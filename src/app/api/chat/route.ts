import { anthropic } from '@ai-sdk/anthropic'
import { streamText, convertToModelMessages } from 'ai'
import { SPOK_SYSTEM_PROMPT, buildAccessibilityPrompt, buildLanguagePrompt } from '@/lib/ai/prompts'
import { buildStudentProfile } from '@/lib/ai/student-profile'
import { embedText } from '@/lib/ai/embeddings'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { isPro, PLANS } from '@/lib/stripe'
import { logEvent } from '@/lib/analytics'
import { CHAT_SKILL_MODES } from '@/lib/spok-skills'
import type { SkillModeId } from '@/lib/spok-skills'
import { getTopics, type Level } from '@/lib/curriculum'

// Built per request so GCSE students get GCSE lesson links, not A-level ones.
function buildTopicLinksBlock(level: string | null | undefined): string {
  const isGcse = (level ?? '').trim().toLowerCase() === 'gcse'
  const topics = getTopics((level as Level) ?? 'A-Level')
  return `

---
## Lesson links — use these when a student asks for help, resources, or wants to learn a topic

When recommending lessons or topics, use this exact format inline: [TOPIC:slug|Display Name]
You can use multiple in a list. Always prefer a bullet list with one link per line and a short description of what that lesson covers.

Available ${isGcse ? 'GCSE' : 'A-level'} topics:
${topics.map(t => `- [TOPIC:${t.slug}|${t.name}] (${t.year_group})`).join('\n')}

Rules:
- Only link topics that are genuinely relevant to what the student asked.
- Never fabricate slugs. Only use slugs from the list above.
- When a student says "I need help with X" or "where can I learn Y", respond with a brief explanation and 2-4 relevant topic links.
- Links render as clickable buttons in the student's interface — they click and go straight to that lesson.
---`
}

