import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await req.json()
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    const { data: topic } = await supabase
      .from('topics')
      .select('id, name')
      .eq('slug', slug)
      .single()

    if (!topic) return NextResponse.json({ error: 'Topic not found — run /api/seed-topics first' }, { status: 404 })

    const { text } = await generateText({
      model: anthropic('claude-opus-4-7'),
      prompt: `Generate an interactive A-level Maths lesson on "${topic.name}" for AQA.

Return ONLY valid JSON (no markdown fences) with this exact shape:

{
  "title": "specific lesson title",
  "difficulty": 2,
  "estimated_minutes": 20,
  "content": [
    {
      "type": "hook",
      "question": "An engaging opening question that activates prior knowledge or creates curiosity",
      "options": ["Plausible answer A", "Plausible answer B", "Plausible answer C", "I'm not sure yet"]
    },
    {
      "type": "concept",
      "label": "Section heading e.g. What is Differentiation?",
      "content": "Clear explanation with LaTeX inline \\\\( x^2 \\\\) and display $$ x^2 $$"
    },
    {
      "type": "graph",
      "title": "Optional graph title",
      "xDomain": [-5, 5],
      "yDomain": [-2, 10],
      "data": [
        { "fn": "x^2", "color": "#3b82f6", "label": "y = x²" },
        { "fn": "2*x", "color": "#ef4444", "label": "y = 2x" }
      ],
      "annotations": [
        { "x": 1, "text": "x = 1" }
      ]
    },
    {
      "type": "worked-example",
      "label": "Example 1: descriptive title",
      "intro": "Problem statement with LaTeX — e.g. Find $$\\\\frac{dy}{dx}$$ when $$y = 3x^4 - 2x^2 + 5$$.",
      "steps": [
        { "label": "Step 1: Identify the technique", "content": "explanation with LaTeX" },
        { "label": "Step 2: Apply the rule", "content": "working with LaTeX" },
        { "label": "Step 3: Simplify", "content": "final expression with LaTeX" }
      ]
    },
    {
      "type": "checkpoint",
      "question": "Short question testing the just-shown concept, with LaTeX",
      "options": ["A: expression", "B: expression", "C: expression", "D: expression"],
      "correct": 1,
      "explanation": "Clear explanation of why that answer is correct and why the others are wrong"
    },
    {
      "type": "worked-example",
      "label": "Example 2: harder variation",
      "intro": "...",
      "steps": [...]
    },
    {
      "type": "try-it",
      "problem": "A fresh problem for the student to attempt independently, with LaTeX",
      "hint": "One-line hint pointing them in the right direction",
      "answer": "Full model answer with LaTeX — e.g. $$\\\\frac{dy}{dx} = 20x^4 - 3$$"
    },
    {
      "type": "summary",
      "content": "Bullet-point key rules and formulas to remember, with LaTeX"
    }
  ]
}

GRAPH RULES — include a graph block whenever the topic benefits visually:
- Differentiation: show the curve and its tangent line at a point
- Integration: show the curve with closed:true to shade the area
- Trigonometry: show sin/cos/tan curves over sensible domain
- Functions/transformations: show f(x) and its transformation
- Sequences/series: scatter graphType for terms
- Kinematics: position-time or velocity-time curves
- fn strings use standard math.js syntax: "x^2", "sin(x)", "exp(x)", "log(x)", "abs(x)", "sqrt(x)"
- xDomain and yDomain must be set so the interesting part of the curve is visible
- Use distinct colors from: #3b82f6 (blue), #ef4444 (red), #4ade80 (green), #fbbf24 (yellow), #a78bfa (purple)
- For area under curve: add "closed": true and "graphType": "polyline" with appropriate "range"

STRUCTURE RULES:
- Start with hook, end with try-it then summary — mandatory order
- Place graph block(s) after the concept they illustrate, before or within worked-example
- Include at least 1 worked-example and 1 checkpoint
- 6 to 12 blocks total
- All maths must use LaTeX: \\\\( ... \\\\) inline, $$ ... $$ for display
- difficulty: 1-5 (use 2 for intro, 3 for standard, 4 for harder)
- estimated_minutes: 15-25
- No markdown fences, no HTML, plain JSON only`,
    })

    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse lesson JSON', raw: text }, { status: 500 })
    }

    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: lesson, error } = await adminSupabase
      .from('lessons')
      .insert({
        topic_id: topic.id,
        title: parsed.title,
        content: parsed.content,
        difficulty: parsed.difficulty ?? 2,
        estimated_minutes: parsed.estimated_minutes ?? 20,
      })
      .select()
      .single()

    if (error) {
      console.error('[generate-lesson] Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(lesson)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('generate-lesson error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
