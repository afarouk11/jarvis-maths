import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { stem, correctAnswer, studentAnswer, studentAnswerImage, workedSolution } = await req.json()

  const instructions = `## Marking instructions
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

  const context = `You are an AQA A-level Mathematics examiner marking a student's response.

## Question
${stem}

## Mark scheme answer
${correctAnswer}

${workedSolution ? `## Worked solution (mark scheme)\n${JSON.stringify(workedSolution, null, 2)}\n` : ''}`

  let text: string

  if (studentAnswerImage) {
    // Vision path — student wrote by hand (Apple Pencil / stylus)
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `${context}\n\n## Student's answer\nThe student's handwritten answer is shown in the attached image. Read and interpret all working shown.\n\n${instructions}` },
          { type: 'image', image: `data:image/png;base64,${studentAnswerImage}` as any },
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
