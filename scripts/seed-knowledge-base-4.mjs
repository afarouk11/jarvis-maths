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
    topic_slug: 'trigonometry',
    title: 'Radians — arc length, sector area, and small angle approximations',
    content: `Converting: degrees to radians × π/180, radians to degrees × 180/π
Key values: 30° = π/6, 45° = π/4, 60° = π/3, 90° = π/2, 180° = π, 360° = 2π

Arc length: l = rθ (θ in radians)
Sector area: A = ½r²θ
Segment area = sector area − triangle area = ½r²θ − ½r²sinθ = ½r²(θ − sinθ)

Small angle approximations (θ in radians, θ close to 0):
sin θ ≈ θ
cos θ ≈ 1 − θ²/2
tan θ ≈ θ

Example: sector of radius 8 cm, angle 1.2 rad.
Arc length = 8 × 1.2 = 9.6 cm
Area = ½ × 64 × 1.2 = 38.4 cm²

Example (small angle): find approximate value of sin(0.1)
sin(0.1) ≈ 0.1 (actual: 0.09983 — very close)

Example: simplify (sin3θ)/(1 − cos2θ) for small θ
≈ 3θ / (1 − (1 − 2θ²)) = 3θ/2θ² = 3/2θ

AQA tip: arc length and sector area only work with radians — convert degrees first.`,
  },
  {
    type: 'formula',
    topic_slug: 'algebra-functions',
    title: 'Straight line coordinate geometry — gradient, midpoint, distance, perpendicular',
    content: `Gradient: m = (y₂ − y₁)/(x₂ − x₁)
Midpoint: M = ((x₁+x₂)/2, (y₁+y₂)/2)
Distance: d = √((x₂−x₁)² + (y₂−y₁)²)

Equation forms:
y = mx + c (gradient-intercept)
y − y₁ = m(x − x₁) (point-gradient — most useful)
ax + by + c = 0 (general form)

Parallel lines: same gradient, m₁ = m₂
Perpendicular lines: m₁ × m₂ = −1 → m₂ = −1/m₁

Finding perpendicular bisector:
1. Find midpoint of the line segment
2. Find gradient of segment, then perpendicular gradient = −1/m
3. Use y − y₁ = m(x − x₁) with the midpoint

Example: Find the equation of the perpendicular bisector of A(2,1) and B(6,5).
Midpoint = (4, 3), gradient AB = 4/4 = 1
Perpendicular gradient = −1
Equation: y − 3 = −1(x − 4) → y = −x + 7

AQA tip: for perpendicular questions, always calculate m₁ × m₂ = −1 explicitly — it earns the method mark.`,
  },
  {
    type: 'formula',
    topic_slug: 'sequences-series',
    title: 'Sequences — recurrence relations and sigma notation',
    content: `Recurrence relation: defines each term using previous terms.
uₙ₊₁ = f(uₙ), with a given first term u₁.

Example: uₙ₊₁ = 2uₙ − 3, u₁ = 5
u₂ = 2(5) − 3 = 7
u₃ = 2(7) − 3 = 11
u₄ = 2(11) − 3 = 19

Increasing/decreasing/periodic sequences:
Periodic: repeats after a fixed number of terms. Find the period by computing terms.
Example: uₙ₊₁ = −1/uₙ, u₁ = 2 → 2, −½, 2, −½, ... period 2.

Sigma notation:
Σᵣ₌₁ⁿ r = n(n+1)/2
Σᵣ₌₁ⁿ r² = n(n+1)(2n+1)/6
Σᵣ₌₁ⁿ r³ = [n(n+1)/2]²
Σᵣ₌₁ⁿ k = kn (constant k)

Example: Σᵣ₌₁¹⁰ (3r − 1) = 3·Σr − Σ1 = 3·(55) − 10 = 155

AQA tip: for periodic sequences, always compute enough terms to identify the period — usually 4–6 terms is sufficient.`,
  },
  {
    type: 'formula',
    topic_slug: 'integration',
    title: 'Integration — area under parametric curves',
    content: `For a curve defined parametrically as x = f(t), y = g(t):

Area = ∫ y dx = ∫ g(t) · f'(t) dt

Change the limits from x-values to t-values using x = f(t).
Check the direction — if t increases as x decreases, negate the integral.

Example: x = t², y = t³, from t = 0 to t = 2
dx/dt = 2t
Area = ∫₀² t³ · 2t dt = ∫₀² 2t⁴ dt = [2t⁵/5]₀² = 64/5

Enclosed area between parametric curve and x-axis:
If the curve forms a loop, use the limits where y = 0 (or where the curve crosses itself).

Volume of revolution (parametric):
V = π ∫ y² dx = π ∫ [g(t)]² · f'(t) dt

AQA tip: always convert the x-limits to t-limits using the parametric equation — substituting x-values directly into the integral is a common error.`,
  },
  {
    type: 'formula',
    topic_slug: 'trigonometry',
    title: 'Inverse trigonometric functions — arcsin, arccos, arctan',
    content: `arcsin(x): inverse of sin, domain −1 ≤ x ≤ 1, range −π/2 ≤ y ≤ π/2
arccos(x): inverse of cos, domain −1 ≤ x ≤ 1, range 0 ≤ y ≤ π
arctan(x): inverse of tan, domain all reals, range −π/2 < y < π/2

Derivatives:
d/dx(arcsin x) = 1/√(1−x²)
d/dx(arccos x) = −1/√(1−x²)
d/dx(arctan x) = 1/(1+x²)

Integrals:
∫ 1/√(1−x²) dx = arcsin(x) + C
∫ 1/(1+x²) dx = arctan(x) + C
∫ 1/√(a²−x²) dx = arcsin(x/a) + C
∫ 1/(a²+x²) dx = (1/a)arctan(x/a) + C

Example: ∫₀¹ 1/(4+x²) dx = [½arctan(x/2)]₀¹ = ½arctan(½) − 0 = ½ × 0.4636 = 0.2318

AQA tip: these integrals appear when the denominator is a sum of squares — recognise the pattern and match to the standard form.`,
  },
  {
    type: 'formula',
    topic_slug: 'kinematics',
    title: 'Impulse and momentum — conservation and collisions',
    content: `Momentum: p = mv (kg m/s)
Newton's 2nd Law: F = ma = m(dv/dt) = d(mv)/dt

Impulse: I = Ft = change in momentum = mv − mu
Units: Ns (same as kg m/s)

Conservation of momentum (no external forces):
m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂

Coefficient of restitution (e): 0 ≤ e ≤ 1
e = (relative speed of separation)/(relative speed of approach)
e = (v₂ − v₁)/(u₁ − u₂)

e = 0: perfectly inelastic (objects stick together)
e = 1: perfectly elastic (kinetic energy conserved)

Example: Ball A (2 kg, 5 m/s) hits stationary ball B (3 kg), e = 0.5.
Conservation: 2(5) + 3(0) = 2v₁ + 3v₂ → 2v₁ + 3v₂ = 10
Restitution: v₂ − v₁ = 0.5(5 − 0) = 2.5
Solving: v₁ = 1 m/s, v₂ = 3.5 m/s

AQA tip: always check v₁ < v₂ after a collision — if A is chasing B, A must be slower after impact.`,
  },
  {
    type: 'formula',
    topic_slug: 'probability',
    title: 'Discrete random variables — E(X), Var(X) and probability distributions',
    content: `A discrete random variable X takes specific values with given probabilities.
Σ P(X = x) = 1 (probabilities must sum to 1)

Expected value (mean): E(X) = Σ x·P(X = x)
E(aX + b) = aE(X) + b

Variance: Var(X) = E(X²) − [E(X)]²
where E(X²) = Σ x²·P(X = x)
Var(aX + b) = a²Var(X) (adding a constant doesn't change variance)

Standard deviation: σ = √Var(X)

Example:
X:       1    2    3    4
P(X=x): 0.1  0.3  0.4  0.2

E(X) = 1(0.1) + 2(0.3) + 3(0.4) + 4(0.2) = 0.1 + 0.6 + 1.2 + 0.8 = 2.7
E(X²) = 1(0.1) + 4(0.3) + 9(0.4) + 16(0.2) = 0.1 + 1.2 + 3.6 + 3.2 = 8.1
Var(X) = 8.1 − 2.7² = 8.1 − 7.29 = 0.81
σ = 0.9

AQA tip: use E(X²) − [E(X)]² for variance — building a table with columns x, P(X=x), xP(X=x), x²P(X=x) keeps it organised.`,
  },
  // ── GCSE Gaps ────────────────────────────────────────────────────────────────
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Pythagoras theorem — 2D and 3D problems',
    content: `2D: a² + b² = c² (c is the hypotenuse — longest side, opposite the right angle)

Finding hypotenuse: c = √(a² + b²)
Finding a leg: a = √(c² − b²)

Always check: hypotenuse is always opposite the right angle.

3D Pythagoras:
Find the length of a diagonal in a cuboid (length l, width w, height h):
Space diagonal = √(l² + w² + h²)

Two-step method: find the diagonal of the base first, then use it as the base of a vertical triangle.
Base diagonal = √(l² + w²)
Space diagonal = √(l² + w² + h²)

Example: Cuboid 4cm × 3cm × 2cm. Find space diagonal.
d = √(16 + 9 + 4) = √29 = 5.39 cm

Angle in 3D: use Pythagoras to find lengths, then trigonometry for angles.

GCSE tip: draw a clear 2D triangle extracted from the 3D shape — label all three sides before applying Pythagoras.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Bearings — reading, calculating, and back bearings',
    content: `Bearings are always:
