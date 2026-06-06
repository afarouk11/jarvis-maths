import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Admin-only event summary: counts per event type and unique users over the
// last 30 days. A lightweight read on the analytics_events table.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('event, user_id, created_at')
    .gte('created_at', since)
    .limit(50000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const counts = new Map<string, { count: number; users: Set<string> }>()
  for (const e of events ?? []) {
    const agg = counts.get(e.event) ?? { count: 0, users: new Set<string>() }
    agg.count += 1
    if (e.user_id) agg.users.add(e.user_id)
    counts.set(e.event, agg)
  }

  const summary = [...counts.entries()]
    .map(([event, agg]) => ({ event, count: agg.count, uniqueUsers: agg.users.size }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({ windowDays: 30, totalEvents: events?.length ?? 0, summary })
}
