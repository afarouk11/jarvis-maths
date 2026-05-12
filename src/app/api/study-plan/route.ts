import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'

export const maxDuration = 30

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase.from('profiles').select('exam_date, target_grade, exam_board').eq('id', user.id).single(),
    supabase.from('student_progress').select('topic_id, p_known').eq('student_id', user.id),
  ])

  const daysToExam = profile?.exam_date
    ? Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - Date.now()) / 86400000))
    : null

  const progressMap = new Map((progress ?? []).map(p => [p.topic_id, p.p_known]))
  const weakTopics  = AQA_TOPICS
    .map(t => ({ name: t.name, pKnown: progressMap.get(t.slug) ?? 0.3 }))
    .sort((a, b) => a.pKnown - b.pKnown)
    .slice(0, 10)

  const context = [
    profile?.exam_board ? `Exam board: ${profile.exam_board} A-level Mathematics` : '',
    profile?.target_grade ? `Target grade: ${profile.target_grade}` : '',
    daysToExam !== null ? `Days until exam: ${daysToExam}` : 'No exam date set',
    `Weakest topics (by mastery %): ${weakTopics.map(t => `${t.name} (${Math.round(t.pKnown * 100)}%)`).join(', ')}`,
  ].filter(Boolean).join('\n')

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt: `You are SPOK, an A-level Maths tutor AI. Generate a personalised study plan for today based on:
${context}

Return ONLY valid JSON (no markdown) with this shape:
{
  "sessions": [
    { "time": "30 min", "topic": "Topic name", "activity": "What to do", "priority": "high" | "medium" | "low" }
  ],
  "tip": "One motivational tip for today (1–2 sentences, SPOK voice)",
  "totalMinutes": 90
}

Rules:
- 2–4 sessions per day
- Prioritise weak topics but vary activity types (lesson, practice, review)
- If exam < 14 days: focus on highest-frequency exam topics and past paper practice
- tip should feel personal and direct, not generic`,
  })

  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    return NextResponse.json(JSON.parse(cleaned))
  } catch {
    return NextResponse.json({ error: 'Parse failed', raw: text }, { status: 500 })
  }
}
