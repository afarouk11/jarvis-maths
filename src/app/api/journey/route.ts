import { createClient } from '@/lib/supabase/server'
import { applyDecay } from '@/lib/bkt/forgetting'
import { getTopics, type Level } from '@/lib/curriculum'
import { pickFocusTopic, nextPhase, isWorkingPhase, pageToPhase, phaseRoute } from '@/lib/journey/engine'
import type { JourneyPage, JourneyPhase, LearningJourney, StepOutcome } from '@/lib/journey/types'
import type { StudentProgress } from '@/types'

type SupabaseServer = Awaited<ReturnType<typeof createClient>>

interface Context {
  level: Level
  slugById: Map<string, string>
  idBySlug: Map<string, string>
  progress: StudentProgress[]
}

// Load the level + slug↔UUID maps + decayed, slug-normalised mastery in one shot.
async function loadContext(supabase: SupabaseServer, userId: string): Promise<Context> {
  const [{ data: profile }, { data: progressRows }, { data: topicRows }] = await Promise.all([
    supabase.from('profiles').select('level').eq('id', userId).single(),
    supabase.from('student_progress').select().eq('student_id', userId),
    supabase.from('topics').select('id, slug'),
  ])

  const level: Level = (profile?.level as Level) ?? 'A-Level'
  const rows = (topicRows ?? []) as Array<{ id: string; slug: string }>
  const slugById = new Map(rows.map(t => [t.id, t.slug]))
  const idBySlug = new Map(rows.map(t => [t.slug, t.id]))
  const progress = applyDecay(
    ((progressRows ?? []) as StudentProgress[]).map(p => ({
      ...p,
      topic_id: slugById.get(p.topic_id) ?? p.topic_id,
    })),
  )
  return { level, slugById, idBySlug, progress }
}

function focusSlugOf(journey: LearningJourney | null, slugById: Map<string, string>): string | null {
  if (!journey?.focus_topic_id) return null
  return slugById.get(journey.focus_topic_id) ?? null
}

async function activeJourney(supabase: SupabaseServer, userId: string): Promise<LearningJourney | null> {
  const { data } = await supabase
    .from('learning_journeys')
    .select()
    .eq('student_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  return (data as LearningJourney | null) ?? null
}

// Open an in-progress audit step for the phase the journey just entered.
async function openStep(
  supabase: SupabaseServer,
  journey: LearningJourney,
  phase: JourneyPhase,
  ctx: Context,
): Promise<void> {
  if (!isWorkingPhase(phase) || phase === 'complete') return
  // Don't open a second in-progress step for the same phase.
  const { data: open } = await supabase
    .from('journey_steps')
    .select('id')
    .eq('journey_id', journey.id)
    .eq('phase', phase)
    .eq('status', 'in_progress')
    .maybeSingle()
  if (open) return
  const slug = focusSlugOf(journey, ctx.slugById)
  const before = slug ? ctx.progress.find(p => p.topic_id === slug)?.p_known ?? null : null
  await supabase.from('journey_steps').insert({
    journey_id: journey.id,
    topic_id: journey.focus_topic_id,
    phase,
    status: 'in_progress',
    p_known_before: before,
  })
}

// Return the student's active journey, creating one (diagnosing the weakest
// topic) if none exists.
async function ensureActiveJourney(
  supabase: SupabaseServer,
  userId: string,
  ctx: Context,
  topics: ReturnType<typeof getTopics>,
): Promise<LearningJourney | null> {
  const existing = await activeJourney(supabase, userId)
  if (existing) return existing
  const focusSlug = pickFocusTopic(ctx.progress, topics, 0.7)
  const focusId = focusSlug ? ctx.idBySlug.get(focusSlug) ?? null : null
  const { data } = await supabase
    .from('learning_journeys')
    .insert({
      student_id: userId,
      status: 'active',
      current_phase: focusSlug ? 'welcome' : 'complete',
      focus_topic_id: focusId,
    })
    .select()
    .single()
  return (data as LearningJourney | null) ?? null
}

export async function GET(): Promise<Response> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const ctx = await loadContext(supabase, user.id)
  const journey = await activeJourney(supabase, user.id)

  let steps: unknown[] = []
  if (journey) {
    const { data } = await supabase
      .from('journey_steps')
      .select()
      .eq('journey_id', journey.id)
      .order('created_at', { ascending: true })
    steps = data ?? []
  }

  return Response.json({
    journey,
    steps,
    focusSlug: focusSlugOf(journey, ctx.slugById),
    progress: ctx.progress,
    level: ctx.level,
  })
}

