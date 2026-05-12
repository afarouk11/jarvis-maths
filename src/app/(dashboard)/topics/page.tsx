import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTopics, getTopicCategories, getLevelLabel, type Level } from '@/lib/curriculum/index'
import { masteryColor, masteryLabel } from '@/lib/bkt/bayesian-knowledge-tracing'
import Link from 'next/link'

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
  const progressMap = new Map((progress ?? []).map(p => [p.topic_id, p.p_known]))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Topics</h1>
        <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>{profile?.level === 'GCSE' ? 'AQA GCSE' : 'AQA A-level'} Mathematics curriculum</p>
      </div>

      {Object.entries(categories).map(([category, slugs]) => (
        <section key={category} className="mb-10">
          <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {topics.filter(t => slugs.includes(t.slug)).map(topic => {
              const pKnown = progressMap.get(topic.slug) ?? 0
              const label = masteryLabel(pKnown)
              const color = masteryColor(pKnown)
              return (
                <Link key={topic.slug} href={`/topics/${topic.slug}`}
                  className="group p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{topic.name}</p>
                      <p className="text-xs mt-0.5" style={{ color }}>{label}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(pKnown * 100)}%`, background: color }} />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
