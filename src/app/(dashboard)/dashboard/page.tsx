import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { masteryColor } from '@/lib/bkt/bayesian-knowledge-tracing'
import { computeGradeSummary } from '@/lib/grade'
import { computeExamReadiness } from '@/lib/exam-readiness'
import { getTopics } from '@/lib/curriculum'
import type { Level } from '@/lib/curriculum'
import { isTopicLocked } from '@/lib/curriculum/topic-graph'
import { getXPLevel } from '@/lib/xp-levels'
import Link from 'next/link'
import { BookOpen, Zap, Bot, FileText, Trophy, Flame } from 'lucide-react'
import { StudyPlan } from '@/components/dashboard/StudyPlan'
import { DueNotification } from '@/components/dashboard/DueNotification'
import { SpokRecommendation } from '@/components/dashboard/SpokRecommendation'
import { ExamReadinessCard } from '@/components/dashboard/ExamReadinessCard'
import { MasteryHeatMap } from '@/components/dashboard/MasteryHeatMap'
import { UpgradedBanner } from '@/components/dashboard/UpgradedBanner'
import { MorningBriefing } from '@/components/dashboard/MorningBriefing'
import { ShareButton } from '@/components/dashboard/ShareButton'
import { CreatorsReel } from '@/components/dashboard/CreatorsReel'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { ExamCountdown } from '@/components/dashboard/ExamCountdown'
import { DailyChallenge } from '@/components/dashboard/DailyChallenge'
import { PushNotificationPrompt } from '@/components/dashboard/PushNotificationPrompt'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ upgraded?: string }> }) {
  const params = await searchParams
  const justUpgraded = params.upgraded === '1'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profileCheck } = await supabase.from('profiles').select('onboarding_complete').eq('id', user.id).single()
  if (!profileCheck?.onboarding_complete) redirect('/onboarding')

  const [{ data: profile }, { data: progress }, { data: recentLessons }, { data: topicsRows }] = await Promise.all([
    supabase.from('profiles').select().eq('id', user.id).single(),
    supabase.from('student_progress').select().eq('student_id', user.id),
    supabase.from('lessons').select('id, title, topic_id, difficulty, created_at').order('created_at', { ascending: false }).limit(4),
    supabase.from('topics').select('id, slug'),
  ])

  const level = ((profile?.level as Level) ?? 'A-Level')
  const allTopics = getTopics(level)

  const slugById   = new Map((topicsRows ?? []).map((t: any) => [t.id,   t.slug]))
  const topicNames = new Map(allTopics.map(t => [t.slug, t.name]))

  const progressMap = new Map((progress ?? []).map(p => [p.topic_id, p]))
  const pKnownMap   = new Map((progress ?? []).map(p => [p.topic_id, p.p_known]))
  const dueTopics   = (progress ?? []).filter(p => new Date(p.next_review_at) <= new Date()).slice(0, 4)
  const gradeSummary       = computeGradeSummary(progress ?? [], allTopics.length)
  const avgPKnown          = gradeSummary.overallPKnown
  const attemptedAvgPKnown = gradeSummary.studiedPKnown
  // Until the student has covered enough of the spec, a predicted grade is noise.
  const grade              = gradeSummary.confident ? gradeSummary.grade : '—'
  const name        = profile?.full_name?.split(' ')[0] ?? 'Student'
  const weakTopics  = [...(progress ?? [])].sort((a, b) => a.p_known - b.p_known).slice(0, 3)
  const xpLevel     = getXPLevel(profile?.xp ?? 0)

  // Exam readiness
  const readiness = computeExamReadiness({
    progress: progress ?? [],
    totalTopics: allTopics.length,
    examDate: profile?.exam_date ?? null,
    targetGrade: profile?.target_grade ?? 'A*',
    slugById,
    topicNames,
  })

  // Exam countdown
  let daysToExam: number | null = null
  if (profile?.exam_date) {
    const diff = new Date(profile.exam_date).getTime() - Date.now()
    daysToExam = Math.max(0, Math.ceil(diff / 86400000))
  }

  const gradeColor = grade === 'A*' ? '#fbbf24' : grade === 'A' ? '#4ade80' : grade === 'B' ? '#60a5fa' : '#94a3b8'
  const greeting   = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  // Topic mastery array for heat map
  const topicMastery = (progress ?? []).map(p => ({
    topicSlug: slugById.get(p.topic_id) ?? p.topic_id,
    pKnown: p.p_known,
  }))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-7">
      <UpgradedBanner show={justUpgraded} />
      <PushNotificationPrompt />
      <MorningBriefing />
      <DueNotification dueCount={dueTopics.length} />

      {/* SPOK recommendation bar */}
      <SpokRecommendation
        progress={progress ?? []}
        examDate={profile?.exam_date ?? null}
        targetGrade={profile?.target_grade ?? 'A*'}
        examBoard={profile?.exam_board ?? 'AQA'}
        topicsRows={topicsRows ?? []}
      />

      {/* Creators reel */}
      <CreatorsReel />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-white"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 26, letterSpacing: '-0.02em' }}>
            {greeting}, {name}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>
            {profile?.exam_board} {profile?.level === 'GCSE' ? 'GCSE' : 'A-level'} Maths · Target {profile?.target_grade}
          </p>
        </div>
        <ShareButton
          name={name}
          grade={grade}
          mastery={Math.round(avgPKnown * 100)}
          topic={`${profile?.exam_board ?? 'AQA'} ${profile?.level === 'GCSE' ? 'GCSE' : 'A-level'} Maths`}
        />
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Trophy size={16} />} label="Predicted Grade" value={grade}
          sub={gradeSummary.confident ? `${Math.round(avgPKnown * 100)}% across all topics` : 'Keep studying to unlock'}
          sub2={gradeSummary.confident ? `${Math.round(attemptedAvgPKnown * 100)}% within studied topics` : undefined}
          color={gradeColor} />
        <StatCard icon={<Flame size={16} />}  label="Study Streak"   value={`${profile?.streak_days ?? 0}d`} sub="days in a row" color="#f97316" />
        <XPCard xp={profile?.xp ?? 0} />
        <StatCard icon={<BookOpen size={16} />} label="Topics Studied" value={`${progress?.length ?? 0}`} sub={`of ${allTopics.length} total`} color="#22c55e" />
      </div>

      {/* Exam countdown (full card) — only when exam date set */}
      {profile?.exam_date && (
        <ExamCountdown
          examDate={profile.exam_date}
          targetGrade={profile?.target_grade ?? 'A*'}
          examBoard={profile?.exam_board ?? 'AQA'}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Exam readiness card */}
          <ExamReadinessCard readiness={readiness} />

          {/* Due for review */}
          {dueTopics.length > 0 && (
            <Section title="Due for Review" href="/practice" linkLabel="Start practice →">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dueTopics.map(p => {
                  const slug  = slugById.get(p.topic_id) ?? p.topic_id
                  const topic = allTopics.find(t => t.slug === slug)
                  return (
                    <Link key={p.id} href={`/practice?topic=${slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                      style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                      <span className="text-xl">{topic?.icon ?? '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{topic?.name ?? 'Topic review'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.round(p.p_known * 100)}%`, background: masteryColor(p.p_known) }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: masteryColor(p.p_known) }}>{Math.round(p.p_known * 100)}%</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Mastery heat map */}
          <Section title="All Topics">
            <MasteryHeatMap topicMastery={topicMastery} />
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <StreakCard
            streakDays={profile?.streak_days ?? 0}
            xp={profile?.xp ?? 0}
            lastStudiedAt={profile?.last_active_at ?? null}
          />
          <DailyChallenge />
          <StudyPlan />

          {/* Quick actions */}
          <Section title="Quick Start">
            <div className="space-y-2">
              {[
                { href: '/jarvis',   icon: <Bot size={15} />,      label: 'Talk to SPOK',        sub: 'Voice or text',          color: '#f59e0b' },
                { href: '/practice', icon: <Zap size={15} />,      label: 'Practice Questions',   sub: `${dueTopics.length} due`, color: '#3b82f6' },
                { href: '/topics',   icon: <BookOpen size={15} />,  label: 'Browse Topics',        sub: 'Start a lesson',         color: '#22c55e' },
                { href: '/papers',   icon: <FileText size={15} />,  label: 'Past Papers',          sub: 'Mock exams',             color: '#a78bfa' },
              ].map(({ href, icon, label, sub, color }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="p-2 rounded-lg shrink-0" style={{ background: `${color}18`, color }}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs" style={{ color: '#5a7aaa' }}>{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>

          {/* Weak topics */}
          {weakTopics.length > 0 && (
            <Section title="Needs Work">
              <div className="space-y-3">
                {weakTopics.map(p => {
                  const slug  = slugById.get(p.topic_id) ?? p.topic_id
                  const topic = allTopics.find(t => t.slug === slug)
                  return (
                    <Link key={p.id} href={`/topics/${slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                      <span>{topic?.icon ?? '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{topic?.name ?? slug}</p>
                        <p className="text-xs" style={{ color: '#ef4444' }}>{Math.round(p.p_known * 100)}% mastered</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Recent lessons */}
          {recentLessons && recentLessons.length > 0 && (
            <Section title="Recent Lessons">
              <div className="space-y-2">
                {recentLessons.map((l: any) => {
                  const topic = allTopics.find(t => t.slug === l.topic_id)
                  return (
                    <div key={l.id} className="p-3 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                      <p className="text-xs font-medium text-white truncate">{topic?.icon ?? '📚'} {l.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
                        {'★'.repeat(l.difficulty)}{'☆'.repeat(5 - l.difficulty)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, sub2, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; sub2?: string; color: string
}) {
  return (
    <div className="p-4 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}18`, color }}>{icon}</div>
        <p className="text-xs font-medium" style={{ color: '#5a7aaa' }}>{label}</p>
      </div>
      <p className="font-bold mb-0.5" style={{ color, fontFamily: 'var(--font-space-grotesk)', fontSize: 28, lineHeight: 1 }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: '#5a7aaa', position: 'relative' }}>{sub}</p>
      {sub2 && <p className="text-xs mt-0.5" style={{ color: '#374151', position: 'relative' }}>{sub2}</p>}
    </div>
  )
}

function XPCard({ xp }: { xp: number }) {
  const lvl   = getXPLevel(xp)
  const isMax = lvl.level === 10

  return (
    <div className="p-4 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ background: `${lvl.color}18`, color: lvl.color }}>
          <Zap size={16} />
        </div>
        <p className="text-xs font-medium" style={{ color: '#5a7aaa' }}>XP Level</p>
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <p className="font-bold" style={{ color: lvl.color, fontFamily: 'var(--font-space-grotesk)', fontSize: 28, lineHeight: 1 }}>
          {lvl.level}
        </p>
        <p className="text-sm font-medium" style={{ color: '#5a7aaa' }}>{lvl.title}</p>
      </div>
      <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(lvl.progress * 100)}%`, background: lvl.color }} />
      </div>
      <p className="text-xs" style={{ color: '#3a4a5c' }}>
        {isMax ? `${xp} XP · Max level` : `${lvl.xpToNext - lvl.xpIntoLevel} XP to level ${lvl.level + 1}`}
      </p>
    </div>
  )
}

function Section({ title, href, linkLabel, children }: {
  title: string; accent?: string; href?: string; linkLabel?: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {href && linkLabel && (
          <Link href={href} className="text-xs font-medium transition-colors hover:text-blue-400" style={{ color: '#5a7aaa' }}>
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}
