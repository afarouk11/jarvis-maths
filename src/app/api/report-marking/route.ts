import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from '@/lib/analytics'
import { asString } from '@/lib/api/validate'

// POST — a student reports a mark they think is wrong.
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const stem = asString(body.stem, 4000)
  if (!stem) return NextResponse.json({ error: 'stem required' }, { status: 400 })

  const row = {
    student_id: user.id,
    stem,
    correct_answer: asString(body.correctAnswer, 4000),
    student_answer: asString(body.studentAnswer, 4000),
    ai_feedback: asString(body.aiFeedback, 4000),
    ai_correct: typeof body.aiCorrect === 'boolean' ? body.aiCorrect : null,
    reason: asString(body.reason, 500),
  }

  try {
    const { error } = await supabase.from('marking_reports').insert(row)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }

  await logEvent(supabase, user.id, 'marking_reported', { aiCorrect: row.ai_correct })
  return NextResponse.json({ ok: true })
}

// GET — admin-only review queue of unresolved reports.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('marking_reports')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data ?? [] })
}
