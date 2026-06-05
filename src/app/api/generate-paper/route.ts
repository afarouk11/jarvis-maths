import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { AQA_TOPICS, TOPIC_CATEGORIES } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS, GCSE_TOPIC_CATEGORIES } from '@/lib/curriculum/gcse-topics'
import { checkRateLimit, tooManyRequests } from '@/lib/api/rate-limit'
import { decayedPKnown } from '@/lib/bkt/forgetting'

export const maxDuration = 120

// ── A-Level config ────────────────────────────────────────────────────────────
type ALevelType = 'pure' | 'stats' | 'mechanics'
const ALEVEL_CONFIG: Record<ALevelType, {
  categoryKey: keyof typeof TOPIC_CATEGORIES
  sectionName: string
  questionCount: number
  totalMarks: number
  timeMinutes: number
  boardLabel: string
}> = {
  pure:      { categoryKey: 'Pure Mathematics', sectionName: 'Pure Mathematics', questionCount: 12, totalMarks: 100, timeMinutes: 120, boardLabel: 'Paper 1 / Paper 2' },
  stats:     { categoryKey: 'Statistics',       sectionName: 'Statistics',       questionCount: 8,  totalMarks: 50,  timeMinutes: 60,  boardLabel: 'Paper 3 — Statistics' },
  mechanics: { categoryKey: 'Mechanics',        sectionName: 'Mechanics',        questionCount: 7,  totalMarks: 50,  timeMinutes: 60,  boardLabel: 'Paper 3 — Mechanics' },
}

// ── GCSE config ───────────────────────────────────────────────────────────────
type GcseType = 'non-calc' | 'calc'
const GCSE_CONFIG: Record<GcseType, {
  sectionName: string
  questionCount: number
  totalMarks: number
  timeMinutes: number
  boardLabel: string
  categories: (keyof typeof GCSE_TOPIC_CATEGORIES)[]
}> = {
  'non-calc': {
    sectionName:   'Non-Calculator',
    questionCount: 10,
    totalMarks:    80,
    timeMinutes:   90,
    boardLabel:    'Paper 1 — Non-Calculator',
    categories:    ['Number', 'Algebra', 'Geometry & Measures', 'Statistics & Probability'],
  },
  'calc': {
    sectionName:   'Calculator',
    questionCount: 10,
    totalMarks:    80,
    timeMinutes:   90,
    boardLabel:    'Paper 2 / Paper 3 — Calculator',
    categories:    ['Number', 'Algebra', 'Geometry & Measures', 'Statistics & Probability'],
  },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Paper generation is the most expensive route — limit it tightly.
  const rl = await checkRateLimit(supabase, user.id, 'generate-paper', 12, 3600)
  if (!rl.allowed) return tooManyRequests(rl)

  const body = await req.json().catch(() => ({}))

  const { data: prof } = await supabase
    .from('profiles')
    .select('exam_board, level')
    .eq('id', user.id)
    .single()

  const board     = prof?.exam_board ?? 'AQA'
  const isGcse    = (prof?.level ?? 'A-Level') === 'GCSE'

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (isGcse) {
    return generateGcsePaper({ body, board, admin, userId: user.id, supabase })
  } else {
    return generateALevelPaper({ body, board, admin, userId: user.id, supabase })
  }
}

