import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/stripe'
import { checkRateLimit, tooManyRequests } from '@/lib/api/rate-limit'
import { checkAnswerEquivalence } from '@/lib/math/equivalence'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: prof } = await supabase
    .from('profiles')
    .select('stripe_subscription_status')
    .eq('id', user.id)
    .single()

  if (!isPro(prof?.stripe_subscription_status)) {
    return Response.json({ error: 'pro_required' }, { status: 403 })
  }

  const rl = await checkRateLimit(supabase, user.id, 'mark-answer', 150, 3600)
  if (!rl.allowed) return tooManyRequests(rl)

  const { stem, correctAnswer, studentAnswer, studentAnswerImage, workedSolution } = await req.json()

  const isMultiLine = typeof studentAnswer === 'string'
    && studentAnswer.includes('\n')
    && studentAnswer.split('\n').filter((l: string) => l.trim()).length > 1

  // Deterministic CAS check on the student's FINAL answer (the last non-empty
  // line) vs the mark scheme — grounds the LLM so 0.5 / 1/2 / \frac12 aren't
  // mismarked. Only for typed answers; handwriting goes through vision.
  let casNote = ''
  if (typeof studentAnswer === 'string' && typeof correctAnswer === 'string') {
    const finalLine = studentAnswer.split('\n').map((l: string) => l.trim()).filter(Boolean).pop() ?? ''
    const verdict = checkAnswerEquivalence(finalLine, correctAnswer)
    if (verdict === 'equivalent') {
      casNote = `\n\n## Symbolic check (authoritative for the final value)\nA computer-algebra check confirms the student's final answer is mathematically EQUIVALENT to the mark scheme answer (e.g. 0.5 = 1/2). Treat the final value as correct; only withhold marks for missing required working or method on "show that"/proof questions.`
    } else if (verdict === 'different') {
      casNote = `\n\n## Symbolic check (authoritative for the final value)\nA computer-algebra check finds the student's final answer is NOT equivalent to the mark scheme answer, so the final value is wrong. Method (M) marks may still apply for correct working.`
    }
  }

  const instructions = `## Marking instructions
Apply AQA mark scheme conventions:
- M marks: method marks — award if the correct method is used, even if arithmetic is wrong
- A marks: accuracy marks — only award if the value is correct (depends on correct method)
- B marks: independent marks — award if the statement/value is correct regardless of method
- "Follow through" (ft): if the student made an earlier error, award marks for correct subsequent working based on their wrong value
- Accept equivalent forms (e.g. 0.5 = 1/2, y = 2x + 3 and 2x - y + 3 = 0)
- Do NOT penalise for omitting units unless the question specifically asks for them
- Award partial credit whenever the student demonstrates correct method even with arithmetic slips

${isMultiLine ? `## Line-by-line marking mode
The student has shown step-by-step working. Analyse each non-empty line they wrote.
For each line, return a step object with: "line" (the student's text), "status" ("correct"|"error"|"incomplete"), "comment" (brief — what's right, what's wrong, or what's missing).
Stop at the first "error" line and explain the fix clearly.` : ''}

Also check for exam technique issues:
- Not stating a formula before using it (loses M1)
- Missing substitution step (loses A1)
- Missing units on a measurement answer (loses B1)
- Rounding too early in multi-step working
- Writing an answer without proof when question says "show that"

Return JSON with exactly this structure:
{
  "correct": true | false,
  "quality": 0-5,
  "feedback": "1-2 sentence AQA-style feedback: state marks awarded and reason, then one specific improvement tip if wrong",
  "partialCredit": true | false,
  "exam_technique_flags": [],
  ${isMultiLine ? '"steps": [{"line":"...","status":"correct"|"error"|"incomplete","comment":"..."}]' : '"steps": null'}
}

exam_technique_flags: array of strings — each one a specific mark-scheme issue found (e.g. "No formula stated before use — loses M1"). Empty array if no issues.
Quality scale: 0=no correct work, 1=correct start only, 2=correct method wrong answer, 3=mostly correct minor slip, 4=correct minor presentation issue, 5=fully correct.

Return ONLY the JSON.`

  const context = `You are an AQA A-level Mathematics examiner marking a student's response.

## Question
${stem}

## Mark scheme answer
${correctAnswer}

${workedSolution ? `## Worked solution (mark scheme)\n${JSON.stringify(workedSolution, null, 2)}\n` : ''}${casNote}`

  let text: string

  if (studentAnswerImage) {
    // Vision path — student wrote by hand (Apple Pencil / stylus)
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${context}\n\n## Student's answer\nThe student's answer is provided as a handwritten image. Transcribe what is written and then mark it against the question.\n\n${instructions}`,
          },
          {
            type: 'image',
            image: Buffer.from(studentAnswerImage, 'base64'),
            mediaType: 'image/png',
          },
        ],
      }],
    })
    text = result.text
  } else {
    // Text path — student typed their answer
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt: `${context}\n\n## Student's answer\n${studentAnswer}\n\n${instructions}`,
    })
    text = result.text
  }

  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    return Response.json(JSON.parse(cleaned))
  } catch {
    return Response.json({ error: 'Failed to parse marking' }, { status: 500 })
  }
}
