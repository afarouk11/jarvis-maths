import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getXPLevel } from '@/lib/xp-levels'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tab = req.nextUrl.searchParams.get('tab') ?? 'xp'
  const orderCol = tab === 'streak' ? 'streak_days' : 'xp'

  // Service role bypasses RLS to read all profiles
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: top }, { data: me }] = await Promise.all([
    admin
      .from('profiles')
      .select('id, full_name, xp, streak_days')
      .order(orderCol, { ascending: false })
      .limit(20),
    admin
      .from('profiles')
      .select('xp, streak_days')
      .eq('id', user.id)
      .single(),
  ])

  let userRank: number | null = null
  if (me) {
    const score = orderCol === 'streak_days' ? (me.streak_days ?? 0) : (me.xp ?? 0)
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gt(orderCol, score)
    userRank = (count ?? 0) + 1
  }

  const enriched = (top ?? []).map((p, i) => ({
    rank: i + 1,
    name: p.full_name ?? 'Anonymous',
    xp: p.xp ?? 0,
    streak: p.streak_days ?? 0,
    isMe: p.id === user.id,
    level: getXPLevel(p.xp ?? 0),
  }))

  return NextResponse.json({
    top: enriched,
    userRank,
    userXP: me?.xp ?? 0,
    userStreak: me?.streak_days ?? 0,
  })
}