// ── A-Level generator ─────────────────────────────────────────────────────────
async function generateALevelPaper({ body, board, admin, userId, supabase }: any) {
  type PaperType = 'pure' | 'stats' | 'mechanics'
  const paperType: PaperType = (['pure', 'stats', 'mechanics'].includes(body.paperType) ? body.paperType : 'pure') as PaperType
  const cfg = ALEVEL_CONFIG[paperType]

  const masteryMap = await buildMasteryMap(supabase, userId)

  const { data: boardPapers } = await admin
    .from('past_papers')
    .select('id')
    .eq('exam_board', board)
    .eq('level', 'A-Level')
    .eq('processed', true)

  const topicFreq = await buildTopicFrequency(admin, (boardPapers ?? []).map((p: any) => p.id))
  const categorySlugs = new Set(TOPIC_CATEGORIES[cfg.categoryKey])
  const categoryTopics = AQA_TOPICS.filter(t => categorySlugs.has(t.slug))

  const scored = categoryTopics.map(t => {
    const mastery = masteryMap.get(t.slug) ?? 0
    const freq    = topicFreq[t.slug] ?? 0
    const freqW   = freq > 0 ? Math.log(freq + 1) : 0.5
    return { slug: t.slug, name: t.name, score: (1 - (mastery as number) / 5) * (1 + freqW) }
  }).sort((a, b) => b.score - a.score)

  const selected = weightedSample(scored, cfg.questionCount)
  const seed     = Math.floor(Math.random() * 99999)
  const diff     = ['straightforward', 'moderate', 'challenging'][Math.floor(Math.random() * 3)]
  const qPH      = selected.map((t, i) => ({
    number: i + 1, topic: t.name,
    marks: distributeMarks(cfg.totalMarks, selected.length)[i],
  }))

  let text: string
  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      temperature: 1,
      system: 'You are an exam paper generator. You respond ONLY with valid JSON — no prose, no markdown fences, no explanation.',
      prompt: buildALevelPrompt(board, cfg, selected, qPH, seed, diff),
    })
    text = result.text
  } catch (err: any) {
    return NextResponse.json({ error: 'AI generation failed', details: String(err?.message ?? err) }, { status: 500 })
  }

  const paper = parseJson(text)
  if (!paper) return NextResponse.json({ error: 'Failed to parse paper JSON' }, { status: 500 })
  return NextResponse.json({ paper: { ...paper, examBoard: board }, focusTopics: selected.map(t => t.name) })
}

// ── GCSE generator ────────────────────────────────────────────────────────────
async function generateGcsePaper({ body, board, admin, userId, supabase }: any) {
  const paperType: GcseType = body.paperType === 'calc' ? 'calc' : 'non-calc'
  const cfg = GCSE_CONFIG[paperType]

  const masteryMap = await buildMasteryMap(supabase, userId)

  const { data: boardPapers } = await admin
    .from('past_papers')
    .select('id')
    .eq('exam_board', board)
    .eq('level', 'GCSE')
    .eq('processed', true)

  const topicFreq  = await buildTopicFrequency(admin, (boardPapers ?? []).map((p: any) => p.id))

  // Pull topics from all GCSE categories with scoring
  const allGcseTopics = cfg.categories.flatMap(cat =>
    (GCSE_TOPIC_CATEGORIES[cat] ?? [])
      .map(slug => GCSE_TOPICS.find(t => t.slug === slug))
      .filter(Boolean)
  ) as typeof GCSE_TOPICS

  const scored = allGcseTopics.map(t => {
    const mastery = masteryMap.get(t.slug) ?? 0
    const freq    = topicFreq[t.slug] ?? 0
    const freqW   = freq > 0 ? Math.log(freq + 1) : 0.5
    return { slug: t.slug, name: t.name, score: (1 - (mastery as number) / 5) * (1 + freqW) }
  }).sort((a, b) => b.score - a.score)

  const selected = weightedSample(scored, cfg.questionCount)
  const seed     = Math.floor(Math.random() * 99999)
  const diff     = ['accessible', 'moderate', 'challenging'][Math.floor(Math.random() * 3)]
  const qPH      = selected.map((t, i) => ({
    number: i + 1, topic: t.name,
    marks: distributeMarks(cfg.totalMarks, selected.length)[i],
  }))

  let text: string
  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      temperature: 1,
      system: 'You are a GCSE exam paper generator. You respond ONLY with valid JSON — no prose, no markdown fences, no explanation.',
      prompt: buildGcsePrompt(board, cfg, paperType, selected, qPH, seed, diff),
    })
    text = result.text
  } catch (err: any) {
    return NextResponse.json({ error: 'AI generation failed', details: String(err?.message ?? err) }, { status: 500 })
  }

  const paper = parseJson(text)
  if (!paper) return NextResponse.json({ error: 'Failed to parse paper JSON' }, { status: 500 })
  return NextResponse.json({ paper: { ...paper, examBoard: board }, focusTopics: selected.map(t => t.name) })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Single source of truth for mastery: read live (decayed) p_known from
