import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { validateName } from '@/lib/validate-name'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fullName, examBoard, targetGrade, yearGroup, examDate, level, dyslexiaMode, adhdMode, language, emailReminders } = await req.json()

  if (fullName) {
    const nameError = validateName(fullName)
    if (nameError) return NextResponse.json({ error: nameError }, { status: 400 })
  }

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
      language: language ?? 'en',
      onboarding_complete: true,
    }, { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Persist the email-reminders preference separately so a missing column
  // (migration 036 not applied) can never break profile setup / onboarding.
  if (typeof emailReminders === 'boolean') {
    try { await admin.from('profiles').update({ email_reminders: emailReminders }).eq('id', user.id) } catch { /* non-fatal */ }
  }

  return NextResponse.json({ ok: true })
}
