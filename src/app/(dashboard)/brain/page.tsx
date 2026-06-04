import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrainMap } from '@/components/progress/BrainMap'
import { computeGradeSummary } from '@/lib/grade'
import { getTopics, getTopicCategories } from '@/lib/curriculum'
import type { Level } from '@/lib/curriculum'

export default async function BrainPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase.from('profiles').select('level').eq('id', user.id).single(),
    supabase.from('student_progress').select().eq('student_id', user.id),
  ])

  const level: Level = (profile?.level as Level) ?? 'A-Level'
  const topics = getTopics(level)
  const topicCategories = getTopicCategories(level)

  const progressList = progress ?? []
  // Grade is now derived from mastery across ALL topics (unstudied = 0), matching
  // the dashboard. Previously this page divided by studied topics only, so it
  // reported a higher grade than the dashboard for the same student.
  const gradeSummary = computeGradeSummary(progressList, topics.length)

  return (
    <BrainMap
      progress={progressList}
      avgPKnown={gradeSummary.overallPKnown}
      grade={gradeSummary.confident ? gradeSummary.grade : '—'}
      topicsActive={progressList.length}
      totalTopics={topics.length}
      topics={topics}
      topicCategories={topicCategories}
    />
  )
}
