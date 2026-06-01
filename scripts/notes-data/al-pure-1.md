===TOPIC=== algebra-functions
===NOTE===
type: concept
title: Algebra & Functions — Revision Notes
---
## Indices and Surds

The laws of indices underpin most algebraic manipulation:

- $a^m \times a^n = a^{m+n}$
- $a^m \div a^n = a^{m-n}$
- $(a^m)^n = a^{mn}$
- $a^0 = 1$, $a^{-n} = \frac{1}{a^n}$, $a^{1/n} = \sqrt[n]{a}$, $a^{m/n} = \sqrt[n]{a^m}$

A **surd** is an irrational root such as $\sqrt{2}$. To **rationalise** a denominator, multiply top and bottom by the conjugate: for $\frac{1}{a + \sqrt{b}}$ multiply by $\frac{a - \sqrt{b}}{a - \sqrt{b}}$.

## Quadratics

For $ax^2 + bx + c = 0$:

- **Factorising**: find two numbers multiplying to $ac$ and summing to $b$.
- **Quadratic formula**: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.
- **Completing the square**: $a(x + p)^2 + q$ reveals the vertex $(-p, q)$.

The **discriminant** $\Delta = b^2 - 4ac$ tells you about the roots:

- $\Delta > 0$: two distinct real roots
- $\Delta = 0$: one repeated root
- $\Delta < 0$: no real roots

## Polynomials

You should be able to add, subtract, multiply and divide polynomials. The **factor theorem** states that $(x - a)$ is a factor of $p(x)$ if and only if $p(a) = 0$. The **remainder theorem** states $p(x)$ divided by $(x - a)$ leaves remainder $p(a)$.

## Simultaneous Equations and Inequalities

Solve a linear and a quadratic equation by substitution. The number of intersection points relates to the discriminant of the resulting quadratic.

For **inequalities**: when multiplying or dividing by a negative, reverse the sign. For quadratic inequalities, sketch the parabola and read off where it is above or below the axis.

## Functions and Transformations

A **function** maps each input to exactly one output. Key features include domain, range and roots.

Graph transformations of $y = f(x)$:

- $y = f(x) + a$: translate up by $a$
- $y = f(x + a)$: translate left by $a$
- $y = af(x)$: stretch vertically, scale factor $a$
- $y = f(ax)$: stretch horizontally, scale factor $\frac{1}{a}$
- $y = -f(x)$: reflect in the $x$-axis
- $y = f(-x)$: reflect in the $y$-axis

You should also recognise the shapes of cubics, quartics, reciprocal graphs $y = \frac{k}{x}$ and the modulus function $y = |x|$.
===NOTE===
type: formula
title: Algebra & Functions — Key Formulas
---
**Quadratic formula:**
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

**Discriminant:** $\Delta = b^2 - 4ac$

**Completed square form:**
$$
ax^2 + bx + c = a\left(x + \frac{b}{2a}\right)^2 + c - \frac{b^2}{4a}
$$

**Laws of indices:** $a^m a^n = a^{m+n}$, $\dfrac{a^m}{a^n} = a^{m-n}$, $(a^m)^n = a^{mn}$, $a^{-n} = \dfrac{1}{a^n}$, $a^{m/n} = \sqrt[n]{a^m}$

**Difference of two squares:** $a^2 - b^2 = (a-b)(a+b)$

**Factor theorem:** $(x-a)$ is a factor of $p(x) \iff p(a) = 0$

**Transformations of $y = f(x)$:** $f(x)+a$ (up), $f(x+a)$ (left), $af(x)$ (vertical stretch $\times a$), $f(ax)$ (horizontal stretch $\times \frac{1}{a}$)
===NOTE===
type: worked_example
title: Completing the square and finding the vertex
---
**Express $2x^2 - 12x + 7$ in the form $a(x+p)^2 + q$ and state the minimum point.**

Factor out the coefficient of $x^2$ from the first two terms:
$$
2x^2 - 12x + 7 = 2(x^2 - 6x) + 7
$$

Complete the square inside the bracket. Half of $-6$ is $-3$, so $x^2 - 6x = (x-3)^2 - 9$:
$$
= 2\big[(x-3)^2 - 9\big] + 7
$$

Expand the constant:
$$
= 2(x-3)^2 - 18 + 7 = 2(x-3)^2 - 11
$$

So $a = 2$, $p = -3$, $q = -11$. The minimum occurs when the squared term is zero, i.e. $x = 3$, giving $y = -11$.

The minimum point is **$(3, -11)$**.
===NOTE===
type: worked_example
title: Rationalising a surd denominator
---
**Simplify $\dfrac{6}{4 - \sqrt{10}}$, leaving your answer in surd form.**

Multiply numerator and denominator by the conjugate $4 + \sqrt{10}$:
$$
\frac{6}{4 - \sqrt{10}} \times \frac{4 + \sqrt{10}}{4 + \sqrt{10}}
$$

The denominator is a difference of two squares:
$$
(4 - \sqrt{10})(4 + \sqrt{10}) = 16 - 10 = 6
$$

The numerator becomes $6(4 + \sqrt{10})$, so:
$$
= \frac{6(4 + \sqrt{10})}{6} = 4 + \sqrt{10}
$$

The simplified result is **$4 + \sqrt{10}$**.
===NOTE===
type: tip
title: Algebra & Functions — Exam Tips & Common Mistakes
---
- When completing the square, always factor out the leading coefficient from the $x^2$ AND $x$ terms first — forgetting the $x$ term is the most common error.
- Use the discriminant when asked to find values for which an equation "has real roots" or "no real roots" — set up an inequality in the unknown.
- Don't forget to reverse the inequality sign when multiplying or dividing by a negative number.
- For quadratic inequalities, sketch the curve. For $> 0$ you want the regions outside the roots; for $< 0$ you want between the roots.
- When rationalising, the conjugate changes only the sign between the terms — keep the surd unchanged.
- Index errors: $a^{-n}$ means reciprocal, not negative. $(2x)^3 = 8x^3$, not $2x^3$.
- State transformations in the right order and remember $f(x+a)$ moves LEFT (towards negative $x$).
===TOPIC=== coordinate-geometry
===NOTE===
type: concept
title: Coordinate Geometry — Revision Notes
---
## Straight Lines

