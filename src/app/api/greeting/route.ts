import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export const maxDuration = 30

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const encouragement = searchParams.get('encouragement') === '1'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      { data: profile },
      { data: progress },
      { data: topics },
      { data: lastMessages },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, exam_date, target_grade, streak_days, last_active_at, level, exam_board')
        .eq('id', user.id)
        .single(),
      supabase
        .from('student_progress')
        .select('topic_id, p_known, next_review_at, last_attempted_at')
        .eq('student_id', user.id),
      supabase
        .from('topics')
        .select('id, name'),
      supabase
        .from('spok_messages')
        .select('role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6),
    ])

    const topicNameById = new Map((topics ?? []).map((t: { id: string; name: string }) => [t.id, t.name]))
    const now = new Date()
    const rows = progress ?? []

    // Due topics (spaced repetition)
    const dueTopics = rows
      .filter(r => new Date(r.next_review_at) <= now)
      .sort((a, b) => a.p_known - b.p_known)
      .slice(0, 3)
      .map(r => topicNameById.get(r.topic_id) ?? null)
      .filter(Boolean) as string[]

    // Weakest practiced topic
    const weakest = rows.length > 0
      ? rows.reduce((a, b) => a.p_known < b.p_known ? a : b)
      : null
    const weakestName = weakest ? (topicNameById.get(weakest.topic_id) ?? null) : null

    // Last practiced topic (most recent last_attempted_at)
    const lastPracticed = rows
      .filter(r => r.last_attempted_at)
      .sort((a, b) => new Date(b.last_attempted_at).getTime() - new Date(a.last_attempted_at).getTime())[0]
    const lastPracticedName = lastPracticed ? (topicNameById.get(lastPracticed.topic_id) ?? null) : null
    const lastPracticedMastery = lastPracticed ? Math.round(lastPracticed.p_known * 100) : null

    // Last SPOK chat topic (from message history — grab most recent user question)
    const lastUserMessage = (lastMessages ?? [])
      .find(m => m.role === 'user')
    const lastChatSnippet = lastUserMessage
      ? lastUserMessage.content.slice(0, 80).replace(/\s+/g, ' ').trim()
      : null

    // Exam countdown
    let daysToExam: number | null = null
    if (profile?.exam_date) {
      daysToExam = Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - now.getTime()) / 86400000))
    }

    const name = profile?.full_name?.split(' ')[0] ?? null
    const streak = profile?.streak_days ?? 0

    // Build context string for the AI
    const parts: string[] = []
    if (lastPracticedName) {
      parts.push(`Last practice session: ${lastPracticedName} (${lastPracticedMastery}% mastery).`)
    }
    if (lastChatSnippet && !lastPracticedName) {
      parts.push(`Last chat topic: "${lastChatSnippet}".`)
    }
    if (dueTopics.length > 0) {
      parts.push(`Due for review today: ${dueTopics.join(', ')}.`)
    }
    if (weakestName && weakestName !== lastPracticedName) {
      parts.push(`Weakest area: ${weakestName}.`)
    }
    if (daysToExam !== null && daysToExam < 120) {
      parts.push(`Exam in ${daysToExam} days.`)
    }
    if (streak > 1) {
      parts.push(`On a ${streak}-day study streak.`)
    }

    const context = parts.join(' ')
    const namePart = name ?? 'there'

    const encouragementExtra = encouragement
      ? ' This student has encouragement mode on — be noticeably warm and end with something that acknowledges their specific effort or progress.'
      : ''

    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: `You are SPOK, an A-level maths tutor who genuinely cares about your students.
Speak in 2–3 natural conversational sentences — no markdown, no bullet points, no dashes, no lists.
Be warm and direct. Sound like a brilliant friend checking in, not a system reading a status report.
Rules:
- If you know what they last practiced, name it specifically: "You were working on ${lastPracticedName ?? 'something'} last time..." not "your last session".
- If there are topics due for review, name the most overdue one specifically: "Your ${dueTopics[0] ?? 'next topic'} is due for a revisit today."
- If there are weak topics, reference the weakest one by name so they know what to prioritise.
- Never say "I see from your profile" or "According to your data". Just speak naturally.
- Never start with "Hello" or "Hi". Open with something personal and immediate.${encouragementExtra}`,
      prompt: context
        ? `Brief ${namePart} on their last session and what to do today: ${context}`
        : `Welcome ${namePart} back and invite them to ask a maths question or pick a topic to practise.`,
    })

    return NextResponse.json({ greeting: text.trim() })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[greeting]', message)
    return NextResponse.json({ error: 'Failed to generate greeting' }, { status: 500 })
  }
}
