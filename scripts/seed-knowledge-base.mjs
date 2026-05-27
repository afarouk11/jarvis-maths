import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

async function embed(text) {
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text.slice(0, 8000) })
  return res.data[0].embedding
}

const entries = [
  {
    type: 'formula',
    topic_slug: 'differentiation',
    title: 'Quotient Rule — differentiating one function divided by another',
    content: `If y = u/v, then dy/dx = (v·du/dx - u·dv/dx) / v²

Memory trick: "vee dee-you minus you dee-vee, all over vee squared"

Example: y = x²/(3x + 1)
Let u = x², v = 3x + 1, du/dx = 2x, dv/dx = 3
dy/dx = ((3x+1)·2x - x²·3) / (3x+1)²
      = (3x² + 2x) / (3x+1)² = x(3x + 2) / (3x+1)²

Common mistake: getting the numerator the wrong way round.
AQA tip: always factorise the numerator in your final answer.`,
  },
  {
    type: 'formula',
    topic_slug: 'integration',
    title: 'Integration by substitution — reversing the chain rule',
    content: `Use when the integrand contains a composite function and its derivative.

Steps:
1. Choose u = inner function
2. Find du/dx, rearrange to get dx in terms of du
3. Substitute and simplify to a standard integral
4. Integrate, then substitute back

Example: ∫ 6x(3x² + 1)⁴ dx
Let u = 3x² + 1, du/dx = 6x → dx = du/6x
= ∫ 6x · u⁴ · du/6x = ∫ u⁴ du = u⁵/5 + C = (3x²+1)⁵/5 + C

Example 2: ∫ cos(x)·sin³(x) dx
Let u = sin(x), du/dx = cos(x)
= ∫ u³ du = u⁴/4 + C = sin⁴(x)/4 + C

AQA tip: always show the substitution step explicitly — it earns the method mark even if arithmetic goes wrong.`,
  },
  {
    type: 'formula',
    topic_slug: 'integration',
    title: 'Integration by parts — ∫u dv = uv − ∫v du',
    content: `∫ u dv/dx dx = uv − ∫ v du/dx dx

Choose u as the function that becomes simpler when differentiated (LATE: Logarithm, Algebra, Trig, Exponential — pick from the left).

Example: ∫ x·eˣ dx
u = x, dv/dx = eˣ → du/dx = 1, v = eˣ
= x·eˣ − ∫ eˣ dx = x·eˣ − eˣ + C = eˣ(x − 1) + C

Example 2: ∫ x·sin(x) dx
u = x, dv/dx = sin(x) → du/dx = 1, v = −cos(x)
= −x·cos(x) − ∫ −cos(x) dx = −x·cos(x) + sin(x) + C

Example 3 (ln): ∫ ln(x) dx
u = ln(x), dv/dx = 1 → du/dx = 1/x, v = x
= x·ln(x) − ∫ x·(1/x) dx = x·ln(x) − x + C

AQA tip: for ∫ ln(x) dx always use parts with u = ln(x), dv/dx = 1.`,
  },
  {
    type: 'formula',
    topic_slug: 'integration',
    title: 'Definite integrals and area under a curve',
    content: `Area between y = f(x) and the x-axis from x = a to x = b:
A = ∫ₐᵇ f(x) dx = [F(x)]ₐᵇ = F(b) − F(a)

If the curve goes below the x-axis, the integral gives a negative value — take the absolute value for area.

Area between two curves y = f(x) and y = g(x) where f(x) ≥ g(x):
A = ∫ₐᵇ [f(x) − g(x)] dx

Example: Area under y = x² − 4 between x = −2 and x = 2
∫₋₂² (x² − 4) dx = [x³/3 − 4x]₋₂² = (8/3 − 8) − (−8/3 + 8) = −32/3
Area = |−32/3| = 32/3

AQA tip: always sketch the curve first to identify regions above and below the x-axis — split the integral if needed.`,
  },
  {
    type: 'formula',
    topic_slug: 'trigonometry',
    title: 'Core trig identities — A-Level essential list',
    content: `Pythagorean identities:
sin²θ + cos²θ = 1
1 + tan²θ = sec²θ
1 + cot²θ = cosec²θ

Double angle formulae:
sin(2θ) = 2sin(θ)cos(θ)
cos(2θ) = cos²θ − sin²θ = 2cos²θ − 1 = 1 − 2sin²θ
tan(2θ) = 2tan(θ) / (1 − tan²θ)

Addition formulae:
sin(A ± B) = sin A cos B ± cos A sin B
cos(A ± B) = cos A cos B ∓ sin A sin B
tan(A ± B) = (tan A ± tan B) / (1 ∓ tan A tan B)

R sin(x + α) form:
a·sin(x) + b·cos(x) = R·sin(x + α)
where R = √(a² + b²), tan(α) = b/a

AQA tip: the double angle and addition formulae are given in the formula booklet — but know them anyway as deriving them wastes time in exams.`,
  },
  {
    type: 'formula',
    topic_slug: 'exponentials-logarithms',
    title: 'Laws of logarithms and solving exponential equations',
    content: `Laws of logarithms:
log(AB) = log A + log B
log(A/B) = log A − log B
log(Aⁿ) = n·log A
log_a(a) = 1, log_a(1) = 0

Change of base: log_a(x) = ln(x)/ln(a)

Solving exponential equations:
Example: 3ˣ = 20
Take ln both sides: x·ln(3) = ln(20)
x = ln(20)/ln(3) = 2.727 (3 d.p.)

Example: e²ˣ − 5eˣ + 6 = 0
Substitution: let u = eˣ → u² − 5u + 6 = 0 → (u−2)(u−3) = 0
u = 2 or u = 3 → eˣ = 2 → x = ln(2), or eˣ = 3 → x = ln(3)

AQA tip: always check for the substitution trick when you see e²ˣ and eˣ in the same equation.`,
  },
  {
    type: 'formula',
    topic_slug: 'sequences-series',
    title: 'Arithmetic and geometric series — formulas and sum',
    content: `Arithmetic sequence:
nth term: uₙ = a + (n−1)d
Sum of n terms: Sₙ = n/2 (2a + (n−1)d) = n/2 (a + l) where l is the last term

Geometric sequence:
nth term: uₙ = arⁿ⁻¹
Sum of n terms: Sₙ = a(1 − rⁿ)/(1 − r) for r ≠ 1
Sum to infinity: S∞ = a/(1−r), valid only when |r| < 1

Example: Find S∞ for 12, 4, 4/3, ...
a = 12, r = 1/3 (|r| < 1 ✓)
S∞ = 12 / (1 − 1/3) = 12 / (2/3) = 18

AQA tip: always state |r| < 1 when using the sum to infinity formula — it's required for the method mark.`,
  },
  {
    type: 'formula',
    topic_slug: 'binomial-expansion',
    title: 'Binomial expansion — positive integer and fractional powers',
    content: `For positive integer n:
(a + b)ⁿ = Σ C(n,r) aⁿ⁻ʳ bʳ
where C(n,r) = n! / (r!(n−r)!)

For |x| < 1 and any n (including fractions/negatives):
(1 + x)ⁿ = 1 + nx + n(n−1)/2! · x² + n(n−1)(n−2)/3! · x³ + ...

Example: Expand (1 + 3x)⁻² up to x²
n = −2, x → 3x
= 1 + (−2)(3x) + (−2)(−3)/2 · (3x)² + ...
= 1 − 6x + 27x² − ...

Valid for |3x| < 1 → |x| < 1/3

AQA tip: always state the range of validity for fractional/negative expansions — it costs a mark if omitted.`,
  },
  {
    type: 'formula',
    topic_slug: 'vectors',
    title: 'Vectors — dot product, angle between vectors, vector equation of a line',
    content: `Dot product: a · b = |a||b|cos θ
Component form: a · b = a₁b₁ + a₂b₂ + a₃b₃

Angle between two vectors:
cos θ = (a · b) / (|a||b|)
If a · b = 0 → vectors are perpendicular

Vector equation of a line:
r = a + λb
where a is a point on the line, b is the direction vector, λ is a scalar parameter

Distance between two points A and B: |AB| = |b − a|

Example: Find angle between a = (2, 1, −1) and b = (1, −1, 2)
a · b = 2(1) + 1(−1) + (−1)(2) = 2 − 1 − 2 = −1
|a| = √6, |b| = √6
cos θ = −1/6 → θ = arccos(−1/6) = 99.6°

AQA tip: when showing vectors are perpendicular, compute the dot product and state it equals zero — don't just say "they're at 90°".`,
  },
  {
    type: 'formula',
    topic_slug: 'proof',
    title: 'Methods of proof — AQA required techniques',
    content: `Proof by deduction:
Start from known facts and use logical steps to reach the conclusion. Show every step clearly.

Proof by exhaustion:
Check all possible cases individually. State you have covered all cases.

Proof by counter-example:
To disprove a statement, find ONE example where it fails.
Example: Disprove "n² + n + 41 is prime for all positive integers n"
n = 41: 41² + 41 + 41 = 41(41 + 1 + 1) = 41 × 43, not prime. ✓

Proof by contradiction:
Assume the opposite is true. Show this leads to a contradiction.
Example: Prove √2 is irrational.
Assume √2 = p/q in lowest terms. Then 2q² = p² → p² is even → p is even.
Let p = 2k: 2q² = 4k² → q² = 2k² → q is even. Contradicts p/q in lowest terms. ✗

AQA tip: in proof by contradiction, always end with "This is a contradiction, therefore our assumption was false."`,
  },
  {
    type: 'tip',
    topic_slug: null,
    title: 'AQA mark scheme — how marks are awarded',
    content: `M marks (Method): awarded for correct method even if arithmetic is wrong. Show working.
A marks (Accuracy): awarded for correct answer, usually depend on M mark being earned first.
B marks (Independent): awarded regardless of method — often for correct formula or statement.
ft marks (Follow-through): if you made an error, subsequent correct working earns these.

Key exam habits:
- Never skip steps — examiners cannot award M marks for working they cannot see
- If you make an error, carry it through correctly — you can still earn ft marks
- State formulas before using them (earns B marks)
- For "show that" questions, start from scratch — you cannot assume the answer
- Write answers to 3 significant figures unless told otherwise
- Always include units where relevant`,
  },
  {
    type: 'concept',
    topic_slug: 'differentiation',
    title: 'Stationary points — finding and classifying',
    content: `A stationary point occurs where dy/dx = 0.

To find stationary points:
1. Differentiate to get dy/dx
2. Set dy/dx = 0 and solve for x
3. Substitute x back into y = f(x) to get the coordinates

To classify (second derivative test):
- Find d²y/dx²
- Substitute the x value of the stationary point
- If d²y/dx² > 0 → minimum
- If d²y/dx² < 0 → maximum
- If d²y/dx² = 0 → inconclusive (check sign of dy/dx either side)

Example: y = x³ − 3x² + 2
dy/dx = 3x² − 6x = 3x(x − 2) = 0 → x = 0 or x = 2
d²y/dx² = 6x − 6
At x = 0: d²y/dx² = −6 < 0 → maximum at (0, 2)
At x = 2: d²y/dx² = 6 > 0 → minimum at (2, −2)

AQA tip: always give coordinates, not just x values.`,
  },
  {
    type: 'concept',
    topic_slug: 'normal-distribution',
    title: 'Normal distribution — Z-scores and probability',
    content: `X ~ N(μ, σ²) means X is normally distributed with mean μ and variance σ².

Standardising: Z = (X − μ) / σ, where Z ~ N(0, 1)

To find P(X < x): convert to Z-score and use tables or calculator.
P(X < x) = P(Z < (x − μ)/σ)

Key symmetry properties:
P(Z < −a) = 1 − P(Z < a)
P(Z > a) = 1 − P(Z < a)
P(−a < Z < a) = 2P(Z < a) − 1

Example: X ~ N(50, 16). Find P(X < 54).
Z = (54 − 50)/4 = 1
P(Z < 1) = 0.8413

Inverse: finding x given a probability
P(X < x) = 0.9 → P(Z < z) = 0.9 → z = 1.282
x = μ + zσ = 50 + 1.282 × 4 = 55.13

AQA tip: always define your random variable and state the distribution at the start of a statistics question.`,
  },
  {
    type: 'concept',
    topic_slug: 'hypothesis-testing',
    title: 'Hypothesis testing — full method for AQA',
    content: `Step 1: Define H₀ (null hypothesis) and H₁ (alternative hypothesis)
H₀: p = 0.3 (the value being tested)
H₁: p < 0.3 (one-tailed) or p ≠ 0.3 (two-tailed)

Step 2: State the test statistic and its distribution under H₀
X ~ B(n, 0.3) under H₀

Step 3: Find the probability of the observed result (or more extreme)
p-value = P(X ≤ x) for lower tail test

Step 4: Compare to significance level α
If p-value ≤ α → reject H₀
If p-value > α → do not reject H₀

Step 5: Write conclusion in context
"There is sufficient evidence at the 5% level to reject H₀. The data suggests the probability has decreased."

For two-tailed tests: compare p-value to α/2

AQA tip: always write your conclusion in context — saying only "reject H₀" without interpreting it in the scenario loses the final mark.`,
  },
  {
    type: 'concept',
    topic_slug: 'kinematics',
    title: 'Kinematics — SUVAT equations and calculus link',
    content: `SUVAT equations (constant acceleration only):
v = u + at
s = ut + ½at²
v² = u² + 2as
s = ½(u + v)t

Variables: s = displacement, u = initial velocity, v = final velocity, a = acceleration, t = time

Calculus link (for variable acceleration):
v = ds/dt (velocity is rate of change of displacement)
a = dv/dt = d²s/dt² (acceleration is rate of change of velocity)
s = ∫v dt, v = ∫a dt

Example: a = 3t − 2, v = 5 when t = 0. Find v when t = 3.
v = ∫(3t − 2) dt = 3t²/2 − 2t + C
At t = 0, v = 5 → C = 5
At t = 3: v = 27/2 − 6 + 5 = 12.5 m/s

AQA tip: SUVAT only works for constant acceleration. If acceleration changes with time, you must use calculus.`,
  },
]

let added = 0
for (const entry of entries) {
  try {
    const embedding = await embed(`${entry.title}\n\n${entry.content}`)
    const { error } = await supabase.from('knowledge_base').insert({
      topic_slug: entry.topic_slug,
      type: entry.type,
      title: entry.title,
      content: entry.content,
      embedding,
    })
    if (error) {
      console.error(`✗ ${entry.title}:`, error.message)
    } else {
      console.log(`✓ ${entry.title}`)
      added++
    }
  } catch (err) {
    console.error(`✗ ${entry.title}:`, err.message)
  }
}

console.log(`\nDone — ${added}/${entries.length} entries added.`)
