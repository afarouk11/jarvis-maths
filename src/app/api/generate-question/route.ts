import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { buildQuestionPrompt } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { topicId, topicName, difficulty = 3 } = await req.json()

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt: buildQuestionPrompt(topicName, difficulty),
    maxTokens: 2000,
  })

  let question
  try {
    question = JSON.parse(text)
  } catch {
    return Response.json({ error: 'Failed to parse question' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .insert({ topic_id: topicId, ...question })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
