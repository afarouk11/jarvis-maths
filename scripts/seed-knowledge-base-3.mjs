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
  // ── A-Level Pure ─────────────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: 'differentiation',
    title: 'Differential equations — separation of variables',
    content: `Used to solve dy/dx = f(x)g(y) by separating x and y to opposite sides.

Steps:
1. Rearrange: 1/g(y) dy = f(x) dx
2. Integrate both sides
3. Apply initial conditions to find the constant C
4. Rearrange to express y explicitly if required

Example: dy/dx = xy, y = 2 when x = 0
1/y dy = x dx
∫1/y dy = ∫x dx
ln|y| = x²/2 + C
At x = 0, y = 2: ln2 = C
ln|y| = x²/2 + ln2
y = 2e^(x²/2)

Example 2 (growth/decay): dN/dt = kN
∫1/N dN = ∫k dt
ln N = kt + C → N = Ae^(kt)
where A = N₀ (initial population)

AQA tip: always apply initial conditions after integrating, not before — and always include + C before finding its value.`,
  },
  {
    type: 'concept',
    topic_slug: 'algebra-functions',
    title: 'Functions — domain, range, composite and inverse functions',
    content: `Domain: the set of allowed input values (x values)
Range: the set of possible output values (y values)

Composite function: fg(x) means apply g first, then f.
fg(x) = f(g(x))
Domain of fg: values of x in domain of g such that g(x) is in domain of f.

Example: f(x) = √x (domain x ≥ 0), g(x) = x − 3
fg(x) = √(x − 3), domain: x ≥ 3

Inverse function f⁻¹(x):
1. Write y = f(x)
2. Rearrange to make x the subject
3. Swap x and y → this is f⁻¹(x)
Domain of f⁻¹ = range of f, range of f⁻¹ = domain of f

Example: f(x) = 2x + 5, x ∈ ℝ
y = 2x + 5 → x = (y−5)/2 → f⁻¹(x) = (x−5)/2

Key fact: ff⁻¹(x) = f⁻¹f(x) = x
Graphically: f⁻¹ is the reflection of f in the line y = x

AQA tip: always state the domain of the inverse function — it's the range of the original and costs a mark if omitted.`,
  },
  {
    type: 'concept',
    topic_slug: 'algebra-functions',
    title: 'Transformations of graphs — translations, stretches, reflections',
    content: `Starting from y = f(x):

Translations:
y = f(x) + a → shift UP by a
y = f(x − a) → shift RIGHT by a (note: inside the function, opposite direction)

Stretches:
y = af(x) → stretch VERTICALLY by scale factor a (away from x-axis)
y = f(ax) → stretch HORIZONTALLY by scale factor 1/a (towards y-axis)

Reflections:
y = −f(x) → reflect in the x-axis
y = f(−x) → reflect in the y-axis

Combined example: y = 3f(2x − 4)
= 3f(2(x − 2))
Step 1: f(2x) → horizontal stretch ×½
Step 2: f(2(x−2)) → translate right 2
Step 3: 3f(...) → vertical stretch ×3

Effect on key points:
(x, y) on f(x) → (x+a, y) after y = f(x−a)
(x, y) on f(x) → (x, ay) after y = af(x)

AQA tip: for combined transformations, apply horizontal changes first (working inside the brackets out).`,
  },
  {
    type: 'formula',
    topic_slug: 'algebra-functions',
    title: 'Modulus function — |f(x)| and solving modulus equations',
    content: `|x| = x if x ≥ 0, and −x if x < 0

|f(x)| reflects any part of the graph below the x-axis upward.
f(|x|) reflects the right half of the graph onto the left.

Solving |ax + b| = c (c > 0):
Two cases: ax + b = c  OR  ax + b = −c

Example: |2x − 3| = 5
2x − 3 = 5 → x = 4
2x − 3 = −5 → x = −1

Solving |f(x)| = |g(x)|:
Square both sides: [f(x)]² = [g(x)]²
Or: f(x) = g(x)  OR  f(x) = −g(x)

Solving |f(x)| < c: −c < f(x) < c (solve as compound inequality)
Solving |f(x)| > c: f(x) > c  OR  f(x) < −c

Example: |3x − 1| < 8
−8 < 3x − 1 < 8
−7 < 3x < 9
−7/3 < x < 3

AQA tip: always sketch the graph for modulus inequalities — it makes it clear which region satisfies the inequality.`,
  },
  {
    type: 'formula',
    topic_slug: 'integration',
    title: 'Volumes of revolution — rotating around the x-axis',
    content: `Volume of solid formed by rotating y = f(x) around the x-axis from x = a to x = b:

V = π ∫ₐᵇ y² dx

For rotation around the y-axis from y = c to y = d:
V = π ∫_c^d x² dy (express x in terms of y first)

Example: Find the volume when y = x² is rotated 360° around the x-axis from x = 0 to x = 2.
V = π ∫₀² (x²)² dx = π ∫₀² x⁴ dx = π [x⁵/5]₀² = π × 32/5 = 32π/5

Example 2: Region between y = x + 1 and y = x² rotated around x-axis.
V = π ∫ₐᵇ [(x+1)² − (x²)²] dx
where a, b are intersection points.

AQA tip: don't forget the π — it's part of the formula. Always substitute y² (not y) into the integral.`,
  },
  {
    type: 'concept',
    topic_slug: 'exponentials-logarithms',
    title: 'Exponential models — growth, decay, and fitting to data',
    content: `General exponential model: y = Ae^(kt)
k > 0: growth (population, compound interest, spread of disease)
k < 0: decay (radioactive decay, cooling, drug concentration)

Linearising: take ln of both sides
y = Ae^(kt) → ln y = kt + ln A
Plot ln y against t → straight line with gradient k and y-intercept ln A

Example: Temperature of cooling object: T = 20 + 60e^(−0.1t)
At t = 0: T = 80°C (initial temp)
As t → ∞: T → 20°C (room temperature)
Rate of cooling: dT/dt = −6e^(−0.1t)

Fitting the model from two data points:
At t = 0: y = A → read A directly
At t = t₁: y₁ = Ae^(kt₁) → k = ln(y₁/A)/t₁

Doubling time for growth: t = ln2/k
Half-life for decay: t½ = ln2/|k|

AQA tip: for "find the value of the constants" — always use ln to convert the exponential equation into a linear one.`,
  },
  {
    type: 'formula',
    topic_slug: 'algebra-functions',
    title: 'Fixed point iteration — finding roots numerically',
    content: `Rearrange f(x) = 0 into the form x = g(x), then iterate:
xₙ₊₁ = g(xₙ)

Steps:
1. Show a root exists in an interval: find sign change of f(x)
2. Rearrange f(x) = 0 to x = g(x) (often given in exam)
3. Choose starting value x₀
4. Apply formula repeatedly until convergence

Example: x³ − 3x + 1 = 0, rearranged as x = (x³ + 1)/3
x₀ = 0.3
x₁ = (0.027 + 1)/3 = 0.342
x₂ = (0.342³ + 1)/3 = 0.346...
Converges to x ≈ 0.347

Convergence condition: |g'(x)| < 1 near the root.
If |g'(x)| > 1, the iteration diverges (try a different rearrangement).

Staircase diagram: converges monotonically
Cobweb diagram: converges by alternating above/below

AQA tip: always show the first 3–4 iterations to the required decimal places, and state the root to the accuracy asked.`,
  },
  // ── A-Level Statistics ───────────────────────────────────────────────────────
  {
    type: 'concept',
    topic_slug: 'probability',
    title: 'Measures of location and spread — mean, variance, standard deviation',
    content: `Mean: x̄ = Σx/n or Σfx/Σf (from frequency table)

Variance: σ² = Σ(x − x̄)²/n = Σx²/n − x̄²  (easier for calculation)

Standard deviation: σ = √variance

Coded data: if y = (x − a)/b, then:
ȳ = (x̄ − a)/b
σᵧ = σₓ/|b|  (standard deviation scales but doesn't shift)

Interpolation for median from grouped data:
median = L + [(n/2 − F)/f] × h
where L = lower class boundary, F = cumulative freq before median class, f = freq of median class, h = class width

Outliers: value more than 1.5 × IQR above Q3 or below Q1.
Or: value more than 2 standard deviations from mean.

AQA tip: use Σx²/n − x̄² for variance calculation — it's less prone to rounding errors than Σ(x − x̄)²/n.`,
  },
  {
    type: 'concept',
    topic_slug: 'probability',
    title: 'Sampling methods — random, stratified, systematic, opportunity',
    content: `Simple random sampling:
Every member of the population has an equal chance of being selected.
Method: number the population, use random number generator.
Advantage: unbiased. Disadvantage: requires a complete sampling frame.

Stratified sampling:
Population divided into groups (strata). Sample from each group proportionally.
Number from stratum = (stratum size / population size) × sample size
Advantage: ensures representation of subgroups.

Systematic sampling:
Select every kth member (k = population/sample size).
Advantage: simple to implement. Disadvantage: can introduce bias if pattern in data.

Opportunity (convenience) sampling:
Use whoever is available.
Advantage: quick and easy. Disadvantage: highly biased, not representative.

Quota sampling:
Like stratified but not random within strata — interviewer fills quotas.

AQA tip: always state both an advantage AND a disadvantage — partial answers only score half marks.`,
  },
  {
    type: 'concept',
    topic_slug: 'probability',
    title: 'Data representation — histograms, box plots, cumulative frequency',
    content: `Histograms (grouped continuous data):
Frequency density = frequency / class width
Area of bar = frequency (not height)

Box plots:
Shows: minimum, Q1 (lower quartile), Q2 (median), Q3 (upper quartile), maximum.
IQR = Q3 − Q1 (measure of spread, not affected by outliers)
Skew: positive skew → median closer to Q1; negative skew → median closer to Q3

Cumulative frequency:
Plot cumulative frequency against upper class boundary.
Read off: median at n/2, Q1 at n/4, Q3 at 3n/4.

Comparing distributions — always comment on:
1. Average (mean or median) — which is higher?
2. Spread (IQR or standard deviation) — which is more consistent?
3. Skew if relevant

Example comparison: "Group A has a higher median (65 vs 58) suggesting higher performance on average. Group A also has a smaller IQR (12 vs 20) indicating more consistent results."

AQA tip: comparison statements must be in context — don't just say "Group A has higher median", say what that means for the situation.`,
  },
  // ── A-Level Mechanics ────────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: 'forces-newtons-laws',
    title: 'Energy, work and power — work-energy theorem',
    content: `Work done: W = Fd cos θ (F = force, d = displacement, θ = angle between them)
Units: Joules (J)

Kinetic energy: KE = ½mv²
Gravitational PE: GPE = mgh

Work-energy theorem: Net work done = change in KE
W_net = ½mv² − ½mu²

Conservation of energy (no friction):
KE + GPE = constant
½mv₁² + mgh₁ = ½mv₂² + mgh₂

With friction: energy lost to friction = friction force × distance
½mu² = ½mv² + mgh + Fd (friction F over distance d on slope)

Power: P = W/t = Fv (force × velocity)
Units: Watts (W)

Example: Car of mass 1000 kg accelerates from 10 to 20 m/s over 100 m on flat road. Driving force = 800 N. Find friction force.
Work by driving force: 800 × 100 = 80,000 J
Change in KE: ½(1000)(400 − 100) = 150,000 J
Work against friction: 80,000 − 150,000 = −70,000 J → friction = 700 N

AQA tip: always identify which energy transfers are happening before setting up the equation.`,
  },
  {
    type: 'formula',
    topic_slug: 'forces-newtons-laws',
    title: 'Friction — coefficient of friction, limiting equilibrium, on slopes',
    content: `Friction force: F ≤ μN
At limiting equilibrium (about to slide): F = μN
μ = coefficient of friction (given in question)

On a horizontal surface:
Normal reaction N = mg (for horizontal surface)
Max friction = μmg

On a slope (angle θ):
Normal reaction N = mg cos θ
Component of weight down slope = mg sin θ
Friction acts UP the slope when object about to slide down.

Limiting equilibrium on slope:
mg sin θ = μmg cos θ → tan θ = μ → θ = arctan(μ)

Example: Block of mass 5 kg on slope at 30°, μ = 0.4. Find whether it slides.
mg sin30° = 5 × 9.8 × 0.5 = 24.5 N (down slope)
N = mg cos30° = 5 × 9.8 × 0.866 = 42.4 N
Max friction = 0.4 × 42.4 = 16.97 N
Since 24.5 > 16.97, the block slides.

AQA tip: friction always opposes the direction of motion (or potential motion). State this in your working.`,
  },
  // ── GCSE Gaps ────────────────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Surds — simplifying and rationalising the denominator',
    content: `Simplifying surds: √(ab) = √a × √b
Find the largest perfect square factor.
√72 = √(36 × 2) = 6√2

Operations:
√a × √b = √(ab)
√a / √b = √(a/b)
(√a)² = a
(a + √b)(a − √b) = a² − b (difference of two squares)

Rationalising the denominator:
Simple: 3/√5 = 3√5/5 (multiply by √5/√5)

Conjugate pair: 1/(3 + √2) = (3 − √2)/((3 + √2)(3 − √2)) = (3 − √2)/(9 − 2) = (3 − √2)/7

Expanding with surds:
(2 + √3)² = 4 + 4√3 + 3 = 7 + 4√3
(1 + √5)(2 − √5) = 2 − √5 + 2√5 − 5 = −3 + √5

GCSE tip: leave answers in surd form unless told to round — surd form is exact and always preferred.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Rules of indices — integer, fractional, and negative powers',
    content: `Basic rules:
