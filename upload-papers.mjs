import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FILES = [
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2018 MS 2.pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2018 MS 3.pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2019 QP.pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2019 QP (Mech).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2019 MS (Stats).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2019 MS (Mech).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/October 2020 QP (Mech).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/October 2020 MS (Stats).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/October 2020 MS (Mech).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/October 2021 QP.pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/October 2021 QP (Stats).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/October 2021 MS (Stats).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/October 2021 MS (Mech).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2022 QP.pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2022 QP 2.pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2022 MS.pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2022 MS (Stats).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2022 MS (Mech).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2023 QP (Mech).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2023 QP (Stats).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2023 MS.pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2023 MS (Stats).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2023 MS (Mech).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2024 QP.pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2024 QP (Mech).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2024 MS (Stats).pdf',
  '/Users/adam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/June 2024 MS (Mech).pdf',
]

function parseMeta(filepath) {
  const name = filepath.split('/').pop().replace('.pdf', '')
  const year = parseInt(name.match(/(\d{4})/)?.[1] ?? '0')
  const isQP = name.includes('QP')
  const hasStats = name.includes('Stats')
  const hasMech = name.includes('Mech')
  const numMatch = name.match(/\s(\d)\s*$/)
  const paperNum = numMatch ? parseInt(numMatch[1]) : hasStats ? 2 : hasMech ? 3 : 1
  return { title: name, year, paper_number: paperNum, type: isQP ? 'QP' : 'MS' }
}

async function extractText(buffer) {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  GlobalWorkerOptions.workerSrc = pathToFileURL(
    join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  ).href
  const pdf = await (await getDocument({ data: new Uint8Array(buffer) })).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map(item => item.str ?? '').join(' '))
  }
  await pdf.destroy()
  return pages.join('\n\n')
}

function chunkText(text, size = 1600, overlap = 200) {
  const chunks = []
  let i = 0
  while (i < text.length) {
    chunks.push(text.slice(i, i + size))
    i += size - overlap
  }
  return chunks.filter(c => c.trim().length > 50)
}

function guessTopicSlug(text) {
  const t = text.toLowerCase()
  const map = [
    [['differentiat', 'dy/dx', 'gradient of the curve'], 'differentiation'],
    [['integrat', 'area under', 'definite integral'], 'integration'],
    [['trigonometr', 'radian', 'cosec', 'cot ', 'sec '], 'trigonometry'],
    [['binomial', 'expansion', 'pascal'], 'binomial-expansion'],
    [['vector', 'position vector', 'scalar product'], 'vectors'],
    [['logarithm', 'ln(', 'e^x', 'exponential'], 'exponentials-logarithms'],
    [['proof by', 'contradict', 'disprove'], 'proof'],
    [['arithmetic progression', 'geometric progression', 'sum to infinity'], 'sequences-series'],
    [['quadratic', 'polynomial', 'remainder theorem', 'factor theorem'], 'algebra-functions'],
    [['probability', 'p(a', 'conditional prob'], 'probability'],
    [['normal distribution', 'z-value', 'standardise'], 'normal-distribution'],
    [['hypothesis test', 'significance level', 'critical region'], 'hypothesis-testing'],
    [['kinematics', 'suvat', 'velocity-time'], 'kinematics'],
    [['newton', 'friction', 'equilibrium', 'resultant force'], 'forces-newtons-laws'],
    [['moment', 'torque', 'pivot'], 'moments'],
  ]
  for (const [kws, slug] of map) {
    if (kws.some(k => t.includes(k))) return slug
  }
  return null
}

async function embedBatch(texts) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map(t => t.slice(0, 8000)),
  })
  return res.data.map(d => d.embedding)
}

async function upload(filepath) {
  const meta = parseMeta(filepath)
  console.log(`\n[${meta.type}] ${meta.title}`)

  let buffer
  try { buffer = readFileSync(filepath) }
  catch { console.log('  ✗ File not found'); return }

  let text
  try { text = await extractText(buffer) }
  catch (e) { console.log(`  ✗ PDF parse error: ${e.message}`); return }

  if (text.trim().length < 100) { console.log('  ✗ Image-based PDF, skipping'); return }

  const { data: paper, error: pe } = await supabase
    .from('past_papers')
    .insert({ title: meta.title, exam_board: 'AQA', year: meta.year, paper_number: meta.paper_number })
    .select().single()

  if (pe) { console.log(`  ✗ DB error: ${pe.message}`); return }

  const chunks = chunkText(text)
  console.log(`  → ${chunks.length} chunks`)

  let inserted = 0
  const BATCH = 20
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH)
    const embeddings = await embedBatch(batch)
    const rows = batch.map((content, j) => ({
      paper_id: paper.id,
      content,
      topic_slug: guessTopicSlug(content),
      page_num: Math.floor((i + j) / 3) + 1,
      embedding: embeddings[j],
    }))
    const { error } = await supabase.from('paper_chunks').insert(rows)
    if (!error) inserted += rows.length
    process.stdout.write('.')
  }

  await supabase.from('past_papers').update({ processed: true, chunk_count: inserted }).eq('id', paper.id)
  console.log(`\n  ✓ ${inserted} chunks embedded`)
}

async function main() {
  console.log(`Uploading ${FILES.length} papers to Supabase...\n`)
  for (const f of FILES) await upload(f)
  console.log('\n\nAll done.')
}

main().catch(console.error)
