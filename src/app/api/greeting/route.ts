import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export const maxDuration = 30

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: profile }, { data: mastery }, { data: exams }] = await Promise.all([
      supabase.from('profiles').select('name, full_name, streak, xp').eq('id', user.id).single(),
      supabase.from('topic_mastery').select('topic, mastery_level, next_review_date, total_attempts').eq('user_id', user.id),
      supabase.from('exams').select('exam_date').eq('user_id', user.id).order('exam_date', { ascending: true }).limit(1),
    ])

    const name = profile?.full_name || profile?.name || null
    const today = new Date().toISOString().slice(0, 10)

    const dueTopics = (mastery ?? [])
      .filter(m => m.next_review_date && m.next_review_date <= today)
      .sort((a, b) => (a.mastery_level ?? 5) - (b.mastery_level ?? 5))
      .slice(0, 3)
      .map(m => m.topic)

    const weakTopics = (mastery ?? [])
      .filter(m => (m.mastery_level ?? 5) < 3 && (m.total_attempts ?? 0) > 0)
      .sort((a, b) => (a.mastery_level ?? 5) - (b.mastery_level ?? 5))
      .slice(0, 3)
      .map(m => m.topic)

    const examDate = exams?.[0]?.exam_date
    const daysToExam = examDate
      ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000)
      : null

    const namePart = name ? `${name}` : 'there'
    const streakPart = (profile?.streak ?? 0) > 1 ? `${profile!.streak}-day streak` : null

    let contextPart = ''
    if (dueTopics.length > 0) contextPart += `Topics due for review: ${dueTopics.join(', ')}. `
    if (weakTopics.length > 0) contextPart += `Weakest areas: ${weakTopics.join(', ')}. `
    if (daysToExam !== null && daysToExam > 0 && daysToExam < 120) contextPart += `Exam in ${daysToExam} days. `
    if (streakPart) contextPart += `Currently on a ${streakPart}. `

    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: `You are SPOK, an A-level maths tutor who genuinely cares about your students.
Speak in natural, conversational sentences — no markdown, no bullet points, no lists, no dashes.
Be warm, human, and direct. Sound like a brilliant friend checking in, not a system announcing a status update.
Keep it to 2 sentences maximum. End with exactly one specific, encouraging thing the student should do right now.
Never start with "Hello" or "Hi" — open with something more personal and immediate.`,
      prompt: contextPart
        ? `Greet ${namePart} and tell them what to focus on based on this context: ${contextPart}`
        : `Give ${namePart} a warm welcome and invite them to ask a maths question or pick a topic to practise.`,
    })

    return NextResponse.json({ greeting: text.trim() })
  } catch (err: any) {
    console.error('[greeting]', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to generate greeting' }, { status: 500 })
  }
}