// student_progress and express it on the 0–5 scale the weakness weighting uses.
// Replaces the separate topic_mastery store that could drift out of sync.
async function buildMasteryMap(supabase: any, userId: string): Promise<Map<string, number>> {
  const [{ data: progress }, { data: topicRows }] = await Promise.all([
    supabase.from('student_progress')
      .select('topic_id, p_known, last_attempted_at, ease_factor, interval_days')
      .eq('student_id', userId),
    supabase.from('topics').select('id, slug'),
  ])
  const slugById = new Map((topicRows ?? []).map((t: { id: string; slug: string }) => [t.id, t.slug]))
  const map = new Map<string, number>()
  for (const p of progress ?? []) {
    const slug = (slugById.get(p.topic_id) ?? p.topic_id) as string
    map.set(slug, decayedPKnown(p) * 5)
  }
  return map
}

async function buildTopicFrequency(admin: any, paperIds: string[]) {
  const BATCH = 50
  const allChunks: { topic_slug: string | null; paper_id: string }[] = []
  for (let i = 0; i < paperIds.length; i += BATCH) {
    let from = 0
    while (true) {
      const { data } = await admin.from('paper_chunks').select('topic_slug, paper_id')
        .in('paper_id', paperIds.slice(i, i + BATCH)).range(from, from + 999)
      if (!data?.length) break
      allChunks.push(...data)
      if (data.length < 1000) break
      from += 1000
    }
  }
  const topicPapers: Record<string, Set<string>> = {}
  for (const { topic_slug, paper_id } of allChunks) {
    if (!topic_slug || !paper_id) continue
    if (!topicPapers[topic_slug]) topicPapers[topic_slug] = new Set()
    topicPapers[topic_slug].add(paper_id)
  }
  return Object.fromEntries(Object.entries(topicPapers).map(([k, v]) => [k, v.size]))
}

function weightedSample(scored: { slug: string; name: string; score: number }[], n: number) {
  const maxQ = Math.min(n, scored.length)
  const pool = scored.slice(0, Math.min(maxQ + 4, scored.length))
  const selected: typeof pool = []
  const used = new Set<string>()
  while (selected.length < maxQ && selected.length < pool.length) {
    let r = Math.random() * pool.reduce((s, t) => used.has(t.slug) ? s : s + t.score, 0)
    for (const t of pool) {
      if (used.has(t.slug)) continue
      r -= t.score
      if (r <= 0) { selected.push(t); used.add(t.slug); break }
    }
  }
  for (const t of pool) {
    if (selected.length >= maxQ) break
    if (!used.has(t.slug)) { selected.push(t); used.add(t.slug) }
  }
  return selected
}

// Distributes marks across questions in ascending order (easier questions first, harder last)
function distributeMarks(total: number, count: number): number[] {
  if (count <= 0) return []
  const wSum = (count * (count + 1)) / 2
  let remaining = total
  return Array.from({ length: count }, (_, i) => {
    if (i === count - 1) return Math.max(2, remaining)
    const m = Math.max(2, Math.round(((i + 1) / wSum) * total))
    remaining -= m
    return m
  })
}

function parseJson(text: string) {
  try {
    return JSON.parse(text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim())
  } catch { return null }
}

