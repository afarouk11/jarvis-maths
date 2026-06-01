// Seed the knowledge_base table with topic revision notes + worked examples.
//
// Source of truth: the human-readable markdown files in scripts/notes-data/*.md.
// Each file holds one or more topics in this format:
//
//   ===TOPIC=== <topic-slug>
//   ===NOTE===
//   type: concept|formula|worked_example|tip
//   title: <title>
//   ---
//   <markdown body, may contain $...$ / $$...$$ LaTeX>
//   ===NOTE===
//   ...
//
// Usage:
//   node scripts/seed-notes.mjs           Insert into Supabase (reads ../.env.local).
//                                         Generates embeddings if OPENAI_API_KEY is set.
//   node scripts/seed-notes.mjs --sql     Emit batched SQL to scripts/notes-data/sql/*.sql
//                                         (no network / credentials needed).

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'notes-data')
const VALID_TYPES = new Set(['concept', 'formula', 'worked_example', 'tip', 'graph_example'])

/** Parse every notes-data/*.md file into flat rows for knowledge_base. */
export function parseNotes() {
  const rows = []
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.md')).sort()

  for (const file of files) {
    const raw = readFileSync(join(DATA_DIR, file), 'utf8')
    // Split into topic sections.
    const topicChunks = raw.split(/^===TOPIC===[ \t]*/m).slice(1)
    for (const chunk of topicChunks) {
      const nl = chunk.indexOf('\n')
      const slug = chunk.slice(0, nl).trim()
      if (!slug) continue
      const body = chunk.slice(nl + 1)
      const noteChunks = body.split(/^===NOTE===[ \t]*$/m).slice(1)
      for (const note of noteChunks) {
        const sepIdx = note.indexOf('\n---')
        if (sepIdx === -1) continue
        const header = note.slice(0, sepIdx)
        // content starts after the line that begins with ---
        const afterSep = note.slice(sepIdx + 1)
        const contentStart = afterSep.indexOf('\n')
        const content = afterSep.slice(contentStart + 1).trim()

        const typeMatch = header.match(/type:[ \t]*(\S+)/)
        const titleMatch = header.match(/title:[ \t]*(.+)/)
        const type = typeMatch?.[1]?.trim()
        const title = titleMatch?.[1]?.trim()
        if (!type || !title || !content) continue
        if (!VALID_TYPES.has(type)) {
          console.warn(`! ${file} / ${slug}: skipping unknown type "${type}"`)
          continue
        }
        rows.push({ topic_slug: slug, type, title, content, source_file: file })
      }
    }
  }
  return rows
}

/** Postgres dollar-quoted literal — avoids all escaping of quotes/backslashes/$. */
function dollar(str) {
  let tag = '$kb$'
  if (str.includes(tag)) {
    let i = 0
    do { tag = `$kb${i++}$` } while (str.includes(tag))
  }
  return `${tag}${str}${tag}`
}

function emitSql(rows) {
  const outDir = join(DATA_DIR, 'sql')
  if (existsSync(outDir)) rmSync(outDir, { recursive: true })
  mkdirSync(outDir, { recursive: true })

  const BATCH = 20
  let fileIdx = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const values = batch.map(r =>
      `  (${dollar(r.topic_slug)}, ${dollar(r.type)}, ${dollar(r.title)}, ${dollar(r.content)})`
    ).join(',\n')
    const sql = `insert into public.knowledge_base (topic_slug, type, title, content) values\n${values};\n`
    const name = `batch-${String(++fileIdx).padStart(2, '0')}.sql`
    writeFileSync(join(outDir, name), sql)
  }
  console.log(`Wrote ${fileIdx} SQL batch file(s) to ${outDir} (${rows.length} rows).`)
}

async function insertToSupabase(rows) {
  const { createClient } = await import('@supabase/supabase-js')
  // Credentials: env vars take priority, then .env.local, then hardcoded defaults.
  let env = { ...process.env }
  try {
    const fileEnv = Object.fromEntries(
      readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
        .split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#'))
        .map(l => {
          const eq = l.indexOf('=')
          const k = l.slice(0, eq)
          let v = l.slice(eq + 1).trim()
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1)
          }
          return [k, v]
        })
    )
    env = { ...fileEnv, ...env }
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn(`Warning: could not parse .env.local: ${err.message}`)
  }

  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local.')
  const supabase = createClient(url, key)

  const openaiKey = env.OPENAI_API_KEY

  // Delete existing rows for all topic slugs we're about to seed — ensures idempotency.
  const slugs = [...new Set(rows.map(r => r.topic_slug))]
  const { error: delErr } = await supabase.from('knowledge_base').delete().in('topic_slug', slugs)
  if (delErr) console.warn(`Warning: could not clear existing notes: ${delErr.message}`)

  let embed = null
  if (openaiKey) {
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({ apiKey: openaiKey })
    embed = async (text) => {
      const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text.slice(0, 8000) })
      return res.data[0].embedding
    }
  }

  let added = 0
  if (embed) {
    // One at a time so we can attach an embedding per row.
    for (const r of rows) {
      const record = { topic_slug: r.topic_slug, type: r.type, title: r.title, content: r.content }
      record.embedding = await embed(`${r.title}\n\n${r.content}`)
      const { error } = await supabase.from('knowledge_base').insert(record)
      if (error) console.error(`✗ ${r.topic_slug} / ${r.title}: ${error.message}`)
      else added++
    }
  } else {
    // Bulk insert in chunks (no embeddings).
    const CHUNK = 25
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK).map(r => ({
        topic_slug: r.topic_slug, type: r.type, title: r.title, content: r.content,
      }))
      const { error } = await supabase.from('knowledge_base').insert(chunk)
      if (error) console.error(`✗ chunk ${i}-${i + chunk.length}: ${error.message}`)
      else added += chunk.length
    }
  }
  console.log(`Done — ${added}/${rows.length} notes inserted.`)
}

// Only run when executed directly (not when imported for its parser).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rows = parseNotes()
  console.log(`Parsed ${rows.length} notes from ${DATA_DIR}.`)
  if (process.argv.includes('--sql')) {
    emitSql(rows)
  } else {
    await insertToSupabase(rows)
  }
}
