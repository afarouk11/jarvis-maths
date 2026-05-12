import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GradePrediction } from '@/components/progress/GradePrediction'
import { GradeTrendChart } from '@/components/progress/GradeTrendChart'
import { StreakBadge } from '@/components/progress/StreakBadge'
import { TopicMasteryMap } from '@/components/progress/TopicMasteryMap'
import { ProfileSettings } from '@/components/profile/ProfileSettings'
import { BillingSection } from '@/components/profile/BillingSection'
import { isPro } from '@/lib/stripe'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: profile }, { data: progress }, { data: snapshots }] = await Promise.all([
    supabase.from('profiles').select().eq('id', user.id).single(),
    supabase.from('student_progress').select().eq('student_id', user.id),
    supabase.from('grade_snapshots').select('grade,avg_p_known,created_at')
      .eq('student_id', user.id).order('created_at', { ascending: true }).limit(90),
  ])

  const progressData = progress ?? []
  const avgPKnown = progressData.length > 0
    ? progressData.reduce((s: number, p: any) => s + p.p_known, 0) / progressData.length
    : 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{profile?.full_name ?? 'Your Profile'}</h1>
        <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>
          {profile?.exam_board} A-level · Target: {profile?.target_grade}
          {profile?.exam_date && ` · Exam: ${new Date(profile.exam_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`}
        </p>
      </div>

      <GradePrediction avgPKnown={avgPKnown} targetGrade={profile?.target_grade} />
      <GradeTrendChart snapshots={snapshots ?? []} />
      <StreakBadge streakDays={profile?.streak_days ?? 0} xp={profile?.xp ?? 0} />

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#3b82f6' }}>
          Topic Mastery Map
        </h2>
        <TopicMasteryMap progress={progressData} />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#a78bfa' }}>
          Subscription
        </h2>
        <BillingSection isPro={isPro(profile?.stripe_subscription_status)} />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#f59e0b' }}>
          Settings
        </h2>
        <ProfileSettings
          initialFullName={profile?.full_name ?? ''}
          initialExamBoard={profile?.exam_board ?? 'AQA'}
          initialTargetGrade={profile?.target_grade ?? 'A*'}
          initialExamDate={profile?.exam_date ?? ''}
        />
      </section>
    </div>
  )
}
