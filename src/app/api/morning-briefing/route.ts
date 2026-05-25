import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const [{ data: profile }, { data: progress }, { data: topics }] = await Promise.all([
    supabase.from('profiles').select('exam_date, full_name, level').eq('id', user.id).single(),
    supabase.from('student_progress').select('p_known, next_review_at, topic_id').eq('student_id', user.id),
    supabase.from('topics').select('id, slug, name'),
  ])

  const now = new Date()
  const rows = progress ?? []
  const topicMap = new Map((topics ?? []).map((t: { id: string; slug: string; name: string }) => [t.id, t]))

  const dueCount = rows.filter(r => new Date(r.next_review_at) <= now).length

  const weakest = rows.length > 0
    ? rows.reduce((a, b) => a.p_known < b.p_known ? a : b)
    : null
  const weakestTopic = weakest
    ? (topicMap.get(weakest.topic_id) as { name?: string } | undefined)?.name ?? null
    : null

  let daysToExam: number | null = null
  if (profile?.exam_date) {
    const diff = new Date(profile.exam_date).getTime() - now.getTime()
    daysToExam = Math.max(0, Math.ceil(diff / 86400000))
  }

  const avgMastery = rows.length > 0
    ? rows.reduce((s, r) => s + r.p_known, 0) / rows.length
    : 0

  return Response.json({
    dueCount,
    weakestTopic,
    daysToExam,
    avgMastery: Math.round(avgMastery * 100),
    firstName: profile?.full_name?.split(' ')[0] ?? null,
  })
}