The **gradient** between two points is:
$$
m = \frac{y_2 - y_1}{x_2 - x_1}
$$

Equations of a line:

- **Gradient-intercept:** $y = mx + c$
- **Point-gradient:** $y - y_1 = m(x - x_1)$
- **General form:** $ax + by + c = 0$

**Parallel** lines have equal gradients. **Perpendicular** lines have gradients whose product is $-1$, so $m_1 m_2 = -1$ (one gradient is the negative reciprocal of the other).

The **distance** between two points:
$$
d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}
$$

The **midpoint** is:
$$
\left( \frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2} \right)
$$

## Circles

The equation of a circle with centre $(a, b)$ and radius $r$:
$$
(x - a)^2 + (y - b)^2 = r^2
$$

The general expanded form $x^2 + y^2 + 2gx + 2fy + c = 0$ can be converted to centre-radius form by **completing the square** in both $x$ and $y$.

Key circle properties used in problems:

- The angle in a semicircle is a right angle (so a triangle inscribed with the diameter as one side has a $90°$ angle).
- The perpendicular from the centre to a chord bisects the chord.
- A **tangent** meets the radius at the point of contact at $90°$. Use this perpendicularity to find tangent equations.

## Intersections

To find where a line meets a circle (or two curves meet), substitute one equation into the other to form a quadratic. The **discriminant** then tells you:

- Two solutions: the line is a secant (crosses twice).
- One solution: the line is a tangent (touches once).
- No real solutions: the line misses the circle.

## Parametric Equations (later in course)

A curve can be defined by $x = f(t)$, $y = g(t)$. Eliminate the parameter $t$ to find the Cartesian equation, using identities where trig parameters appear.
===NOTE===
type: formula
title: Coordinate Geometry — Key Formulas
---
**Gradient:** $m = \dfrac{y_2 - y_1}{x_2 - x_1}$

**Distance:** $d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$

**Midpoint:** $\left( \dfrac{x_1 + x_2}{2}, \dfrac{y_1 + y_2}{2} \right)$

**Line through a point:** $y - y_1 = m(x - x_1)$

**Perpendicular gradients:** $m_1 m_2 = -1$

**Circle (centre-radius):**
$$
(x - a)^2 + (y - b)^2 = r^2
$$

**Circle (general):** $x^2 + y^2 + 2gx + 2fy + c = 0$ has centre $(-g, -f)$ and radius $\sqrt{g^2 + f^2 - c}$
===NOTE===
type: worked_example
title: Finding the centre and radius of a circle
---
**Find the centre and radius of the circle $x^2 + y^2 - 6x + 8y - 11 = 0$.**

Group the $x$ and $y$ terms:
$$
(x^2 - 6x) + (y^2 + 8y) - 11 = 0
$$

Complete the square for each. Half of $-6$ is $-3$, so $x^2 - 6x = (x-3)^2 - 9$. Half of $8$ is $4$, so $y^2 + 8y = (y+4)^2 - 16$:
$$
(x-3)^2 - 9 + (y+4)^2 - 16 - 11 = 0
$$

Collect the constants:
$$
(x-3)^2 + (y+4)^2 = 36
$$

Comparing with $(x-a)^2 + (y-b)^2 = r^2$:

The centre is **$(3, -4)$** and the radius is **$\sqrt{36} = 6$**.
===NOTE===
type: worked_example
title: Equation of a perpendicular bisector
---
**Find the equation of the perpendicular bisector of the line joining $A(1, 2)$ and $B(5, 10)$.**

Find the midpoint of $AB$:
$$
\left( \frac{1+5}{2}, \frac{2+10}{2} \right) = (3, 6)
$$

Find the gradient of $AB$:
$$
m_{AB} = \frac{10 - 2}{5 - 1} = \frac{8}{4} = 2
$$

The perpendicular bisector has the negative reciprocal gradient:
$$
m = -\frac{1}{2}
$$

Use the point-gradient form through $(3, 6)$:
$$
y - 6 = -\frac{1}{2}(x - 3)
$$

Expand and simplify:
$$
y = -\frac{1}{2}x + \frac{3}{2} + 6 = -\frac{1}{2}x + \frac{15}{2}
$$

The perpendicular bisector is **$y = -\frac{1}{2}x + \frac{15}{2}$** (or $x + 2y - 15 = 0$).
===NOTE===
type: tip
title: Coordinate Geometry — Exam Tips & Common Mistakes
---
- "Negative reciprocal" means flip the fraction AND change the sign: the perpendicular to gradient $\frac{2}{3}$ is $-\frac{3}{2}$.
- When completing the square for a circle, remember to subtract the squared constants from BOTH brackets and combine carefully — sign slips here are very common.
- The radius is $\sqrt{r^2}$, not $r^2$ — students often forget the square root.
- To show a line is a tangent, prove the discriminant of the intersection quadratic equals zero.
- Use the radius-tangent right angle: the tangent's gradient is the negative reciprocal of the radius gradient at the point of contact.
- Always leave answers in the form requested (e.g. $ax + by + c = 0$ with integer coefficients).
- Check whether $g^2 + f^2 - c$ is positive; if negative there is no real circle.
===TOPIC=== sequences-series
===NOTE===
type: concept
title: Sequences & Series — Revision Notes
---
## Sequence Notation

A sequence can be defined by a **position-to-term** rule $u_n = f(n)$ or a **recurrence relation** $u_{n+1} = g(u_n)$ with a stated first term. Sequences may be **increasing**, **decreasing**, **periodic** or **convergent**.

## Arithmetic Sequences

An **arithmetic sequence** has a constant common difference $d$. The $n$th term:
$$
u_n = a + (n-1)d
$$

The sum of the first $n$ terms:
$$
S_n = \frac{n}{2}\big[2a + (n-1)d\big] = \frac{n}{2}(a + l)
$$

where $a$ is the first term and $l$ is the last term.

## Geometric Sequences

A **geometric sequence** has a constant common ratio $r$. The $n$th term:
$$
u_n = ar^{n-1}
$$

The sum of the first $n$ terms (for $r \neq 1$):
$$
S_n = \frac{a(1 - r^n)}{1 - r}
$$

When $|r| < 1$ the sequence converges and the **sum to infinity** exists:
$$
S_\infty = \frac{a}{1 - r}
$$

## Sigma Notation

