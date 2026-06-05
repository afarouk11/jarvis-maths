import { createClient } from '@/lib/supabase/server'
import { updateBKTPartial, pGuessForFormat } from '@/lib/bkt/bayesian-knowledge-tracing'
import { decayedPKnown } from '@/lib/bkt/forgetting'
import { computeGradeSummary } from '@/lib/grade'
import { updateSM2, qualityFromCorrect } from '@/lib/sm2/spaced-repetition'
import { getPrerequisites } from '@/lib/curriculum/topic-graph'
import { getTopics } from '@/lib/curriculum'
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
  const { topicId, questionId, correct, timeSeconds, quality: qualityOverride, timeTakenSeconds, marksEarned, marksAvailable, format, misconceptions } = body
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

  // Decay the prior toward "forgotten" based on how overdue this topic was, so
  // a student returning after a long gap starts from an honest, lower mastery
  // before the new answer is folded in.
  const priorPKnown = existing
    ? decayedPKnown({
        p_known: existing.p_known,
        last_attempted_at: existing.last_attempted_at,
        ease_factor: existing.ease_factor,
        interval_days: existing.interval_days,
      })
    : 0.3

  // Guess probability depends on the question format — written answers are far
  // harder to fluke than multiple choice.
  const pGuess = pGuessForFormat(format)
  const bktState: BKTState = existing
    ? { pKnown: priorPKnown, pTransit: existing.p_transit, pSlip: existing.p_slip, pGuess }
    : { pKnown: 0.3, pTransit: 0.09, pSlip: 0.1, pGuess }

  const quality = qualityOverride ?? qualityFromCorrect(correct, effectiveTimeSeconds ?? 60)

  // Proportional credit: move p_known by how much of the question was actually
  // right (marks earned if known, otherwise self-assessed quality), instead of
  // collapsing everything to a binary correct/incorrect.
  const marksScore = (typeof marksEarned === 'number' && typeof marksAvailable === 'number' && marksAvailable > 0)
    ? marksEarned / marksAvailable
    : null
  const score = marksScore ?? quality / 5
  const newBKT = updateBKTPartial(bktState, score)
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

  // (student_progress is now the single source of truth for mastery — paper
  // generation reads live decayed p_known directly, so the old topic_mastery
  // mirror is no longer written.)

  // Prerequisite evidence propagation: answering a dependent correctly is weak
  // positive evidence that its prerequisites are solid, so nudge them upward
  // (never downward — a wrong answer is too ambiguous to penalise prereqs).
  if (correct) {
    const prereqSlugs = getPrerequisites(topicId)
    if (prereqSlugs.length > 0) {
      const { data: preTopics } = await supabase
        .from('topics').select('id, slug').in('slug', prereqSlugs)
      const preIds = (preTopics ?? []).map((t: { id: string }) => t.id)
      if (preIds.length > 0) {
        const { data: preProgress } = await supabase
          .from('student_progress')
          .select('topic_id, p_known')
          .eq('student_id', user.id)
          .in('topic_id', preIds)
        for (const pp of preProgress ?? []) {
          const nudged = Math.min(0.99, pp.p_known + (1 - pp.p_known) * 0.04)
          await supabase.from('student_progress')
            .update({ p_known: nudged })
            .eq('student_id', user.id)
            .eq('topic_id', pp.topic_id)
        }
      }
    }
  }

  // Misconception tracking: record exam-technique slips against this topic so
  // SPOK can name recurring patterns later. Non-fatal if the table isn't there.
  if (Array.isArray(misconceptions) && misconceptions.length > 0) {
    try {
      for (const raw of misconceptions.slice(0, 5)) {
        const tag = String(raw).slice(0, 200)
        const { data: existingM } = await supabase
          .from('student_misconceptions')
          .select('count')
          .eq('user_id', user.id).eq('topic_slug', topicId).eq('tag', tag)
          .maybeSingle()
        await supabase.from('student_misconceptions').upsert({
          user_id: user.id,
          topic_slug: topicId,
          tag,
          count: (existingM?.count ?? 0) + 1,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'user_id,topic_slug,tag' })
      }
    } catch { /* table may not be migrated yet — non-fatal */ }
  }

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
    .select('xp, streak_days, last_active_at, level')
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
      const totalTopics = getTopics(prof?.level ?? 'A-Level').length
      const summary = computeGradeSummary(allProgress, totalTopics)
      await supabase.from('grade_snapshots').insert({
        student_id: user.id,
        avg_p_known: summary.overallPKnown,
        grade: summary.grade,
      })
    }
  }

  return Response.json({ pKnown: newBKT.pKnown, nextReviewAt: sm2.nextReviewAt, xpGain: correct ? 15 : 5 })
}