const NAV_LINKS_BLOCK = `

---
## Site navigation — help students find their way around StudiQ

When a student asks how or where to do something on the site (or seems lost), point them to the right page using this exact format inline: [NAV:/path|Button label]

Available pages:
- [NAV:/dashboard|Dashboard] — their home overview: streak, predicted grade, what's due
- [NAV:/practice|Practice] — adaptive exam questions marked by you (add ?topic=slug to target a topic, e.g. [NAV:/practice?topic=integration|Practice integration])
- [NAV:/topics|Topics] — browse every topic and open a lesson
- [NAV:/papers|Past Papers] — generate a full mock paper or open official past papers
- [NAV:/progress|Progress] — grade trend, mastery charts and exam readiness
- [NAV:/brain|Knowledge Map] — the 3D neural map showing mastery and gaps
- [NAV:/timetable|Revision Timetable] — a personalised revision schedule
- [NAV:/leaderboard|Leaderboard] — XP ranking
- [NAV:/profile|Profile] — change exam board, target grade or exam date

Rules:
- Use a NAV link whenever the student asks "how do I…", "where do I…", "can I…" about a feature, or when sending them somewhere would genuinely help their next step.
- Only use paths from the list above. Never invent a path.
- Keep it natural: one short sentence plus the relevant link, not a wall of buttons. Usually one NAV link, occasionally two.
---`

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, topicContext, accessibilityPrefs, skillMode, conversationHistory, imageData } = await req.json()
  const modeAppend = skillMode
    ? (CHAT_SKILL_MODES.find(m => m.id === (skillMode as SkillModeId))?.systemAppend ?? '')
    : ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  // Free tier: 10 Spok messages per day
  const { data: prof } = await supabase
    .from('profiles')
    .select('stripe_subscription_status, chat_messages_today, chat_messages_reset_at, is_admin, language, level')
    .eq('id', user.id)
    .single()

  if (!isPro(prof?.stripe_subscription_status) && !prof?.is_admin) {
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

  // Skill mastery gate — some modes require minimum avg p_known
  if (skillMode) {
    const requestedMode = CHAT_SKILL_MODES.find(m => m.id === (skillMode as SkillModeId))
    if (requestedMode && requestedMode.minMastery > 0) {
      const { data: progress } = await supabase
        .from('student_progress')
        .select('p_known')
        .eq('student_id', user.id)
      const rows = progress ?? []
      const avgPKnown = rows.length > 0 ? rows.reduce((s: number, r: { p_known: number }) => s + r.p_known, 0) / rows.length : 0
      if (avgPKnown < requestedMode.minMastery) {
        return Response.json(
          { error: 'skill_locked', minMastery: requestedMode.minMastery, currentMastery: avgPKnown },
          { status: 403 }
        )
      }
    }
  }

  await logEvent(supabase, user.id, 'chat_message', { skillMode: skillMode ?? null, hasImage: !!imageData })

  const profile = await buildStudentProfile(user.id)

  // RAG: embed the latest user message and find relevant past paper chunks
  let ragContext = ''
  let graphImageUrls: string[] = []
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

      // Knowledge base: curated worked examples, concepts, and graph references
      const { data: knowledge } = await supabase.rpc('match_knowledge', {
        query_embedding: embedding,
        match_count:     3,
        min_similarity:  0.4,
      })

      if (knowledge && knowledge.length > 0) {
        ragContext += '\n\n---\nCurated knowledge base (prioritise these worked examples and concepts in your answer):\n'
        ragContext += knowledge.map((k: any) => {
          const imageNote = k.image_url ? ' [Reference graph image injected as vision context above]' : ''
          return `[${k.type.replace('_', ' ')} — ${k.title}]${imageNote}\n${k.content}`
        }).join('\n\n')
        ragContext += '\n---'

        // Collect image URLs from graph reference entries for vision injection.
        // URL is embedded as "IMAGE_URL: <url>" on the first line of content.
        graphImageUrls = (knowledge as any[])
          .map(k => (k.content as string).match(/^IMAGE_URL:\s*(.+)$/m)?.[1]?.trim() ?? '')
          .filter(Boolean)
      }
    } catch {
      // RAG failure is non-fatal — continue without it
    }
  }

  const accessibilityInstructions = buildAccessibilityPrompt(accessibilityPrefs)
  const languageInstruction = buildLanguagePrompt(prof?.language)

  const historyBlock = conversationHistory
    ? `\n\n---\nPrevious session context (do not repeat or summarise — use only to continue naturally):\n${conversationHistory}\n---`
    : ''

  const system = [
    SPOK_SYSTEM_PROMPT,
    buildTopicLinksBlock(prof?.level),
    NAV_LINKS_BLOCK,
    accessibilityInstructions,
    languageInstruction,
    profile ? `\n\n---\n${profile}\n---\n\nUse this profile to personalise your responses.` : '',
    topicContext ? `\nCurrent topic: The student is studying "${topicContext}".` : '',
    modeAppend ? `\n\n---\nINSTRUCTION: ${modeAppend}\n---` : '',
    ragContext,
    historyBlock,
  ].join('')

  // Log user message before streaming
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  if (lastText) {
    await admin.from('spok_messages').insert({ user_id: user.id, role: 'user', content: lastText })
  }

  const modelMessages = await convertToModelMessages(messages)

  // If the student attached a photo of their working, inject it into the last user message
  if (imageData && typeof imageData === 'string' && modelMessages.length > 0) {
    const lastMsg = modelMessages[modelMessages.length - 1]
    if (lastMsg.role === 'user') {
      const existingText = typeof lastMsg.content === 'string'
        ? lastMsg.content
        : (lastMsg.content as Array<{ type: string; text?: string }>)
            .filter(p => p.type === 'text')
            .map(p => p.text ?? '')
            .join('')
      lastMsg.content = [
        { type: 'image' as const, image: imageData },
        { type: 'text' as const, text: existingText || 'Here is my handwritten working. Please mark it step by step.' },
      ]
    }
  }

  // If KB returned graph reference images, inject them before the last user message
  // so Claude can see the example graph style when generating [GRAPH] blocks.
  if (graphImageUrls.length > 0) {
    const imageMessage = {
      role: 'user' as const,
      content: [
        ...graphImageUrls.map(url => ({ type: 'image' as const, image: new URL(url) })),
        { type: 'text' as const, text: 'These are reference graph images from the knowledge base for this topic. Use them as style and format references when generating [GRAPH] blocks — match the axis labels, annotation style, and visual structure.' },
      ],
    }
    modelMessages.splice(modelMessages.length - 1, 0, imageMessage)
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system,
    messages: modelMessages,
    maxOutputTokens: 16000,
    providerOptions: {
      anthropic: { thinking: { type: 'enabled', budgetTokens: 2000 } },
    },
    onFinish: async ({ text }) => {
      if (text) {
        await admin.from('spok_messages').insert({ user_id: user.id, role: 'assistant', content: text })
      }
    },
  })

  return result.toUIMessageStreamResponse({ sendReasoning: true })
}
