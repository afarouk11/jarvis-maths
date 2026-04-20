import { createClient } from '@/lib/supabase/server'
import { updateBKT } from '@/lib/bkt/bayesian-knowledge-tracing'
import { updateSM2, qualityFromCorrect } from '@/lib/sm2/spaced-repetition'
import { BKTState } from '@/types'

export async function POST(req: Request) {
  const { topicId, questionId, correct, timeSeconds } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Get or create progress row
  const { data: existing } = await supabase
    .from('student_progress')
    .select()
    .eq('student_id', user.id)
    .eq('topic_id', topicId)
    .single()

  const bktState: BKTState = existing
    ? { pKnown: existing.p_known, pTransit: existing.p_transit, pSlip: existing.p_slip, pGuess: existing.p_guess }
    : { pKnown: 0.3, pTransit: 0.09, pSlip: 0.1, pGuess: 0.2 }

  const newBKT = updateBKT(bktState, correct)
  const quality = qualityFromCorrect(correct, timeSeconds ?? 60)
  const sm2 = updateSM2(
    existing
      ? { intervalDays: existing.interval_days, easeFactor: existing.ease_factor, repetitions: existing.repetitions, nextReviewAt: new Date(existing.next_review_at) }
      : { intervalDays: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: new Date() },
    quality
  )

  const update = {
    student_id: user.id,
    topic_id: topicId,
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
      time_taken_seconds: timeSeconds,
    })
  }

  return Response.json({ pKnown: newBKT.pKnown, nextReviewAt: sm2.nextReviewAt })
}
