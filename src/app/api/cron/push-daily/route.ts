import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export const maxDuration = 60

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL ?? 'hello@studiq.org'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subs } = await admin.from('push_subscriptions').select('*')
  if (!subs?.length) return NextResponse.json({ sent: 0 })

  // Get due counts per user
  const userIds = subs.map((s: any) => s.user_id)
  const now = new Date().toISOString()
  const { data: due } = await admin
    .from('student_progress')
    .select('student_id')
    .in('student_id', userIds)
    .lte('next_review_at', now)

  const dueByUser = new Map<string, number>()
  for (const row of due ?? []) {
    dueByUser.set(row.student_id, (dueByUser.get(row.student_id) ?? 0) + 1)
  }

  let sent = 0
  await Promise.allSettled(
    subs.map(async (sub: any) => {
      const dueCount = dueByUser.get(sub.user_id) ?? 0
      const payload = JSON.stringify({
        title: dueCount > 0 ? `${dueCount} topic${dueCount > 1 ? 's' : ''} due for review` : "Daily challenge is ready 🎯",
        body: dueCount > 0 ? "Open StudiQ to keep your streak alive." : "One question a day. Can you get it right?",
        url: dueCount > 0 ? '/practice' : '/dashboard',
      })
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
      sent++
    })
  )

  return NextResponse.json({ sent })
}
