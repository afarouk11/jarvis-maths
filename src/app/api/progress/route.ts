import { createClient } from '@/lib/supabase/server'
import { updateBKTPartial, pGuessForFormat } from '@/lib/bkt/bayesian-knowledge-tracing'
import { decayedPKnown } from '@/lib/bkt/forgetting'
import { computeGradeSummary } from '@/lib/grade'
import { qualityFromCorrect } from '@/lib/sm2/spaced-repetition'
import { updateFSRS, gradeFromScore, compressIntervalForExam } from '@/lib/fsrs/fsrs'
import { getPrerequisites } from '@/lib/curriculum/topic-graph'
import { getTopics } from '@/lib/curriculum'
import { xpForAnswer } from '@/lib/xp-levels'
import { logEvent } from '@/lib/analytics'
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

  // Normalise topic_id (a UUID in the DB) to the topic slug, so every client
  // consumer is slug-consistent (brain map, Study Now, useProgress all key by slug).
  const { data: topicRows } = await supabase.from('topics').select('id, slug')
  const slugById = new Map((topicRows ?? []).map((t: { id: string; slug: string }) => [t.id, t.slug]))
  const normalised = (data ?? []).map(p => ({ ...p, topic_id: slugById.get(p.topic_id) ?? p.topic_id }))
  return Response.json(normalised)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { topicId, questionId, correct, timeSeconds, quality: qualityOverride, timeTakenSeconds, marksEarned, marksAvailable, format, misconceptions, difficulty, skill, selfRating } = body
  const effectiveTimeSeconds = timeTakenSeconds ?? timeSeconds

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Resolve topic slug → UUID. topic_id is a UUID FK, so we must never fall back
  // to writing the raw slug (that would violate the FK and orphan the row).
  const { data: topic } = await supabase
    .from('topics').select('id').eq('slug', topicId).single()
  if (!topic) {
    return Response.json({ error: 'Topic not found — run /api/seed-topics first' }, { status: 404 })
  }
  const topicUUID = topic.id

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

  // Difficulty- and weakness-weighted XP (uses the prior, pre-update mastery).
  const xpGain = xpForAnswer(correct, difficulty ?? 3, priorPKnown)
  // Read exam date + personalised FSRS retention (gracefully if 039 unapplied).
  let examDate: string | null = null
  let fsrsRetention = 0.9
  const profRead = await supabase.from('profiles').select('exam_date, fsrs_retention').eq('id', user.id).single()
  if (profRead.error) {
    examDate = (await supabase.from('profiles').select('exam_date').eq('id', user.id).single()).data?.exam_date ?? null
  } else {
    examDate = profRead.data?.exam_date ?? null
    fsrsRetention = profRead.data?.fsrs_retention ?? 0.9
  }

  // FSRS scheduling: derive a grade from the answer score and update the topic's
  // memory model (stability + difficulty), targeting the student's retention.
  const grade = gradeFromScore(score)
  const fsrs = updateFSRS(
    existing
      ? { stability: existing.stability, difficulty: existing.difficulty, lastReviewAt: existing.last_attempted_at }
      : {},
    grade,
    Date.now(),
    fsrsRetention,
  )

  // Capture a review log for FSRS personalisation (best-effort).
  try {
    await supabase.from('fsrs_review_logs').insert({
      user_id: user.id,
      topic_slug: topicId,
      grade,
      elapsed_days: existing?.last_attempted_at
        ? Math.max(0, (Date.now() - new Date(existing.last_attempted_at).getTime()) / 86400000)
        : 0,
      recalled: grade >= 3,
    })
  } catch { /* table not migrated — non-fatal */ }

  // Compress the interval as the exam approaches (cramming curve), and never
  // schedule a review past the exam date.
  const daysToExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))
    : null
  const intervalDays = compressIntervalForExam(fsrs.intervalDays, daysToExam)
  const nextReviewAt = new Date(Date.now() + intervalDays * 86400000)

  const update = {
    student_id: user.id,
    topic_id: topicUUID,
    p_known: newBKT.pKnown,
    p_transit: newBKT.pTransit,
    p_slip: newBKT.pSlip,
    p_guess: newBKT.pGuess,
    next_review_at: nextReviewAt.toISOString(),
    interval_days: intervalDays,
    ease_factor: existing?.ease_factor ?? 2.5,
    repetitions: (existing?.repetitions ?? 0) + 1,
    questions_attempted: (existing?.questions_attempted ?? 0) + 1,
    questions_correct: (existing?.questions_correct ?? 0) + (correct ? 1 : 0),
    last_attempted_at: new Date().toISOString(),
  }

  // Persist FSRS state if the columns exist; retry without them if migration 032
  // hasn't been applied yet so question recording never breaks.
  const fsrsFields = { stability: fsrs.stability, difficulty: fsrs.difficulty }
  let upsertError = (await supabase
    .from('student_progress')
    .upsert({ ...update, ...fsrsFields }, { onConflict: 'student_id,topic_id' })).error
  if (upsertError) {
    upsertError = (await supabase
      .from('student_progress')
      .upsert(update, { onConflict: 'student_id,topic_id' })).error
  }
  if (upsertError) return Response.json({ error: upsertError.message }, { status: 500 })

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
        // Atomic increment via RPC; fall back to read-modify-write if 037 isn't applied.
        const { error } = await supabase.rpc('bump_misconception', { p_user: user.id, p_topic: topicId, p_tag: tag })
        if (error) {
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
      }
    } catch { /* table may not be migrated yet — non-fatal */ }
  }

  // Per-sub-skill mastery: update the specific technique this question tested.
  if (typeof skill === 'string' && skill) {
    try {
      const { data: sk } = await supabase
        .from('student_skill_progress')
        .select('p_known, attempts, correct')
        .eq('student_id', user.id).eq('topic_slug', topicId).eq('skill', skill)
        .maybeSingle()
      const updated = updateBKTPartial(
        { pKnown: sk?.p_known ?? 0.3, pTransit: 0.09, pSlip: 0.1, pGuess },
        score,
      ).pKnown
      await supabase.from('student_skill_progress').upsert({
        student_id: user.id,
        topic_slug: topicId,
        skill,
        p_known: updated,
        attempts: (sk?.attempts ?? 0) + 1,
        correct: (sk?.correct ?? 0) + (correct ? 1 : 0),
        last_attempted_at: new Date().toISOString(),
      }, { onConflict: 'student_id,topic_slug,skill' })
    } catch { /* table not migrated yet — non-fatal */ }
  }

  // Confidence calibration: compare the student's self-rating (0-5) with how
  // they actually did. A persistent positive gap = overconfident. Non-fatal.
  if (typeof selfRating === 'number') {
    try {
      const { data: c } = await supabase.from('profiles').select('calib_sum, calib_count').eq('id', user.id).single()
      const gap = selfRating / 5 - score
      await supabase.from('profiles').update({
        calib_sum: (c?.calib_sum ?? 0) + gap,
        calib_count: (c?.calib_count ?? 0) + 1,
      }).eq('id', user.id)
    } catch { /* columns not migrated yet — non-fatal */ }
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
    const now = new Date()

    // Read streak freezes separately so a missing column (un-migrated) simply
    // disables the feature instead of breaking the profile read.
    let freezes: number | null = null
    {
      const { data: f, error: fErr } = await supabase
        .from('profiles').select('streak_freezes').eq('id', user.id).single()
      if (!fErr) freezes = (f?.streak_freezes as number | null) ?? 0
    }

    // Calendar-day difference (UTC), not a raw millisecond floor.
    const lastActive = prof.last_active_at ? new Date(prof.last_active_at) : null
    const dayDiff = lastActive
      ? Math.round(
          (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
            - Date.UTC(lastActive.getUTCFullYear(), lastActive.getUTCMonth(), lastActive.getUTCDate())) / 86400000,
        )
      : 999

    let newStreak = prof.streak_days ?? 0
    let newFreezes = freezes ?? 0

    if (dayDiff <= 0) {
      if (newStreak === 0) newStreak = 1        // first activity today
    } else if (dayDiff === 1) {
      newStreak += 1                            // consecutive day
    } else if (dayDiff === 2 && newFreezes > 0) {
      newFreezes -= 1                           // one missed day — covered by a freeze
      newStreak += 1
    } else {
      newStreak = 1                             // gap too large → reset
    }

    // Earn a freeze each time the streak crosses a 7-day milestone (capped at 2).
    if (newStreak > (prof.streak_days ?? 0) && newStreak % 7 === 0) {
      newFreezes = Math.min(2, newFreezes + 1)
    }

    const update: Record<string, unknown> = {
      streak_days: newStreak,
      last_active_at: now.toISOString(),
    }
    if (freezes !== null) update.streak_freezes = newFreezes

    await supabase.from('profiles').update(update).eq('id', user.id)

    // XP is incremented atomically so concurrent answers never lose points.
    // Fall back to read-modify-write if the RPC (migration 037) isn't present.
    const { error: xpErr } = await supabase.rpc('increment_xp', { p_user: user.id, p_amount: xpGain })
    if (xpErr) await supabase.from('profiles').update({ xp: (prof.xp ?? 0) + xpGain }).eq('id', user.id)
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

  await logEvent(supabase, user.id, 'answer_recorded', {
    topic: topicId,
    correct,
    difficulty: difficulty ?? null,
    source: body.source ?? 'practice',
    skill: skill ?? null,
  })

  return Response.json({ pKnown: newBKT.pKnown, nextReviewAt, xpGain })
}
