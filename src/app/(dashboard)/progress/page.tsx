import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap, Star, Brain, BookOpen, Target, ChevronRight, CheckCircle2 } from 'lucide-react'
import { GradeTrendChart } from '@/components/progress/GradeTrendChart'
import { TopicMasteryMap } from '@/components/progress/TopicMasteryMap'
import { getXPLevel } from '@/lib/xp-levels'
import { masteryColor } from '@/lib/bkt/bayesian-knowledge-tracing'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'

const GRADE_IDX: Record<string, number> = { 'A*': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 }
const GRADE_COLOR: Record<string, string> = {
  'A*': '#22c55e', 'A': '#3b82f6', 'B': '#8b5cf6',
  'C': '#f59e0b', 'D': '#ef4444', 'E': '#6b7280',
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: profile }, { data: progress }, { data: snapshots }, { data: topicsRows }] = await Promise.all([
    supabase.from('profiles').select().eq('id', user.id).single(),
    supabase.from('student_progress').select().eq('student_id', user.id),
    supabase.from('grade_snapshots').select('grade,avg_p_known,created_at')
      .eq('student_id', user.id).order('created_at', { ascending: true }).limit(90),
    supabase.from('topics').select('id, slug'),
  ])

  const progressData = (progress ?? []) as any[]
  const snapshotsData = snapshots ?? []

  const avgPKnown = progressData.length > 0
    ? progressData.reduce((s: number, p: any) => s + p.p_known, 0) / progressData.length
    : 0

  const totalAttempted = progressData.reduce((s: number, p: any) => s + (p.questions_attempted ?? 0), 0)
  const totalCorrect = progressData.reduce((s: number, p: any) => s + (p.questions_correct ?? 0), 0)
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

  const slugById    = new Map((topicsRows ?? []).map((t: any) => [t.id, t.slug]))
  const topicNameMap = new Map(AQA_TOPICS.map(t => [t.slug, t.name]))
  const topicIconMap = new Map(AQA_TOPICS.map(t => [t.slug, t.icon]))

  const enriched = progressData
    .filter((p: any) => p.p_known > 0)
    .map((p: any) => {
      const slug = slugById.get(p.topic_id) ?? p.topic_id
      return {
        ...p,
        slug,
        name: topicNameMap.get(slug) ?? slug,
        icon: topicIconMap.get(slug) ?? '📚',
      }
    })
    .sort((a: any, b: any) => b.p_known - a.p_known)

  const strengths = enriched.slice(0, 5)
  const focusAreas = [...enriched].reverse().slice(0, 5)

  const xpLevel = getXPLevel(profile?.xp ?? 0)

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const activeThisWeek = progressData.filter((p: any) =>
    p.last_attempted_at && new Date(p.last_attempted_at) >= oneWeekAgo
  ).length

  const firstSnap = snapshotsData[0]
  const lastSnap = snapshotsData[snapshotsData.length - 1]
  const gradeImproved = firstSnap && lastSnap && firstSnap.grade !== lastSnap.grade
    ? GRADE_IDX[lastSnap.grade] < GRADE_IDX[firstSnap.grade]
    : null

  const streakDays = profile?.streak_days ?? 0
  const streakColor = streakDays >= 7 ? '#f59e0b' : streakDays >= 3 ? '#3b82f6' : '#5a7aaa'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Progress</h1>
          <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>
            {profile?.exam_board ?? 'AQA'} A-level Mathematics
            {profile?.target_grade && ` · Target: ${profile.target_grade}`}
            {profile?.exam_date && ` · Exam: ${new Date(profile.exam_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`}
          </p>
        </div>
        <Link
          href="/brain"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
          <Brain size={13} />
          Knowledge Brain
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Grade prediction */}
        <div className="p-4 rounded-2xl col-span-2 sm:col-span-1"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a7aaa' }}>
            Predicted Grade
          </p>
          <p className="text-4xl font-bold"
            style={{ color: GRADE_COLOR[profile?.target_grade ?? 'A'] ?? '#3b82f6' }}>
            {lastSnap?.grade ?? 'N/A'}
          </p>
          {gradeImproved !== null && (
            <p className="text-xs mt-1 font-semibold" style={{ color: gradeImproved ? '#22c55e' : '#f59e0b' }}>
              {gradeImproved ? `Up from ${firstSnap.grade}` : `Same as start`}
            </p>
          )}
        </div>

        {/* Topics covered */}
        <div className="p-4 rounded-2xl"
          style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen size={12} style={{ color: '#a78bfa' }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a7aaa' }}>Topics</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#a78bfa' }}>{progressData.length}</p>
          <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>of {AQA_TOPICS.length} started</p>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-2xl"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} style={{ color: streakColor }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a7aaa' }}>Streak</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: streakColor }}>{streakDays}d</p>
          <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
            {streakDays === 0 ? 'Start today!' : streakDays >= 7 ? 'On fire!' : 'Keep going!'}
          </p>
        </div>

        {/* XP */}
        <div className="p-4 rounded-2xl"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Star size={12} style={{ color: '#22c55e' }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a7aaa' }}>XP</p>
          </div>
          <p className="text-3xl font-bold text-green-400">{profile?.xp ?? 0}</p>
          <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>{xpLevel.title}</p>
        </div>
      </div>

      {/* Grade trend */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#5a7aaa' }}>
          Grade Over Time
        </h2>
        <GradeTrendChart snapshots={snapshotsData} />
      </div>

      {/* This week + accuracy */}
      {totalAttempted > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}>
            <p className="text-2xl font-bold text-white">{totalAttempted}</p>
            <p className="text-xs mt-1" style={{ color: '#5a7aaa' }}>Questions answered</p>
          </div>
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}>
            <p className="text-2xl font-bold" style={{ color: accuracy >= 70 ? '#22c55e' : accuracy >= 50 ? '#f59e0b' : '#ef4444' }}>
              {accuracy}%
            </p>
            <p className="text-xs mt-1" style={{ color: '#5a7aaa' }}>Accuracy</p>
          </div>
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}>
            <p className="text-2xl font-bold" style={{ color: '#a78bfa' }}>{activeThisWeek}</p>
            <p className="text-xs mt-1" style={{ color: '#5a7aaa' }}>Topics this week</p>
          </div>
        </div>
      )}

      {/* Strengths and focus areas */}
      {enriched.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#22c55e' }}>
                Strengths
              </h2>
            </div>
            <div className="space-y-2">
              {strengths.map((topic: any) => {
                const color = masteryColor(topic.p_known)
                const pct = Math.round(topic.p_known * 100)
                return (
                  <div key={topic.topic_id} className="p-3 rounded-xl flex items-center gap-3"
                    style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
                    <span className="text-lg w-7 text-center">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{topic.name}</p>
                      <div className="mt-1.5 h-1 rounded-full bg-slate-800">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold shrink-0" style={{ color }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Focus areas */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} style={{ color: '#f59e0b' }} />
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
                Needs Work
              </h2>
            </div>
            <div className="space-y-2">
              {focusAreas.length === 0 ? (
                <p className="text-sm" style={{ color: '#5a7aaa' }}>
                  Start practising topics to see your focus areas here.
                </p>
              ) : (
                focusAreas.map((topic: any) => {
                  const color = masteryColor(topic.p_known)
                  const pct = Math.round(topic.p_known * 100)
                  return (
                    <Link key={topic.topic_id} href={`/topics/${topic.slug}`}
                      className="p-3 rounded-xl flex items-center gap-3 group transition-colors block"
                      style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
                      <span className="text-lg w-7 text-center">{topic.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{topic.name}</p>
                        <div className="mt-1.5 h-1 rounded-full bg-slate-800">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                        <span className="text-xs px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                          style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                          Practice
                        </span>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
            {enriched.length > 0 && (
              <Link href="/practice"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Zap size={12} />
                Practice weakest topics
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {progressData.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">No progress yet</h3>
          <p className="text-sm mb-6" style={{ color: '#5a7aaa' }}>
            Answer some practice questions or chat with SPOK to start tracking your progress.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/practice"
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#3b82f6', color: '#fff' }}>
              Start Practising
            </Link>
            <Link href="/jarvis"
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
              Ask SPOK
            </Link>
          </div>
        </div>
      )}

      {/* Full mastery map */}
      {progressData.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#5a7aaa' }}>
            All Topics
          </h2>
          <TopicMasteryMap progress={progressData} />
        </section>
      )}

    </div>
  )
}
