import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Zap, BookOpen, Lightbulb, Sigma, PencilRuler } from 'lucide-react'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS } from '@/lib/curriculum/gcse-topics'
import { NotesContent } from '@/components/notes/NotesContent'

interface Props { params: Promise<{ slug: string }> }

type NoteType = 'concept' | 'formula' | 'worked_example' | 'tip' | 'graph_example'

interface NoteRow {
  id: string
  type: NoteType
  title: string
  content: string
}

// Display order + styling per note type.
const TYPE_META: Record<string, { label: string; icon: typeof BookOpen; color: string; order: number }> = {
  concept:         { label: 'Notes',           icon: BookOpen,    color: '#60a5fa', order: 0 },
  formula:         { label: 'Key Formulas',    icon: Sigma,       color: '#a78bfa', order: 1 },
  worked_example:  { label: 'Worked Example',  icon: PencilRuler, color: '#22c55e', order: 2 },
  tip:             { label: 'Exam Tips',       icon: Lightbulb,   color: '#f59e0b', order: 3 },
  graph_example:   { label: 'Graphs',          icon: BookOpen,    color: '#60a5fa', order: 4 },
}

export default async function TopicNotesPage({ params }: Props) {
  const { slug } = await params
  const topic = AQA_TOPICS.find(t => t.slug === slug) ?? GCSE_TOPICS.find(t => t.slug === slug)
  if (!topic) notFound()
  const isGCSE = slug.startsWith('gcse-')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase.from('profiles').select('exam_board').eq('id', user.id).single(),
    supabase.from('knowledge_base')
      .select('id, type, title, content')
      .eq('topic_slug', slug)
      .order('created_at', { ascending: true }),
  ])
  const examBoard = profile?.exam_board ?? 'AQA'

  const notes = (rows ?? []) as NoteRow[]
  const sorted = [...notes].sort((a, b) =>
    (TYPE_META[a.type]?.order ?? 9) - (TYPE_META[b.type]?.order ?? 9)
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/notes"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors hover:text-white"
        style={{ color: '#5a7aaa' }}>
        <ArrowLeft size={15} /> All notes
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <span className="text-4xl leading-none">{topic.icon}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white"
                style={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
                {topic.name}
              </h1>
              <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>
                {topic.year_group} · {isGCSE ? `${examBoard} GCSE Mathematics` : `${examBoard} A-level Mathematics`}
              </p>
            </div>
            <Link href={`/practice?topic=${slug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all hover:scale-105"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa' }}>
              <Zap size={14} /> Practice
            </Link>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="p-8 rounded-2xl text-center"
          style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}>
          <BookOpen size={28} className="mx-auto mb-3" style={{ color: '#3b82f6' }} />
          <p className="text-sm font-medium text-white mb-1">Notes are on their way</p>
          <p className="text-sm" style={{ color: '#5a7aaa' }}>
            We&apos;re still writing revision notes for this topic. In the meantime, try the lessons or ask SPOK.
          </p>
          <Link href={`/topics/${slug}`}
            className="inline-block mt-4 text-xs px-4 py-2 rounded-lg"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
            Go to topic →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {sorted.map(note => {
            const meta = TYPE_META[note.type] ?? TYPE_META.concept
            const Icon = meta.icon
            return (
              <article key={note.id} className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-5 py-3 flex items-center gap-2.5"
                  style={{ background: `${meta.color}0f`, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Icon size={15} style={{ color: meta.color }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  <span className="text-sm font-semibold text-white ml-1 truncate">{note.title}</span>
                </div>
                <div className="px-5 py-4">
                  <NotesContent content={note.content} />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
