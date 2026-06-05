import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTopicCategories, type Level } from '@/lib/curriculum'

/**
 * Seeds the BKT model from the onboarding baseline. The student rates confidence
 * per topic category (0–4); we turn that into a modest initial p_known for every
 * topic in the category so the brain map and predicted grade aren't empty on day
 * one. Self-report can never seed "mastered", and we never overwrite real
 * practice progress.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ratings, level } = await req.json().catch(() => ({}))
  if (!ratings || typeof ratings !== 'object') return NextResponse.json({ seeded: 0 })

  const categories = getTopicCategories((level ?? 'A-Level') as Level)

  // category rating (0–4) → modest prior p_known in [0.15, 0.55]
  const seeds = new Map<string, number>()
  for (const [category, slugs] of Object.entries(categories)) {
    const rating = (ratings as Record<string, unknown>)[category]
    if (typeof rating !== 'number') continue
    const pKnown = Math.max(0.1, Math.min(0.6, 0.15 + (rating / 4) * 0.4))
    for (const slug of slugs) seeds.set(slug, pKnown)
  }
  if (seeds.size === 0) return NextResponse.json({ seeded: 0 })

  const { data: topicRows } = await supabase.from('topics').select('id, slug').in('slug', [...seeds.keys()])
  const idBySlug = new Map((topicRows ?? []).map((t: { id: string; slug: string }) => [t.slug, t.id]))

  // Don't clobber any topic the student has already practised.
  const ids = [...idBySlug.values()]
  const { data: existing } = await supabase
    .from('student_progress').select('topic_id').eq('student_id', user.id).in('topic_id', ids)
  const existingSet = new Set((existing ?? []).map((r: { topic_id: string }) => r.topic_id))

  const now = new Date().toISOString()
  const rowsToInsert: Array<{ student_id: string; topic_id: string; p_known: number; next_review_at: string }> = []
  for (const [slug, pKnown] of seeds) {
    const id = idBySlug.get(slug)
    if (!id || existingSet.has(id)) continue
    rowsToInsert.push({ student_id: user.id, topic_id: id, p_known: pKnown, next_review_at: now })
  }

  if (rowsToInsert.length > 0) {
    const { error } = await supabase.from('student_progress').insert(rowsToInsert)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ seeded: rowsToInsert.length })
}
