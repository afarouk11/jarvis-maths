/**
 * GCSE Past Papers Seed Script
 *
 * Downloads AQA GCSE Maths past papers (Higher tier, Papers 1/2/3, 2017-2024)
 * + their mark schemes, extracts text via pdfjs-dist, and inserts into Supabase.
 *
 * Usage:
 *   node scripts/seed-gcse-papers.mjs
 *   node scripts/seed-gcse-papers.mjs --tier Higher          (default)
 *   node scripts/seed-gcse-papers.mjs --tier Foundation
 *   node scripts/seed-gcse-papers.mjs --dry-run              (download + parse only, no DB insert)
 */

import { createClient } from '@supabase/supabase-js'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { pathToFileURL } from 'url'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'

// ── Config ─────────────────────────────────────────────────────────────────
const ARGS     = Object.fromEntries(
  process.argv.slice(2).reduce((acc, val, i, arr) => {
    if (val.startsWith('--')) acc.push([val.slice(2), arr[i + 1] ?? true])
    return acc
  }, [])
)
const TIER     = (ARGS.tier ?? 'Higher')   // 'Higher' | 'Foundation'
const TIER_ABBR = TIER === 'Higher' ? 'H' : 'F'
const DRY_RUN  = ARGS['dry-run'] === true
const CACHE    = '/tmp/gcse-paper-cache'
const BASE     = 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA'

const SUPABASE_URL      = 'https://ervibbsbzjpleffaxwfv.supabase.co'
const SERVICE_ROLE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVydmliYnNiempwbGVmZmF4d2Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcwNjU2NiwiZXhwIjoyMDkyMjgyNTY2fQ.2MecV3Kid8jZa2EenaXIjmb3isRUP0pBp0xR4BrvB3M'

// Sessions available on PMT
const SESSIONS = [
  { label: 'June 2017',     year: 2017, session: 'June' },
  { label: 'June 2018',     year: 2018, session: 'June' },
  { label: 'June 2019',     year: 2019, session: 'June' },
  { label: 'June 2020',     year: 2020, session: 'June' },
  { label: 'June 2021',     year: 2021, session: 'June' },
  { label: 'June 2022',     year: 2022, session: 'June' },
  { label: 'June 2023',     year: 2023, session: 'June' },
  { label: 'June 2024',     year: 2024, session: 'June' },
  { label: 'November 2017', year: 2017, session: 'November' },
  { label: 'November 2018', year: 2018, session: 'November' },
  { label: 'November 2019', year: 2019, session: 'November' },
  { label: 'November 2022', year: 2022, session: 'November' },
  { label: 'November 2023', year: 2023, session: 'November' },
  { label: 'November 2024', year: 2024, session: 'November' },
]

const PAPERS = [1, 2, 3]
const PAPER_LABELS = {
  1: 'Paper 1 — Non-Calculator',
  2: 'Paper 2 — Calculator',
  3: 'Paper 3 — Calculator',
}

// GCSE topic slug keywords for guessing topic from text
const GCSE_TOPIC_KEYWORDS = {
  'gcse-quadratics':       ['quadratic', 'factorise', 'completing the square', 'discriminant'],
  'gcse-trigonometry':     ['sine', 'cosine', 'tangent', 'trigonometry', 'sin(', 'cos(', 'tan(', 'pythagoras'],
  'gcse-probability':      ['probability', 'tree diagram', 'venn diagram', 'mutually exclusive'],
  'gcse-statistics':       ['mean', 'median', 'mode', 'range', 'quartile', 'interquartile', 'cumulative frequency'],
  'gcse-sequences':        ['sequence', 'nth term', 'arithmetic', 'geometric'],
  'gcse-percentages':      ['percentage', 'percent', 'interest', 'depreciation', 'appreciation'],
  'gcse-ratio':            ['ratio', 'proportion', 'direct proportion', 'inverse proportion'],
  'gcse-vectors':          ['vector', 'column vector', 'resultant'],
  'gcse-circles':          ['circle', 'circumference', 'diameter', 'radius', 'arc', 'sector', 'tangent to circle'],
  'gcse-area-volume':      ['area', 'volume', 'surface area', 'cylinder', 'cone', 'sphere', 'prism'],
  'gcse-linear-graphs':    ['gradient', 'y-intercept', 'straight line', 'linear graph', 'y = mx'],
  'gcse-simultaneous':     ['simultaneous', 'solve the equations'],
  'gcse-inequalities':     ['inequality', 'inequalities', 'number line'],
  'gcse-transformations':  ['reflection', 'rotation', 'translation', 'enlargement', 'transformation'],
  'gcse-indices-surds':    ['indices', 'surd', 'square root', 'cube root', 'index', 'power'],
  'gcse-standard-form':    ['standard form', 'standard index form', '× 10'],
  'gcse-fractions':        ['fraction', 'numerator', 'denominator', 'simplify'],
  'gcse-expressions':      ['expand', 'simplify', 'expression', 'brackets', 'factorise'],
  'gcse-linear-equations': ['solve', 'equation', 'unknown'],
  'gcse-other-graphs':     ['graph', 'sketch', 'curve', 'parabola', 'cubic', 'reciprocal'],
  'gcse-pythagoras':       ['pythagoras', 'hypotenuse', 'right-angled triangle'],
  'gcse-angles':           ['angle', 'polygon', 'interior', 'exterior', 'bearing', 'parallel'],
  'gcse-scatter':          ['scatter', 'correlation', 'line of best fit'],
  'gcse-charts':           ['histogram', 'frequency diagram', 'box plot', 'stem and leaf'],
  'gcse-constructions':    ['construct', 'locus', 'loci', 'bisect', 'perpendicular'],
  'gcse-number':           ['integer', 'prime', 'factor', 'multiple', 'hcf', 'lcm', 'place value'],
}