export async function POST(req: Request): Promise<Response> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { action?: unknown; page?: unknown; outcome?: StepOutcome }
  const action = body.action
  if (action !== 'start' && action !== 'advance' && action !== 'end' && action !== 'open') {
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  }
  const outcome: StepOutcome | undefined = body.outcome

  const ctx = await loadContext(supabase, user.id)
  const topics = getTopics(ctx.level)

  // ── start ────────────────────────────────────────────────────────────────
  if (action === 'start') {
    const existing = await activeJourney(supabase, user.id)
    if (existing) {
      return Response.json({ journey: existing, focusSlug: focusSlugOf(existing, ctx.slugById) })
    }

    const focusSlug = pickFocusTopic(ctx.progress, topics, 0.7)
    const focusId = focusSlug ? ctx.idBySlug.get(focusSlug) ?? null : null
    const { data: journey, error } = await supabase
      .from('learning_journeys')
      .insert({
        student_id: user.id,
        status: 'active',
        current_phase: focusSlug ? 'welcome' : 'complete',
        focus_topic_id: focusId,
      })
      .select()
      .single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ journey, focusSlug })
  }

  // ── end ──────────────────────────────────────────────────────────────────
  if (action === 'end') {
    await supabase
      .from('learning_journeys')
      .update({ status: 'abandoned', completed_at: new Date().toISOString() })
      .eq('student_id', user.id)
      .eq('status', 'active')
    return Response.json({ journey: null })
  }

  // ── open ───────────────────────────────────────────────────────────────────
  // SPOK opens a page itself: ensure a journey exists, set its phase to match
  // the page, manage the audit step, and return the route for the client to push.
  if (action === 'open') {
    const page: JourneyPage = body.page === 'practice' || body.page === 'paper' ? body.page : 'notes'
    const journey = await ensureActiveJourney(supabase, user.id, ctx, topics)
    if (!journey) return Response.json({ error: 'Nothing to study — all topics mastered' }, { status: 400 })

    const targetPhase = pageToPhase(page)
    // Close any step still open on the phase we're leaving.
    if (isWorkingPhase(journey.current_phase) && journey.current_phase !== targetPhase) {
      await supabase
        .from('journey_steps')
        .update({ status: 'done', completed_at: new Date().toISOString() })
        .eq('journey_id', journey.id)
        .eq('phase', journey.current_phase)
        .eq('status', 'in_progress')
    }

    const { data: updated } = await supabase
      .from('learning_journeys')
      .update({ current_phase: targetPhase })
      .eq('id', journey.id)
      .select()
      .single()
    const target = (updated as LearningJourney | null) ?? journey
    if (target.current_phase === targetPhase) await openStep(supabase, target, targetPhase, ctx)

    const slug = focusSlugOf(target, ctx.slugById)
    const route = slug ? phaseRoute(targetPhase, slug, target.id) : null
    return Response.json({ journey: target, focusSlug: slug, route })
  }

  // ── advance ────────────────────────────────────────────────────────────────
  const journey = await activeJourney(supabase, user.id)
  if (!journey) return Response.json({ error: 'No active journey' }, { status: 404 })

  const phase = journey.current_phase
  const slug = focusSlugOf(journey, ctx.slugById)

  // Close the step we're leaving with the latest mastery + any reported outcome.
  if (isWorkingPhase(phase)) {
    const liveAfter = slug ? ctx.progress.find(p => p.topic_id === slug)?.p_known ?? null : null
    await supabase
      .from('journey_steps')
      .update({
        status: 'done',
        p_known_after: outcome?.pKnownAfter ?? liveAfter,
        payload: outcome?.payload ?? {},
        completed_at: new Date().toISOString(),
      })
      .eq('journey_id', journey.id)
      .eq('phase', phase)
      .eq('status', 'in_progress')
  }

  // Finishing `analyse` closes a cycle: either loop to the next weak topic, or
  // complete the journey when nothing is left below target.
  if (phase === 'analyse') {
    const newFocus = pickFocusTopic(ctx.progress, topics, journey.target_mastery)
    if (!newFocus) {
      const { data: done } = await supabase
        .from('learning_journeys')
        .update({
          status: 'completed',
          current_phase: 'complete',
          cycles_done: journey.cycles_done + 1,
          completed_at: new Date().toISOString(),
        })
        .eq('id', journey.id)
        .select()
        .single()
      return Response.json({ journey: done, focusSlug: null })
    }
    const newId = ctx.idBySlug.get(newFocus) ?? null
    const { data: looped } = await supabase
      .from('learning_journeys')
      .update({ current_phase: 'diagnose', focus_topic_id: newId, cycles_done: journey.cycles_done + 1 })
      .eq('id', journey.id)
      .select()
      .single()
    if (looped) await openStep(supabase, looped as LearningJourney, 'diagnose', ctx)
    return Response.json({ journey: looped, focusSlug: newFocus })
  }

  // Normal forward advance.
  const next = nextPhase(phase)
  const { data: advanced } = await supabase
    .from('learning_journeys')
    .update({ current_phase: next })
    .eq('id', journey.id)
    .select()
    .single()
  if (advanced && isWorkingPhase(next)) {
    await openStep(supabase, advanced as LearningJourney, next, ctx)
  }
  return Response.json({ journey: advanced, focusSlug: focusSlugOf(advanced as LearningJourney, ctx.slugById) })
}
