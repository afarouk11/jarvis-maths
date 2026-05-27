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
  // ── Pure: Algebra & Polynomials ──────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: 'algebra-functions',
    title: 'Factor theorem and algebraic long division',
    content: `Factor theorem: (x − a) is a factor of f(x) if and only if f(a) = 0.

To find factors: test integer values ±1, ±2, ±3, ... until f(a) = 0.

Example: Show (x − 2) is a factor of f(x) = x³ − 3x² − 4x + 12
f(2) = 8 − 12 − 8 + 12 = 0 ✓ → (x − 2) is a factor

Algebraic long division to find remaining factor:
x³ − 3x² − 4x + 12 ÷ (x − 2) = x² − x − 6 = (x − 3)(x + 2)

So f(x) = (x − 2)(x − 3)(x + 2)

Remainder theorem: when f(x) is divided by (x − a), the remainder is f(a).

AQA tip: always verify by substitution after factorising — catches sign errors before they cost marks.`,
  },
  {
    type: 'formula',
    topic_slug: 'algebra-functions',
    title: 'Completing the square — quadratics and circle equations',
    content: `ax² + bx + c → a(x + b/2a)² + (c − b²/4a)

Steps:
1. Factor out a from x² and x terms
2. Add and subtract (b/2a)² inside the bracket
3. Simplify

Example: x² + 6x + 2
= (x + 3)² − 9 + 2 = (x + 3)² − 7
Vertex: (−3, −7), minimum point

Example 2: 2x² − 8x + 5
= 2(x² − 4x) + 5 = 2[(x − 2)² − 4] + 5 = 2(x − 2)² − 3
Vertex: (2, −3)

Uses:
- Finding the vertex/turning point without differentiation
- Solving quadratics: (x + 3)² = 7 → x = −3 ± √7
- Proving a quadratic has no real roots (if completed form always positive)

AQA tip: completing the square is often required explicitly — don't just use the formula unless the question says you can.`,
  },
  {
    type: 'formula',
    topic_slug: 'algebra-functions',
    title: 'Partial fractions — decomposing rational expressions',
    content: `Used to split a fraction with a polynomial denominator into simpler fractions, especially before integrating.

Case 1 — distinct linear factors:
(3x + 1)/((x+1)(x−2)) = A/(x+1) + B/(x−2)
Multiply through: 3x + 1 = A(x−2) + B(x+1)
x = 2: 7 = 3B → B = 7/3
x = −1: −2 = −3A → A = 2/3

Case 2 — repeated factor:
(x+3)/((x−1)²(x+2)) = A/(x−1) + B/(x−1)² + C/(x+2)

Case 3 — improper fraction (degree of numerator ≥ denominator):
First do algebraic long division, then decompose the remainder.

AQA tip: partial fractions almost always appear as the first step before integrating. If you see ∫ 1/((x+1)(x−2)) dx, decompose first.`,
  },
  {
    type: 'formula',
    topic_slug: 'algebra-functions',
    title: 'Discriminant — nature of roots of a quadratic',
    content: `For ax² + bx + c = 0, the discriminant is Δ = b² − 4ac

Δ > 0 → two distinct real roots
Δ = 0 → one repeated real root (touches x-axis)
Δ < 0 → no real roots (complex roots)

Example: Find the values of k for which x² + kx + 9 = 0 has real roots.
Δ ≥ 0: k² − 36 ≥ 0 → k ≤ −6 or k ≥ 6

Example 2: Show x² − 3x + 5 > 0 for all real x.
Δ = 9 − 20 = −11 < 0, and a = 1 > 0 → always positive ✓

AQA tip: for "show the curve doesn't cross the x-axis" questions, compute the discriminant and state Δ < 0 with a = positive.`,
  },
  // ── Pure: Coordinate Geometry ────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: 'algebra-functions',
    title: 'Circle equations — standard form, tangents, and normals',
    content: `Standard form: (x − a)² + (y − b)² = r²
Centre (a, b), radius r

General form: x² + y² + 2gx + 2fy + c = 0
Centre (−g, −f), radius = √(g² + f² − c)

Converting: complete the square on x and y terms.
x² + y² − 4x + 6y − 3 = 0
(x−2)² − 4 + (y+3)² − 9 − 3 = 0
(x−2)² + (y+3)² = 16 → centre (2, −3), radius 4

Tangent to circle at point P:
- Radius to P is perpendicular to tangent
- Find gradient of radius OP, then tangent gradient = −1/m
- Use y − y₁ = m(x − x₁) with point P

AQA tip: always check a point lies on the circle before finding the tangent — substitute into the equation first.`,
  },
  // ── Pure: Differentiation ────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: 'differentiation',
    title: 'Implicit differentiation — differentiating equations in x and y',
    content: `Used when y cannot be isolated — differentiate both sides with respect to x.
Key rule: d/dx[f(y)] = f'(y) · dy/dx (chain rule)

Example: Differentiate x² + y² = 25
2x + 2y·dy/dx = 0
dy/dx = −x/y

Example 2: x² + 3xy + y² = 7
2x + 3(y + x·dy/dx) + 2y·dy/dx = 0
2x + 3y + (3x + 2y)·dy/dx = 0
dy/dx = −(2x + 3y)/(3x + 2y)

Example 3: Find stationary points of x² − xy + y² = 3
Set dy/dx = 0 and solve simultaneously with original equation.

AQA tip: always collect all dy/dx terms on one side before factorising — this is the most common source of errors.`,
  },
  {
    type: 'formula',
    topic_slug: 'differentiation',
    title: 'Parametric differentiation and equations',
    content: `For x = f(t), y = g(t):
dy/dx = (dy/dt) / (dx/dt)

d²y/dx² = d/dx(dy/dx) = (d/dt(dy/dx)) / (dx/dt)

Example: x = t², y = t³ − 3t
dx/dt = 2t, dy/dt = 3t² − 3
dy/dx = (3t² − 3)/(2t)

At t = 2: dy/dx = (12 − 3)/4 = 9/4

Finding stationary points: set dy/dt = 0 (and dx/dt ≠ 0)
3t² − 3 = 0 → t = ±1
At t = 1: (1, −2), At t = −1: (1, 2)

Converting to Cartesian: eliminate t.
x = t² → t = √x, y = x√x − 3√x = √x(x − 3)

AQA tip: for d²y/dx², differentiate dy/dx with respect to t first, then divide by dx/dt.`,
  },
  {
    type: 'formula',
    topic_slug: 'differentiation',
    title: 'Connected rates of change — chain rule in context',
    content: `Use the chain rule to connect rates: dA/dt = dA/dr · dr/dt

Steps:
1. Write down the relationship between the quantities (formula)
2. Differentiate with respect to the relevant variable
3. Use chain rule to connect the rates

Example: A spherical balloon is inflated at 10 cm³/s. Find the rate of increase of radius when r = 5 cm.
V = 4/3 πr³ → dV/dr = 4πr²
dV/dt = 10, find dr/dt when r = 5
dr/dt = dV/dt ÷ dV/dr = 10/(4π·25) = 1/(10π) cm/s

Example 2: Water drains from a cone. Height h, radius r = h/2.
V = πh³/12 → dV/dh = πh²/4
If dV/dt = −5: dh/dt = −5/(πh²/4) = −20/(πh²)

AQA tip: always define your variables and write the connecting formula before differentiating.`,
  },
  // ── Pure: Integration ────────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: 'integration',
    title: 'Standard integrals — essential list for AQA',
    content: `∫ xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ −1)
∫ 1/x dx = ln|x| + C
∫ eˣ dx = eˣ + C
∫ eᵃˣ dx = (1/a)eᵃˣ + C
∫ sin(x) dx = −cos(x) + C
∫ cos(x) dx = sin(x) + C
∫ sin(ax) dx = −(1/a)cos(ax) + C
∫ cos(ax) dx = (1/a)sin(ax) + C
∫ sec²(x) dx = tan(x) + C
∫ 1/(x² + a²) dx = (1/a)arctan(x/a) + C
∫ 1/√(a² − x²) dx = arcsin(x/a) + C

Key pattern — reverse chain rule:
∫ f'(x)/f(x) dx = ln|f(x)| + C
∫ f'(x)[f(x)]ⁿ dx = [f(x)]ⁿ⁺¹/(n+1) + C

Example: ∫ 2x/(x²+3) dx = ln|x²+3| + C (numerator is derivative of denominator)

AQA tip: memorise the ln|x| and arctan results — they appear frequently and are not always obvious.`,
  },
  {
    type: 'formula',
    topic_slug: 'integration',
    title: 'Trapezium rule — numerical integration',
    content: `Approximates ∫ₐᵇ f(x) dx using trapezoids.

Formula: ∫ₐᵇ f(x) dx ≈ h/2 [y₀ + 2(y₁ + y₂ + ... + yₙ₋₁) + yₙ]
where h = (b−a)/n (strip width), yᵢ = f(a + ih)

Example: Estimate ∫₁³ √(x+1) dx using 4 strips.
h = (3−1)/4 = 0.5
x:    1,    1.5,   2,    2.5,   3
y: √2, √2.5, √3, √3.5, √4
  = 1.414, 1.581, 1.732, 1.871, 2.000

≈ 0.5/2 [1.414 + 2(1.581 + 1.732 + 1.871) + 2.000]
= 0.25 [1.414 + 10.368 + 2.000] = 0.25 × 13.782 = 3.446

Overestimate vs underestimate:
- Curve concave up (∪) → trapezium rule overestimates
- Curve concave down (∩) → trapezium rule underestimates

AQA tip: more strips = better approximation. Always state whether it's an over or underestimate and why.`,
  },
  {
    type: 'formula',
    topic_slug: 'algebra-functions',
    title: 'Newton-Raphson method — numerical root finding',
    content: `Iterative formula: xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ)

Used to find roots of f(x) = 0 to a specified accuracy.

Steps:
1. Find an initial estimate x₀ (usually given, or find by sign change)
2. Apply the formula repeatedly until convergence
3. Check: substitute into f(x) to verify accuracy

Example: Find a root of f(x) = x³ − 2x − 5, x₀ = 2
f(x) = x³ − 2x − 5, f'(x) = 3x² − 2
x₁ = 2 − (8−4−5)/(12−2) = 2 − (−1/10) = 2.1
x₂ = 2.1 − f(2.1)/f'(2.1) = 2.1 − 0.061/11.23 = 2.0945...

Failure: Newton-Raphson fails if f'(xₙ) = 0 (tangent is horizontal) or if the iteration diverges.

AQA tip: show each iteration clearly with values to 4 d.p. — lose accuracy marks for rounding too early.`,
  },
  // ── Trigonometry ─────────────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: 'trigonometry',
    title: 'Solving trigonometric equations — full method',
    content: `Step 1: Rearrange to get sin/cos/tan = value
Step 2: Find principal value using inverse trig
Step 3: Use symmetry and periodicity to find all solutions in the given range

Key symmetry:
sin: sin(180° − x) = sin(x) → solutions at x and 180° − x in [0°, 360°]
cos: cos(360° − x) = cos(x) → solutions at x and 360° − x
tan: period 180° → solutions at x and x + 180°

Example: Solve 2sin(x) − 1 = 0 for 0° ≤ x ≤ 360°
sin(x) = 0.5
x = 30° (principal value)
x = 180° − 30° = 150° (sin symmetry)
Solutions: x = 30°, 150°

Example 2: Solve cos(2x) = −0.5 for 0° ≤ x ≤ 360°
Let u = 2x, range 0° ≤ u ≤ 720°
cos(u) = −0.5 → u = 120°, 240°, 480°, 600°
x = 60°, 120°, 240°, 300°

AQA tip: always transform the range when substituting (e.g. u = 2x doubles the range).`,
  },
  {
    type: 'formula',
    topic_slug: 'trigonometry',
    title: 'Reciprocal trig functions — sec, cosec, cot',
    content: `Definitions:
sec(x) = 1/cos(x)
cosec(x) = 1/sin(x)
cot(x) = cos(x)/sin(x) = 1/tan(x)

Identities derived from sin²x + cos²x = 1:
Divide by cos²x: tan²x + 1 = sec²x
Divide by sin²x: 1 + cot²x = cosec²x

Graphs:
- sec(x): undefined where cos(x) = 0 (x = 90°, 270°, ...)
- cosec(x): undefined where sin(x) = 0 (x = 0°, 180°, 360°, ...)
- cot(x): undefined where sin(x) = 0

Derivatives:
d/dx(tan x) = sec²x
d/dx(sec x) = sec x tan x
d/dx(cosec x) = −cosec x cot x
d/dx(cot x) = −cosec²x

∫ sec²x dx = tan x + C
∫ cosec²x dx = −cot x + C

AQA tip: use 1 + tan²x = sec²x to simplify expressions involving sec²x before integrating.`,
  },
  // ── Statistics ───────────────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: 'probability',
    title: 'Binomial distribution — B(n,p) full method',
    content: `X ~ B(n, p) when:
- Fixed number of trials n
- Each trial has two outcomes (success/failure)
- Probability of success p is constant
- Trials are independent

P(X = r) = C(n,r) · pʳ · (1−p)ⁿ⁻ʳ

Mean: E(X) = np
Variance: Var(X) = np(1−p)

Example: X ~ B(10, 0.3). Find P(X = 4).
P(X = 4) = C(10,4) · 0.3⁴ · 0.7⁶
= 210 × 0.0081 × 0.117649 = 0.2001

Cumulative: P(X ≤ 3) — use tables or calculator (binomcdf on calculator)

P(X ≥ r) = 1 − P(X ≤ r−1)

AQA tip: use your calculator's binomial distribution function for cumulative probabilities — manual calculation wastes time and risks errors.`,
  },
  {
    type: 'formula',
    topic_slug: 'probability',
    title: 'Conditional probability — P(A|B) and independence',
    content: `Conditional probability: P(A|B) = P(A ∩ B) / P(B)
"Probability of A given B has occurred"

Multiplication rule: P(A ∩ B) = P(A|B) · P(B)

Independence: A and B are independent if P(A|B) = P(A), equivalently P(A ∩ B) = P(A) · P(B)

Tree diagrams:
- Multiply along branches for P(A ∩ B)
- Add across branches for P(A ∪ B) situations

Example: P(A) = 0.4, P(B) = 0.5, P(A ∩ B) = 0.2
P(A|B) = 0.2/0.5 = 0.4
Since P(A|B) = P(A), A and B are independent.

Venn diagrams: P(A ∪ B) = P(A) + P(B) − P(A ∩ B)

Mutually exclusive: P(A ∩ B) = 0, so P(A ∪ B) = P(A) + P(B)

AQA tip: always show the formula before substituting — P(A|B) = P(A ∩ B)/P(B) earns the method mark.`,
  },
  {
    type: 'formula',
    topic_slug: 'probability',
    title: 'PMCC and regression — correlation and line of best fit',
    content: `Product moment correlation coefficient r measures linear correlation.
r = Sₓᵧ / √(Sₓₓ · Sᵧᵧ)
where Sₓᵧ = Σxy − (Σx)(Σy)/n, Sₓₓ = Σx² − (Σx)²/n, Sᵧᵧ = Σy² − (Σy)²/n

Range: −1 ≤ r ≤ 1
r = 1: perfect positive correlation
r = −1: perfect negative correlation
r = 0: no linear correlation

Regression line y on x: ŷ = a + bx
b = Sₓᵧ/Sₓₓ
a = ȳ − bx̄

The regression line always passes through (x̄, ȳ).

Interpolation vs extrapolation:
- Interpolation (within data range): reliable
- Extrapolation (outside data range): unreliable, state this explicitly

AQA tip: only use y on x line to predict y from x. If predicting x from y, you need the x on y regression line.`,
  },
  // ── Mechanics ────────────────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: 'forces-newtons-laws',
    title: "Newton's laws — F = ma, connected particles, pulleys",
    content: `Newton's First Law: a body remains at rest or constant velocity unless acted on by a resultant force.
Newton's Second Law: F = ma (resultant force = mass × acceleration)
Newton's Third Law: every action has an equal and opposite reaction.

Resolving forces:
- Resolve parallel and perpendicular to motion
- On a slope: component down slope = mg sin θ, normal reaction N = mg cos θ
- Friction: F ≤ μN, F = μN when sliding

Connected particles (e.g. two masses on a string over a pulley):
- Treat the system together: resultant force = (m₁ − m₂)g, total mass = m₁ + m₂
- a = (m₁ − m₂)g / (m₁ + m₂)
- Tension: T = m₂(g + a) for the lighter mass

Example: m₁ = 5 kg, m₂ = 3 kg connected over smooth pulley.
a = (5−3)×9.8/(5+3) = 19.6/8 = 2.45 m/s²
T = 3(9.8 + 2.45) = 36.75 N

AQA tip: always draw a clear force diagram before writing equations — examiners check your diagram.`,
  },
  {
    type: 'formula',
    topic_slug: 'kinematics',
    title: 'Projectile motion — horizontal and vertical components',
    content: `Projectile: object moving freely under gravity (no air resistance).

Horizontal: constant velocity (no force)
x = u cos(θ) · t

Vertical: constant acceleration g = 9.8 m/s² downward
y = u sin(θ) · t − ½gt²
vᵧ = u sin(θ) − gt

At maximum height: vᵧ = 0 → t = u sin(θ)/g
Maximum height: H = (u sin θ)²/(2g)
Range (back to same level): R = u² sin(2θ)/g
Maximum range when θ = 45°.

Example: Ball projected at 20 m/s at 30° to horizontal.
t at max height = 20 sin30°/9.8 = 10/9.8 = 1.02 s
H = 10²/(2×9.8) = 5.10 m
Range = 20² sin60°/9.8 = 400×0.866/9.8 = 35.4 m

AQA tip: treat horizontal and vertical motion completely separately — they share only time t.`,
  },
  {
    type: 'formula',
    topic_slug: 'moments',
    title: 'Moments — taking moments for equilibrium',
    content: `Moment of a force = Force × perpendicular distance from pivot
Units: Nm. Clockwise moments are negative by convention (or use sign rules consistently).

Principle of moments: for a body in equilibrium, sum of clockwise moments = sum of anticlockwise moments.

Conditions for equilibrium:
1. Resultant force = 0 (resolve horizontally and vertically)
2. Resultant moment about any point = 0

Example: Uniform beam AB, length 4m, mass 10 kg, rests on supports at A and C (C is 3m from A). Find reactions at A and C.
Weight 10g acts at midpoint (2m from A).
Take moments about A: Rc × 3 = 10g × 2 → Rc = 20g/3 = 65.3 N
Resolve vertically: Ra + Rc = 10g → Ra = 98 − 65.3 = 32.7 N

AQA tip: always take moments about a point where an unknown force acts — it eliminates that unknown from the equation.`,
  },
  // ── GCSE ─────────────────────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Quadratic formula and solving quadratics',
    content: `For ax² + bx + c = 0:
x = (−b ± √(b² − 4ac)) / 2a

Methods for solving quadratics:
1. Factorising: x² + 5x + 6 = (x+2)(x+3) = 0 → x = −2 or x = −3
2. Quadratic formula: always works
3. Completing the square

Example: Solve 2x² + 3x − 5 = 0
x = (−3 ± √(9 + 40)) / 4 = (−3 ± 7) / 4
x = 1 or x = −2.5

Recognising quadratic equations in disguise:
x⁴ − 5x² + 4 = 0 → let u = x²: u² − 5u + 4 = 0 → (u−1)(u−4) = 0
x² = 1 or x² = 4 → x = ±1 or x = ±2

GCSE tip: if the question says "give your answer to 2 decimal places", use the quadratic formula — it won't factorise neatly.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Simultaneous equations — substitution and elimination',
    content: `Elimination method (both equations linear):