function guessGcseTopic(text) {
  const lower = text.toLowerCase()
  for (const [slug, keywords] of Object.entries(GCSE_TOPIC_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return slug
  }
  return null
}

function chunkText(text, chunkSize = 600, overlap = 100) {
  const words = text.split(/\s+/)
  const chunks = []
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim().length > 50) chunks.push(chunk)
  }
  return chunks
}

async function extractPdfText(buffer) {
  GlobalWorkerOptions.workerSrc = pathToFileURL(
    join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  ).href

  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map(item => ('str' in item ? item.str : '')).join(' '))
  }
  await pdf.destroy()
  return pages.join('\n\n')
}

async function downloadPdf(url, cachePath) {
  if (existsSync(cachePath)) {
    return readFileSync(cachePath)
  }
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 StudiQ/1.0 (educational use)' },
    redirect: 'follow',
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`)
  const buf = Buffer.from(await resp.arrayBuffer())
  writeFileSync(cachePath, buf)
  return buf
}

// ── Main ───────────────────────────────────────────────────────────────────
mkdirSync(CACHE, { recursive: true })

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function log(msg)  { console.log(`\x1b[36m▶\x1b[0m  ${msg}`) }
function ok(msg)   { console.log(`\x1b[32m✓\x1b[0m  ${msg}`) }
function warn(msg) { console.log(`\x1b[33m⚠\x1b[0m  ${msg}`) }
function err(msg)  { console.log(`\x1b[31m✗\x1b[0m  ${msg}`) }

let inserted = 0, skipped = 0, failed = 0

for (const paper of PAPERS) {
  for (const s of SESSIONS) {
    const folder    = `Paper-${paper}${TIER_ABBR}`
    const filename  = `${s.label} QP.pdf`
    const url       = `${BASE}/${folder}/QP/${encodeURIComponent(filename)}`
    const msUrl     = `${BASE}/${folder}/MS/${encodeURIComponent(filename.replace('QP', 'MS'))}`
    const cachePath = join(CACHE, `${folder}-${s.label.replace(/ /g, '_')}-QP.pdf`)
    const title     = `AQA GCSE Maths — ${TIER} — ${PAPER_LABELS[paper]} — ${s.label}`

    log(`${title}`)

    // Check if already in DB
    if (!DRY_RUN) {
      const { data: existing } = await admin
        .from('past_papers')
        .select('id')
        .eq('title', title)
        .maybeSingle()
      if (existing) { ok(`Already in DB — skipping`); skipped++; continue }
    }

    // Download QP
    let buf
    try {
      buf = await downloadPdf(url, cachePath)
    } catch (e) {
      warn(`Download failed: ${e.message}`)
      failed++
      continue
    }

    // Extract text
    let text
    try {
      text = await extractPdfText(buf)
    } catch (e) {
      warn(`PDF parse failed: ${e.message}`)
      failed++
      continue
    }

    if (text.trim().length < 100) {
      warn(`Image-based PDF — skipping (no extractable text)`)
      failed++
      continue
    }

    ok(`Extracted ${text.length} chars`)

    if (DRY_RUN) {
      ok(`[DRY RUN] Would insert: ${title}`)
      continue
    }

    // Insert past_papers row
    const { data: row, error: rowErr } = await admin
      .from('past_papers')
      .insert({
        title,
        exam_board:     'AQA',
        year:           s.year,
        paper_number:   paper,
        paper_label:    PAPER_LABELS[paper],
        tier:           TIER,
        level:          'GCSE',
        pdf_url:        url,
        mark_scheme_url: msUrl,
        processed:      false,
      })
      .select()
      .single()

    if (rowErr) { err(`DB insert failed: ${rowErr.message}`); failed++; continue }

    // Chunk + embed
    const chunks = chunkText(text)
    const BATCH  = 20
    let totalChunks = 0

    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH)

      // Call OpenAI embeddings via Supabase edge function or directly
      // Using fetch to OpenAI directly since we have the key in env
      let embeddings
      try {
        const openaiKey = process.env.OPENAI_API_KEY
        if (!openaiKey) throw new Error('OPENAI_API_KEY not set')

        const resp = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({ model: 'text-embedding-3-small', input: batch }),
        })
        const json = await resp.json()
        if (!resp.ok) throw new Error(json.error?.message ?? 'OpenAI error')
        embeddings = json.data.map(d => d.embedding)
      } catch (e) {
        warn(`Embedding batch ${i} failed: ${e.message} — inserting without embeddings`)
        embeddings = batch.map(() => null)
      }

      const rows = batch.map((content, j) => ({
        paper_id:   row.id,
        content,
        topic_slug: guessGcseTopic(content),
        page_num:   Math.floor((i + j) / 3) + 1,
        embedding:  embeddings[j],
      }))

      const { error: chunkErr } = await admin.from('paper_chunks').insert(rows)
      if (!chunkErr) totalChunks += rows.length
    }

    await admin
      .from('past_papers')
      .update({ processed: true, chunk_count: totalChunks })
      .eq('id', row.id)

    ok(`Inserted ${totalChunks} chunks for ${title}`)
    inserted++
  }
}

console.log(`\n\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`)
console.log(`  Inserted: ${inserted}  |  Skipped: ${skipped}  |  Failed: ${failed}`)
console.log(`\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`)
