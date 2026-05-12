import { anthropic } from '@ai-sdk/anthropic'
import { streamText, convertToModelMessages } from 'ai'
import { SPOK_SYSTEM_PROMPT, buildAccessibilityPrompt } from '@/lib/ai/prompts'
import { buildStudentProfile } from '@/lib/ai/student-profile'
import { embedText } from '@/lib/ai/embeddings'
import { createClient } from '@/lib/supabase/server'
import { isPro, PLANS } from '@/lib/stripe'
import { CHAT_SKILL_MODES } from '@/lib/spok-skills'
import type { SkillModeId } from '@/lib/spok-skills'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, topicContext, accessibilityPrefs, skillMode } = await req.json()
  const modeAppend = skillMode
    ? (CHAT_SKILL_MODES.find(m => m.id === (skillMode as SkillModeId))?.systemAppend ?? '')
    : ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  // Free tier: 10 Spok messages per day
  const { data: prof } = await supabase
    .from('profiles')
    .select('stripe_subscription_status, chat_messages_today, chat_messages_reset_at')
    .eq('id', user.id)
    .single()

  if (!isPro(prof?.stripe_subscription_status)) {
    const today = new Date().toISOString().slice(0, 10)
    const resetDate = prof?.chat_messages_reset_at ?? today
    const count = resetDate === today ? (prof?.chat_messages_today ?? 0) : 0

    if (count >= PLANS.free.chatMessagesPerDay) {
      return Response.json({ error: 'daily_limit_reached' }, { status: 429 })
    }

    // Increment counter (reset if new day)
    await supabase.from('profiles').update({
      chat_messages_today: resetDate === today ? count + 1 : 1,
      chat_messages_reset_at: today,
    }).eq('id', user.id)
  }

  const profile = await buildStudentProfile(user.id)

  // RAG: embed the latest user message and find relevant past paper chunks
  let ragContext = ''
  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')
  const lastText = lastUserMsg?.parts?.find((p: any) => p.type === 'text')?.text
    ?? lastUserMsg?.content ?? ''

  if (lastText && process.env.OPENAI_API_KEY) {
    try {
      const embedding  = await embedText(lastText)
      const { data: chunks } = await supabase.rpc('match_paper_chunks', {
        query_embedding: embedding,
        match_count:     4,
        min_similarity:  0.45,
      })

      if (chunks && chunks.length > 0) {
        const { data: papers } = await supabase
          .from('past_papers')
          .select('id, title, year, exam_board, paper_number')
          .in('id', chunks.map((c: any) => c.paper_id))

        const paperMap = new Map((papers ?? []).map((p: any) => [p.id, p]))

        ragContext = '\n\n---\nRelevant past paper extracts (use these to ground your answer and cite the source):\n'
        ragContext += chunks.map((c: any) => {
          const paper = paperMap.get(c.paper_id)
          const src   = paper
            ? `${paper.exam_board} ${paper.year ?? ''} Paper ${paper.paper_number ?? ''}`
            : 'Past paper'
          return `[${src} — similarity ${(c.similarity * 100).toFixed(0)}%]\n${c.content}`
        }).join('\n\n')
        ragContext += '\n---'
      }

      // Knowledge base: curated worked examples and concepts
      const { data: knowledge } = await supabase.rpc('match_knowledge', {
        query_embedding: embedding,
        match_count:     3,
        min_similarity:  0.4,
      })

      if (knowledge && knowledge.length > 0) {
        ragContext += '\n\n---\nCurated knowledge base (prioritise these worked examples and concepts in your answer):\n'
        ragContext += knowledge.map((k: any) =>
          `[${k.type.replace('_', ' ')} — ${k.title}]\n${k.content}`
        ).join('\n\n')
        ragContext += '\n---'
      }
    } catch {
      // RAG failure is non-fatal — continue without it
    }
  }

  const accessibilityInstructions = buildAccessibilityPrompt(accessibilityPrefs)

  const system = [
    SPOK_SYSTEM_PROMPT,
    accessibilityInstructions,
    profile ? `\n\n---\n${profile}\n---\n\nUse this profile to personalise your responses.` : '',
    topicContext ? `\nCurrent topic: The student is studying "${topicContext}".` : '',
    modeAppend ? `\n\n---\nINSTRUCTION: ${modeAppend}\n---` : '',
    ragContext,
  ].join('')

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 16000,
    providerOptions: {
      anthropic: { thinking: { type: 'enabled', budgetTokens: 2000 } },
    },
  })

  return result.toUIMessageStreamResponse({ sendReasoning: true })
}
