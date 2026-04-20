import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { JARVIS_SYSTEM_PROMPT } from '@/lib/ai/prompts'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, topicContext } = await req.json()

  const systemWithContext = topicContext
    ? `${JARVIS_SYSTEM_PROMPT}\n\nCurrent topic context: The student is studying "${topicContext}".`
    : JARVIS_SYSTEM_PROMPT

  const result = streamText({
    model: anthropic('claude-sonnet-4-6', {
      thinking: { type: 'enabled', budgetTokens: 8000 },
    }),
    system: systemWithContext,
    messages,
    maxTokens: 16000,
  })

  return result.toDataStreamResponse()
}
