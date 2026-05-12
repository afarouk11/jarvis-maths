import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function POST(req: Request) {
  const { stem, correctAnswer, studentAnswer, workedSolution } = await req.json()

  const prompt = `You are an AQA A-level Mathematics examiner marking a student's response.

## Question
${stem}

## Mark scheme answer
${correctAnswer}

${workedSolution ? `## Worked solution (mark scheme)\n${JSON.stringify(workedSolution, null, 2)}\n` : ''}

## Student's answer
${studentAnswer}

## Marking instructions
Apply AQA mark scheme conventions:
- M marks: method marks — award if the correct method is used, even if arithmetic is wrong
- A marks: accuracy marks — only award if the value is correct (depends on correct method)
- B marks: independent marks — award if the statement/value is correct regardless of method
- "Follow through" (ft): if the student made an earlier error, award marks for correct subsequent working based on their wrong value
- Accept equivalent forms (e.g. 0.5 = 1/2, y = 2x + 3 and 2x - y + 3 = 0)
- Do NOT penalise for omitting units unless the question specifically asks for them
- Award partial credit whenever the student demonstrates correct method even with arithmetic slips

Return JSON with exactly this structure:
{
  "correct": true | false,
  "quality": 0-5,
  "feedback": "1-2 sentence AQA-style feedback: state marks awarded and reason, then one specific improvement tip if wrong",
  "partialCredit": true | false
}

Quality scale: 0=no correct work, 1=correct start only, 2=correct method wrong answer, 3=mostly correct minor slip, 4=correct minor presentation issue, 5=fully correct.

Return ONLY the JSON.`

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt,
  })

  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    return Response.json(JSON.parse(cleaned))
  } catch {
    return Response.json({ error: 'Failed to parse marking' }, { status: 500 })
  }
}
