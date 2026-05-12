import { createClient } from '@/lib/supabase/server'
import { updateBKT, predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'
import { updateSM2, qualityFromCorrect } from '@/lib/sm2/spaced-repetition'
import { BKTState } from '@/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('student_progress')
    .select()
    .eq('student_id', user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: Request) {
  const body = await req.json()
  const { topicId, questionId, correct, timeSeconds, quality: qualityOverride, timeTakenSeconds } = body
  const effectiveTimeSeconds = timeTakenSeconds ?? timeSeconds

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Resolve topic slug → UUID
  const { data: topic } = await supabase
    .from('topics').select('id').eq('slug', topicId).single()
  const topicUUID = topic?.id ?? topicId

  // Get or create progress row
  const { data: existing } = await supabase
    .from('student_progress')
    .select()
    .eq('student_id', user.id)
    .eq('topic_id', topicUUID)
    .single()

  const bktState: BKTState = existing
    ? { pKnown: existing.p_known, pTransit: existing.p_transit, pSlip: existing.p_slip, pGuess: existing.p_guess }
    : { pKnown: 0.3, pTransit: 0.09, pSlip: 0.1, pGuess: 0.2 }

  const newBKT = updateBKT(bktState, correct)
  const quality = qualityOverride ?? qualityFromCorrect(correct, effectiveTimeSeconds ?? 60)
  const sm2 = updateSM2(
    existing
      ? { intervalDays: existing.interval_days, easeFactor: existing.ease_factor, repetitions: existing.repetitions, nextReviewAt: new Date(existing.next_review_at) }
      : { intervalDays: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: new Date() },
    quality
  )

  const update = {
    student_id: user.id,
    topic_id: topicUUID,
    p_known: newBKT.pKnown,
    p_transit: newBKT.pTransit,
    p_slip: newBKT.pSlip,
    p_guess: newBKT.pGuess,
    next_review_at: sm2.nextReviewAt.toISOString(),
    interval_days: sm2.intervalDays,
    ease_factor: sm2.easeFactor,
    repetitions: sm2.repetitions,
    questions_attempted: (existing?.questions_attempted ?? 0) + 1,
    questions_correct: (existing?.questions_correct ?? 0) + (correct ? 1 : 0),
    last_attempted_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('student_progress')
    .upsert(update, { onConflict: 'student_id,topic_id' })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Log the attempt
  if (questionId) {
    await supabase.from('question_attempts').insert({
      student_id: user.id,
      question_id: questionId,
      correct,
      time_taken_seconds: effectiveTimeSeconds,
    })
  }

  // Update XP and streak on the profile
  const { data: prof } = await supabase
    .from('profiles')
    .select('xp, streak_days, last_active_at')
    .eq('id', user.id)
    .single()

  if (prof) {
    const xpGain    = correct ? 15 : 5
    const now       = new Date()
    const lastActive = prof.last_active_at ? new Date(prof.last_active_at) : null
    const daysSince  = lastActive
      ? Math.floor((now.getTime() - lastActive.getTime()) / 86400000)
      : 999

    const newStreak = daysSince === 0
      ? prof.streak_days              // already studied today
      : daysSince === 1
        ? prof.streak_days + 1        // studied yesterday → extend streak
        : 1                           // gap → reset

    await supabase
      .from('profiles')
      .update({
        xp: (prof.xp ?? 0) + xpGain,
        streak_days: newStreak,
        last_active_at: now.toISOString(),
      })
      .eq('id', user.id)
  }

  // Record grade snapshot at most once per day
  const today = new Date().toISOString().slice(0, 10)
  const { data: todaySnap } = await supabase
    .from('grade_snapshots')
    .select('id')
    .eq('student_id', user.id)
    .gte('created_at', `${today}T00:00:00Z`)
    .limit(1)
    .single()

  if (!todaySnap) {
    const { data: allProgress } = await supabase
      .from('student_progress')
      .select('p_known')
      .eq('student_id', user.id)
    if (allProgress && allProgress.length > 0) {
      const avg = allProgress.reduce((s, p) => s + p.p_known, 0) / allProgress.length
      await supabase.from('grade_snapshots').insert({
        student_id: user.id,
        avg_p_known: avg,
        grade: predictedGrade(avg),
      })
    }
  }

  return Response.json({ pKnown: newBKT.pKnown, nextReviewAt: sm2.nextReviewAt, xpGain: correct ? 15 : 5 })
}
