import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const base = 'level, exam_board, target_grade, year_group, full_name, dyslexia_mode, adhd_mode, stripe_subscription_status, chat_messages_today, chat_messages_reset_at, language'
  // Try to include the notification preference; fall back if migration 036 isn't applied.
  const withPrefs = await supabase.from('profiles').select(`${base}, email_reminders`).eq('id', user.id).single()
  const profile = withPrefs.error
    ? (await supabase.from('profiles').select(base).eq('id', user.id).single()).data
    : withPrefs.data

  return NextResponse.json({ level: profile?.level ?? 'A-Level', ...profile })
}
