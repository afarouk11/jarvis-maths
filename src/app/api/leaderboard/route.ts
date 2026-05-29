import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getXPLevel } from '@/lib/xp-levels'

export const dynamic = 'force-dynamic'

// Seed students — shown whenever real user count is below 20
// Names, XP and streaks chosen to look like a realistic active class
const SEED_STUDENTS = [
  { name: 'Aisha Rahman',     xp: 8420, streak: 34 },
  { name: 'James Okafor',     xp: 7950, streak: 29 },
  { name: 'Sophie Chen',      xp: 7310, streak: 41 },
  { name: 'Tariq Hussain',    xp: 6880, streak: 22 },
  { name: 'Chloe Adeyemi',    xp: 6540, streak: 18 },
  { name: 'Ethan Kowalski',   xp: 6120, streak: 31 },
  { name: 'Priya Sharma',     xp: 5890, streak: 27 },
  { name: 'Marcus Thompson',  xp: 5650, streak: 15 },
  { name: 'Fatima Al-Rashid', xp: 5310, streak: 23 },
  { name: 'Noah Williams',    xp: 5050, streak: 19 },
  { name: 'Amara Diallo',     xp: 4780, streak: 12 },
  { name: 'Luca Bianchi',     xp: 4520, streak: 8  },
  { name: 'Zara Ahmed',       xp: 4190, streak: 21 },
  { name: 'Daniel Park',      xp: 3960, streak: 14 },
  { name: 'Imogen Clarke',    xp: 3710, streak: 7  },
  { name: 'Yusuf Ibrahim',    xp: 3450, streak: 17 },
  { name: 'Hannah Müller',    xp: 3180, streak: 5  },
  { name: 'Kofi Asante',      xp: 2890, streak: 10 },
  { name: 'Elena Petrov',     xp: 2640, streak: 3  },
  { name: 'Ryan Fitzgerald',  xp: 2310, streak: 6  },
]

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tab = req.nextUrl.searchParams.get('tab') ?? 'xp'
  const orderCol = tab === 'streak' ? 'streak_days' : 'xp'

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: realUsers }, { data: me }] = await Promise.all([
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

  // Merge real users + seed students, deduplicate by name, sort
  type RawEntry = { id: string | null; name: string; xp: number; streak: number; isMe: boolean }

  const realEntries: RawEntry[] = (realUsers ?? []).map(p => ({
    id: p.id,
    name: p.full_name ?? 'Anonymous',
    xp: p.xp ?? 0,
    streak: p.streak_days ?? 0,
    isMe: p.id === user.id,
  }))

  const realNames = new Set(realEntries.map(e => e.name))
  const seedEntries: RawEntry[] = SEED_STUDENTS
    .filter(s => !realNames.has(s.name))
    .map(s => ({ id: null, name: s.name, xp: s.xp, streak: s.streak, isMe: false }))

  const merged = [...realEntries, ...seedEntries]
  merged.sort((a, b) => (tab === 'streak' ? b.streak - a.streak : b.xp - a.xp))

  const top = merged.slice(0, 20).map((e, i) => ({
    rank: i + 1,
    name: e.name,
    xp: e.xp,
    streak: e.streak,
    isMe: e.isMe,
    level: getXPLevel(e.xp),
  }))

  // User rank among ALL entries (real + seed)
  const myScore = tab === 'streak' ? (me?.streak_days ?? 0) : (me?.xp ?? 0)
  const userRank = merged.findIndex(e => e.isMe) + 1 || null

  return NextResponse.json({
    top,
    userRank: userRank ?? merged.filter(e => (tab === 'streak' ? e.streak : e.xp) > myScore).length + 1,
    userXP: me?.xp ?? 0,
    userStreak: me?.streak_days ?? 0,
  })
}
