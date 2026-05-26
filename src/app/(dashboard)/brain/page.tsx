import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrainMap } from '@/components/progress/BrainMap'
import { predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'
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
  const avgPKnown = progressList.length
    ? progressList.reduce((s: number, p: any) => s + p.p_known, 0) / progressList.length
    : 0

  return (
    <BrainMap
      progress={progressList}
      avgPKnown={avgPKnown}
      grade={predictedGrade(avgPKnown)}
      topicsActive={progressList.length}
      totalTopics={topics.length}
      topics={topics}
      topicCategories={topicCategories}
    />
  )
}
