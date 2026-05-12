import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const MIN_YEAR = 2018
const MAX_YEAR = 2024

function recencyWeight(year: number | null): number {
  if (!year) return 0.6
  const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year))
  // 2018 → 0.5, 2024 → 1.0, linear
  return 0.5 + ((clamped - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 0.5
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get the student's exam board
  const { data: prof } = await supabase
    .from('profiles')
    .select('exam_board')
    .eq('id', user.id)
    .single()
  const board = prof?.exam_board ?? 'AQA'

  // Use admin client to bypass RLS for reading shared paper data
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // QPs only — mark schemes double-count every topic
  const { data: qpPapers } = await admin
    .from('past_papers')
    .select('id, year, title')
    .eq('processed', true)
    .eq('exam_board', board)
    .ilike('title', '%QP%')

  if (!qpPapers || qpPapers.length === 0) return NextResponse.json({ frequency: [], totalPapers: 0 })

  const qpIdSet = new Set(qpPapers.map(p => p.id))
  const paperMeta = new Map(qpPapers.map(p => [p.id, p]))

  // Fetch chunks in batches of 50 IDs to avoid URL limits, page 1000 rows at a time
  const qpIds = [...qpIdSet]
  const BATCH = 50
  const allChunks: { topic_slug: string | null; paper_id: string }[] = []

  for (let i = 0; i < qpIds.length; i += BATCH) {
    const batchIds = qpIds.slice(i, i + BATCH)
    let from = 0
    while (true) {
      const { data } = await admin
        .from('paper_chunks')
        .select('topic_slug, paper_id')
        .in('paper_id', batchIds)
        .range(from, from + 999)
      if (!data || data.length === 0) break
      allChunks.push(...data)
      if (data.length < 1000) break
      from += 1000
    }
  }

  const chunks = allChunks
  if (chunks.length === 0) return NextResponse.json({ frequency: [], totalPapers: qpPapers.length })

  // Track: which papers each topic appeared in, and per-year presence
  const topicPaperIds: Record<string, Set<string>> = {}
  const topicYears: Record<string, Set<number>> = {}

  for (const { topic_slug, paper_id } of chunks) {
    if (!topic_slug || !paper_id) continue
    if (!topicPaperIds[topic_slug]) { topicPaperIds[topic_slug] = new Set(); topicYears[topic_slug] = new Set() }
    topicPaperIds[topic_slug].add(paper_id)
    const year = paperMeta.get(paper_id)?.year
    if (year) topicYears[topic_slug].add(year)
  }

  const allYears = [...new Set(qpPapers.map(p => p.year).filter(Boolean))].sort() as number[]
  const latestYear = Math.max(...allYears)

  const frequency = Object.entries(topicPaperIds).map(([slug, paperSet]) => {
    const years = [...topicYears[slug]].sort()
    const lastYear = Math.max(...years)

    // Weighted score: sum of recency weights for each paper this topic appeared in
    let weightedScore = 0
    for (const pid of paperSet) {
      weightedScore += recencyWeight(paperMeta.get(pid)?.year ?? null)
    }

    // Gap bonus: topic was frequent but skipped recent year(s) → likely "due"
    const historicFreq = years.length / allYears.length
    const yearsMissed = latestYear - lastYear
    const due = historicFreq >= 0.5 && yearsMissed >= 1

    const maxPossibleScore = qpPapers.length * recencyWeight(MAX_YEAR)
    const percent = Math.min(100, Math.round((weightedScore / maxPossibleScore) * 100))

    return {
      slug,
      count: paperSet.size,
      percent,
      weightedScore: Math.round(weightedScore * 10) / 10,
      lastYear,
      due,
    }
  }).sort((a, b) => b.weightedScore - a.weightedScore)

  return NextResponse.json({ frequency, totalPapers: qpPapers.length })
}
