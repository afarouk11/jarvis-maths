import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getTopics, getLevelLabel, type Level } from '@/lib/curriculum/index'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const hoursPerDay: number = typeof body.hoursPerDay === 'number' ? body.hoursPerDay : 2

    // Fetch profile and progress in parallel
    const [
      { data: profile },
      { data: progress },
    ] = await Promise.all([
      supabase.from('profiles').select('exam_date, target_grade, full_name, level').eq('id', user.id).single(),
      supabase.from('student_progress').select().eq('student_id', user.id),
    ])

    const progressList = progress ?? []
    const examDate = profile?.exam_date ?? null
    const targetGrade = profile?.target_grade ?? 'A'
    const fullName = profile?.full_name ?? 'Student'
    const level = (profile?.level ?? 'A-Level') as Level
    const TOPICS = getTopics(level)
    const levelLabel = getLevelLabel(level)

    const today = new Date().toISOString().slice(0, 10)

    // Compute exam countdown
    let examCountdown: number | null = null
    if (examDate) {
      const diff = new Date(examDate).getTime() - new Date(today).getTime()
      examCountdown = Math.max(0, Math.round(diff / 86400000))
    }

    // Build topic lists
    const weakTopics = progressList
      .filter(p => p.p_known < 0.5)
      .map(p => {
        const topic = TOPICS.find(t => t.slug === p.topic_id)
        return topic ? `${topic.name} (${Math.round(p.p_known * 100)}% mastery)` : null
      })
      .filter((t): t is string => t !== null)

    const strongTopics = progressList
      .filter(p => p.p_known > 0.7)
      .map(p => {
        const topic = TOPICS.find(t => t.slug === p.topic_id)
        return topic ? `${topic.name} (${Math.round(p.p_known * 100)}% mastery)` : null
      })
      .filter((t): t is string => t !== null)

    const notStartedTopics = TOPICS
      .filter(t => !progressList.find(p => p.topic_id === t.slug))
      .map(t => t.name)

    // Only include slugs for topics that will appear in the plan (weak + not-started + strong)
    const relevantSlugs = TOPICS
      .filter(t => {
        const p = progressList.find(pr => pr.topic_id === t.slug)
        return !p || p.p_known < 0.8
      })
      .slice(0, 20)
      .map(t => `${t.slug} → "${t.name}"`)
      .join('\n')

    const prompt = `You are a study planner for ${levelLabel} students. Generate a 7-day study timetable.

STUDENT: ${fullName} | Target: ${targetGrade} | Exam: ${examDate ?? 'Unknown'} (${examCountdown !== null ? examCountdown + ' days' : 'unknown'})
Today: ${today} | Study time: ${hoursPerDay}h/day (${hoursPerDay * 60} min)

TOPIC MASTERY:
- Weak (prioritise): ${weakTopics.length > 0 ? weakTopics.join(', ') : 'None'}
- Strong (review): ${strongTopics.length > 0 ? strongTopics.join(', ') : 'None'}
- Not started: ${notStartedTopics.length > 0 ? notStartedTopics.slice(0, 6).join(', ') : 'None'}

VALID TOPIC SLUGS (use ONLY these):
${relevantSlugs}

INSTRUCTIONS:
1. Create a 7-day plan starting from the coming Monday (calculate from today: ${today}) for 7 consecutive days.
2. Prioritise weak topics early in the week; use later days for stronger topics and mixed review.
3. Each day should have 1-4 sessions that together total approximately ${hoursPerDay * 60} minutes.
4. Activity types: "practice" (drilling questions), "lesson" (learning new content), "review" (spaced repetition of known topics).
5. Only use slugs from the VALID TOPIC SLUGS list above.
6. Return ONLY valid JSON matching this exact shape, with NO markdown fences or extra text:

{
  "summary": "2 sentence overview of the week's focus and strategy",
  "examCountdown": ${examCountdown ?? 42},
  "weeklyPlan": [
    {
      "day": "Monday",
      "date": "YYYY-MM-DD",
      "totalMinutes": ${hoursPerDay * 60},
      "sessions": [
        {
          "topicSlug": "algebra-functions",
          "topicName": "Algebra & Functions",
          "activityType": "practice",
          "durationMinutes": 45,
          "reason": "Low mastery — focused drilling to build foundations"
        }
      ]
    }
  ]
}`

    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt,
      maxOutputTokens: 1800,
    })

    // Strip markdown fences if present
    const cleaned = text
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return Response.json({ error: 'Failed to parse timetable from AI response' }, { status: 500 })
    }

    return Response.json(parsed)
  } catch (err) {
    console.error('Timetable API error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
