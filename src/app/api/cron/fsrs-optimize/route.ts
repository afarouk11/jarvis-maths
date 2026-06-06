import { createClient as createServiceClient } from '@supabase/supabase-js'
import { optimalRetentionFromLogs } from '@/lib/fsrs/fsrs'

export const dynamic = 'force-dynamic'

// Periodic job: recompute each student's personalised FSRS requested-retention
// from their recent review logs. Scheduled like the other crons.
export async function GET(req: Request) {
  const secret = req.headers.get('x-cron-secret') ?? new URL(req.url).searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString()
  const { data: logs, error } = await admin
    .from('fsrs_review_logs')
    .select('user_id, recalled')
    .gte('reviewed_at', ninetyDaysAgo)
    .limit(100000)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Aggregate recall per user.
  const byUser = new Map<string, { recalled: boolean }[]>()
  for (const l of logs ?? []) {
    const arr = byUser.get(l.user_id) ?? []
    arr.push({ recalled: l.recalled })
    byUser.set(l.user_id, arr)
  }

  let updated = 0
  for (const [userId, userLogs] of byUser) {
    const retention = optimalRetentionFromLogs(userLogs)
    if (retention === null) continue
    await admin.from('profiles').update({ fsrs_retention: retention }).eq('id', userId)
    updated++
  }

  return Response.json({ usersConsidered: byUser.size, updated })
}