The symbol $\sum$ denotes a sum. For example:
$$
\sum_{r=1}^{n} u_r = u_1 + u_2 + \cdots + u_n
$$

Useful when expressing arithmetic and geometric series compactly.

## Binomial Expansion

For a positive integer $n$:
$$
(a + b)^n = \sum_{r=0}^{n} \binom{n}{r} a^{n-r} b^r
$$

where $\binom{n}{r} = \dfrac{n!}{r!(n-r)!}$. The coefficients follow Pascal's triangle. For $(1 + x)^n$ with non-integer or negative $n$, the expansion is an infinite series valid for $|x| < 1$:
$$
(1 + x)^n = 1 + nx + \frac{n(n-1)}{2!}x^2 + \frac{n(n-1)(n-2)}{3!}x^3 + \cdots
$$

## Convergence

A geometric series converges only if $|r| < 1$. Recurrence-defined sequences may converge to a **limit** $L$ found by solving $L = g(L)$.
===NOTE===
type: formula
title: Sequences & Series — Key Formulas
---
**Arithmetic $n$th term:** $u_n = a + (n-1)d$

**Arithmetic sum:**
$$
S_n = \frac{n}{2}\big[2a + (n-1)d\big]
$$

**Geometric $n$th term:** $u_n = ar^{n-1}$

**Geometric sum:**
$$
S_n = \frac{a(1 - r^n)}{1 - r}, \quad r \neq 1
$$

**Sum to infinity ($|r| < 1$):**
$$
S_\infty = \frac{a}{1 - r}
$$

**Binomial coefficient:** $\dbinom{n}{r} = \dfrac{n!}{r!(n-r)!}$

**Binomial expansion:**
$$
(a + b)^n = \sum_{r=0}^{n} \binom{n}{r} a^{n-r} b^r
$$
===NOTE===
type: worked_example
title: Sum of a geometric series and sum to infinity
---
**A geometric series has first term $a = 24$ and common ratio $r = \frac{1}{2}$. Find (a) the sum of the first 6 terms, (b) the sum to infinity.**

(a) Use the geometric sum formula:
$$
S_6 = \frac{a(1 - r^n)}{1 - r} = \frac{24\left(1 - \left(\frac{1}{2}\right)^6\right)}{1 - \frac{1}{2}}
$$

Evaluate $\left(\frac{1}{2}\right)^6 = \frac{1}{64}$:
$$
S_6 = \frac{24\left(1 - \frac{1}{64}\right)}{\frac{1}{2}} = \frac{24 \times \frac{63}{64}}{\frac{1}{2}}
$$

Simplify:
$$
= 48 \times \frac{63}{64} = \frac{3024}{64} = 47.25
$$

So $S_6 = \mathbf{47.25}$.

(b) Since $|r| = \frac{1}{2} < 1$, the sum to infinity exists:
$$
S_\infty = \frac{a}{1 - r} = \frac{24}{1 - \frac{1}{2}} = \frac{24}{\frac{1}{2}} = \mathbf{48}
$$
===NOTE===
type: worked_example
title: Binomial expansion of a bracket
---
**Find the first four terms of the expansion of $(2 + 3x)^5$ in ascending powers of $x$.**

Use $(a+b)^n$ with $a = 2$, $b = 3x$, $n = 5$. The general term is $\binom{5}{r}(2)^{5-r}(3x)^r$.

Term for $r = 0$:
$$
\binom{5}{0}(2)^5 = 1 \times 32 = 32
$$

Term for $r = 1$:
$$
\binom{5}{1}(2)^4(3x) = 5 \times 16 \times 3x = 240x
$$

Term for $r = 2$:
$$
\binom{5}{2}(2)^3(3x)^2 = 10 \times 8 \times 9x^2 = 720x^2
$$

Term for $r = 3$:
$$
\binom{5}{3}(2)^2(3x)^3 = 10 \times 4 \times 27x^3 = 1080x^3
$$

The first four terms are:
$$
\mathbf{32 + 240x + 720x^2 + 1080x^3}
$$
===NOTE===
type: tip
title: Sequences & Series — Exam Tips & Common Mistakes
---
- Use $n-1$ (not $n$) in the power/multiplier for the $n$th term of both arithmetic and geometric sequences.
- The sum to infinity only exists when $|r| < 1$. Always state this condition if asked to justify convergence.
- In binomial expansions, raise the WHOLE term to the power: $(3x)^2 = 9x^2$, not $3x^2$.
- Keep track of signs when $b$ is negative, e.g. $(2 - 3x)^5$ gives alternating signs.
- For "ascending powers", start with the constant term ($r = 0$); for "descending powers" start with the highest power.
- When solving for $n$ in $S_n = \text{value}$, you may get a quadratic — discard non-integer or negative solutions.
- For a limit of a recurrence, set $L = g(L)$ and solve, choosing the root that matches the sequence's behaviour.
===TOPIC=== trigonometry
===NOTE===
type: concept
title: Trigonometry — Revision Notes
---
## Right-Angled Trigonometry and Beyond

In a right-angled triangle, $\sin\theta = \frac{\text{opp}}{\text{hyp}}$, $\cos\theta = \frac{\text{adj}}{\text{hyp}}$, $\tan\theta = \frac{\text{opp}}{\text{adj}}$. For any triangle use:

- **Sine rule:** $\dfrac{a}{\sin A} = \dfrac{b}{\sin B} = \dfrac{c}{\sin C}$
- **Cosine rule:** $a^2 = b^2 + c^2 - 2bc\cos A$
- **Area:** $\frac{1}{2}ab\sin C$

## Radians

Angles can be measured in radians where $\pi$ radians $= 180°$. For a circle of radius $r$ and angle $\theta$ in radians:

- **Arc length:** $s = r\theta$
- **Sector area:** $A = \frac{1}{2}r^2\theta$

## Graphs and Exact Values

You must know the shapes and periods of $y = \sin x$, $y = \cos x$ (period $360°$ or $2\pi$) and $y = \tan x$ (period $180°$ or $\pi$). Learn exact values for $0, 30, 45, 60, 90$ degrees.

## Identities

The two fundamental identities are:
$$
\sin^2\theta + \cos^2\theta = 1, \qquad \tan\theta = \frac{\sin\theta}{\cos\theta}
$$

