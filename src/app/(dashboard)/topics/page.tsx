import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTopics, getTopicCategories, type Level } from '@/lib/curriculum/index'
import { TopicsSearch } from '@/components/topics/TopicsSearch'

export default async function TopicsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: progress }, { data: profile }] = await Promise.all([
    supabase.from('student_progress').select('topic_id, p_known').eq('student_id', user.id),
    supabase.from('profiles').select('level').eq('id', user.id).single(),
  ])

  const level = (profile?.level ?? 'A-Level') as Level
  const topics = getTopics(level)
  const categories = getTopicCategories(level)
  const progressMap = Object.fromEntries(
    (progress ?? []).map(p => [p.topic_id, p.p_known])
  )

  const studied = (progress ?? []).filter(p => p.p_known > 0).length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>Topics</h1>
        <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>
          {profile?.level === 'GCSE' ? 'AQA GCSE' : 'AQA A-level'} Mathematics — {studied} of {topics.length} topics started
        </p>
      </div>

      <TopicsSearch topics={topics} categories={categories} progressMap={progressMap} />
    </div>
  )
}