function buildALevelPrompt(board: string, cfg: any, selected: any[], qPH: any[], seed: number, diff: string) {
  return `Generate a UNIQUE mock A-level ${board} Maths ${cfg.boardLabel} exam paper. Seed: ${seed}. Difficulty: ${diff}.

This paper must closely mirror a real ${board} A-Level Mathematics exam. Follow these requirements precisely:
- Structure the ramp like a real paper: the first two or three questions are short (3-5 marks each), the middle builds steadily, and the final one or two questions are extended multi-part problems worth 10-15 marks.
- The marks across all questions MUST sum to exactly ${cfg.totalMarks}. Do not exceed or fall short.
- For questions worth 5 or more marks, split into labelled parts within the stem field using (a), (b), (c): "(a) Find... [3 marks]\n(b) Hence show that... [4 marks]" — include individual mark allocations in square brackets, and later parts should follow from earlier ones (use "Hence").
- Use only standard ${board} command words: "Find", "Show that", "Prove that", "Hence", "Given that", "Solve", "Sketch", "Determine", "Express", "Deduce". Match the precise, formal register of real ${board} papers.
- Assume the standard formulae booklet is provided: do not award marks for merely quoting a booklet formula, but DO require full derivations where the specification expects them ("show that", "prove", first principles).
- Include at least one "Show that" or "Prove that" question, and at least one question set in a real-world context: "A particle moves...", "The curve C has equation...", "A geometric series has...".
- In worked_solution steps, use real mark scheme notation: M1 (method mark), A1 (accuracy mark), B1 (independent mark), and "ft" for follow-through — each step states exactly what mark it earns, so the steps add up to that question's total.

Topics and mark allocations (questions must appear in this order, easiest first):
${qPH.map(q => `Q${q.number}. ${q.topic} — ${q.marks} marks`).join('\n')}

Each question may have an optional "diagram" field with a complete SVG string. Include diagrams for geometric, graphical, or vector questions.

Respond with ONLY this exact JSON structure (use LaTeX: \\(...\\) for inline, \\[...\\] for display math):
{"title":"SPOK Mock — ${board} ${cfg.sectionName}","totalMarks":${cfg.totalMarks},"timeMinutes":${cfg.timeMinutes},"sections":[{"name":"${cfg.sectionName}","questions":[${qPH.map(q => `{"number":${q.number},"topic":"${q.topic}","marks":${q.marks},"stem":"FULL QUESTION STEM WITH PARTS IF APPLICABLE","answer":"FULL ANSWER COVERING ALL PARTS","worked_solution":[{"label":"Step 1 [M1]","content":"WORKING"}]}`).join(',')}]}]}`
}

function buildGcsePrompt(board: string, cfg: any, paperType: GcseType, selected: any[], qPH: any[], seed: number, diff: string) {
  const calcNote = paperType === 'non-calc'
    ? 'NON-CALCULATOR paper — do NOT include questions requiring a calculator. All arithmetic must be doable by hand.'
    : 'CALCULATOR paper — questions may involve decimals, standard form, and calculations requiring a calculator.'

  return `Generate a UNIQUE mock ${board} GCSE Higher Maths ${cfg.boardLabel} exam paper. Seed: ${seed}. Difficulty: ${diff}.
${calcNote}

This paper must closely mirror a real ${board} GCSE Higher Mathematics exam. Follow these requirements precisely:
- Structure the ramp like a real paper: open with short accessible questions (1-3 marks), build through the middle, and finish with the most demanding grade 8/9 questions (5-6 marks, multi-step).
- The marks across all questions MUST sum to exactly ${cfg.totalMarks}. Do not exceed or fall short.
- For questions worth 4 or more marks, split into labelled parts using (a), (b): "(a) Work out... [2 marks]\n(b) Explain why... [2 marks]".
- Use clear, age-appropriate language and the standard ${board} GCSE command words: "Work out", "Calculate", "Show that", "Prove", "Estimate", "Explain", "Write down", "Sketch", "Solve".
- Include real-world contexts: "A shop sells...", "The diagram shows a triangle...", "A car travels...".
- Mix question types across the paper: calculate, show that, estimate, explain, sketch, and at least one reasoning/proof question typical of the higher grades.
- In worked_solution steps, use mark scheme notation: M1 (method mark), A1 (accuracy mark), B1 (independent mark), so the steps add up to that question's total.

Topics and mark allocations (questions must appear in this order, easiest first):
${qPH.map(q => `Q${q.number}. ${q.topic} — ${q.marks} marks`).join('\n')}

Each question may have an optional "diagram" field with a complete SVG string. Include diagrams for geometry and graph questions.

Respond with ONLY this exact JSON structure (use LaTeX: \\(...\\) for inline, \\[...\\] for display math):
{"title":"SPOK Mock — ${board} GCSE ${cfg.sectionName}","totalMarks":${cfg.totalMarks},"timeMinutes":${cfg.timeMinutes},"sections":[{"name":"${cfg.sectionName}","questions":[${qPH.map(q => `{"number":${q.number},"topic":"${q.topic}","marks":${q.marks},"stem":"FULL QUESTION STEM WITH PARTS IF APPLICABLE","answer":"FULL ANSWER COVERING ALL PARTS","worked_solution":[{"label":"Step 1 [M1]","content":"WORKING"}]}`).join(',')}]}]}`
}