**Compound angle formulas:**
$$
\sin(A \pm B) = \sin A\cos B \pm \cos A\sin B
$$
$$
\cos(A \pm B) = \cos A\cos B \mp \sin A\sin B
$$

**Double angle formulas:**
$$
\sin 2A = 2\sin A\cos A, \quad \cos 2A = \cos^2 A - \sin^2 A = 1 - 2\sin^2 A
$$

## Solving Equations

When solving trig equations, find the principal value, then use symmetry/periodicity to find all solutions in the given range. Watch for losing solutions when dividing by a trig term — factorise instead.

## Harmonic Form

Expressions $a\sin\theta + b\cos\theta$ can be written as $R\sin(\theta + \alpha)$ where $R = \sqrt{a^2 + b^2}$, useful for finding maxima, minima and solving equations.
===NOTE===
type: formula
title: Trigonometry — Key Formulas
---
**Pythagorean identity:** $\sin^2\theta + \cos^2\theta = 1$, also $1 + \tan^2\theta = \sec^2\theta$ and $1 + \cot^2\theta = \csc^2\theta$

**Sine rule:** $\dfrac{a}{\sin A} = \dfrac{b}{\sin B} = \dfrac{c}{\sin C}$

**Cosine rule:** $a^2 = b^2 + c^2 - 2bc\cos A$

**Area of triangle:** $\frac{1}{2}ab\sin C$

**Arc length:** $s = r\theta$  **Sector area:** $A = \frac{1}{2}r^2\theta$

**Compound angles:**
$$
\sin(A \pm B) = \sin A\cos B \pm \cos A\sin B
$$
$$
\cos(A \pm B) = \cos A\cos B \mp \sin A\sin B
$$

**Double angles:** $\sin 2A = 2\sin A\cos A$, $\cos 2A = 1 - 2\sin^2 A$, $\tan 2A = \dfrac{2\tan A}{1 - \tan^2 A}$
===NOTE===
type: worked_example
title: Solving a trigonometric equation
---
**Solve $2\sin^2 x - \sin x - 1 = 0$ for $0° \leq x \leq 360°$.**

This is a quadratic in $\sin x$. Let $s = \sin x$:
$$
2s^2 - s - 1 = 0
$$

Factorise:
$$
(2s + 1)(s - 1) = 0
$$

So $s = -\frac{1}{2}$ or $s = 1$.

For $\sin x = 1$: the only solution in range is $x = 90°$.

For $\sin x = -\frac{1}{2}$: the principal value is $-30°$. Sine is negative in the third and fourth quadrants:
$$
x = 180° + 30° = 210°, \qquad x = 360° - 30° = 330°
$$

The solutions are **$x = 90°, 210°, 330°$**.
===NOTE===
type: worked_example
title: Using the cosine rule
---
**A triangle has sides $b = 7$ cm, $c = 10$ cm and included angle $A = 60°$. Find side $a$.**

Apply the cosine rule:
$$
a^2 = b^2 + c^2 - 2bc\cos A
$$

Substitute the values:
$$
a^2 = 7^2 + 10^2 - 2(7)(10)\cos 60°
$$

Evaluate, using $\cos 60° = \frac{1}{2}$:
$$
a^2 = 49 + 100 - 140 \times \frac{1}{2} = 149 - 70 = 79
$$

Take the positive square root:
$$
a = \sqrt{79} \approx 8.89 \text{ cm}
$$

The length of side $a$ is **$\sqrt{79} \approx 8.89$ cm**.
===NOTE===
type: tip
title: Trigonometry — Exam Tips & Common Mistakes
---
- Check whether the answer should be in degrees or radians and set your calculator accordingly.
- Never divide an equation by $\sin x$ or $\cos x$ — you lose solutions. Factorise out the common term instead.
- Use the CAST diagram or graph symmetry to find ALL solutions in the range, not just the principal value.
- For $\sin(2x)$ or $\sin(x + 30)$ equations, adjust the range BEFORE solving (e.g. if $0 \le x \le 360$ then $0 \le 2x \le 720$).
- Memorise exact values for $30°, 45°, 60°$ — these come up constantly.
- $\sin^2 x$ means $(\sin x)^2$. Don't confuse with $\sin(x^2)$.
- When using the sine rule to find an angle, consider the possible obtuse solution (ambiguous case).
===TOPIC=== exponentials-logarithms
===NOTE===
type: concept
title: Exponentials & Logarithms — Revision Notes
---
## Exponential Functions

An **exponential function** has the form $y = a^x$ where $a > 0$. All such curves pass through $(0, 1)$. The special base $e \approx 2.718$ gives the function $y = e^x$, whose key property is that it equals its own derivative:
$$
\frac{d}{dx}(e^x) = e^x
$$

Exponential models describe **growth** (e.g. populations, investments) and **decay** (e.g. radioactive material, cooling), typically in the form $y = Ae^{kt}$. A positive $k$ gives growth; a negative $k$ gives decay.

## Logarithms

A **logarithm** is the inverse of exponentiation:
$$
y = a^x \iff x = \log_a y
$$

So $\log_a a^x = x$ and $a^{\log_a x} = x$. The function $\ln x = \log_e x$ is the natural logarithm, inverse of $e^x$.

## Laws of Logarithms

For a fixed base:

- **Product:** $\log_a(xy) = \log_a x + \log_a y$
- **Quotient:** $\log_a\left(\frac{x}{y}\right) = \log_a x - \log_a y$
- **Power:** $\log_a(x^n) = n\log_a x$

Also $\log_a 1 = 0$ and $\log_a a = 1$.

## Solving Equations

To solve $a^x = b$, take logarithms of both sides:
$$
x\log a = \log b \implies x = \frac{\log b}{\log a}
$$

For equations involving $e^x$, take natural logs; for equations involving $\ln x$, exponentiate using $e$.

## Linearising Data

Many models can be made linear to find unknown constants by plotting logs:

- For $y = ax^n$: $\log y = \log a + n\log x$ — plot $\log y$ against $\log x$; gradient $n$, intercept $\log a$.
- For $y = ab^x$ (or $Ae^{kt}$): $\log y = \log a + x\log b$ — plot $\log y$ against $x$; gradient $\log b$, intercept $\log a$.

This technique lets you estimate parameters from experimental data using a straight-line fit.
===NOTE===
type: formula
title: Exponentials & Logarithms — Key Formulas
---
**Definition:** $y = a^x \iff x = \log_a y$