- Measured from North
- Measured clockwise
- Given as 3 digits (e.g. 045°, not 45°)

Reading bearings: stand at the starting point, face North, rotate clockwise to the direction of travel.

Back bearing: the bearing from B to A when you know the bearing from A to B.
If bearing from A to B is less than 180°: back bearing = bearing + 180°
If bearing from A to B is greater than 180°: back bearing = bearing − 180°

Example: bearing from A to B is 065°. Bearing from B to A = 065° + 180° = 245°.

Calculating bearings with trigonometry:
Draw a North line at each point. Use alternate angles (parallel North lines) and angle rules.

Example: A is due West of B. C is on a bearing of 130° from A. Find bearing of C from B.
Draw diagram with parallel North lines.
Angle at A (from North, clockwise to AC) = 130°
Angle NAC from West = 130° − 90° = 40°
Use co-interior/alternate angles to find bearing from B.

GCSE tip: always draw a clear diagram with North lines at every relevant point — bearings questions are almost impossible without one.`,
  },
  {
    type: 'concept',
    topic_slug: null,
    title: 'GCSE: Transformations — rotation, reflection, translation, enlargement',
    content: `Translation: described by a column vector (a, b). Moves shape a right, b up.
Object and image are congruent. No rotation or reflection.

Reflection: described by the mirror line (e.g. y = x, x = 2).
Object and image are congruent but laterally reversed.
Key mirror lines: x-axis (y=0), y-axis (x=0), y=x, y=−x.