2x + 3y = 12  ... (1)
4x − y = 10   ... (2)

Multiply (2) by 3: 12x − 3y = 30
Add to (1): 14x = 42 → x = 3
Substitute: 6 + 3y = 12 → y = 2

Substitution method (one equation with a squared term):
y = x + 1  ... (1)
x² + y² = 13  ... (2)

Substitute (1) into (2): x² + (x+1)² = 13
2x² + 2x − 12 = 0 → x² + x − 6 = 0 → (x+3)(x−2) = 0
x = −3, y = −2  or  x = 2, y = 3

GCSE tip: when one equation is quadratic, always use substitution. Make sure to find both x AND y values.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Trigonometry — SOH CAH TOA and sine/cosine rules',
    content: `Right-angled triangles:
sin θ = opposite/hypotenuse
cos θ = adjacent/hypotenuse
tan θ = opposite/adjacent

SOH CAH TOA

Non-right-angled triangles:
Sine rule: a/sin A = b/sin B = c/sin C
Use when: two angles and a side, or two sides and a non-included angle.

Cosine rule: a² = b² + c² − 2bc cos A
Rearranged: cos A = (b² + c² − a²) / 2bc
Use when: three sides, or two sides and the included angle.

Area of triangle: A = ½ab sin C

Example (cosine rule): Find x in triangle with sides 5, 8 and angle 60° between them.
x² = 25 + 64 − 2(5)(8)cos60° = 89 − 40 = 49 → x = 7

GCSE tip: label sides a, b, c opposite to angles A, B, C before applying any formula.`,
  },
  {
    type: 'concept',
    topic_slug: null,
    title: 'GCSE: Circle theorems — all 8 rules',
    content: `1. Angle at centre = 2 × angle at circumference (same arc)
2. Angles in the same segment are equal
3. Angle in a semicircle = 90° (angle subtended by diameter)
4. Opposite angles in a cyclic quadrilateral add up to 180°
5. Tangent to a circle is perpendicular to the radius at the point of contact
6. Two tangents from an external point are equal in length
7. Alternate segment theorem: angle between tangent and chord = angle in alternate segment
8. Perpendicular from centre to a chord bisects the chord

GCSE exam tip: always state the theorem name in your answer, not just the angle.
Example: "Angle in a semicircle = 90°, therefore angle ABD = 90°"

Examiners award marks for the reason, not just the number.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Probability — trees, Venn diagrams, and combined events',
    content: `P(A and B) = P(A) × P(B) — only if A and B are independent
P(A or B) = P(A) + P(B) − P(A and B)
P(not A) = 1 − P(A)

Tree diagrams:
- Multiply along branches for AND
- Add separate branches for OR
- Probabilities on each set of branches must sum to 1

Example: Bag has 3 red, 2 blue. Two drawn without replacement.
P(both red) = 3/5 × 2/4 = 6/20 = 3/10
P(one of each) = P(RB) + P(BR) = (3/5 × 2/4) + (2/5 × 3/4) = 3/10 + 3/10 = 3/5

Without replacement: second probability changes based on first outcome.
With replacement: probabilities stay the same for both draws.

Venn diagrams: use for two or more overlapping events.
n(A ∪ B) = n(A) + n(B) − n(A ∩ B)

GCSE tip: for "without replacement" problems, always draw a tree diagram and adjust the second branch.`,
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
