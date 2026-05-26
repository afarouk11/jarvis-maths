import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8').split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=').map((p, i) => i === 0 ? p.trim() : l.slice(l.indexOf('=') + 1).trim()))
)

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function embed(text) {
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text })
  return res.data[0].embedding
}

// Re-run only the 6 exam_tip entries that failed from seed-knowledge-base-5.mjs
const entries = [
  {
    type: 'tip',
    title: 'Edexcel A-Level Maths — formula booklet contents and what to memorise',
    topic_slug: null,
    content: `The Edexcel A-Level Maths formula booklet (given in every exam) contains:

PURE — provided:
- Quadratic formula, binomial expansion for (1+x)ⁿ (rational n, |x|<1)
- Logarithm laws (change of base, product, quotient, power)
- Trig: exact values table (30°, 45°, 60°), sin(A±B), cos(A±B), tan(A±B), double angle formulas
- Integration: ∫xⁿ, ∫eˣ, ∫1/x, ∫cos x, ∫sin x, and a table of standard forms
- Differentials: d/dx of eˣ, ln x, sin x, cos x, tan x and their inverses
- Numerical methods: Newton-Raphson formula

STATISTICS — provided:
- Binomial distribution: P(X=r) = ⁿCᵣ pʳ(1−p)ⁿ⁻ʳ, mean = np, variance = np(1−p)
- Normal distribution: standardisation Z = (X−μ)/σ; percentage points table included
- PMCC formula

MUST MEMORISE (not in booklet):
- Arithmetic series: nth term and sum formulas
- Geometric series: nth term, sum, and sum to infinity (with |r| < 1 condition)
- Suvat equations (all 5)
- sin²θ + cos²θ = 1, tan θ = sin θ/cos θ
- Circle standard form (x−a)² + (y−b)² = r²
- Factor theorem, remainder theorem

Key exam strategy: open the booklet at the start. Locate the relevant section before you need it. Never copy a formula incorrectly — write the booklet version then substitute.`
  },
  {
    type: 'tip',
    title: 'Edexcel A-Level large data set — weather stations and exam context',
    topic_slug: null,
    content: `The Edexcel A-Level Statistics large data set covers weather data from UK Met Office stations across different years. Familiarity with the data is tested in Paper 2 (Statistics) and Paper 3.

UK stations typically included: Camborne (Cornwall — south west, mild wet winters), Hurn (Bournemouth area — south coast), Leeming (Yorkshire — northern England, colder), Heathrow (London — urban heat island effect), Beijing and Jacksonville may appear for international comparison.

Variables in the dataset:
- Daily maximum temperature (°C)
- Daily mean temperature
- Daily total rainfall (mm) — includes days with 0 mm (dry days)
- Daily maximum gust speed (knots)
- Daily mean wind speed (knots)
- Daily sunshine (hours)
- Daily mean cloud cover (oktas, 0–8 scale)
- Daily mean pressure (hPa)

Exam question types:
1. "Clean" the data — identify impossible/missing values (tr = trace rainfall, recorded as 0 or very small)
2. Calculate summary statistics (mean, median, IQR) for a station in a given month
3. Compare distributions between stations or seasons using measures of location and spread
4. Discuss correlation between two variables (e.g. temperature and sunshine)
5. Comment on whether a sample is representative

Key knowledge: Camborne tends to have more rainfall and milder temperatures than Leeming. Heathrow temperatures are often higher than rural stations (urban heat island). August and May data are commonly examined. Cloud cover is measured in oktas (0 = clear sky, 8 = completely overcast).`
  },
  {
    type: 'tip',
    title: 'Edexcel A-Level question style — how marks are allocated',
    topic_slug: null,
    content: `Edexcel A-Level Maths questions are more scaffolded than AQA — they break multi-step problems into labelled parts (a), (b), (c) with mark allocations shown.

Understanding mark allocation:
- (1 mark): usually just a statement, substitution, or read-off
- (2 marks — M1 A1): method mark (correct approach) + accuracy mark (correct answer)
- (3 marks — M1 M1 A1 or M1 A1 B1): two method steps plus answer, or one method plus two separate answers
- "Show that" questions: method marks only — must show all working even if answer is given
- "Hence" questions: must use the result of the previous part, not a fresh method

Common question types:
- "Find the exact value of..." — leave in surd/log form, rationalise if fraction
- "State the range of..." — inequalities, use ≤ or < correctly
- "Prove that..." — full algebraic proof required, no gaps
- "Interpret your answer in context" — say what the number means in real-world terms, including units
- "Criticise this sampling method" — named limitation in context (not "the sample is too small" without context)

Edexcel-specific language:
- "Fully factorise" means take out all common factors AND factorise any remaining quadratic
- "Simplify fully" means reduce as far as possible including rationalising
- "Show your working clearly" — every method step must be visible for M marks
- Diagrams: label all intercepts, asymptotes, turning points with coordinates`
  },
  {
    type: 'tip',
    title: 'Edexcel GCSE Maths — formula sheet and question style',
    topic_slug: null,
    content: `Edexcel GCSE Maths provides a formula sheet at the front of the exam paper.

Formulas PROVIDED by Edexcel GCSE:
- Area of a trapezium: ½(a+b)h
- Volume of a prism: cross-sectional area × length
- Volume of sphere: (4/3)πr³ and surface area 4πr²
- Volume of cone: (1/3)πr²h and curved surface area πrl
- Sine rule: a/sin A = b/sin B = c/sin C
- Cosine rule: a² = b² + c² − 2bc cos A
- Area of triangle: ½ab sin C
- Quadratic formula: x = (−b ± √(b²−4ac)) / 2a

Must MEMORISE for Edexcel GCSE (not on sheet):
- Circle: area = πr², circumference = 2πr or πd
- Pythagoras: a² + b² = c²
- All angle facts, circle theorems
- SOH CAH TOA (and exact trig values)
- Speed = distance/time, density = mass/volume

Edexcel GCSE question style:
- Problem-solving questions (3–5 marks): multi-step, require choosing the right method
- "Show that" and "Prove" questions at Grade 7–9
- Functional questions: real-world contexts (cost, measurement, planning)
- Questions often give unnecessary information to test what you select
- Final answers: give to 3 significant figures unless exact form is specified`
  },
  {
    type: 'tip',
    title: 'Edexcel A-Level Mechanics — key topics and question patterns',
    topic_slug: null,
    content: `Edexcel A-Level Mechanics is examined in Paper 3 (alongside Statistics). The mechanics content is compulsory — unlike some boards, Edexcel has no applied option choice.

High-frequency Edexcel mechanics topics:
1. Connected particles — especially particle on a table + hanging weight, or Atwood machines
2. Projectile motion — finding range, time of flight, angle, or point of landing
3. Friction — coefficient of friction problems, limiting equilibrium on slopes
4. Moments — non-uniform rods, finding centre of mass, reaction at supports
5. Variable acceleration — using calculus (v = ds/dt, a = dv/dt) or suvat

Edexcel question patterns:
- "A particle is released from rest..." → use suvat with u=0
- "Find the tension in the string" → separate equations for each particle, add to find T
- "Find the range of values of μ for which the particle remains stationary" → solve inequality
- "A uniform beam AB of mass M kg rests horizontally..." → take moments about a support to eliminate its reaction
- "Verify that the particle is moving in a straight line" → check velocity vector is a scalar multiple of position vector at some time

Key formulas to know:
- Impulse = change in momentum: I = mv − mu (= Ft for constant force)
- Work done = force × distance in direction of force; KE = ½mv²; PE = mgh
- Coefficient of restitution in collisions (if asked): e = relative speed of separation / relative speed of approach`
  },
  {
    type: 'tip',
    title: 'Edexcel GCSE — grade boundaries and question difficulty pattern',
    topic_slug: null,
    content: `Edexcel GCSE Maths Higher tier has three papers: Paper 1 (non-calculator, 80 marks), Paper 2 (calculator, 80 marks), Paper 3 (calculator, 80 marks). Total: 240 marks.

Typical grade boundaries (vary by year but approximate):
- Grade 4 (pass): ~145–160 marks (60–67%)
- Grade 5 (strong pass): ~165–175 marks (69–73%)
- Grade 7: ~190–200 marks (79–83%)
- Grade 9: ~215+ marks (90%+)

Question difficulty pattern within each paper:
- Questions 1–5: Grade 3–4 accessible questions (1–2 marks each)
- Questions 6–15: Grade 5–6 standard Higher content (2–4 marks each)
- Questions 16–22: Grade 7–9 demanding questions (4–6 marks each)
- Final 2–3 questions: Grade 8–9 synoptic problems requiring multiple techniques

Exam strategy for Edexcel Higher:
- Do not skip to harder questions — marks at the start are the same value
- For calculator papers: check all answers are sensible (e.g. lengths are positive)
- "Give your answer to an appropriate degree of accuracy" — match the precision of the given data (usually 3 s.f.)
- Constructions and circle theorems frequently appear on the non-calculator paper
- Vectors and algebraic proof appear in the final section — prep these for Grade 7+ students`
  },
]

async function seed() {
  let ok = 0
  for (const entry of entries) {
    const embedding = await embed(`${entry.title}\n\n${entry.content}`)
    const { error } = await supabase
      .from('knowledge_base')
      .insert({ topic_slug: entry.topic_slug, type: entry.type, title: entry.title, content: entry.content, embedding })
    if (error) {
      console.error(`✗ ${entry.title}: ${error.message}`)
    } else {
      console.log(`✓ ${entry.title}`)
      ok++
    }
  }
  console.log(`\nDone — ${ok}/${entries.length} entries added.`)
}

seed()
