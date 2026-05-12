import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('level, exam_board, target_grade, year_group, full_name, dyslexia_mode, adhd_mode')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ level: profile?.level ?? 'A-Level', ...profile })
}
