import { createClient } from '@/lib/supabase/server'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS } from '@/lib/curriculum/gcse-topics'
import { masteryLabel, predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'

const ALL_TOPICS = [...AQA_TOPICS, ...GCSE_TOPICS]

export async function buildStudentProfile(userId: string): Promise<string> {
  const supabase = await createClient()

  const [
    { data: profile },
    { data: progress },
    { data: attempts },
    { data: insights },
    { data: miscons },
  ] = await Promise.all([
    supabase.from('profiles').select().eq('id', userId).single(),
    supabase.from('student_progress').select().eq('student_id', userId),
    supabase.from('question_attempts').select().eq('student_id', userId).order('attempted_at', { ascending: false }).limit(50),
    supabase.from('student_insights').select().eq('student_id', userId).single(),
    supabase.from('student_misconceptions').select('topic_slug, tag, count').eq('user_id', userId).gte('count', 2).order('count', { ascending: false }).limit(4),
  ])

  if (!profile) return ''

  const progressList = progress ?? []
  const attemptList = attempts ?? []

  // Grade prediction
  const avgPKnown = progressList.length > 0
    ? progressList.reduce((s, p) => s + p.p_known, 0) / progressList.length
    : 0
  const grade = predictedGrade(avgPKnown, profile.level)

  // Weakest topics (p_known < 0.4, most attempts)
  const weak = progressList
    .filter(p => p.p_known < 0.4)
    .sort((a, b) => b.questions_attempted - a.questions_attempted)
    .slice(0, 3)
    .map(p => {
      const topic = ALL_TOPICS.find(t => t.slug === p.topic_id)
      return topic ? `${topic.name} (${Math.round(p.p_known * 100)}%)` : null
    })
    .filter(Boolean)

  // Strongest topics
  const strong = progressList
    .filter(p => p.p_known >= 0.7)
    .sort((a, b) => b.p_known - a.p_known)
    .slice(0, 3)
    .map(p => {
      const topic = ALL_TOPICS.find(t => t.slug === p.topic_id)
      return topic ? `${topic.name} (${Math.round(p.p_known * 100)}%)` : null
    })
    .filter(Boolean)

  // Due for review
  const due = progressList
    .filter(p => new Date(p.next_review_at) <= new Date())
    .length

  // Recent accuracy
  const recentCorrect = attemptList.filter(a => a.correct).length
  const recentAccuracy = attemptList.length > 0
    ? Math.round((recentCorrect / attemptList.length) * 100)
    : null

  // Avg time per question
  const timings = attemptList.filter(a => a.time_taken_seconds).map(a => a.time_taken_seconds)
  const avgTime = timings.length > 0
    ? Math.round(timings.reduce((s, t) => s + t, 0) / timings.length)
    : null

  // Recurring misconceptions (seen 2+ times) — so SPOK can gently name the pattern
  const recurring = (miscons ?? []).map((m: { topic_slug: string; tag: string; count: number }) => {
    const topic = ALL_TOPICS.find(t => t.slug === m.topic_slug)
    return `${m.tag}${topic ? ` (in ${topic.name})` : ''} — seen ${m.count}×`
  })

  // Confidence calibration — only once there's enough signal.
  const calibCount = (profile.calib_count as number | undefined) ?? 0
  const calibMean = calibCount >= 5 ? (profile.calib_sum as number) / calibCount : null
  const calibrationNote = calibMean === null
    ? ''
    : calibMean > 0.15
      ? 'Calibration: tends to OVERESTIMATE their performance — gently reality-check answers and encourage checking working.'
      : calibMean < -0.15
        ? 'Calibration: tends to UNDERESTIMATE themselves — they are better than they think, build their confidence.'
        : 'Calibration: well-calibrated self-assessment.'

  // Spok notes
  const notes = (insights?.jarvis_notes as any[] ?? []).slice(-5).map((n: any) => n.note)

  // Build profile string
  const lines = [
    `STUDENT PROFILE — ${profile.full_name ?? 'Student'}`,
    `Exam board: ${profile.exam_board} | Target grade: ${profile.target_grade} | Predicted grade: ${grade}`,
    `Streak: ${profile.streak_days} days | XP: ${profile.xp} | Topics practised: ${progressList.length}`,
    '',
    strong.length > 0 ? `Strong topics: ${strong.join(', ')}` : 'No mastered topics yet.',
    weak.length > 0 ? `Weak topics (prioritise): ${weak.join(', ')}` : 'No significant weaknesses identified yet.',
    due > 0 ? `${due} topic(s) due for spaced repetition review today.` : 'No topics due for review.',
    recentAccuracy !== null ? `Recent accuracy (last 50 questions): ${recentAccuracy}%` : '',
    avgTime !== null ? `Average time per question: ${avgTime}s` : '',
    calibrationNote,
    recurring.length > 0 ? `\nRecurring mistakes (call these out gently when relevant, don't list them mechanically):\n${recurring.map(r => `- ${r}`).join('\n')}` : '',
    notes.length > 0 ? `\nSpok memory notes:\n${notes.map(n => `- ${n}`).join('\n')}` : '',
  ].filter(Boolean)

  return lines.join('\n')
}
