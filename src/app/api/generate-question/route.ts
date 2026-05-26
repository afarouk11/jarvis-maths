import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { buildQuestionPrompt } from '@/lib/ai/prompts'
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

  const { topicId, topicName, difficulty = 3 } = await req.json()

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

  // Look up topic UUID from slug
  const { data: topic } = await supabase
    .from('topics').select('id').eq('slug', topicId).single()
  if (!topic) return Response.json({ error: 'Topic not found — run /api/seed-topics first' }, { status: 404 })

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