aᵐ × aⁿ = aᵐ⁺ⁿ
aᵐ ÷ aⁿ = aᵐ⁻ⁿ
(aᵐ)ⁿ = aᵐⁿ
a⁰ = 1 (any non-zero base)
a⁻ⁿ = 1/aⁿ

Fractional indices:
a^(1/n) = ⁿ√a (nth root)
a^(m/n) = (ⁿ√a)ᵐ = ⁿ√(aᵐ)

Examples:
27^(2/3) = (∛27)² = 3² = 9
16^(−3/4) = 1/(16^(3/4)) = 1/(⁴√16)³ = 1/2³ = 1/8
(2x³)⁴ = 16x¹²

Solving index equations:
2ˣ = 32 = 2⁵ → x = 5
9ˣ = 27 → (3²)ˣ = 3³ → 3²ˣ = 3³ → 2x = 3 → x = 1.5

GCSE tip: for fractional indices, always find the root first (easier numbers), then raise to the power.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Standard form — converting, calculating, and interpreting',
    content: `Standard form: A × 10ⁿ where 1 ≤ A < 10 and n is an integer.

Converting to standard form:
4,500,000 = 4.5 × 10⁶
0.000073 = 7.3 × 10⁻⁵

Multiplying: (3 × 10⁴) × (2 × 10³) = 6 × 10⁷
Dividing: (6 × 10⁸) ÷ (2 × 10³) = 3 × 10⁵

Adding/subtracting — convert to same power of 10 first:
(3.2 × 10⁴) + (4 × 10³) = (3.2 × 10⁴) + (0.4 × 10⁴) = 3.6 × 10⁴

On calculator: use EXP or ×10ˣ button. Never write 10^4 as E4 in final answer.

Example: Distance from Earth to Sun = 1.5 × 10¹¹ m
Light speed = 3 × 10⁸ m/s
Time = distance/speed = (1.5 × 10¹¹)/(3 × 10⁸) = 0.5 × 10³ = 500 seconds

GCSE tip: after multiplying, check that A is still between 1 and 10 — adjust the power if needed.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Inequalities — solving, graphing, and integer solutions',
    content: `Solving linear inequalities — same as equations but:
When multiplying or dividing by a negative, FLIP the inequality sign.

Example: −3x + 2 > 11
−3x > 9
x < −3 (flipped because dividing by −3)

Representing on number line:
○ (open circle) for strict inequalities (< or >)
● (filled circle) for ≤ or ≥

Integer solutions: list all integers satisfying the inequality.
Example: −3 ≤ x < 2 → integers: −3, −2, −1, 0, 1

Quadratic inequalities:
x² − 5x + 6 > 0 → (x−2)(x−3) > 0
Sketch the parabola: positive outside the roots → x < 2 or x > 3

x² − 5x + 6 < 0 → between the roots → 2 < x < 3

Two inequalities simultaneously:
Solve each separately, then find the overlap (AND) or union (OR).

GCSE tip: always sketch a number line for inequalities with two conditions — it prevents errors in combining them.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Ratio, proportion, and percentage problems',
    content: `Ratio: share £240 in ratio 3:5
Total parts = 8. One part = 240/8 = 30.
Shares: 3×30 = £90 and 5×30 = £150.

Direct proportion: y = kx (as x doubles, y doubles)
Inverse proportion: y = k/x (as x doubles, y halves)
Find k using a given pair of values, then use to find unknowns.

Percentage increase/decrease:
New value = original × (1 + r/100)
Multiplier for 15% increase: × 1.15
Multiplier for 20% decrease: × 0.80

Reverse percentage (finding original):
After 20% increase, price is £360. Original?
£360 ÷ 1.20 = £300

Compound interest: A = P(1 + r/100)ⁿ
P = principal, r = annual rate, n = years

Simple interest: I = PRT/100 (T in years)

Percentage change = (change / original) × 100

GCSE tip: for reverse percentages, always divide by the multiplier — never subtract the percentage directly.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Volume and surface area — spheres, cones, cylinders',
    content: `Cylinder (radius r, height h):
