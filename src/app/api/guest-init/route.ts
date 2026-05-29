import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check if profile already exists (idempotent)
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existing) return NextResponse.json({ ok: true })

  // Create a demo profile with everything set up so the dashboard loads fully
  const examDate = new Date()
  examDate.setMonth(examDate.getMonth() + 10) // ~next May

  const { error } = await admin.from('profiles').insert({
    id: user.id,
    full_name: 'Guest Teacher',
    email: null,
    role: 'student',
    level: 'A-Level',
    exam_board: 'Edexcel',
    exam_date: examDate.toISOString().split('T')[0],
    target_grade: 'A',
    xp: 0,
    streak_days: 0,
    onboarding_complete: true,
    is_admin: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
