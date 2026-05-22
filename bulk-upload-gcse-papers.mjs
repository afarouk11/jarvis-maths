// GCSE Maths past paper bulk-upload script.
// Mirrors bulk-upload-papers.mjs (A-level) but targets GCSE Higher tier papers
// across AQA (8300), Edexcel (1MA1), and OCR (J560).
// All papers sourced from PMT (physicsandmathstutor.com).

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── URL builder ──────────────────────────────────────────────────────────────

function pmtUrl(board, paperKey, type, month, year) {
  return `https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/${board}/${paperKey}/${type}/${month}%20${year}%20${type}.pdf`
}

// ── Build paper list ─────────────────────────────────────────────────────────

const GCSE_PAPERS = []

// AQA Higher — Paper-1H, Paper-2H, Paper-3H
const aqaSessions = [
  { month: 'June',     years: [2017, 2018, 2019, 2022, 2023, 2024] },
  { month: 'November', years: [2017, 2018, 2019, 2020, 2021] },
]
for (const { month, years } of aqaSessions) {
  for (const year of years) {
    for (const p of [1, 2, 3]) {
      for (const type of ['QP', 'MS']) {
        GCSE_PAPERS.push({
          url: pmtUrl('AQA', `Paper-${p}H`, type, month, year),
          title: `AQA GCSE ${month === 'November' ? year + ' Nov' : year} Paper ${p} Higher ${type}`,
          board: 'AQA', year, paper: p,
        })
      }
    }
  }
}

// Edexcel Higher — Paper-1H, Paper-2H, Paper-3H
const edexcelSessions = [
  { month: 'June',     years: [2017, 2018, 2019, 2022, 2023, 2024] },
  { month: 'November', years: [2020, 2021] },
]
for (const { month, years } of edexcelSessions) {
  for (const year of years) {
    for (const p of [1, 2, 3]) {
      for (const type of ['QP', 'MS']) {
        GCSE_PAPERS.push({
          url: pmtUrl('Edexcel', `Paper-${p}H`, type, month, year),
          title: `Edexcel GCSE ${month === 'November' ? year + ' Nov' : year} Paper ${p} Higher ${type}`,
          board: 'Edexcel', year, paper: p,
        })
      }
    }
  }
}

