import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTopics, type Level } from '@/lib/curriculum'
import { applyDecay } from '@/lib/bkt/forgetting'
import { rootWeakPrerequisite, topologicalOrder } from '@/lib/curriculum/topic-graph'

export const maxDuration = 15

interface Session {
  time: string
  topic: string
  activity: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * Deterministic study plan. Built directly from the student's real signals —
 * due-for-review (spaced repetition), weakest topics routed to their weakest
 * prerequisite, unseen topics in prerequisite order, and time to exam — rather
 * than an LLM call on every dashboard load. Instant, free and consistent.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: profile }, { data: progressRows }, { data: topicRows }] = await Promise.all([
    supabase.from('profiles').select('exam_date, target_grade, level').eq('id', user.id).single(),
    supabase.from('student_progress')
      .select('topic_id, p_known, next_review_at, last_attempted_at, ease_factor, interval_days, questions_attempted')
      .eq('student_id', user.id),
    supabase.from('topics').select('id, slug'),
  ])

  const level = (profile?.level ?? 'A-Level') as Level
  const topics = getTopics(level)
  const nameBySlug = new Map(topics.map(t => [t.slug, t.name]))
  const slugById = new Map((topicRows ?? []).map((t: { id: string; slug: string }) => [t.id, t.slug]))

  // Decay mastery so "weak" reflects real retention.
  const rows = applyDecay(progressRows ?? []).map(p => ({
    ...p,
    slug: (slugById.get(p.topic_id) ?? p.topic_id) as string,
  }))
  const pKnownBySlug = new Map(rows.map(r => [r.slug, r.p_known]))
  const attemptedBySlug = new Map(rows.map(r => [r.slug, r.questions_attempted ?? 0]))

  const now = Date.now()
  const daysToExam = profile?.exam_date
    ? Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - now) / 86400000))
    : null
  const examSoon = daysToExam !== null && daysToExam <= 14

  // Due for spaced-repetition review (weakest first).
  const dueSlugs = rows
    .filter(r => r.next_review_at && new Date(r.next_review_at).getTime() <= now && nameBySlug.has(r.slug))
    .sort((a, b) => a.p_known - b.p_known)
    .map(r => r.slug)

  // Weak started topics, each routed to its weakest prerequisite ("fix first").
  const weakRoots: string[] = []
  for (const r of rows.filter(r => (attemptedBySlug.get(r.slug) ?? 0) > 0 && r.p_known < 0.55).sort((a, b) => a.p_known - b.p_known)) {
    const root = rootWeakPrerequisite(r.slug, pKnownBySlug) ?? r.slug
    if (nameBySlug.has(root) && !weakRoots.includes(root)) weakRoots.push(root)
  }

  // Unseen topics in prerequisite order (so foundations come first).
  const startedSet = new Set(rows.filter(r => (attemptedBySlug.get(r.slug) ?? 0) > 0).map(r => r.slug))
  const unseen = topologicalOrder(topics.map(t => t.slug).filter(s => !startedSet.has(s)))

  const sessions: Session[] = []
  const used = new Set<string>()
  const addTopic = (slug: string | undefined, activity: string, time: string, priority: Session['priority']) => {
    if (!slug || used.has(slug) || sessions.length >= 4) return
    const name = nameBySlug.get(slug)
    if (!name) return
    used.add(slug)
    sessions.push({ time, topic: name, activity, priority })
  }

  if (examSoon) {
    sessions.push({ time: '40 min', topic: 'Mixed past-paper questions', activity: 'Timed past-paper practice to build exam stamina', priority: 'high' })
  }
  addTopic(dueSlugs[0], 'Spaced-repetition review — revisit before it fades', '20 min', 'high')
  addTopic(weakRoots[0], 'Targeted practice on your weakest area', '30 min', 'high')
  addTopic(weakRoots[1] ?? dueSlugs[1], 'Practice to push mastery higher', '25 min', 'medium')
  if (sessions.length < 3) addTopic(unseen[0], 'Start a new topic — lesson then a question', '25 min', 'medium')
  if (sessions.length < 3) addTopic(weakRoots[2] ?? unseen[1], 'More practice on a weak spot', '20 min', 'low')

  if (sessions.length === 0) {
    sessions.push({ time: '30 min', topic: 'Mixed practice', activity: 'A mix of questions across your topics to keep everything sharp', priority: 'medium' })
  }

  const target = profile?.target_grade ?? 'your target'
  const tip = examSoon
    ? `${daysToExam} days to go — timed past papers are the fastest way to lift your grade now.`
    : dueSlugs.length > 0
      ? `You have ${dueSlugs.length} topic${dueSlugs.length > 1 ? 's' : ''} due for review. Clear those first — revisiting just before you forget is when it sticks.`
      : weakRoots.length > 0
        ? `Closing your weakest topics is the quickest route to ${target}. One focused session beats an hour of re-reading.`
        : `Strong position — keep the streak going and stretch yourself with harder questions.`

  const totalMinutes = sessions.reduce((s, ss) => s + (parseInt(ss.time, 10) || 0), 0)

  return NextResponse.json({ sessions, tip, totalMinutes })
}