Rotation: described by centre, angle, and direction (clockwise/anticlockwise).
Object and image are congruent. Use tracing paper in exam.
180° rotation: same result clockwise or anticlockwise.

Enlargement: described by centre and scale factor k.
- k > 1: enlargement
- 0 < k < 1: reduction
- k negative: image on opposite side of centre, also rotated 180°
Length ratio = k, Area ratio = k²

To find centre of enlargement: draw lines through corresponding vertices — they meet at the centre.

Combined transformations: apply in order (right to left in function notation).

GCSE tip: for describing a transformation, always give ALL required information — missing the centre, angle, or scale factor loses marks.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Linear graphs and sequences — nth term and straight lines',
    content: `Straight line: y = mx + c
m = gradient (rise/run), c = y-intercept

Finding equation from two points:
1. Calculate gradient m = (y₂−y₁)/(x₂−x₁)
2. Substitute one point into y = mx + c to find c

Arithmetic sequences — nth term: aₙ = a + (n−1)d
a = first term, d = common difference

Example: 3, 7, 11, 15, ...
d = 4, a = 3
nth term = 3 + (n−1)4 = 4n − 1

Checking if a value is in a sequence: set nth term = value, solve for n — if n is a positive integer, it's in the sequence.

Quadratic sequences — nth term: an² + bn + c
Find second differences (constant for quadratic) = 2a
Then use simultaneous equations or systematic method to find b and c.

Example: 2, 8, 18, 32, 50, ...
Differences: 6, 10, 14, 18 — second differences: 4, 4, 4 → 2a = 4 → a = 2
nth term = 2n² (check: 2,8,18,32 ✓)

GCSE tip: always verify your nth term formula by substituting n = 1 and n = 2.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Expanding brackets and factorising — all types',
    content: `Single bracket: 3(2x − 5) = 6x − 15

