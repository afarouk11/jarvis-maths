import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().slice(0, 10)

  // Check if already completed today
  const { data: completion } = await supabase
    .from('daily_challenge_completions')
    .select('*')
    .eq('user_id', user.id)
    .eq('challenge_date', today)
    .single()

  if (completion) return NextResponse.json({ completion, done: true })

  // Get weakest topic for personalized challenge
  const { data: profile } = await supabase.from('profiles').select('level, exam_board').eq('id', user.id).single()
  const { data: progress } = await supabase
    .from('student_progress')
    .select('topic_id, p_known')
    .eq('student_id', user.id)
    .order('p_known', { ascending: true })
    .limit(5)

  const weakest = progress?.[0]

  // Resolve topic UUID → human-readable slug for the AI prompt
  let topicSlug = 'quadratics'
  if (weakest?.topic_id) {
    const { data: topicRow } = await supabase
      .from('topics')
      .select('slug')
      .eq('id', weakest.topic_id)
      .single()
    if (topicRow?.slug) topicSlug = topicRow.slug
  }
  const level = profile?.level === 'GCSE' ? 'GCSE' : 'A-level'
  const board = profile?.exam_board ?? 'AQA'

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt: `Generate a single ${level} ${board} maths question on "${topicSlug}" suitable as a daily challenge (medium difficulty, 2-3 marks).

Return JSON only:
{
  "question": "question text using LaTeX \\(...\\) for inline maths",
  "answer": "final answer",
  "hint": "one-sentence hint without giving away the answer",
  "explanation": "brief 2-sentence explanation of the method"
}`,
  })

  try {
    const match = text.match(/\{[\s\S]*\}/)
    const q = JSON.parse(match?.[0] ?? '{}')
    return NextResponse.json({ question: q, topicSlug, done: false })
  } catch {
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topicSlug, correct } = await req.json()
  const xpEarned = correct ? 25 : 5
  const today = new Date().toISOString().slice(0, 10)

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await admin.from('daily_challenge_completions').upsert({
    user_id: user.id,
    challenge_date: today,
    topic_slug: topicSlug,
    correct,
    xp_earned: xpEarned,
  }, { onConflict: 'user_id,challenge_date' })

  if (xpEarned > 0) {
    const { data: prof } = await admin.from('profiles').select('xp').eq('id', user.id).single()
    await admin.from('profiles').update({ xp: (prof?.xp ?? 0) + xpEarned }).eq('id', user.id)
  }

  return NextResponse.json({ ok: true, xpEarned })
}