**Laws of logs:**
$$
\log_a(xy) = \log_a x + \log_a y
$$
$$
\log_a\left(\frac{x}{y}\right) = \log_a x - \log_a y
$$
$$
\log_a(x^n) = n\log_a x
$$

**Special values:** $\log_a 1 = 0$, $\log_a a = 1$

**Natural log and $e$:** $\ln x = \log_e x$, $\ \ln(e^x) = x$, $\ e^{\ln x} = x$

**Derivative:** $\dfrac{d}{dx}(e^x) = e^x$, $\ \dfrac{d}{dx}(\ln x) = \dfrac{1}{x}$

**Change of base:** $\log_a x = \dfrac{\log_b x}{\log_b a}$

**Linear forms:** $y = ax^n \Rightarrow \log y = n\log x + \log a$; $\ y = ab^x \Rightarrow \log y = (\log b)x + \log a$
===NOTE===
type: worked_example
title: Solving an exponential equation with logs
---
**Solve $5^{2x-1} = 30$, giving your answer to 3 significant figures.**

Take natural logarithms of both sides:
$$
\ln\left(5^{2x-1}\right) = \ln 30
$$

Use the power law to bring down the exponent:
$$
(2x - 1)\ln 5 = \ln 30
$$

Divide both sides by $\ln 5$:
$$
2x - 1 = \frac{\ln 30}{\ln 5} = \frac{3.4012}{1.6094} = 2.1133
$$

Solve for $x$:
$$
2x = 3.1133 \implies x = 1.5566
$$

To 3 significant figures, $x = \mathbf{1.56}$.
===NOTE===
type: worked_example
title: Linearising an exponential model
---
**A model is $y = ab^x$. A straight-line graph of $\log_{10} y$ against $x$ has gradient $0.3$ and intercept $0.7$. Find $a$ and $b$.**

Take logs of the model:
$$
\log_{10} y = \log_{10}(ab^x) = \log_{10} a + x\log_{10} b
$$

Compare with $Y = mX + c$ where $Y = \log_{10} y$, $X = x$:

- Gradient $= \log_{10} b = 0.3$
- Intercept $= \log_{10} a = 0.7$

Solve for $b$ by raising 10 to the power:
$$
b = 10^{0.3} \approx 1.995 \approx 2.00
$$

Solve for $a$:
$$
a = 10^{0.7} \approx 5.01
$$

So **$a \approx 5.01$** and **$b \approx 2.00$**.
===NOTE===
type: tip
title: Exponentials & Logarithms — Exam Tips & Common Mistakes
---
- $\log(x + y)$ is NOT $\log x + \log y$. The product law applies to $\log(xy)$ only.
- When solving $a^x = b$, take logs of BOTH sides before bringing down the power.
- $\ln$ and $e^x$ are inverses — use one to undo the other.
- For "show that the data fits $y = ax^n$", take logs and explain that a straight line on a log-log plot confirms the model.
- Be careful which variable goes on each axis when linearising — gradient and intercept depend on it.
- $\log_a a = 1$ and $\log_a 1 = 0$ — these simplifications are easy marks.
- Keep full accuracy in intermediate steps and round only at the end.
===TOPIC=== differentiation
===NOTE===
type: concept
title: Differentiation — Revision Notes
---
## The Derivative

The **derivative** $\frac{dy}{dx}$ measures the instantaneous rate of change — the gradient of the tangent to a curve. From first principles:
$$
f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$

## Standard Rules

- **Power rule:** if $y = x^n$ then $\frac{dy}{dx} = nx^{n-1}$.
- **Constant multiple:** $\frac{d}{dx}(kf) = kf'$.
- **Sum rule:** differentiate term by term.

Standard derivatives:
$$
\frac{d}{dx}(e^x) = e^x, \quad \frac{d}{dx}(\ln x) = \frac{1}{x}, \quad \frac{d}{dx}(\sin x) = \cos x, \quad \frac{d}{dx}(\cos x) = -\sin x
$$

## Product, Quotient and Chain Rules

- **Chain rule:** if $y = f(g(x))$ then $\frac{dy}{dx} = f'(g(x)) \cdot g'(x)$. In Leibniz form, $\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}$.
- **Product rule:** if $y = uv$ then $\frac{dy}{dx} = u'v + uv'$.
- **Quotient rule:** if $y = \frac{u}{v}$ then $\frac{dy}{dx} = \frac{u'v - uv'}{v^2}$.

## Stationary Points

A **stationary point** occurs where $\frac{dy}{dx} = 0$. To classify it:

- Use the **second derivative**: if $\frac{d^2y}{dx^2} > 0$ it is a minimum; if $< 0$ a maximum; if $= 0$ inspect further.
- Or examine the sign of the gradient either side.

## Increasing and Decreasing Functions

A function is **increasing** where $\frac{dy}{dx} > 0$ and **decreasing** where $\frac{dy}{dx} < 0$.

## Tangents, Normals and Applications

The tangent at a point has gradient $\frac{dy}{dx}$; the normal has gradient $-\frac{1}{dy/dx}$. Differentiation underpins **optimisation** problems (maximise/minimise a quantity) and **rates of change**, often combined via the chain rule as $\frac{dV}{dt} = \frac{dV}{dr} \cdot \frac{dr}{dt}$.
===NOTE===
type: formula
title: Differentiation — Key Formulas
---
**Power rule:** $\dfrac{d}{dx}(x^n) = nx^{n-1}$

**First principles:**
$$
f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$

**Standard derivatives:**
$$
\frac{d}{dx}(e^{kx}) = ke^{kx}, \quad \frac{d}{dx}(\ln x) = \frac{1}{x}
$$
$$
\frac{d}{dx}(\sin x) = \cos x, \quad \frac{d}{dx}(\cos x) = -\sin x
$$

**Chain rule:** $\dfrac{dy}{dx} = \dfrac{dy}{du} \cdot \dfrac{du}{dx}$

**Product rule:** $(uv)' = u'v + uv'$

**Quotient rule:** $\left(\dfrac{u}{v}\right)' = \dfrac{u'v - uv'}{v^2}$

