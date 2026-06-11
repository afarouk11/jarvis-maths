import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrainMap } from '@/components/progress/BrainMap'
import { applyDecay } from '@/lib/bkt/forgetting'
import { computeGradeSummary } from '@/lib/grade'
import { getTopics, getTopicCategories } from '@/lib/curriculum'
import type { Level } from '@/lib/curriculum'

export default async function BrainPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: profile }, { data: progressRows }, { data: topicRows }] = await Promise.all([
    supabase.from('profiles').select('level').eq('id', user.id).single(),
    supabase.from('student_progress').select().eq('student_id', user.id),
    supabase.from('topics').select('id, slug'),
  ])

  const level: Level = (profile?.level as Level) ?? 'A-Level'
  const topics = getTopics(level)
  const topicCategories = getTopicCategories(level)

  // The brain map keys everything by slug, but student_progress.topic_id is a
  // UUID — remap it so mastery actually matches the topics (previously it never
  // did, so the map showed every topic as unstarted).
  const slugById: Record<string, string> = Object.fromEntries((topicRows ?? []).map((t: { id: string; slug: string }) => [t.id, t.slug]))
  const remapped = (progressRows ?? []).map(p => ({ ...p, topic_id: slugById[p.topic_id] ?? p.topic_id }))

  // Decay mastery for topics overdue for review so the map shows real retention.
  const progressList = applyDecay(remapped)
  // Grade is now derived from mastery across ALL topics (unstudied = 0), matching
  // the dashboard. Previously this page divided by studied topics only, so it
  // reported a higher grade than the dashboard for the same student.
  const gradeSummary = computeGradeSummary(progressList, topics.length, level)

  return (
    <BrainMap
      progress={progressList}
      slugById={slugById}
      avgPKnown={gradeSummary.overallPKnown}
      grade={gradeSummary.confident ? gradeSummary.grade : '—'}
      topicsActive={progressList.length}
      totalTopics={topics.length}
      topics={topics}
      topicCategories={topicCategories}
    />
  )
}
