import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrainMap } from '@/components/progress/BrainMap'
import { predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'

export default async function BrainPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: progress } = await supabase
    .from('student_progress')
    .select()
    .eq('student_id', user.id)

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
      totalTopics={AQA_TOPICS.length}
    />
  )
}