**Normal gradient:** $-\dfrac{1}{dy/dx}$
===NOTE===
type: worked_example
title: Finding and classifying stationary points
---
**Find the stationary points of $y = x^3 - 3x^2 - 9x + 5$ and determine their nature.**

Differentiate:
$$
\frac{dy}{dx} = 3x^2 - 6x - 9
$$

Set equal to zero and solve:
$$
3x^2 - 6x - 9 = 0 \implies x^2 - 2x - 3 = 0 \implies (x-3)(x+1) = 0
$$

So $x = 3$ or $x = -1$.

Find the $y$-values:
$$
x = 3: \ y = 27 - 27 - 27 + 5 = -22
$$
$$
x = -1: \ y = -1 - 3 + 9 + 5 = 10
$$

Use the second derivative to classify:
$$
\frac{d^2y}{dx^2} = 6x - 6
$$

At $x = 3$: $6(3) - 6 = 12 > 0$, so $(3, -22)$ is a **minimum**.

At $x = -1$: $6(-1) - 6 = -12 < 0$, so $(-1, 10)$ is a **maximum**.
===NOTE===
type: worked_example
title: Using the product rule
---
**Differentiate $y = x^2 e^{3x}$ with respect to $x$.**

This is a product, so use the product rule with $u = x^2$ and $v = e^{3x}$.

Differentiate each factor:
$$
u' = 2x, \qquad v' = 3e^{3x}
$$

(the derivative of $e^{3x}$ uses the chain rule, giving a factor of $3$).

Apply the product rule $\frac{dy}{dx} = u'v + uv'$:
$$
\frac{dy}{dx} = 2x \cdot e^{3x} + x^2 \cdot 3e^{3x}
$$

Factor out the common terms $x e^{3x}$:
$$
\frac{dy}{dx} = xe^{3x}(2 + 3x)
$$

The derivative is **$\frac{dy}{dx} = xe^{3x}(2 + 3x)$**.
===NOTE===
type: tip
title: Differentiation — Exam Tips & Common Mistakes
---
- Rewrite roots and fractions as powers before differentiating: $\sqrt{x} = x^{1/2}$, $\frac{1}{x^2} = x^{-2}$.
- For the chain rule on $e^{kx}$ or $\sin(kx)$, don't forget the factor of $k$.
- The second derivative test: positive means minimum, negative means maximum. If it equals zero, use the sign of the first derivative instead.
- The normal gradient is the NEGATIVE RECIPROCAL of the tangent gradient.
- In optimisation, write the quantity in one variable using a constraint, differentiate, set to zero, then justify max/min.
- Don't mix up the product and quotient rules — note the minus sign and $v^2$ denominator in the quotient rule.
- Always evaluate the gradient at the specific $x$-value when finding a tangent/normal equation.
===TOPIC=== integration
===NOTE===
type: concept
title: Integration — Revision Notes
---
## Integration as the Reverse of Differentiation

**Indefinite integration** reverses differentiation. For $n \neq -1$:
$$
\int x^n \, dx = \frac{x^{n+1}}{n+1} + c
$$

The **constant of integration** $c$ must always be included for indefinite integrals. It can be found if a point on the curve (a boundary condition) is given.

## Standard Integrals

$$
\int e^x \, dx = e^x + c, \quad \int \frac{1}{x} \, dx = \ln|x| + c
$$
$$
\int \sin x \, dx = -\cos x + c, \quad \int \cos x \, dx = \sin x + c
$$

## Definite Integration and Area

A **definite integral** gives the signed area between a curve and the $x$-axis:
$$
\int_a^b f(x) \, dx = \big[F(x)\big]_a^b = F(b) - F(a)
$$

where $F$ is any antiderivative. Areas below the axis are negative, so split the integral at the roots and take absolute values when finding total physical area. The area between two curves is $\int_a^b (\text{top} - \text{bottom}) \, dx$.

## Techniques

- **Integration by substitution:** replace part of the integrand with $u$, change $dx$ to $du$, and adjust limits. Reverses the chain rule.
- **Integration by parts:** $\int u \frac{dv}{dx} \, dx = uv - \int v \frac{du}{dx} \, dx$. Reverses the product rule; choose $u$ to simplify on differentiation (LATE: Logs, Algebra, Trig, Exponential).
- **Reverse chain rule:** $\int f'(x)e^{f(x)} dx = e^{f(x)} + c$ and $\int \frac{f'(x)}{f(x)} dx = \ln|f(x)| + c$.

## The Trapezium Rule

When a function cannot be integrated exactly, approximate the area numerically:
$$
\int_a^b y \, dx \approx \frac{h}{2}\big[y_0 + 2(y_1 + \cdots + y_{n-1}) + y_n\big]
$$

where $h = \frac{b-a}{n}$ is the strip width.
===NOTE===
type: formula
title: Integration — Key Formulas
---
**Power rule ($n \neq -1$):**
$$
\int x^n \, dx = \frac{x^{n+1}}{n+1} + c
$$

**Standard integrals:**
$$
\int e^x dx = e^x + c, \quad \int \frac{1}{x} dx = \ln|x| + c
$$
$$
\int \sin x \, dx = -\cos x + c, \quad \int \cos x \, dx = \sin x + c
$$

**Definite integral:**
$$
\int_a^b f(x) \, dx = F(b) - F(a)
$$

**Integration by parts:**
$$
\int u \frac{dv}{dx} \, dx = uv - \int v \frac{du}{dx} \, dx
$$

**Trapezium rule:** $\displaystyle \int_a^b y \, dx \approx \frac{h}{2}\big[y_0 + 2(y_1 + \cdots + y_{n-1}) + y_n\big]$, $h = \dfrac{b-a}{n}$
===NOTE===
type: worked_example
title: Evaluating a definite integral
---
**Evaluate $\displaystyle \int_1^2 \left(3x^2 - \frac{2}{x^2}\right) dx$.**

Rewrite the second term as a power: $\frac{2}{x^2} = 2x^{-2}$. Integrate term by term:
$$
\int \left(3x^2 - 2x^{-2}\right) dx = \frac{3x^3}{3} - \frac{2x^{-1}}{-1} = x^3 + \frac{2}{x}
$$

Apply the limits from $1$ to $2$:
$$
\left[x^3 + \frac{2}{x}\right]_1^2 = \left(2^3 + \frac{2}{2}\right) - \left(1^3 + \frac{2}{1}\right)
$$

