import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { AQA_TOPICS, TOPIC_CATEGORIES } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS, GCSE_TOPIC_CATEGORIES } from '@/lib/curriculum/gcse-topics'

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
  pure:      { categoryKey: 'Pure Mathematics', sectionName: 'Pure Mathematics', questionCount: 8,  totalMarks: 60, timeMinutes: 75, boardLabel: 'Paper 1 / Paper 2' },
  stats:     { categoryKey: 'Statistics',       sectionName: 'Statistics',       questionCount: 6,  totalMarks: 45, timeMinutes: 55, boardLabel: 'Paper 3 — Statistics' },
  mechanics: { categoryKey: 'Mechanics',        sectionName: 'Mechanics',        questionCount: 5,  totalMarks: 40, timeMinutes: 50, boardLabel: 'Paper 3 — Mechanics' },
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

  const { data: progress } = await supabase
    .from('topic_mastery')
    .select('topic, mastery_level')
    .eq('user_id', userId)

  const { data: boardPapers } = await admin
    .from('past_papers')
    .select('id')
    .eq('exam_board', board)
    .eq('level', 'A-Level')
    .eq('processed', true)

  const topicFreq = await buildTopicFrequency(admin, (boardPapers ?? []).map((p: any) => p.id))
  const categorySlugs = new Set(TOPIC_CATEGORIES[cfg.categoryKey])
  const categoryTopics = AQA_TOPICS.filter(t => categorySlugs.has(t.slug))
  const masteryMap = new Map((progress ?? []).map((p: any) => [p.topic.toLowerCase(), p.mastery_level ?? 0]))

  const scored = categoryTopics.map(t => {
    const mastery = masteryMap.get(t.name.toLowerCase()) ?? masteryMap.get(t.slug) ?? 0
    const freq    = topicFreq[t.slug] ?? 0
    const freqW   = freq > 0 ? Math.log(freq + 1) : 0.5
    return { slug: t.slug, name: t.name, score: (1 - (mastery as number) / 5) * (1 + freqW) }
  }).sort((a, b) => b.score - a.score)

  const selected = weightedSample(scored, cfg.questionCount)
  const seed     = Math.floor(Math.random() * 99999)
  const diff     = ['straightforward', 'moderate', 'challenging'][Math.floor(Math.random() * 3)]
  const qPH      = selected.map((t, i) => ({
    number: i + 1, topic: t.name,
    marks: Math.floor(cfg.totalMarks / selected.length) + (i < cfg.totalMarks % selected.length ? 1 : 0),
  }))

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    temperature: 1,
    system: 'You are an exam paper generator. You respond ONLY with valid JSON — no prose, no markdown fences, no explanation.',
    prompt: buildALevelPrompt(board, cfg, selected, qPH, seed, diff),
  })

  const paper = parseJson(text)
  if (!paper) return NextResponse.json({ error: 'Failed to parse paper JSON' }, { status: 500 })
  return NextResponse.json({ paper, focusTopics: selected.map(t => t.name) })
}

