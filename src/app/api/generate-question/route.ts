import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { buildQuestionPrompt } from '@/lib/ai/prompts'
import { difficultyForMastery } from '@/lib/bkt/adaptive'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: prof } = await supabase
    .from('profiles')
    .select('level, exam_board')
    .eq('id', user.id)
    .single()

  const { topicId, topicName, difficulty: requestedDifficulty } = await req.json()

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
      prompt: buildQuestionPrompt(topicName, difficulty, prof?.level ?? undefined, kbContext, prof?.exam_board ?? 'aqa'),
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

  const adminSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await adminSupabase
    .from('questions')
    .insert({ topic_id: topic.id, ...question })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