Evaluate each bracket:
$$
= (8 + 1) - (1 + 2) = 9 - 3 = 6
$$

The value of the integral is **$6$**.
===NOTE===
type: worked_example
title: Integration by parts
---
**Find $\displaystyle \int x e^{x} \, dx$.**

Use integration by parts. Choose $u = x$ (simplifies on differentiating) and $\frac{dv}{dx} = e^x$:
$$
u = x \implies \frac{du}{dx} = 1
$$
$$
\frac{dv}{dx} = e^x \implies v = e^x
$$

Apply $\int u \frac{dv}{dx} dx = uv - \int v \frac{du}{dx} dx$:
$$
\int x e^x \, dx = x e^x - \int e^x \cdot 1 \, dx
$$

Integrate the remaining term:
$$
= x e^x - e^x + c
$$

Factor for a tidy answer:
$$
= e^x(x - 1) + c
$$

The integral is **$e^x(x - 1) + c$**.
===NOTE===
type: tip
title: Integration — Exam Tips & Common Mistakes
---
- ALWAYS add $+c$ for indefinite integrals. Marks are routinely lost for omitting it.
- The power rule fails for $n = -1$; $\int \frac{1}{x} dx = \ln|x| + c$, not $\frac{x^0}{0}$.
- For definite integrals, substitute the limits in the order $F(b) - F(a)$ and watch the signs.
- If area is below the $x$-axis the integral is negative — split at roots and take the magnitude for total area.
- For "area between two curves", integrate (upper minus lower) between the intersection points.
- The trapezium rule over/underestimates depending on concavity — be ready to state whether it's an over- or under-estimate.
- When using by parts, pick $u$ to be the part that gets simpler when differentiated (logs and powers of $x$ first).
===TOPIC=== vectors
===NOTE===
type: concept
title: Vectors — Revision Notes
---
## Vectors and Notation

A **vector** has both magnitude and direction. In two dimensions a vector can be written as a column $\begin{pmatrix} a \\ b \end{pmatrix}$ or in component form $a\mathbf{i} + b\mathbf{j}$, where $\mathbf{i}$ and $\mathbf{j}$ are unit vectors along the axes. (The A-level extends this to three dimensions with $\mathbf{k}$.)

## Magnitude and Direction

The **magnitude** (modulus) of $\mathbf{v} = \begin{pmatrix} a \\ b \end{pmatrix}$ is:
$$
|\mathbf{v}| = \sqrt{a^2 + b^2}
$$

A **unit vector** in the direction of $\mathbf{v}$ is $\hat{\mathbf{v}} = \frac{1}{|\mathbf{v}|}\mathbf{v}$. The direction (angle from the positive $x$-axis) is found using $\tan\theta = \frac{b}{a}$.

## Vector Arithmetic

- **Addition/subtraction:** add or subtract corresponding components.
- **Scalar multiplication:** $k\mathbf{v}$ scales each component by $k$; if $k > 0$ the direction is unchanged, if $k < 0$ it is reversed.

Two vectors are **parallel** if one is a scalar multiple of the other.

## Position Vectors

The **position vector** of a point $A$ is $\overrightarrow{OA} = \mathbf{a}$, measured from the origin. The vector joining $A$ to $B$ is:
$$
\overrightarrow{AB} = \mathbf{b} - \mathbf{a}
$$

The **distance** between $A$ and $B$ equals $|\overrightarrow{AB}|$. The midpoint of $AB$ has position vector $\frac{1}{2}(\mathbf{a} + \mathbf{b})$.

## Geometric Problems

Vectors are used to prove geometric results: collinearity (points $A$, $B$, $C$ are collinear if $\overrightarrow{AB}$ and $\overrightarrow{BC}$ are parallel), to find ratios in which a point divides a line, and to work with shapes such as parallelograms (where $\overrightarrow{AB} = \overrightarrow{DC}$). Always express required vectors as combinations of known vectors before comparing.
===NOTE===
type: formula
title: Vectors — Key Formulas
---
**Magnitude (2D):** $|\mathbf{v}| = \sqrt{a^2 + b^2}$

**Magnitude (3D):** $|\mathbf{v}| = \sqrt{a^2 + b^2 + c^2}$

**Unit vector:** $\hat{\mathbf{v}} = \dfrac{1}{|\mathbf{v}|}\mathbf{v}$

**Vector between points:** $\overrightarrow{AB} = \mathbf{b} - \mathbf{a}$

**Distance between points:** $|\overrightarrow{AB}| = |\mathbf{b} - \mathbf{a}|$

**Midpoint position vector:** $\dfrac{1}{2}(\mathbf{a} + \mathbf{b})$

**Direction (2D):** $\tan\theta = \dfrac{b}{a}$

**Parallel condition:** $\mathbf{u} = k\mathbf{v}$ for some scalar $k$
===NOTE===
type: worked_example
title: Magnitude and unit vector
---
**Given $\mathbf{v} = \begin{pmatrix} 5 \\ -12 \end{pmatrix}$, find $|\mathbf{v}|$ and the unit vector in the direction of $\mathbf{v}$.**

Compute the magnitude:
$$
|\mathbf{v}| = \sqrt{5^2 + (-12)^2} = \sqrt{25 + 144} = \sqrt{169} = 13
$$

The unit vector divides each component by the magnitude:
$$
\hat{\mathbf{v}} = \frac{1}{13}\begin{pmatrix} 5 \\ -12 \end{pmatrix} = \begin{pmatrix} \frac{5}{13} \\[4pt] -\frac{12}{13} \end{pmatrix}
$$

So $|\mathbf{v}| = \mathbf{13}$ and the unit vector is $\mathbf{\frac{1}{13}\begin{pmatrix} 5 \\ -12 \end{pmatrix}}$.
===NOTE===
type: worked_example
title: Proving points are collinear
---
**Points have position vectors $A(1, 2)$, $B(3, 6)$ and $C(6, 12)$. Show that $A$, $B$ and $C$ are collinear.**

Find $\overrightarrow{AB}$:
$$
\overrightarrow{AB} = \mathbf{b} - \mathbf{a} = \begin{pmatrix} 3 \\ 6 \end{pmatrix} - \begin{pmatrix} 1 \\ 2 \end{pmatrix} = \begin{pmatrix} 2 \\ 4 \end{pmatrix}
$$

