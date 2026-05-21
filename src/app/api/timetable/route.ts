import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { buildStudentProfile } from '@/lib/ai/student-profile'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'

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
      studentProfileText,
    ] = await Promise.all([
      supabase.from('profiles').select('exam_date, target_grade, full_name').eq('id', user.id).single(),
      supabase.from('student_progress').select().eq('student_id', user.id),
      buildStudentProfile(user.id),
    ])

    const progressList = progress ?? []
    const examDate = profile?.exam_date ?? null
    const targetGrade = profile?.target_grade ?? 'A'
    const fullName = profile?.full_name ?? 'Student'

    const today = '2026-05-21'

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
        const topic = AQA_TOPICS.find(t => t.slug === p.topic_id)
        return topic ? `${topic.name} (${Math.round(p.p_known * 100)}% mastery)` : null
      })
      .filter((t): t is string => t !== null)

    const strongTopics = progressList
      .filter(p => p.p_known > 0.7)
      .map(p => {
        const topic = AQA_TOPICS.find(t => t.slug === p.topic_id)
        return topic ? `${topic.name} (${Math.round(p.p_known * 100)}% mastery)` : null
      })
      .filter((t): t is string => t !== null)

    const notStartedTopics = AQA_TOPICS
      .filter(t => !progressList.find(p => p.topic_id === t.slug))
      .map(t => t.name)

    const allTopicSlugs = AQA_TOPICS.map(t => `${t.slug} → "${t.name}"`).join('\n')

    const prompt = `You are a study planner for A-level Mathematics students. Generate a 7-day study timetable for the following student.

STUDENT PROFILE:
${studentProfileText}

ADDITIONAL DETAILS:
- Today's date: ${today}
- Exam date: ${examDate ?? 'Unknown'}
- Days until exam: ${examCountdown !== null ? examCountdown : 'Unknown'}
- Target grade: ${targetGrade}
- Available study time per day: ${hoursPerDay} hours (${hoursPerDay * 60} minutes)

TOPIC MASTERY:
- Weak topics (p_known < 50%, prioritise these): ${weakTopics.length > 0 ? weakTopics.join(', ') : 'None'}
- Strong topics (p_known > 70%, use for review/confidence): ${strongTopics.length > 0 ? strongTopics.join(', ') : 'None'}
- Not yet started: ${notStartedTopics.length > 0 ? notStartedTopics.slice(0, 8).join(', ') : 'None'}

VALID TOPIC SLUGS (use ONLY these for topicSlug):
${allTopicSlugs}

INSTRUCTIONS:
1. Create a 7-day plan starting from Monday 2026-05-25 to Sunday 2026-05-31.
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
      "date": "2026-05-25",
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
      model: anthropic('claude-sonnet-4-6'),
      prompt,
      maxOutputTokens: 4000,
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