Volume = πr²h
Curved surface area = 2πrh
Total surface area = 2πrh + 2πr²

Cone (radius r, slant height l, perpendicular height h):
Volume = ⅓πr²h
Curved surface area = πrl
Total surface area = πrl + πr²
l = √(r² + h²)

Sphere (radius r):
Volume = 4/3 πr³
Surface area = 4πr²

Hemisphere:
Volume = 2/3 πr³
Total surface area = 2πr² + πr² = 3πr²

Compound shapes: split into simpler solids, calculate each separately.

Example: Cone on top of cylinder, r = 3, cylinder h = 10, cone h = 4.
l = √(9 + 16) = 5
Volume = πr²h_cyl + ⅓πr²h_cone = π(9)(10) + ⅓π(9)(4) = 90π + 12π = 102π cm³

GCSE tip: leave answers in terms of π unless told to round — it's exact and avoids rounding errors.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Vectors — column vectors, magnitude, and geometric proof',
    content: `Column vector: (a, b) means a right, b up (negative = left/down)

Addition: (a, b) + (c, d) = (a+c, b+d)
Scalar multiplication: k(a, b) = (ka, kb)
Magnitude: |(a, b)| = √(a² + b²)

Vector journey: to go from A to B = −(vector to A) + (vector to B) = AB⃗

Geometric proofs:
Parallel vectors: b = ka (scalar multiple → parallel)
Same point: if two vectors for same route are equal → same point (midpoint proofs)

Example: OA = a, OB = b. M is midpoint of AB.
OM = OA + AM = a + ½(b − a) = ½a + ½b = ½(a + b)

Proving collinear points: show AB⃗ = k × AC⃗ (parallel and share point A)

Example: Show P, Q, R are collinear given PQ⃗ = 2a + b and PR⃗ = 6a + 3b
PR⃗ = 3(2a + b) = 3 PQ⃗ → parallel and share point P → collinear ✓

GCSE tip: for vector proofs, always express vectors in terms of the given base vectors a and b, then factorise.`,
  },
  // ── Exam Technique Entries ───────────────────────────────────────────────────
  {
    type: 'tip',
    topic_slug: null,
    title: 'How to write "show that" and "prove" answers',
    content: `"Show that" questions: you are given the answer — your job is to show the working that leads to it.
- Start from scratch — never assume the result
- Every step must follow logically from the previous
- State what you are doing at each step
- End with a clear conclusion: "Therefore [result] as required" or QED

"Prove" questions: same as "show that" but you must also choose your approach.
- For algebraic proofs: start from one side and manipulate to reach the other
- For proof by counter-example: one example is sufficient
- For proof by contradiction: clearly state your assumption, derive the contradiction

Common mistakes in proofs:
✗ Starting with both sides and working to 0 = 0 (circular reasoning)
✗ Assuming the result and working backwards without saying so
✓ Choose one side, manipulate to match the other

Example: Prove (2n+1)² − (2n−1)² = 8n for all integers n.
LHS = (4n² + 4n + 1) − (4n² − 4n + 1) = 8n = RHS ✓

AQA tip: "show that" answers should have more detail than regular questions — examiners check the logic, not just the final line.`,
  },
  {
    type: 'tip',
    topic_slug: 'differentiation',
    title: 'Common mistakes in differentiation — AQA exam errors',
    content: `Chain rule errors:
✗ Forgetting to multiply by the derivative of the inner function
✓ Always write out u = inner, du/dx = ..., then apply d/dx[uⁿ] = nuⁿ⁻¹ · du/dx

Product rule errors:
✗ Differentiating both parts without adding (treating as chain rule)
✓ Remember: d/dx[uv] = u·v' + v·u' (two terms, not one)

Quotient rule sign error:
✗ Writing (u·dv − v·du)/v² instead of (v·du − u·dv)/v²
✓ "vee dee-you minus you dee-vee" — v comes first in the numerator

Power rule applied to 1/x:
✗ d/dx(1/x) = 1 (forgetting the power rule)
✓ d/dx(x⁻¹) = −x⁻² = −1/x²

Forgetting to simplify:
✗ Leaving dy/dx = (3x² + 3x) when it factorises
✓ Always factorise the final answer: 3x(x + 1)

Stationary points — forgetting both coordinates:
✗ Stating x = 2 as the stationary point
✓ State (2, f(2)) as the full coordinate`,
  },
  {
    type: 'tip',
    topic_slug: 'integration',
    title: 'Common mistakes in integration — AQA exam errors',
    content: `Forgetting + C:
✗ ∫2x dx = x²
✓ ∫2x dx = x² + C (indefinite integrals ALWAYS need + C)

Wrong substitution direction:
✗ Not fully substituting — leaving x terms after substitution
✓ After substituting u, no x should remain in the integral

Integration by parts — wrong choice of u:
✗ Choosing u = eˣ when integrating xeˣ (makes it more complex)
✓ Use LATE: Logarithm, Algebraic, Trig, Exponential — pick u from left of list

Definite integral sign errors:
✗ F(b) + F(a) instead of F(b) − F(a)
✓ [F(x)]ₐᵇ = F(b) − F(a) — upper limit minus lower limit

Area below x-axis:
✗ Using the negative value as the area
✓ Area is always positive: take |∫f(x)dx| for sections below the x-axis

Partial fractions before integrating:
✗ Trying to integrate 1/((x+1)(x−2)) directly
✓ Always decompose into partial fractions first, then integrate each term`,
  },
  {
    type: 'tip',
    topic_slug: 'trigonometry',
    title: 'Common mistakes in trigonometry — AQA exam errors',
    content: `Missing solutions when solving equations:
✗ Giving only the calculator answer (principal value)
✓ Always find ALL solutions in the given range using symmetry

Range transformation errors:
✗ Solving cos(2x) = 0.5 with the same range as x
✓ If solving for 2x, double the range: 0 ≤ x ≤ 360° → 0 ≤ 2x ≤ 720°

Wrong identity used:
✗ Using cos(2x) = cos²x − sin²x when you need 1 − 2sin²x form
✓ Choose the double angle form that simplifies with what's already in the equation

Rounding too early:
✗ Rounding intermediate trig values mid-calculation
✓ Keep full calculator precision until the final answer

Using degrees vs radians:
✗ Mixing degrees and radians in the same calculation
✓ Check what the question requires — if in radians, keep calculator in radian mode

Identities — wrong form:
✗ Writing tan²x + 1 = cosec²x
✓ tan²x + 1 = sec²x and 1 + cot²x = cosec²x`,
  },
  {
    type: 'tip',
    topic_slug: null,
    title: 'Common mistakes in statistics — AQA exam errors',
    content: `Hypothesis testing — wrong tail:
✗ Using two-tailed test when question says "has increased" (one-tailed)
✓ "Increased/decreased/changed" tells you the direction and tail of the test

Not writing conclusion in context:
✗ "Reject H₀"
✓ "There is sufficient evidence at the 5% level to suggest the probability of success has increased"

Normal distribution — standardising errors:
✗ Z = (μ − X)/σ instead of (X − μ)/σ
✓ Always: Z = (X − μ)/σ with X first in numerator

Binomial — wrong model:
✗ Using binomial when trials are not independent or p changes
✓ Check: fixed n, two outcomes, constant p, independent trials

PMCC — wrong interpretation:
✗ "r = 0.9 means X causes Y"
✓ Correlation does not imply causation — state "evidence of a linear relationship"

Regression — extrapolation:
✗ Using ŷ = a + bx to predict far outside the data range without comment
✓ State "this is extrapolation and may not be reliable"`,
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
