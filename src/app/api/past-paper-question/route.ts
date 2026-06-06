import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const QUESTION_STARTERS = /^(find|calculate|show|prove|given|hence|a\s|the\s|determine|evaluate|simplify|factorise|factorize|solve|sketch|describe|explain|work out|write down)/i
const HAS_QUESTION_MARK = /\?/

function looksLikeQuestion(text: string): boolean {
  const trimmed = text.trim()
  return HAS_QUESTION_MARK.test(trimmed) || QUESTION_STARTERS.test(trimmed)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const topicName = searchParams.get('topic') ?? ''
  const topicId = searchParams.get('topicId') ?? ''

  if (!topicName) return Response.json({ error: 'topic required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: prof } = await supabase
    .from('profiles')
    .select('level, exam_board')
    .eq('id', user.id)
    .single()

  // Need OpenAI embeddings to search past papers
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'no_embeddings' }, { status: 404 })
  }

  let chunks: Array<{ id: string; paper_id: string; content: string; topic_slug: string; similarity: number }> = []
  try {
    const { embedText } = await import('@/lib/ai/embeddings')
    const embedding = await embedText(topicName)
    const { data } = await supabase.rpc('match_paper_chunks', {
      query_embedding: embedding,
      match_count: 15,
      min_similarity: 0.45,
    })
    chunks = data ?? []
  } catch {
    return Response.json({ error: 'embedding_failed' }, { status: 500 })
  }

  // Filter to chunks that look like actual questions
  const questionChunks = chunks.filter(c => looksLikeQuestion(c.content))
  if (questionChunks.length === 0) {
    return Response.json({ error: 'no_past_paper_questions' }, { status: 404 })
  }

  // Resolve paper metadata for every candidate chunk up front so we can keep
  // only questions from the student's OWN exam board. Without this an Edexcel
  // student could be served an AQA past-paper question (bug: "Edexcel selected
  // but AQA paper shown").
  const candidatePaperIds = [...new Set(questionChunks.map(c => c.paper_id))]
  const { data: candidatePapers } = await supabase
    .from('past_papers')
    .select('id, title, exam_board, year, paper_number')
    .in('id', candidatePaperIds)
  const paperById = new Map((candidatePapers ?? []).map((p: { id: string }) => [p.id, p]))

  const studentBoard = (prof?.exam_board ?? '').toLowerCase()
  const boardMatched = studentBoard
    ? questionChunks.filter(c => ((paperById.get(c.paper_id) as { exam_board?: string } | undefined)?.exam_board ?? '').toLowerCase() === studentBoard)
    : questionChunks

  // No past-paper question for this board → let the caller fall back to
  // board-aware AI generation rather than showing the wrong board's paper.
  if (boardMatched.length === 0) {
    return Response.json({ error: 'no_past_paper_questions' }, { status: 404 })
  }

  // Pick the best-matching chunk from the board-correct set
  const best = boardMatched[0]
  const paper = paperById.get(best.paper_id) as { exam_board?: string; year?: number; paper_number?: number } | undefined

  const source = paper
    ? `${paper.exam_board?.toUpperCase() ?? 'Past paper'} ${paper.year ?? ''} Paper ${paper.paper_number ?? ''}`.trim()
    : 'Past paper'

  // Generate a worked solution for this question using Claude
  let workedSolution: Array<{ label: string; content: string; math?: string }> = []
  let answer = ''
  let marks = 4

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt: `You are a ${prof?.exam_board ?? 'AQA'} ${prof?.level ?? 'A-Level'} Maths examiner.

Question from past paper:
${best.content}

Return ONLY valid JSON:
{
  "answer": "the final answer",
  "marks": <integer 1-10>,
  "worked_solution": [
    {"label":"Step 1 [M1]","content":"explanation","math":"optional LaTeX"},
    {"label":"Step 2 [A1]","content":"explanation","math":"optional LaTeX"}
  ]
}`,
    })
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    answer = parsed.answer ?? ''
    marks = parsed.marks ?? 4
    workedSolution = parsed.worked_solution ?? []
  } catch {
    // Non-fatal — return question without worked solution
  }

  // Look up topic UUID and save to questions table
  let questionId: string | null = null
  try {
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data: topic } = await supabase
      .from('topics').select('id').eq('slug', topicId).single()

    if (topic) {
      const { data } = await adminSupabase
        .from('questions')
        .insert({
          topic_id: topic.id,
          stem: best.content,
          answer,
          worked_solution: workedSolution,
          marks,
          difficulty: 3,
          source,
        })
        .select('id')
        .single()
      questionId = data?.id ?? null
    }
  } catch {
    // Non-fatal
  }

  return Response.json({
    id: questionId,
    stem: best.content,
    answer,
    worked_solution: workedSolution,
    marks,
    difficulty: 3,
    source,
    topic_slug: best.topic_slug,
  })
}