Double brackets (FOIL): (x + 3)(x − 2) = x² − 2x + 3x − 6 = x² + x − 6

Perfect square: (x + a)² = x² + 2ax + a²
Difference of two squares: (x + a)(x − a) = x² − a²

Triple brackets: expand two first, then multiply by third.
(x+1)(x+2)(x+3) = (x²+3x+2)(x+3) = x³+6x²+11x+6

Factorising:
Common factor: 6x² + 9x = 3x(2x + 3)
Quadratic (a=1): x² + 5x + 6 = (x+2)(x+3) — find two numbers that add to 5 and multiply to 6
Quadratic (a≠1): 2x² + 7x + 3 — use ac method: ac = 6, find 6+1=7 → 2x²+6x+x+3 = 2x(x+3)+(x+3) = (2x+1)(x+3)
Difference of two squares: 9x² − 16 = (3x+4)(3x−4)

GCSE tip: always check your factorisation by expanding back out — takes 10 seconds and catches most errors.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Bounds and error intervals',
    content: `A measurement rounded to a given degree of accuracy has an error interval.

Rounded to nearest unit: lower bound = value − 0.5 × unit, upper bound = value + 0.5 × unit

Example: length = 7.4 cm (1 d.p.) → 7.35 ≤ l < 7.45 (note: upper bound not included)
Example: 300 rounded to nearest 10 → 295 ≤ x < 305

Operations with bounds:
Addition: LB = LB₁ + LB₂, UB = UB₁ + UB₂
Subtraction: LB = LB₁ − UB₂, UB = UB₁ − LB₂ (to find SMALLEST difference, subtract LARGEST from smallest)
Multiplication: LB = LB₁ × LB₂, UB = UB₁ × UB₂
Division: LB = LB₁ ÷ UB₂, UB = UB₁ ÷ LB₂

Example: a = 3.4 (1 d.p.), b = 1.2 (1 d.p.). Find upper bound of a/b.
UB(a/b) = 3.45 / 1.15 = 3.00 (3 s.f.)

Truncation (not rounding): 7.4 truncated to 1 d.p. → 7.4 ≤ x < 7.5 (lower bound = the value itself)

GCSE tip: for subtraction and division, think carefully — to MAXIMISE, you want the top as big and bottom as small as possible.`,
  },
  {
    type: 'concept',
    topic_slug: null,
    title: 'GCSE: Similarity and congruence — conditions and scale factors',
    content: `Congruent shapes: identical in shape and size (can be reflected or rotated).

Congruence conditions (triangles):
- SSS: three sides equal
- SAS: two sides and included angle equal
- ASA or AAS: two angles and a side equal
- RHS: right angle, hypotenuse, and one side equal

Similar shapes: same shape, different size (all angles equal, sides in proportion).

Scale factor k = corresponding length in image / corresponding length in original

Length ratio = k
Area ratio = k²
Volume ratio = k³

Example: Two similar cylinders, radii 3 cm and 5 cm.
k = 5/3
Area ratio = 25/9
Volume ratio = 125/27

Finding missing lengths in similar triangles:
Set up ratio: a/b = c/d → cross multiply.

AQA/GCSE tip: for congruence proofs, state which condition you're using (SSS, SAS, etc.) and list the matching pairs of sides/angles explicitly.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Speed, distance, time and compound measures',
    content: `Speed = Distance / Time
Distance = Speed × Time
Time = Distance / Speed

Memory triangle: put D on top, S and T on bottom. Cover what you want.

Units: always check consistency — convert km/h to m/s by × 1000/3600 = ÷ 3.6

Density = Mass / Volume
Pressure = Force / Area

Average speed ≠ average of speeds (unless equal time intervals).
Average speed = total distance / total time

Example: 60 km at 40 km/h then 60 km at 60 km/h.
Time₁ = 1.5 h, Time₂ = 1 h, Total time = 2.5 h, Total distance = 120 km
Average speed = 120/2.5 = 48 km/h (NOT (40+60)/2 = 50)

Converting units:
1 m/s = 3.6 km/h
1 km/h = 1/3.6 m/s

Area under velocity-time graph = distance travelled
Gradient of velocity-time graph = acceleration

GCSE tip: for multi-stage journey problems, always calculate time for each stage separately then add.`,
  },
  {
    type: 'concept',
    topic_slug: null,
    title: 'GCSE: Scatter graphs — correlation, lines of best fit, and outliers',
    content: `Types of correlation:
Positive correlation: as x increases, y increases.
Negative correlation: as x increases, y decreases.
No correlation: no pattern between x and y.
Strong correlation: points close to a line.
Weak correlation: points more scattered.

Line of best fit:
- Must pass through the mean point (x̄, ȳ)
- Roughly equal number of points above and below
- Use for interpolation (within data range) — reliable
- Extrapolation (outside data range) — unreliable

Outliers: points that don't fit the general pattern. State whether to include or exclude and why.

Causation vs correlation:
Correlation does NOT prove causation.
Example: ice cream sales and drowning both increase in summer — correlated, but ice cream doesn't cause drowning (both caused by hot weather).

Using the line of best fit:
To predict y from x: read across from x to the line, then up/down to y-axis.
State predictions are estimates and may not be accurate.

GCSE tip: never draw a line of best fit through the origin unless the data clearly supports it.`,
  },
  {
    type: 'formula',
    topic_slug: null,
    title: 'GCSE: Angles in polygons, parallel lines, and geometric reasoning',
    content: `Angles in a triangle: sum = 180°
Angles in a quadrilateral: sum = 360°
Sum of interior angles of n-sided polygon: (n−2) × 180°
Each interior angle of regular n-gon: (n−2) × 180° / n
Each exterior angle of regular n-gon: 360° / n
Interior + exterior angle = 180°

Parallel line angle rules:
Alternate angles (Z-angles): equal
Co-interior angles (C-angles): add up to 180°
Corresponding angles (F-angles): equal

Circle angle rules (GCSE level):
Angles on a straight line: 180°
Angles around a point: 360°
Vertically opposite angles: equal
Isosceles triangle (two equal sides → two equal base angles)

Geometric reasoning — always give reasons:
"Angles in a triangle sum to 180°"
"Alternate angles are equal (AB ∥ CD)"
"Base angles of isosceles triangle are equal"

GCSE tip: every angle answer needs a reason — a number without justification scores 0 for the reasoning mark.`,
  },
  // ── Exam Technique ───────────────────────────────────────────────────────────
  {
    type: 'tip',
    topic_slug: null,
    title: 'Common mistakes in algebra and algebraic manipulation',
    content: `Expanding incorrectly:
✗ (x + 3)² = x² + 9 (forgetting the middle term)
✓ (x + 3)² = x² + 6x + 9

Cancelling incorrectly:
✗ (x² + 3)/x = x + 3 (can only cancel factors, not terms)
✓ x(x + 3)/x = x + 3 (here x is a factor of the numerator)

Solving equations — dividing by variable:
✗ x² = 3x → x = 3 (losing the x = 0 solution)
✓ x² − 3x = 0 → x(x−3) = 0 → x = 0 or x = 3

Sign errors with negatives:
✗ −(3x − 2) = −3x − 2
✓ −(3x − 2) = −3x + 2

Fractions — adding without common denominator:
✗ 1/3 + 1/4 = 2/7
✓ 1/3 + 1/4 = 4/12 + 3/12 = 7/12

Index rules confusion:
✗ x² × x³ = x⁶ (should add, not multiply)
✓ x² × x³ = x⁵
✗ (x²)³ = x⁵ (should multiply, not add)
✓ (x²)³ = x⁶`,
  },
  {
    type: 'tip',
    topic_slug: 'vectors',
    title: 'Common mistakes in vectors and mechanics — AQA exam errors',
    content: `Vector direction errors:
✗ AB = OA + OB
✓ AB = OB − OA = b − a (you go FROM A TO B: subtract start, add end)

Proving collinearity — incomplete:
✗ "AB = 2AC therefore they are parallel"
✓ "AB = 2AC and both vectors share point A, therefore A, B, C are collinear"

Scalar multiplication sign:
✗ −2(3, −4) = (−6, −8)
✓ −2(3, −4) = (−6, 8)

Mechanics — wrong direction for friction:
✗ Drawing friction in the direction of motion
✓ Friction always opposes motion (or tendency to move)

Newton's second law — forgetting resultant:
✗ F = ma using just the driving force
✓ F = ma where F is the NET (resultant) force — subtract friction, weight components, tension, etc.

Resolving on a slope — wrong components:
✗ Normal reaction = mg (ignoring the slope angle)
✓ Normal reaction N = mg cosθ, component down slope = mg sinθ

Momentum — sign convention:
✓ Choose a positive direction at the start and stick to it — velocities in the opposite direction are negative.`,
  },
  {
    type: 'tip',
    topic_slug: null,
    title: 'Exam time management and strategy — AQA Maths',
    content: `A-Level Paper timing: ~1.5 minutes per mark is a rough guide.
Paper 1 & 2: 2 hours, 100 marks. Paper 3: 2 hours, 100 marks.

Strategy:
1. Skim through the paper first — identify questions you can do quickly
2. Do the easy marks first — don't spend 10 minutes on a 2-mark question
3. Show all working — partial marks are common even when final answer is wrong
4. Leave blank spaces and return — don't waste time being stuck
5. Check: does the answer make sense in context? (negative length, probability > 1, etc.)

For "show that" and multi-part questions:
- If you can't do part (a), use the given answer to attempt part (b)
- Many marks in later parts don't depend on getting earlier parts right

Calculator use:
- Always write down what you're calculating before pressing buttons
- Store intermediate values in memory — don't round mid-calculation
- Check mode: degrees vs radians for trig

Last 10 minutes:
- Go back and check arithmetic in questions you found easy
- Add units to any answers that need them
- Make sure you've answered every part (a), (b), (c)

GCSE tip: if you're running out of time, write down the method/formula — method marks are available even without the final answer.`,
  },
  {
    type: 'tip',
    topic_slug: null,
    title: 'Using the AQA formula booklet effectively',
    content: `The formula booklet is given in all A-Level papers. Know what's in it so you don't waste time deriving things that are given.

What IS in the formula booklet:
- Quadratic formula
- Binomial expansion (for any n)
- Trigonometric identities (addition formulae, double angle)
- Differentiation: standard derivatives (sin, cos, tan, eˣ, ln x, aˣ)
- Integration: standard integrals (sin, cos, sec², eˣ, 1/x, etc.)
- Numerical methods: trapezium rule, Newton-Raphson
- Statistical distributions: binomial probabilities, normal distribution table
- Kinematics: SUVAT equations
- Mechanics: no extra — use F=ma, moments, energy

What is NOT in the booklet (must memorise):
- Product, quotient, and chain rules
- Sum formulas for arithmetic and geometric series
- Factor theorem
- Small angle approximations
- Pythagorean identities (sin²+cos²=1, tan²+1=sec²)
- Integration by parts formula (∫u dv = uv − ∫v du)

Strategy: in revision, practise identifying which formula to use before looking at the booklet. In the exam, you should only need the booklet for exact values or to double-check — not to figure out the method.`,
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