Find $\overrightarrow{BC}$:
$$
\overrightarrow{BC} = \mathbf{c} - \mathbf{b} = \begin{pmatrix} 6 \\ 12 \end{pmatrix} - \begin{pmatrix} 3 \\ 6 \end{pmatrix} = \begin{pmatrix} 3 \\ 6 \end{pmatrix}
$$

Check whether one is a scalar multiple of the other:
$$
\begin{pmatrix} 3 \\ 6 \end{pmatrix} = \frac{3}{2}\begin{pmatrix} 2 \\ 4 \end{pmatrix} = \frac{3}{2}\overrightarrow{AB}
$$

Since $\overrightarrow{BC} = \frac{3}{2}\overrightarrow{AB}$, the vectors are parallel and share the common point $B$.

Therefore **$A$, $B$ and $C$ are collinear**.
===NOTE===
type: tip
title: Vectors — Exam Tips & Common Mistakes
---
- $\overrightarrow{AB} = \mathbf{b} - \mathbf{a}$ (end minus start) — getting this the wrong way round reverses the vector.
- The magnitude always uses a square root of the sum of squares; never forget to square the negative components.
- A unit vector has magnitude 1; check by computing its modulus.
- For collinearity, show two vectors are parallel (scalar multiples) AND share a common point.
- Parallel vectors satisfy $\mathbf{u} = k\mathbf{v}$; equal vectors need the same magnitude and direction.
- Keep column vectors aligned and work component by component to avoid arithmetic slips.
- When finding an angle, use $\tan\theta = \frac{b}{a}$ but check the quadrant from the signs of the components.
===TOPIC=== proof
===NOTE===
type: concept
title: Proof — Revision Notes
---
## What is a Proof?

A **proof** is a logical, watertight argument establishing that a statement is true in every case (or, for a disproof, false). At A-level you must understand the language of proof: the symbols $\implies$ (implies), $\impliedby$ (is implied by) and $\iff$ (if and only if), and the difference between a **necessary** and a **sufficient** condition.

## Proof by Deduction

Start from known facts or definitions and use logical steps to reach the required conclusion. For example, expressing a general even number as $2n$ and an odd number as $2n+1$ lets you prove general statements about integers using algebra.

## Proof by Exhaustion

Break the statement into a finite number of cases and verify each one. This is valid only when the cases genuinely cover every possibility — for example, checking a property for all integers in a small range, or splitting integers into "even" and "odd".

## Disproof by Counterexample

To disprove a universal statement ("for all..."), it is enough to find a single example where it fails. One valid counterexample destroys the claim. For instance, the claim "$n^2 - n + 41$ is prime for all positive integers $n$" fails at $n = 41$.

## Proof by Contradiction

Assume the **opposite** (negation) of what you want to prove, then derive a logical contradiction. Since the assumption leads to an impossibility, the original statement must be true. Classic examples include proving $\sqrt{2}$ is irrational and proving there are infinitely many primes. Structure:

1. Assume the statement is false.
2. Reason logically to a contradiction.
3. Conclude the original statement is true.

## Writing Good Proofs

- Define your variables clearly (e.g. "let $n$ be an integer").
- Use general representations, not specific examples, when proving "for all".
- Justify each step; a proof is only as strong as its weakest link.
- End with a clear concluding statement linking back to what was required.
===NOTE===
type: formula
title: Proof — Key Results & Representations
---
**Standard algebraic representations:**

- Even number: $2n$
- Odd number: $2n + 1$ (or $2n - 1$)
- Consecutive integers: $n,\ n+1,\ n+2$
- Multiple of $k$: $kn$

**Logical symbols:**

- $P \implies Q$: $P$ implies $Q$ ($P$ sufficient for $Q$)
- $P \impliedby Q$: $P$ is implied by $Q$ ($P$ necessary for $Q$)
- $P \iff Q$: $P$ if and only if $Q$ (equivalence)

**Methods of proof:**

- Deduction — logical steps from known facts
- Exhaustion — check all finite cases
- Counterexample — one case disproves a universal claim
- Contradiction — assume the negation, derive an impossibility

**Key fact:** the product/sum of integers stays an integer — used to show divisibility (e.g. $2(\ldots)$ is even).
===NOTE===
type: worked_example
title: Proof by deduction
---
**Prove that the sum of any three consecutive integers is divisible by 3.**

Let the three consecutive integers be $n$, $n+1$ and $n+2$, where $n$ is any integer.

Add them together:
$$
n + (n+1) + (n+2) = 3n + 3
$$

Factor out 3:
$$
3n + 3 = 3(n + 1)
$$

Since $n$ is an integer, $n + 1$ is also an integer, so $3(n+1)$ is a multiple of 3.

Therefore the sum of any three consecutive integers is **divisible by 3**, as required.
===NOTE===
type: worked_example
title: Proof by contradiction
---
**Prove by contradiction that there is no smallest positive rational number.**

Assume the opposite: suppose there IS a smallest positive rational number, and call it $q$.

Since $q$ is rational and positive, consider the number $\frac{q}{2}$.

Because $q$ is rational, $\frac{q}{2}$ is also rational (a rational divided by 2 is rational). It is also positive, since $q > 0$.

Compare it with $q$:
$$
\frac{q}{2} < q \quad \text{(because } q > 0\text{)}
$$

So $\frac{q}{2}$ is a positive rational number smaller than $q$. This **contradicts** the assumption that $q$ was the smallest positive rational.

Since the assumption leads to a contradiction, it must be false. Therefore **there is no smallest positive rational number**, as required.
===NOTE===
type: tip
title: Proof — Exam Tips & Common Mistakes
---
- A few examples do NOT prove a general statement — you must use a general variable like $n$ to prove "for all".
- One counterexample IS enough to disprove a universal claim. Pick the simplest one that works.
- In proof by contradiction, state the assumption clearly ("Assume, for contradiction, that...") and identify exactly where the contradiction arises.
- For "show $\iff$", you may need to prove the implication in BOTH directions.
- Always define variables: "let $n$ be an integer" sets up the argument properly.
- Don't confuse necessary and sufficient conditions: $P \implies Q$ means $P$ is sufficient for $Q$, and $Q$ is necessary for $P$.
- Finish with a concluding sentence; an unstated conclusion can lose the final mark.
