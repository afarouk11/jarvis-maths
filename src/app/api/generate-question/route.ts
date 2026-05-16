import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { buildQuestionPrompt } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { topicId, topicName, difficulty = 3 } = await req.json()

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt: buildQuestionPrompt(topicName, difficulty),
  })

  let question
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    question = JSON.parse(cleaned)
  } catch {
    return Response.json({ error: 'Failed to parse question', raw: text }, { status: 500 })
  }

  const supabase = await createClient()

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