// ── GCSE generator ────────────────────────────────────────────────────────────
async function generateGcsePaper({ body, board, admin, userId, supabase }: any) {
  const paperType: GcseType = body.paperType === 'calc' ? 'calc' : 'non-calc'
  const cfg = GCSE_CONFIG[paperType]

  const { data: progress } = await supabase
    .from('topic_mastery')
    .select('topic, mastery_level')
    .eq('user_id', userId)

  const { data: boardPapers } = await admin
    .from('past_papers')
    .select('id')
    .eq('exam_board', board)
    .eq('level', 'GCSE')
    .eq('processed', true)

  const topicFreq  = await buildTopicFrequency(admin, (boardPapers ?? []).map((p: any) => p.id))
  const masteryMap = new Map((progress ?? []).map((p: any) => [p.topic.toLowerCase(), p.mastery_level ?? 0]))

  // Pull topics from all GCSE categories with scoring
  const allGcseTopics = cfg.categories.flatMap(cat =>
    (GCSE_TOPIC_CATEGORIES[cat] ?? [])
      .map(slug => GCSE_TOPICS.find(t => t.slug === slug))
      .filter(Boolean)
  ) as typeof GCSE_TOPICS

  const scored = allGcseTopics.map(t => {
    const mastery = masteryMap.get(t.name.toLowerCase()) ?? masteryMap.get(t.slug) ?? 0
    const freq    = topicFreq[t.slug] ?? 0
    const freqW   = freq > 0 ? Math.log(freq + 1) : 0.5
    return { slug: t.slug, name: t.name, score: (1 - (mastery as number) / 5) * (1 + freqW) }
  }).sort((a, b) => b.score - a.score)

  const selected = weightedSample(scored, cfg.questionCount)
  const seed     = Math.floor(Math.random() * 99999)
  const diff     = ['accessible', 'moderate', 'challenging'][Math.floor(Math.random() * 3)]
  const qPH      = selected.map((t, i) => ({
    number: i + 1, topic: t.name,
    marks: Math.floor(cfg.totalMarks / selected.length) + (i < cfg.totalMarks % selected.length ? 1 : 0),
  }))

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    temperature: 1,
    system: 'You are a GCSE exam paper generator. You respond ONLY with valid JSON — no prose, no markdown fences, no explanation.',
    prompt: buildGcsePrompt(board, cfg, paperType, selected, qPH, seed, diff),
  })

  const paper = parseJson(text)
  if (!paper) return NextResponse.json({ error: 'Failed to parse paper JSON' }, { status: 500 })
  return NextResponse.json({ paper, focusTopics: selected.map(t => t.name) })
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function parseJson(text: string) {
  try {
    return JSON.parse(text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim())
  } catch { return null }
}

function buildALevelPrompt(board: string, cfg: any, selected: any[], qPH: any[], seed: number, diff: string) {
  return `Generate a UNIQUE mock A-level ${board} Maths ${cfg.boardLabel} exam paper. Seed: ${seed}. Difficulty: ${diff}.

Topics to cover (one question each):
${selected.map((t, i) => `${i + 1}. ${t.name} (${qPH[i].marks} marks)`).join('\n')}

Each question may have an optional "diagram" field with a complete SVG string. Include diagrams for geometric/graphical questions.

Respond with this exact JSON (LaTeX using \\(...\\) inline and \\[...\\] display):
{"title":"SPOK Mock — ${board} ${cfg.sectionName}","totalMarks":${cfg.totalMarks},"timeMinutes":${cfg.timeMinutes},"sections":[{"name":"${cfg.sectionName}","questions":[${qPH.map(q => `{"number":${q.number},"topic":"${q.topic}","marks":${q.marks},"stem":"STEM","answer":"ANSWER","worked_solution":[{"label":"Step 1","content":"WORKING"}]}`).join(',')}]}]}`
}

function buildGcsePrompt(board: string, cfg: any, paperType: GcseType, selected: any[], qPH: any[], seed: number, diff: string) {
  const calcNote = paperType === 'non-calc'
    ? 'This is a NON-CALCULATOR paper. Do not write questions that require a calculator.'
    : 'This is a CALCULATOR paper. Questions may involve decimal calculations.'

  return `Generate a UNIQUE mock ${board} GCSE Maths ${cfg.boardLabel} exam paper. Seed: ${seed}. Difficulty: ${diff}.
${calcNote}

Topics to cover (one question each — use GCSE-appropriate language and difficulty):
${selected.map((t, i) => `${i + 1}. ${t.name} (${qPH[i].marks} marks)`).join('\n')}

Questions should be at GCSE Higher tier level. Each may have an optional "diagram" SVG field.

Respond with this exact JSON (LaTeX using \\(...\\) inline and \\[...\\] display):
{"title":"SPOK Mock — ${board} GCSE ${cfg.sectionName}","totalMarks":${cfg.totalMarks},"timeMinutes":${cfg.timeMinutes},"sections":[{"name":"${cfg.sectionName}","questions":[${qPH.map(q => `{"number":${q.number},"topic":"${q.topic}","marks":${q.marks},"stem":"STEM","answer":"ANSWER","worked_solution":[{"label":"Step 1","content":"WORKING"}]}`).join(',')}]}]}`
}