// OCR Higher — Paper-1, Paper-2, Paper-3 (no tier suffix on PMT)
const ocrSessions = [
  { month: 'June',     years: [2017, 2018, 2019, 2022, 2023, 2024] },
  { month: 'November', years: [2017, 2018, 2019, 2020, 2021] },
]
for (const { month, years } of ocrSessions) {
  for (const year of years) {
    for (const p of [1, 2, 3]) {
      for (const type of ['QP', 'MS']) {
        GCSE_PAPERS.push({
          url: pmtUrl('OCR', `Paper-${p}`, type, month, year),
          title: `OCR GCSE ${month === 'November' ? year + ' Nov' : year} Paper ${p} Higher ${type}`,
          board: 'OCR', year, paper: p,
        })
      }
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function downloadPDF(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StudiQ-Indexer/1.0)' },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = await res.arrayBuffer()
  return Buffer.from(buf)
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
    [['place value', 'round to', 'significant figure', 'decimal place'], 'gcse-number'],
    [['fraction', 'numerator', 'denominator', 'mixed number'], 'gcse-fractions'],
    [['percentage', 'percent', '% of', 'compound interest', 'simple interest'], 'gcse-percentages'],
    [['ratio', 'proportion', 'direct proportion', 'inverse proportion'], 'gcse-ratio'],
    [['index', 'indices', 'surds', 'irrational', '√', 'root'], 'gcse-indices-surds'],
    [['standard form', '× 10', 'scientific notation'], 'gcse-standard-form'],
    [['expand', 'factorise', 'expression', 'simplify', 'like terms'], 'gcse-expressions'],
    [['solve', 'linear equation', 'rearrange', 'make x the subject'], 'gcse-linear-equations'],
    [['quadratic', 'x²', 'completing the square', 'quadratic formula', 'discriminant'], 'gcse-quadratics'],
    [['simultaneous', 'elimination', 'substitution method'], 'gcse-simultaneous'],
    [['inequality', 'inequalities', 'number line', '≤', '≥'], 'gcse-inequalities'],
    [['sequence', 'nth term', 'arithmetic', 'geometric sequence', 'fibonacci'], 'gcse-sequences'],
    [['straight line', 'gradient', 'y = mx', 'y-intercept', 'parallel line'], 'gcse-linear-graphs'],
    [['quadratic graph', 'cubic', 'reciprocal graph', 'circle graph'], 'gcse-other-graphs'],
    [['angle', 'polygon', 'interior angle', 'exterior angle', 'parallel lines'], 'gcse-angles'],
    [['circle', 'circumference', 'diameter', 'radius', 'arc', 'sector', 'chord', 'tangent'], 'gcse-circles'],
    [['transform', 'reflection', 'rotation', 'translation', 'enlargement', 'vector'], 'gcse-transformations'],
    [['area', 'volume', 'perimeter', 'surface area', 'prism', 'cylinder', 'cone', 'sphere'], 'gcse-area-volume'],
    [['pythagoras', 'hypotenuse', 'right-angled triangle'], 'gcse-pythagoras'],
    [['trigonometry', 'sin', 'cos', 'tan', 'sohcahtoa', 'sine rule', 'cosine rule'], 'gcse-trigonometry'],
    [['vector', 'column vector', 'magnitude', 'resultant'], 'gcse-vectors'],
    [['construction', 'locus', 'loci', 'compass', 'bisect'], 'gcse-constructions'],
    [['mean', 'median', 'mode', 'range', 'quartile', 'interquartile'], 'gcse-statistics'],
    [['histogram', 'cumulative frequency', 'box plot', 'stem and leaf', 'bar chart'], 'gcse-charts'],
    [['probability', 'p(', 'tree diagram', 'venn diagram', 'mutually exclusive'], 'gcse-probability'],
    [['scatter', 'correlation', 'line of best fit', 'bivariate'], 'gcse-scatter'],
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

// ── Main ─────────────────────────────────────────────────────────────────────

async function alreadyUploaded(title) {
  const { data } = await supabase.from('past_papers').select('id').eq('title', title).maybeSingle()
  return !!data
}

async function upload(paper) {
  process.stdout.write(`\n[${paper.board} GCSE ${paper.year} P${paper.paper}] ${paper.title.replace(/.*\d{4}( Nov)? /, '')}`)

  if (await alreadyUploaded(paper.title)) {
    process.stdout.write(' — already uploaded, skipping')
    return
  }

  let buffer
  try {
    buffer = await downloadPDF(paper.url)
  } catch (e) {
    process.stdout.write(` — ✗ download failed: ${e.message}`)
    return
  }

  let text
  try {
    text = await extractText(buffer)
  } catch (e) {
    process.stdout.write(` — ✗ PDF parse error`)
    return
  }

  if (text.trim().length < 100) {
    process.stdout.write(' — ✗ image-based, skipping')
    return
  }

  const { data: rec, error: pe } = await supabase
    .from('past_papers')
    .insert({ title: paper.title, exam_board: paper.board, year: paper.year, paper_number: paper.paper })
    .select().single()

  if (pe) { process.stdout.write(` — ✗ DB: ${pe.message}`); return }

  const chunks = chunkText(text)
  let inserted = 0
  const BATCH = 20
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH)
    const embeddings = await embedBatch(batch)
    const rows = batch.map((content, j) => ({
      paper_id: rec.id, content,
      topic_slug: guessTopicSlug(content),
      page_num: Math.floor((i + j) / 3) + 1,
      embedding: embeddings[j],
    }))
    const { error } = await supabase.from('paper_chunks').insert(rows)
    if (!error) inserted += rows.length
    process.stdout.write('.')
  }

  await supabase.from('past_papers').update({ processed: true, chunk_count: inserted }).eq('id', rec.id)
  process.stdout.write(` ✓ ${inserted} chunks`)
}

async function main() {
  console.log(`Attempting ${GCSE_PAPERS.length} GCSE papers across AQA, Edexcel, OCR...\n`)
  let ok = 0, failed = 0
  for (const p of GCSE_PAPERS) {
    try { await upload(p); ok++ } catch { failed++ }
  }
  console.log(`\n\nDone — ${ok} uploaded, ${failed} errors`)
}

main().catch(console.error)
