import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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

  const base = {
    student_id: user.id,
    stem,
    correct_answer: asString(body.correctAnswer, 4000),
    student_answer: asString(body.studentAnswer, 4000),
    ai_feedback: asString(body.aiFeedback, 4000),
    ai_correct: typeof body.aiCorrect === 'boolean' ? body.aiCorrect : null,
    reason: asString(body.reason, 500),
  }
  const questionId = asString(body.questionId, 100)

  // Insert with question_id if the column exists (migration 038); retry without.
  let err = (await supabase.from('marking_reports').insert(questionId ? { ...base, question_id: questionId } : base)).error
  if (err && questionId) err = (await supabase.from('marking_reports').insert(base)).error
  if (err) return NextResponse.json({ error: err.message }, { status: 500 })

  await logEvent(supabase, user.id, 'marking_reported', { aiCorrect: base.ai_correct })
  return NextResponse.json({ ok: true })
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { supabase }
}

// GET — admin-only review queue of unresolved reports.
export async function GET() {
  const ctx = await requireAdmin()
  if (ctx.error) return ctx.error
  const { data, error } = await ctx.supabase
    .from('marking_reports')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data ?? [] })
}

// PATCH — admin resolves a report, optionally flagging the underlying question
// so it's removed from the reuse cache.
export async function PATCH(req: Request) {
  const ctx = await requireAdmin()
  if (ctx.error) return ctx.error
  const { supabase } = ctx

  const { id, flagQuestionId } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await supabase.from('marking_reports').update({ resolved: true }).eq('id', id)

  if (flagQuestionId) {
    // Use the service role to flag the shared question (RLS-protected table).
    try {
      const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      await admin.from('questions').update({ flagged: true }).eq('id', flagQuestionId)
    } catch { /* flagged column may not be migrated — non-fatal */ }
  }

  return NextResponse.json({ ok: true })
}
