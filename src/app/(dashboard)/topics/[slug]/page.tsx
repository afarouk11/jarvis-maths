import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { masteryColor, masteryLabel } from '@/lib/bkt/bayesian-knowledge-tracing'
import { JarvisChat } from '@/components/jarvis/JarvisChat'
import { GenerateLessonButton } from '@/components/lessons/GenerateLessonButton'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, Zap, BookOpen } from 'lucide-react'

interface Props { params: Promise<{ slug: string }> }

export default async function TopicPage({ params }: Props) {
  const { slug } = await params
  const topic = AQA_TOPICS.find(t => t.slug === slug)
  if (!topic) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: topicRow } = await supabase
    .from('topics').select('id').eq('slug', slug).single()

  const [{ data: lessons }, { data: progress }, { data: recentAttempts }] = await Promise.all([
    topicRow
      ? supabase.from('lessons').select().eq('topic_id', topicRow.id).order('difficulty')
      : Promise.resolve({ data: [] }),
    supabase.from('student_progress').select().eq('student_id', user.id).eq('topic_id', slug).single(),
    topicRow
      ? supabase
          .from('question_attempts')
          .select('id, correct, time_taken_seconds, created_at, question_id, questions(stem)')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),
  ])

  const pKnown = progress?.p_known ?? 0
  const color = masteryColor(pKnown)
  const accuracy = progress && progress.questions_attempted > 0
    ? Math.round((progress.questions_correct / progress.questions_attempted) * 100)
    : null
  const nextReview = progress?.next_review_at ? new Date(progress.next_review_at) : null
  const isDue = nextReview ? nextReview <= new Date() : false

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <span className="text-4xl">{topic.icon}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{topic.name}</h1>
              <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>
                {topic.year_group} · AQA A-level Mathematics
              </p>
            </div>
            <Link href={`/practice?topic=${slug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all hover:scale-105"
              style={{
                background: isDue ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                border: `1px solid ${isDue ? 'rgba(245,158,11,0.4)' : 'rgba(59,130,246,0.35)'}`,
                color: isDue ? '#f59e0b' : '#60a5fa',
              }}>
              <Zap size={14} />
              {isDue ? 'Due — Practice Now' : 'Practice'}
            </Link>
          </div>

          {/* Mastery bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color }}>{masteryLabel(pKnown)}</span>
              <span className="text-xs font-bold" style={{ color }}>{Math.round(pKnown * 100)}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.round(pKnown * 100)}%`, background: color }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {progress && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatTile label="Questions" value={String(progress.questions_attempted)} />
          <StatTile label="Accuracy" value={accuracy !== null ? `${accuracy}%` : '—'} color={accuracy !== null ? (accuracy >= 70 ? '#22c55e' : accuracy >= 50 ? '#f59e0b' : '#ef4444') : undefined} />
          <StatTile
            label="Next review"
            value={nextReview ? (isDue ? 'Due now' : nextReview.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })) : '—'}
            color={isDue ? '#f59e0b' : undefined}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Lessons */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={14} style={{ color: '#3b82f6' }} />
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Lessons</h2>
          </div>
          {lessons && lessons.length > 0 ? (
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <Link key={lesson.id} href={`/topics/${slug}/lesson/${lesson.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }}>
                  <span className="text-blue-400 font-mono text-sm w-6">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{lesson.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
                      {lesson.estimated_minutes ? `~${lesson.estimated_minutes} min · ` : ''}
                      {'★'.repeat(lesson.difficulty)}{'☆'.repeat(5 - lesson.difficulty)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-xl text-center"
              style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-sm mb-4" style={{ color: '#5a7aaa' }}>No lessons yet.</p>
              <GenerateLessonButton slug={slug} />
            </div>
          )}
          {lessons && lessons.length > 0 && (
            <div className="mt-3"><GenerateLessonButton slug={slug} /></div>
          )}
        </section>

        {/* Recent attempts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} style={{ color: '#a78bfa' }} />
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a78bfa' }}>Recent Attempts</h2>
          </div>
          {recentAttempts && recentAttempts.length > 0 ? (
            <div className="space-y-2">
              {recentAttempts.map((a: any) => (
                <div key={a.id}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: a.correct ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                    border: `1px solid ${a.correct ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  }}>
                  <div className="shrink-0 mt-0.5">
                    {a.correct
                      ? <CheckCircle size={14} style={{ color: '#22c55e' }} />
                      : <XCircle size={14} style={{ color: '#ef4444' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate leading-relaxed">
                      {(a.questions as any)?.stem
                        ? (a.questions as any).stem.replace(/\$\$?/g, '').slice(0, 80) + ((a.questions as any).stem.length > 80 ? '…' : '')
                        : 'Question'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: a.correct ? '#22c55e' : '#ef4444' }}>
                        {a.correct ? 'Correct' : 'Incorrect'}
                      </span>
                      {a.time_taken_seconds && (
                        <span className="text-xs" style={{ color: '#4a6080' }}>· {a.time_taken_seconds}s</span>
                      )}
                      <span className="text-xs" style={{ color: '#4a6080' }}>
                        · {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-xl text-center"
              style={{ background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)' }}>
              <p className="text-sm mb-3" style={{ color: '#5a7aaa' }}>No attempts yet.</p>
              <Link href={`/practice?topic=${slug}`}
                className="text-xs px-4 py-2 rounded-lg inline-block"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                Start practising →
              </Link>
            </div>
          )}
        </section>
      </div>

      <JarvisChat topicContext={topic.name} />
    </div>
  )
}

function StatTile({ label, value, color = '#fff' }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs mb-1" style={{ color: '#5a7aaa' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}
