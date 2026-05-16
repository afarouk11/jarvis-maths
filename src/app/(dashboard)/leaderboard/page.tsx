import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import LeaderboardClient from './LeaderboardClient'

export const metadata: Metadata = {
  title: 'Leaderboard',
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  return <LeaderboardClient />
}
