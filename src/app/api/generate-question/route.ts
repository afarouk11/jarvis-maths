import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { buildQuestionPrompt } from '@/lib/ai/prompts'
import { difficultyForMastery } from '@/lib/bkt/adaptive'
import { getSubskills } from '@/lib/curriculum/subskills'
import { checkRateLimit, tooManyRequests } from '@/lib/api/rate-limit'
import { asString, badRequest } from '@/lib/api/validate'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await checkRateLimit(supabase, user.id, 'generate-question', 60, 3600)
  if (!rl.allowed) return tooManyRequests(rl)

  const { data: prof } = await supabase
    .from('profiles')
    .select('level, exam_board')
    .eq('id', user.id)
    .single()

  const body = await req.json().catch(() => ({}))
  const { difficulty: requestedDifficulty } = body
  const topicId = asString(body.topicId, 200)
  const topicName = asString(body.topicName, 200)
  if (!topicId || !topicName) return badRequest('topicId and topicName are required')

  // Resolve the topic up front — needed for both adaptive difficulty and the insert.
  const { data: topic } = await supabase
    .from('topics').select('id').eq('slug', topicId).single()
  if (!topic) return Response.json({ error: 'Topic not found — run /api/seed-topics first' }, { status: 404 })

  // ── Adaptive difficulty ──────────────────────────────────────────────────
  // Difficulty is driven by the student's live mastery of this topic, unless a
  // caller explicitly pins it. After each answer p_known updates, so the next
  // question naturally gets harder or easier — the core adaptive loop.
  let difficulty = typeof requestedDifficulty === 'number' ? requestedDifficulty : 3
  if (typeof requestedDifficulty !== 'number') {
    const { data: prog } = await supabase
      .from('student_progress')
      .select('p_known, questions_attempted, questions_correct')
      .eq('student_id', user.id)
      .eq('topic_id', topic.id)
      .maybeSingle()
    if (prog) {
      difficulty = difficultyForMastery(prog.p_known, prog.questions_attempted ?? 0, prog.questions_correct ?? 0)
    } else {
      difficulty = 2 // brand-new topic: start gently
    }
  }

  // ── Target the weakest sub-skill ──────────────────────────────────────────
  // Pick the sub-skill (technique) within this topic the student is weakest on,
  // so practice drills the specific gap, not just the broad topic.
  let targetSkill: string | null = null
  const subskills = getSubskills(topicId)
  if (subskills.length > 0) {
    const { data: skillRows } = await supabase
      .from('student_skill_progress')
      .select('skill, p_known')
      .eq('student_id', user.id)
      .eq('topic_slug', topicId)
    const pBySkill = new Map((skillRows ?? []).map((r: { skill: string; p_known: number }) => [r.skill, r.p_known]))
    // Unseen sub-skills are treated as slightly weak so coverage is ensured.
    targetSkill = subskills.reduce((weakest, s) =>
      (pBySkill.get(s) ?? 0.25) < (pBySkill.get(weakest) ?? 0.25) ? s : weakest, subskills[0])
  }

  // ── Question bank / cache ─────────────────────────────────────────────────
  // Most of the time, reuse a previously generated question for this exact
  // topic+difficulty that the student hasn't seen yet. This cuts model calls and
  // latency dramatically on popular topics, while fresh generation the rest of
  // the time keeps growing the bank. Only reuse questions with a worked solution.
  const REUSE_PROBABILITY = 0.6
  try {
    const [{ data: attemptedRows }, { data: bank }] = await Promise.all([
      supabase.from('question_attempts').select('question_id').eq('student_id', user.id),
      supabase.from('questions').select('*').eq('topic_id', topic.id).eq('difficulty', difficulty).limit(50),
    ])
    const attemptedIds = new Set((attemptedRows ?? []).map((a: { question_id: string }) => a.question_id))
    const unseen = (bank ?? []).filter((q: { id: string; worked_solution: unknown }) =>
      !attemptedIds.has(q.id) && Array.isArray(q.worked_solution) && q.worked_solution.length > 0)
    if (unseen.length > 0 && Math.random() < REUSE_PROBABILITY) {
      const pick = unseen[Math.floor(Math.random() * unseen.length)]
      return Response.json(pick)
    }
  } catch {
    // Cache lookup failed — fall through to fresh generation.
  }

  let kbContext = ''
  if (process.env.OPENAI_API_KEY) {
    try {
      const { embedText } = await import('@/lib/ai/embeddings')
      const embedding = await embedText(topicName)
      const { data: knowledge } = await supabase.rpc('match_knowledge', {
        query_embedding: embedding,
        match_count: 2,
        min_similarity: 0.4,
      })
      if (knowledge && knowledge.length > 0) {
        kbContext = '\n\nReference these curated examples when writing the question and worked solution:\n'
        kbContext += (knowledge as Array<{ type: string; title: string; content: string }>)
          .map(k => `[${k.type.replace('_', ' ')} — ${k.title}]\n${k.content}`)
          .join('\n\n')
      }
    } catch {
      // Non-fatal — continue without KB
    }
  }

  let text: string
  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt: buildQuestionPrompt(topicName, difficulty, prof?.level ?? undefined, kbContext, prof?.exam_board ?? 'aqa', targetSkill),
    })
    text = result.text
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: 'AI generation failed', details: msg }, { status: 500 })
  }

  let question
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    question = JSON.parse(cleaned)
  } catch {
    return Response.json({ error: 'Failed to parse question', raw: text }, { status: 500 })
  }

  // The adaptive difficulty is authoritative — override whatever the model echoed.
  question.difficulty = difficulty

  // Keep the diagram aside: persist it if the column exists, but never let a
  // missing column (un-migrated) break question generation.
  const diagram = typeof question.diagram === 'string' && question.diagram.trim() ? question.diagram : null
  delete question.diagram

  const adminSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let inserted: Record<string, unknown> | null = null
  const first = await adminSupabase
    .from('questions')
    .insert({ topic_id: topic.id, ...question, ...(diagram ? { diagram } : {}) })
    .select()
    .single()
  if (first.error && diagram) {
    // `diagram` column may not be migrated yet — retry without it.
    const retry = await adminSupabase
      .from('questions')
      .insert({ topic_id: topic.id, ...question })
      .select()
      .single()
    if (retry.error) return Response.json({ error: retry.error.message }, { status: 500 })
    inserted = retry.data
  } else if (first.error) {
    return Response.json({ error: first.error.message }, { status: 500 })
  } else {
    inserted = first.data
  }

  // `diagram` and `skill` are returned even when not persisted, so the client can
  // render the visual and report the sub-skill back when recording progress.
  return Response.json({ ...inserted, diagram: diagram ?? (inserted?.diagram as string | undefined) ?? null, skill: targetSkill })
}
