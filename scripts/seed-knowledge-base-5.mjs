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

const entries = [
  // ─── Universal missing content ───────────────────────────────────────────────
  {
    type: 'worked_example',
    title: 'Integration — area between two curves',
    topic_slug: 'integration',
    content: `The area between two curves y = f(x) and y = g(x), where f(x) ≥ g(x) on [a, b], is:
Area = ∫[a to b] (f(x) − g(x)) dx

Always subtract the lower curve from the upper curve. If the curves cross within the interval, split the integral at each crossing point.

Method:
1. Find intersection points by solving f(x) = g(x)
2. Sketch both curves to identify which is on top
3. Integrate (upper − lower) between the intersection points
4. Take the absolute value of each sub-integral if curves swap

Example: Find the area between y = x² and y = x + 2.
Step 1: Solve x² = x + 2 → x² − x − 2 = 0 → (x − 2)(x + 1) = 0 → x = −1 and x = 2
Step 2: On [−1, 2], the line y = x + 2 is above y = x²
Step 3: Area = ∫[−1 to 2] ((x + 2) − x²) dx = [x²/2 + 2x − x³/3] from −1 to 2
= (2 + 4 − 8/3) − (1/2 − 2 + 1/3) = 10/3 − (−7/6) = 20/6 + 7/6 = 27/6 = 4.5 square units

Common mistakes: forgetting to find intersection points first; subtracting in the wrong order; not splitting at crossing points.`
  },
  {
    type: 'worked_example',
    title: 'Connected particles and Atwood machines',
    topic_slug: 'mechanics',
    content: `Connected particles problems involve two or more objects linked by a string over a pulley. Treat each particle separately with Newton's second law, then combine equations.

Key principle: If the string is inextensible, both particles have the same magnitude of acceleration. Tension T is the same throughout a light string over a smooth pulley.

Atwood machine (two hanging masses):
- Particle A (mass m₁) moves down, particle B (mass m₂) moves up where m₁ > m₂
- For A: m₁g − T = m₁a
- For B: T − m₂g = m₂a
- Add equations: (m₁ − m₂)g = (m₁ + m₂)a → a = (m₁ − m₂)g / (m₁ + m₂)
- Then T = m₂(g + a)

Particle on table connected to hanging particle:
- Particle A (mass m₁) on smooth horizontal table, connected by string over edge to hanging particle B (mass m₂)
- For A: T = m₁a (horizontal)
- For B: m₂g − T = m₂a (vertical)
- Add: m₂g = (m₁ + m₂)a → a = m₂g / (m₁ + m₂)

If the table has friction (μ), add μm₁g to the denominator side:
m₂g − μm₁g = (m₁ + m₂)a

After one particle reaches the floor or table edge, the string goes slack and the remaining particle moves freely under gravity (or friction).`
  },
  {
    type: 'formula',
    title: 'Resolving forces at an angle — equilibrium and resultant',
    topic_slug: 'mechanics',
    content: `When a force F acts at angle θ to the horizontal:
- Horizontal component: Fx = F cos θ
- Vertical component: Fy = F sin θ

For equilibrium, the sum of all horizontal components = 0 AND sum of all vertical components = 0.

On an inclined plane at angle α:
- Resolve parallel to the plane: mg sin α (down the slope)
- Resolve perpendicular to the plane: Normal reaction N = mg cos α
- Friction (if μ given): F = μN = μmg cos α (opposes motion)

Particle on inclined plane in equilibrium with applied force P at angle θ to the slope:
- Parallel: P cos θ = mg sin α + F (or P cos θ + F = mg sin α depending on direction)
- Perpendicular: N + P sin θ = mg cos α → N = mg cos α − P sin θ

General resultant of multiple forces:
- Sum all x-components: Rx = ΣFᵢ cos θᵢ
- Sum all y-components: Ry = ΣFᵢ sin θᵢ
- Magnitude: R = √(Rx² + Ry²)
- Direction: tan θ = Ry / Rx

Always draw a force diagram first. Label each force with its component form before writing equations.`
  },
  {
    type: 'worked_example',
    title: 'Proof by mathematical induction — series and divisibility',
    topic_slug: 'proof',
    content: `Mathematical induction proves a statement P(n) is true for all positive integers n.

Structure (must follow exactly in exams):
1. Base case: Show P(1) is true (or P(0), whichever applies)
2. Inductive step: Assume P(k) is true (state the assumption clearly)
3. Show P(k+1) follows from P(k)
4. Conclusion: By the principle of mathematical induction, P(n) is true for all n ∈ ℤ⁺

Example — summation: Prove Σᵣ₌₁ⁿ r = n(n+1)/2
Base case: n=1, LHS = 1, RHS = 1(2)/2 = 1 ✓
Assume: Σᵣ₌₁ᵏ r = k(k+1)/2
Show for k+1: Σᵣ₌₁ᵏ⁺¹ r = Σᵣ₌₁ᵏ r + (k+1) = k(k+1)/2 + (k+1) = (k+1)[k/2 + 1] = (k+1)(k+2)/2 ✓

Example — divisibility: Prove 3ⁿ − 1 is divisible by 2 for all n ≥ 1
Base case: n=1, 3¹ − 1 = 2, divisible by 2 ✓
Assume: 3ᵏ − 1 = 2m for some integer m, i.e. 3ᵏ = 2m + 1
Show for k+1: 3ᵏ⁺¹ − 1 = 3·3ᵏ − 1 = 3(2m+1) − 1 = 6m + 3 − 1 = 6m + 2 = 2(3m+1)
Since 3m+1 is an integer, 3ᵏ⁺¹ − 1 is divisible by 2 ✓

Key marks: explicit base case, clear inductive hypothesis stated with "assume P(k) true", algebraic manipulation using the assumption, full conclusion sentence.`
  },
  {
    type: 'worked_example',
    title: 'GCSE: Algebraic fractions — simplify, add, subtract, and solve',
    topic_slug: null,
    content: `Algebraic fractions follow the same rules as numerical fractions.

Simplifying: Factorise numerator and denominator, then cancel common factors.
Example: (x² − 4)/(x² + 5x + 6) = (x−2)(x+2)/[(x+2)(x+3)] = (x−2)/(x+3)  [x ≠ −2]

Adding/subtracting: Find a common denominator, convert each fraction, then combine.
Example: 3/(x+1) + 2/(x−1)
Common denominator: (x+1)(x−1)
= 3(x−1)/[(x+1)(x−1)] + 2(x+1)/[(x+1)(x−1)]
= [3x−3 + 2x+2] / [(x+1)(x−1)]
= (5x−1) / (x²−1)

Solving equations with algebraic fractions: Multiply both sides by the common denominator.
Example: 1/(x−1) + 1/(x+1) = 1
Multiply by (x−1)(x+1): (x+1) + (x−1) = (x−1)(x+1)
2x = x² − 1 → x² − 2x − 1 = 0 → x = (2 ± √8)/2 = 1 ± √2

Always check your solutions are not excluded values (denominator ≠ 0).
Watch for: not factorising before cancelling; errors expanding the common denominator; not checking for excluded values.`
  },
  {
    type: 'formula',
    title: 'GCSE: Quadratic sequences — finding the nth term',
    topic_slug: null,
    content: `A quadratic sequence has a constant second difference. The nth term has the form an² + bn + c.

Method to find nth term:
Step 1: Find first differences (subtract consecutive terms)
Step 2: Find second differences (subtract consecutive first differences) — this should be constant
Step 3: a = (second difference) ÷ 2
Step 4: Subtract an² from each term to get a linear sequence
Step 5: Find nth term of that linear sequence (= bn + c)
Step 6: Combine: nth term = an² + bn + c

Example: 3, 8, 15, 24, 35, ...
First differences: 5, 7, 9, 11, ... (differences of +2)
Second difference: 2 → a = 2/2 = 1 → an² = n²
Subtract n² from terms: 3−1=2, 8−4=4, 15−9=6, 24−16=8, ... → 2n
nth term = n² + 2n

Check: n=1: 1+2=3 ✓, n=2: 4+4=8 ✓, n=3: 9+6=15 ✓

Common exam variants: finding a specific term, finding which term has a given value (solve a quadratic), identifying whether a number is in the sequence.`
  },
  {
    type: 'worked_example',
    title: 'GCSE: Reverse percentages and compound interest',
    topic_slug: null,
    content: `Reverse percentages: finding the original value before a percentage change.
If a value after an increase/decrease is known, divide by the multiplier.

Multipliers: +20% → ×1.2 | −15% → ×0.85 | +7.5% → ×1.075

Example: A jacket costs £68 after a 15% reduction. Find the original price.
After reduction: price × 0.85 = £68
Original price = 68 ÷ 0.85 = £80

Common mistake: Students subtract 15% of £68 instead of reversing correctly.

Compound interest: interest is calculated on the accumulated amount each period.
Formula: A = P(1 + r/100)ⁿ where P = principal, r = rate %, n = number of periods

Example: £2000 invested at 3.5% compound interest for 4 years.
A = 2000 × (1.035)⁴ = 2000 × 1.14752 = £2295.05

Depreciation (compound decay): A = P(1 − r/100)ⁿ
Example: Car worth £12000 depreciates at 18% per year. Value after 3 years:
A = 12000 × (0.82)³ = 12000 × 0.551368 = £6616.42

Finding n (time): Use trial and improvement or logarithms at A-Level.
Example: How long until £1000 doubles at 6%? 2000 = 1000(1.06)ⁿ → 1.06ⁿ = 2 → n = log(2)/log(1.06) ≈ 11.9 years`
  },
  {
    type: 'formula',
    title: 'GCSE: HCF, LCM, and prime factorisation',
    topic_slug: null,
    content: `Prime factorisation: express a number as a product of prime factors using a factor tree or repeated division.

Example: 360 = 2 × 180 = 2 × 2 × 90 = 2 × 2 × 2 × 45 = 2 × 2 × 2 × 3 × 15 = 2 × 2 × 2 × 3 × 3 × 5
In index form: 360 = 2³ × 3² × 5

HCF (Highest Common Factor): the largest number that divides into both.
Method: list prime factors of each number, take the lowest power of each shared prime, multiply.
HCF(360, 504): 360 = 2³ × 3² × 5, 504 = 2³ × 3² × 7
Shared primes: 2³ × 3² = 8 × 9 = 72

LCM (Lowest Common Multiple): the smallest number both divide into.
Method: take the highest power of every prime that appears in either number.
LCM(360, 504): 2³ × 3² × 5 × 7 = 8 × 9 × 5 × 7 = 2520

Key relationship: HCF × LCM = product of the two numbers
Check: 72 × 2520 = 181440 = 360 × 504 ✓

Uses: simplifying fractions (divide by HCF); adding fractions (denominator = LCM); timed events (e.g. buses — LCM gives when they coincide again).

Exam trick: if asked "how many times does X divide into Y", it's Y ÷ HCF(X, Y) and X ÷ HCF(X, Y) that matter.`
  },

  // ─── Edexcel-specific ─────────────────────────────────────────────────────────
  {
    type: 'exam_tip',
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
    type: 'exam_tip',
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
    type: 'exam_tip',
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
    type: 'exam_tip',
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
    type: 'exam_tip',
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
    type: 'exam_tip',
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
