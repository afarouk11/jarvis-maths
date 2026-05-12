import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fullName, examBoard, targetGrade, yearGroup, examDate, level, dyslexiaMode, adhdMode } = await req.json()

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await admin
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: fullName ?? null,
      level: level ?? 'A-Level',
      exam_board: examBoard ?? 'AQA',
      target_grade: targetGrade ?? 'A*',
      year_group: yearGroup ?? 'AS',
      exam_date: examDate || null,
      dyslexia_mode: dyslexiaMode ?? false,
      adhd_mode: adhdMode ?? false,
      onboarding_complete: true,
    }, { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
