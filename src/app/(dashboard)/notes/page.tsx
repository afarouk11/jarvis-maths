import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NotebookText, FileText, ChevronRight } from 'lucide-react'
import { getTopics, getTopicCategories, type Level } from '@/lib/curriculum/index'

export const metadata = { title: 'Notes · StudiQ' }

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: profile }, { data: notes }] = await Promise.all([
    supabase.from('profiles').select('level, exam_board').eq('id', user.id).single(),
    supabase.from('knowledge_base').select('topic_slug, type'),
  ])

  const level = (profile?.level ?? 'A-Level') as Level
  const topics = getTopics(level)
  const categories = getTopicCategories(level)

  // Count notes (and worked examples) per topic slug.
  const counts = new Map<string, { total: number; examples: number }>()
  for (const n of notes ?? []) {
    if (!n.topic_slug) continue
    const c = counts.get(n.topic_slug) ?? { total: 0, examples: 0 }
    c.total += 1
    if (n.type === 'worked_example') c.examples += 1
    counts.set(n.topic_slug, c)
  }

  const topicBySlug = Object.fromEntries(topics.map(t => [t.slug, t]))
  const totalNotes = topics.reduce((sum, t) => sum + (counts.get(t.slug)?.total ?? 0), 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex items-start gap-3">
        <div className="mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <NotebookText size={20} style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>Notes</h1>
          <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>
            Revision notes & worked examples for {profile?.exam_board ?? 'AQA'}{' '}
            {level === 'GCSE' ? 'GCSE' : 'A-level'} Mathematics — {totalNotes} notes across {topics.length} topics
          </p>
        </div>
      </div>

      {Object.entries(categories).map(([category, slugs]) => (
        <section key={category} className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#5a7aaa' }}>
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slugs.map(slug => {
              const topic = topicBySlug[slug]
              if (!topic) return null
              const c = counts.get(slug)
              const has = (c?.total ?? 0) > 0
              return (
                <Link key={slug} href={`/notes/${slug}`}
                  className="group flex items-start gap-3 p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{
                    background: has ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${has ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.05)'}`,
                  }}>
                  <span className="text-2xl shrink-0 leading-none mt-0.5">{topic.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm leading-snug">{topic.name}</p>
                    <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: '#5a7aaa' }}>
                      <FileText size={11} />
                      {has
                        ? `${c!.total} note${c!.total === 1 ? '' : 's'}${c!.examples ? ` · ${c!.examples} worked example${c!.examples === 1 ? '' : 's'}` : ''}`
                        : 'Coming soon'}
                    </p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 mt-1 transition-transform group-hover:translate-x-0.5"
                    style={{ color: '#3a4a5c' }} />
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
