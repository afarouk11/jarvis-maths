import { createClient } from '@/lib/supabase/server'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { masteryLabel, predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'

export async function buildStudentProfile(userId: string): Promise<string> {
  const supabase = await createClient()

  const [
    { data: profile },
    { data: progress },
    { data: attempts },
    { data: insights },
  ] = await Promise.all([
    supabase.from('profiles').select().eq('id', userId).single(),
    supabase.from('student_progress').select().eq('student_id', userId),
    supabase.from('question_attempts').select().eq('student_id', userId).order('attempted_at', { ascending: false }).limit(50),
    supabase.from('student_insights').select().eq('student_id', userId).single(),
  ])

  if (!profile) return ''

  const progressList = progress ?? []
  const attemptList = attempts ?? []

  // Grade prediction
  const avgPKnown = progressList.length > 0
    ? progressList.reduce((s, p) => s + p.p_known, 0) / progressList.length
    : 0
  const grade = predictedGrade(avgPKnown)

  // Weakest topics (p_known < 0.4, most attempts)
  const weak = progressList
    .filter(p => p.p_known < 0.4)
    .sort((a, b) => b.questions_attempted - a.questions_attempted)
    .slice(0, 3)
    .map(p => {
      const topic = AQA_TOPICS.find(t => t.slug === p.topic_id)
      return topic ? `${topic.name} (${Math.round(p.p_known * 100)}%)` : null
    })
    .filter(Boolean)

  // Strongest topics
  const strong = progressList
    .filter(p => p.p_known >= 0.7)
    .sort((a, b) => b.p_known - a.p_known)
    .slice(0, 3)
    .map(p => {
      const topic = AQA_TOPICS.find(t => t.slug === p.topic_id)
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
    notes.length > 0 ? `\nSpok memory notes:\n${notes.map(n => `- ${n}`).join('\n')}` : '',
  ].filter(Boolean)

  return lines.join('\n')
}
