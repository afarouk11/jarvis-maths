===TOPIC=== functions
===NOTE===
type: concept
title: Functions — Revision Notes
---
## What is a Function?

A **function** is a rule that assigns to each input exactly **one** output. We write $f(x)$ for the output when $x$ is the input. A relation is only a function if every input maps to a single output (the "vertical line test").

### Domain and Range

- The **domain** is the set of permitted input values ($x$).
- The **range** is the set of output values the function actually produces ($f(x)$).
- The range of a function becomes constrained by its domain. Always sketch the graph to read off the range.

Common domain restrictions:
- Square roots require the contents to be $\geq 0$.
- Fractions require the denominator $\neq 0$.
- Logarithms require a strictly positive argument.

### One-to-One and Many-to-One

- A **one-to-one** function maps each input to a distinct output (e.g. $f(x) = 2x + 1$).
- A **many-to-one** function maps several inputs to the same output (e.g. $f(x) = x^2$, since $f(2) = f(-2) = 4$).
- Only one-to-one functions have an inverse over their whole domain.

### Composite Functions

The composite $fg(x)$ means "do $g$ first, then $f$": $fg(x) = f(g(x))$.

- The inner function must produce outputs lying in the domain of the outer function.
- In general $fg(x) \neq gf(x)$ — order matters.

### Inverse Functions

The **inverse** $f^{-1}(x)$ reverses $f$: if $f(a) = b$ then $f^{-1}(b) = a$.

To find it:
1. Write $y = f(x)$.
2. Rearrange to make $x$ the subject.
3. Swap $x$ and $y$; this is $f^{-1}(x)$.

Key facts:
- $ff^{-1}(x) = f^{-1}f(x) = x$.
- The domain of $f^{-1}$ equals the range of $f$, and vice versa.
- The graph of $f^{-1}$ is the reflection of $f$ in the line $y = x$.
- A function must be one-to-one (on its domain) to have an inverse.

### The Modulus Function

The **modulus** (absolute value) $|x|$ gives the non-negative magnitude:
$$
|x| = \begin{cases} x & x \geq 0 \\ -x & x < 0 \end{cases}
$$

- To sketch $y = |f(x)|$, reflect any part of $y = f(x)$ below the $x$-axis up above it.
- To sketch $y = f(|x|)$, keep $x \geq 0$ and reflect it in the $y$-axis.
- To solve $|f(x)| = g(x)$, solve both $f(x) = g(x)$ and $f(x) = -g(x)$, then check solutions are valid.

### Transformations of Graphs

- $y = f(x) + a$: translation up by $a$.
- $y = f(x + a)$: translation left by $a$.
- $y = af(x)$: vertical stretch, scale factor $a$.
- $y = f(ax)$: horizontal stretch, scale factor $\frac{1}{a}$.
- $y = -f(x)$: reflection in the $x$-axis; $y = f(-x)$: reflection in the $y$-axis.
===NOTE===
type: formula
title: Functions — Key Formulas
---
**Composite functions**
$$
fg(x) = f(g(x))
$$

**Inverse relationships**
$$
ff^{-1}(x) = f^{-1}f(x) = x
$$
- Domain of $f^{-1}$ = Range of $f$
- Range of $f^{-1}$ = Domain of $f$
- $y = f^{-1}(x)$ is the reflection of $y = f(x)$ in $y = x$

**Modulus**
$$
|x| = \sqrt{x^2}, \qquad |x| = \begin{cases} x & x \geq 0 \\ -x & x < 0 \end{cases}
$$
- $|a| = b \Rightarrow a = b$ or $a = -b$ (for $b \geq 0$)

**Transformations of $y = f(x)$**
- $f(x) + a$: up $a$
- $f(x + a)$: left $a$
- $af(x)$: vertical stretch sf $a$
- $f(ax)$: horizontal stretch sf $\frac{1}{a}$
- $-f(x)$: reflect in $x$-axis
- $f(-x)$: reflect in $y$-axis
===NOTE===
type: worked_example
title: Finding a composite function and its domain
---
Given $f(x) = 3x - 1$ and $g(x) = \dfrac{2}{x + 4}$ for $x \neq -4$, find $fg(x)$ and state its domain.

**Step 1 — Substitute $g$ into $f$.** The composite $fg(x)$ means apply $g$ first, then $f$:
$$
fg(x) = f\left(\frac{2}{x+4}\right) = 3\left(\frac{2}{x+4}\right) - 1
$$

**Step 2 — Simplify.**
$$
fg(x) = \frac{6}{x+4} - 1 = \frac{6 - (x+4)}{x+4} = \frac{2 - x}{x + 4}
$$

**Step 3 — Determine the domain.** The inner function $g$ requires $x \neq -4$. Since $f$ accepts all real inputs, no further restriction is added. The denominator confirms $x \neq -4$.

The composite function is $\boxed{fg(x) = \dfrac{2 - x}{x + 4}, \quad x \neq -4}$, with domain **all real $x$ except $x = -4$**.
===NOTE===
type: worked_example
title: Solving a modulus equation
---
Solve $|2x - 5| = x + 1$.

**Step 1 — Set up the two cases.** The modulus splits into a positive and a negative branch:
$$
2x - 5 = x + 1 \qquad \text{or} \qquad 2x - 5 = -(x + 1)
$$

**Step 2 — Solve the first case.**
$$
2x - 5 = x + 1 \implies x = 6
$$

**Step 3 — Solve the second case.**
$$
2x - 5 = -x - 1 \implies 3x = 4 \implies x = \frac{4}{3}
$$

**Step 4 — Check validity.** The right-hand side $x + 1$ must be $\geq 0$, so we need $x \geq -1$. Both values satisfy this. Verify by substitution:
- $x = 6$: $|12 - 5| = 7$ and $6 + 1 = 7$. Valid.
- $x = \frac{4}{3}$: $\left|\frac{8}{3} - 5\right| = \left|-\frac{7}{3}\right| = \frac{7}{3}$ and $\frac{4}{3} + 1 = \frac{7}{3}$. Valid.

The solutions are $\boxed{x = 6 \text{ and } x = \dfrac{4}{3}}$.
===NOTE===
type: tip
title: Functions — Exam Tips & Common Mistakes
---
- **Always state restrictions on the domain** when defining an inverse or composite — marks are awarded specifically for these.
- Remember $fg(x)$ means **$g$ acts first**. A very common error is computing $gf(x)$ by mistake.
- For inverse functions, the **domain of $f^{-1}$ is the range of $f$** — work out the range of $f$ first by sketching.
- When solving modulus equations, **always check your solutions** back in the original equation; the squaring/case method can introduce false roots.
- For $|f(x)| = |g(x)|$, squaring both sides ($f(x)^2 = g(x)^2$) is often cleaner than case analysis.
- When sketching $y = |f(x)|$, only reflect the parts **below** the $x$-axis; do not redraw the whole curve.
- A many-to-one function (like $x^2$) has no inverse unless you **restrict its domain** to make it one-to-one.
- Don't confuse $f^{-1}(x)$ (inverse) with $\frac{1}{f(x)}$ (reciprocal) — they are completely different.

===TOPIC=== further-algebra
===NOTE===
type: concept
title: Further Algebra — Revision Notes
---
## Partial Fractions

**Partial fractions** split a single algebraic fraction into a sum of simpler fractions. This is essential for integration and binomial expansion.

### Distinct Linear Factors

For $\dfrac{f(x)}{(ax+b)(cx+d)}$, write:
$$
\frac{f(x)}{(ax+b)(cx+d)} = \frac{A}{ax+b} + \frac{B}{cx+d}
$$
Multiply through by the denominator and find $A, B$ by **substituting convenient values** of $x$ (the "cover-up" idea) or by comparing coefficients.

### Repeated Factors

A repeated factor needs a term for each power:
$$
\frac{f(x)}{(ax+b)(cx+d)^2} = \frac{A}{ax+b} + \frac{B}{cx+d} + \frac{C}{(cx+d)^2}
$$

### Improper Fractions

If the numerator's degree is $\geq$ the denominator's, first divide (polynomial division) to get a polynomial plus a proper fraction, then split the remainder.

## Algebraic Division

To divide polynomials, use **long division** or the **factor/remainder theorem**.

- **Remainder Theorem:** the remainder when $f(x)$ is divided by $(x - a)$ is $f(a)$.
- **Factor Theorem:** $(x - a)$ is a factor of $f(x)$ if and only if $f(a) = 0$.
- More generally, dividing by $(ax - b)$ gives remainder $f\left(\frac{b}{a}\right)$.

Any division can be written as:
$$
f(x) = (\text{divisor}) \times (\text{quotient}) + (\text{remainder})
$$

## Binomial Expansion (General Index)

For any rational $n$ and $|x| < 1$:
$$
(1 + x)^n = 1 + nx + \frac{n(n-1)}{2!}x^2 + \frac{n(n-1)(n-2)}{3!}x^3 + \cdots
$$

Key points:
- The series is **infinite** when $n$ is not a positive integer.
- It is **valid only for $|x| < 1$** (the condition for convergence).
- For $(a + bx)^n$, factor out $a^n$ first:
$$
(a + bx)^n = a^n\left(1 + \frac{bx}{a}\right)^n, \quad \text{valid for } \left|\frac{bx}{a}\right| < 1
$$
- Partial fractions can simplify a function before expanding, allowing two simpler binomial expansions to be added.

### Validity

Always state the **range of validity** ($|x| < $ something). When expanding a function written in partial fractions, the overall validity is the **most restrictive** of the individual conditions.
===NOTE===
type: formula
title: Further Algebra — Key Formulas
---
**Binomial expansion (any rational $n$)**
$$
(1+x)^n = 1 + nx + \frac{n(n-1)}{2!}x^2 + \frac{n(n-1)(n-2)}{3!}x^3 + \cdots, \quad |x| < 1
$$

**General term coefficient**
$$
\frac{n(n-1)(n-2)\cdots(n-r+1)}{r!}x^r
$$

**Factoring before expanding**
$$
(a+bx)^n = a^n\left(1 + \frac{bx}{a}\right)^n, \quad \left|\frac{bx}{a}\right| < 1
$$

**Remainder Theorem:** remainder of $f(x) \div (x-a)$ is $f(a)$.

**Factor Theorem:** $(x-a)$ is a factor $\iff f(a) = 0$.

**Division identity**
$$
f(x) = (\text{divisor})(\text{quotient}) + (\text{remainder})
$$

**Partial fraction forms**
$$
\frac{px+q}{(ax+b)(cx+d)} = \frac{A}{ax+b} + \frac{B}{cx+d}
$$
$$
\frac{px+q}{(ax+b)(cx+d)^2} = \frac{A}{ax+b} + \frac{B}{cx+d} + \frac{C}{(cx+d)^2}
$$
===NOTE===
type: worked_example
title: Expressing a fraction in partial fractions
---
Express $\dfrac{5x + 1}{(x - 1)(x + 2)}$ in partial fractions.

**Step 1 — Set up the form.** Two distinct linear factors:
$$
\frac{5x + 1}{(x - 1)(x + 2)} = \frac{A}{x - 1} + \frac{B}{x + 2}
$$

**Step 2 — Clear denominators.** Multiply both sides by $(x-1)(x+2)$:
$$
5x + 1 = A(x + 2) + B(x - 1)
$$

**Step 3 — Substitute $x = 1$** to eliminate $B$:
$$
5(1) + 1 = A(1 + 2) \implies 6 = 3A \implies A = 2
$$

**Step 4 — Substitute $x = -2$** to eliminate $A$:
$$
5(-2) + 1 = B(-2 - 1) \implies -9 = -3B \implies B = 3
$$

**Step 5 — Write the answer.**
$$
\boxed{\frac{5x + 1}{(x - 1)(x + 2)} = \frac{2}{x - 1} + \frac{3}{x + 2}}
$$
===NOTE===
type: worked_example
title: Binomial expansion with validity
---
Find the binomial expansion of $\sqrt{4 - x}$ up to and including the term in $x^2$, and state the range of validity.

**Step 1 — Rewrite in standard form.** Factor out $4$ so the bracket starts with $1$:
$$
\sqrt{4 - x} = (4 - x)^{1/2} = 4^{1/2}\left(1 - \frac{x}{4}\right)^{1/2} = 2\left(1 - \frac{x}{4}\right)^{1/2}
$$

**Step 2 — Apply the binomial series** with $n = \frac{1}{2}$ and replacing $x$ by $-\frac{x}{4}$:
$$
(1 + X)^{1/2} = 1 + \tfrac{1}{2}X + \frac{\frac{1}{2}\left(-\frac{1}{2}\right)}{2!}X^2 + \cdots
$$

**Step 3 — Substitute $X = -\frac{x}{4}$.**
$$
= 1 + \tfrac{1}{2}\left(-\tfrac{x}{4}\right) + \frac{-\frac{1}{4}}{2}\left(\tfrac{x^2}{16}\right) + \cdots = 1 - \frac{x}{8} - \frac{x^2}{128} + \cdots
$$

**Step 4 — Multiply by the factor $2$.**
$$
\sqrt{4 - x} \approx 2 - \frac{x}{4} - \frac{x^2}{64}
$$

**Step 5 — State validity.** Need $\left|-\frac{x}{4}\right| < 1$, i.e. $|x| < 4$.

Final answer: $\boxed{\sqrt{4 - x} \approx 2 - \dfrac{x}{4} - \dfrac{x^2}{64}, \quad |x| < 4}$.
===NOTE===
type: tip
title: Further Algebra — Exam Tips & Common Mistakes
---
- For partial fractions, **always factor the denominator fully first**, and check whether the fraction is improper (numerator degree $\geq$ denominator degree) — if so, divide first.
- The substitution method is fastest, but remember repeated factors **also need a comparing-coefficients step** to find the middle term.
- In binomial expansion, the formula only works when the bracket starts with $1$. **Factor out the leading term** of $(a + bx)^n$ first — a frequent source of lost marks.
- When you replace $x$ with something like $-2x$ or $\frac{x}{4}$, **apply the substitution to every term**, including inside the powers.
- Validity is $|x| < 1$ for $(1+x)^n$ but changes once you substitute — for $(1 + kx)^n$ it becomes $|x| < \frac{1}{|k|}$.
- Watch signs carefully when $n$ is negative or fractional: $n(n-1)$ can be positive even when $n < 0$.
- For the remainder theorem with divisor $(ax - b)$, the remainder is $f\left(\frac{b}{a}\right)$, **not** $f(b)$.

===TOPIC=== further-calculus
===NOTE===
type: concept
title: Further Calculus — Revision Notes
---
## Differentiation Rules

### Chain Rule

For a function of a function, $y = f(g(x))$:
$$
\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}
$$
Set $u$ equal to the inner function, differentiate each part, and multiply.

### Product Rule

If $y = uv$ (a product of two functions):
$$
\frac{dy}{dx} = u\frac{dv}{dx} + v\frac{du}{dx}
$$

### Quotient Rule

If $y = \dfrac{u}{v}$:
$$
\frac{dy}{dx} = \frac{v\frac{du}{dx} - u\frac{dv}{dx}}{v^2}
$$

### Standard Derivatives

- $\dfrac{d}{dx}(e^{kx}) = ke^{kx}$
- $\dfrac{d}{dx}(\ln x) = \dfrac{1}{x}$
- $\dfrac{d}{dx}(\sin x) = \cos x$, $\dfrac{d}{dx}(\cos x) = -\sin x$
- $\dfrac{d}{dx}(\tan x) = \sec^2 x$

## Implicit Differentiation

When $y$ is not given explicitly, differentiate **both sides with respect to $x$**, treating $y$ as a function of $x$. Each $y$ term gains a factor of $\frac{dy}{dx}$ via the chain rule:
$$
\frac{d}{dx}\left(y^n\right) = ny^{n-1}\frac{dy}{dx}
$$
For products of $x$ and $y$ (e.g. $xy$), use the product rule.

## Parametric Differentiation

When $x$ and $y$ are both given in terms of a parameter $t$:
$$
\frac{dy}{dx} = \frac{dy/dt}{dx/dt}
$$

## Advanced Integration

Key techniques:
- **Standard results:** $\int \frac{1}{x}\,dx = \ln|x| + c$, $\int e^{kx}\,dx = \frac{1}{k}e^{kx} + c$.
- **Reverse chain rule:** $\int f'(x)e^{f(x)}\,dx = e^{f(x)} + c$, and $\int \frac{f'(x)}{f(x)}\,dx = \ln|f(x)| + c$.
- **Integration by substitution:** let $u = g(x)$, replace $dx$ with $\frac{du}{g'(x)}$, and change limits if definite.
- **Integration by parts:**
$$
\int u\frac{dv}{dx}\,dx = uv - \int v\frac{du}{dx}\,dx
$$
Choose $u$ to be the part that simplifies on differentiating (LATE: Logs, Algebra, Trig, Exponentials).
- **Using partial fractions** to integrate rational functions.
- **Trigonometric identities** (e.g. double-angle) to integrate $\sin^2 x$, $\cos^2 x$.
===NOTE===
type: formula
title: Further Calculus — Key Formulas
---
**Chain rule**
$$
\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx}
$$

**Product rule**
$$
(uv)' = u'v + uv'
$$

**Quotient rule**
$$
\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}
$$

**Parametric**
$$
\frac{dy}{dx} = \frac{dy/dt}{dx/dt}
$$

**Implicit**
$$
\frac{d}{dx}(y^n) = ny^{n-1}\frac{dy}{dx}
$$

**Integration by parts**
$$
\int u\,\frac{dv}{dx}\,dx = uv - \int v\,\frac{du}{dx}\,dx
$$

**Key integrals**
$$
\int \frac{f'(x)}{f(x)}\,dx = \ln|f(x)| + c
$$
$$
\int e^{kx}\,dx = \frac{1}{k}e^{kx} + c, \qquad \int \frac{1}{x}\,dx = \ln|x| + c
$$
===NOTE===
type: worked_example
title: Implicit differentiation
---
Find $\dfrac{dy}{dx}$ for the curve $x^2 + 3xy + y^2 = 7$.

**Step 1 — Differentiate every term with respect to $x$.** Treat $y$ as a function of $x$. The term $3xy$ needs the product rule:
$$
\frac{d}{dx}(x^2) + \frac{d}{dx}(3xy) + \frac{d}{dx}(y^2) = \frac{d}{dx}(7)
$$

**Step 2 — Apply the rules.**
$$
2x + 3\left(x\frac{dy}{dx} + y\right) + 2y\frac{dy}{dx} = 0
$$

**Step 3 — Expand.**
$$
2x + 3x\frac{dy}{dx} + 3y + 2y\frac{dy}{dx} = 0
$$

**Step 4 — Collect the $\frac{dy}{dx}$ terms.**
$$
\frac{dy}{dx}(3x + 2y) = -2x - 3y
$$

**Step 5 — Make $\frac{dy}{dx}$ the subject.**
$$
\boxed{\frac{dy}{dx} = \frac{-2x - 3y}{3x + 2y}}
$$
===NOTE===
type: worked_example
title: Integration by parts
---
Evaluate $\displaystyle\int x e^{2x}\,dx$.

**Step 1 — Choose $u$ and $\frac{dv}{dx}$.** Using LATE, let the algebraic part be $u$ (it simplifies when differentiated):
$$
u = x \implies \frac{du}{dx} = 1
$$
$$
\frac{dv}{dx} = e^{2x} \implies v = \frac{1}{2}e^{2x}
$$

**Step 2 — Apply the formula** $\int u\frac{dv}{dx}\,dx = uv - \int v\frac{du}{dx}\,dx$:
$$
\int x e^{2x}\,dx = x\cdot\frac{1}{2}e^{2x} - \int \frac{1}{2}e^{2x}\cdot 1\,dx
$$

**Step 3 — Integrate the remaining term.**
$$
= \frac{1}{2}x e^{2x} - \frac{1}{2}\cdot\frac{1}{2}e^{2x} + c
$$

**Step 4 — Simplify.**
$$
\boxed{\int x e^{2x}\,dx = \frac{1}{2}x e^{2x} - \frac{1}{4}e^{2x} + c}
$$
===NOTE===
type: tip
title: Further Calculus — Exam Tips & Common Mistakes
---
- For the **quotient rule**, the order in the numerator matters: it is $u'v - uv'$, not $uv' - u'v$. Sign errors here are very common.
- When using **implicit differentiation**, never forget the $\frac{dy}{dx}$ factor on every $y$ term, and use the product rule on mixed $xy$ terms.
- For **integration by parts**, pick $u$ using LATE so the integral simplifies. If you pick wrongly, the new integral becomes harder.
- Some integrals (like $\int \ln x\,dx$) use parts with $\frac{dv}{dx} = 1$ — a trick worth remembering.
- For the **reverse chain rule**, check by differentiating your answer; the constant out front is easy to get wrong.
- Always include $+ c$ for indefinite integrals and **change the limits** when substituting in definite integrals (or substitute back).
- Don't forget $\int \frac{1}{x}\,dx = \ln|x|$ — the **modulus signs** matter for full marks.
- Simplify $\frac{dy}{dx}$ fully before substituting coordinates for gradients of tangents/normals.

===TOPIC=== parametric-equations
===NOTE===
type: concept
title: Parametric Equations — Revision Notes
---
## What are Parametric Equations?

Instead of relating $y$ directly to $x$, **parametric equations** express both coordinates in terms of a third variable called a **parameter** (usually $t$ or $\theta$):
$$
x = f(t), \qquad y = g(t)
$$
As $t$ varies, the point $(x, y)$ traces out a curve. This is especially useful for curves that are not functions (e.g. circles, ellipses) or that describe motion over time.

## Converting to Cartesian Form

To eliminate the parameter and find the Cartesian equation:
- **Rearrange** one equation for $t$ and substitute into the other, or
- Use a **trigonometric identity** when $x$ and $y$ involve $\sin$, $\cos$, etc.

For example, if $x = \cos\theta$ and $y = \sin\theta$, then using $\cos^2\theta + \sin^2\theta = 1$:
$$
x^2 + y^2 = 1
$$
Always state any restriction on the domain/range that the parametric form implies (e.g. $-1 \leq x \leq 1$).

## Parametric Differentiation

The gradient is found using the chain rule:
$$
\frac{dy}{dx} = \frac{dy/dt}{dx/dt} = \frac{g'(t)}{f'(t)}
$$
The result is usually in terms of $t$. To find the gradient at a specific point, substitute the corresponding value of $t$.

### Tangents and Normals

- The **tangent** at a point has gradient $\frac{dy}{dx}$ evaluated at that $t$.
- The **normal** has gradient $-\dfrac{1}{dy/dx}$.
- Use $y - y_1 = m(x - x_1)$ with the point $(x_1, y_1)$ found by substituting $t$.

### Stationary Points

Stationary points occur where $\frac{dy}{dx} = 0$, i.e. where $\frac{dy}{dt} = 0$ (and $\frac{dx}{dt} \neq 0$). Vertical tangents occur where $\frac{dx}{dt} = 0$.

## Parametric Integration (Areas)

The area under a parametric curve is found by:
$$
\int y\,dx = \int y\,\frac{dx}{dt}\,dt
$$
Change the limits from $x$-values to the corresponding $t$-values before integrating.
===NOTE===
type: formula
title: Parametric Equations — Key Formulas
---
**Gradient**
$$
\frac{dy}{dx} = \frac{dy/dt}{dx/dt}
$$

**Tangent gradient** = $\dfrac{dy}{dx}$ at the point.

**Normal gradient** = $-\dfrac{1}{dy/dx}$.

**Line equation**
$$
y - y_1 = m(x - x_1)
$$

**Area under a curve**
$$
A = \int y\,\frac{dx}{dt}\,dt
$$

**Useful identities for elimination**
$$
\cos^2\theta + \sin^2\theta = 1
$$
$$
1 + \tan^2\theta = \sec^2\theta
$$

- Stationary points: $\dfrac{dy}{dt} = 0$ (with $\dfrac{dx}{dt} \neq 0$).
- Vertical tangents: $\dfrac{dx}{dt} = 0$.
===NOTE===
type: worked_example
title: Converting parametric to Cartesian form
---
A curve is defined by $x = 2t + 1$ and $y = t^2 - 3$. Find the Cartesian equation.

**Step 1 — Rearrange the simpler equation for $t$.** From $x = 2t + 1$:
$$
t = \frac{x - 1}{2}
$$

**Step 2 — Substitute into the equation for $y$.**
$$
y = \left(\frac{x - 1}{2}\right)^2 - 3
$$

**Step 3 — Expand and simplify.**
$$
y = \frac{(x - 1)^2}{4} - 3 = \frac{(x-1)^2}{4} - 3
$$

Multiplying out the bracket:
$$
y = \frac{x^2 - 2x + 1}{4} - 3 = \frac{x^2 - 2x + 1 - 12}{4} = \frac{x^2 - 2x - 11}{4}
$$

The Cartesian equation is $\boxed{y = \dfrac{x^2 - 2x - 11}{4}}$, a parabola.
===NOTE===
type: worked_example
title: Tangent to a parametric curve
---
A curve has parametric equations $x = t^2$, $y = t^3 - t$. Find the equation of the tangent at the point where $t = 2$.

**Step 1 — Differentiate each equation with respect to $t$.**
$$
\frac{dx}{dt} = 2t, \qquad \frac{dy}{dt} = 3t^2 - 1
$$

**Step 2 — Form $\frac{dy}{dx}$.**
$$
\frac{dy}{dx} = \frac{3t^2 - 1}{2t}
$$

**Step 3 — Evaluate the gradient at $t = 2$.**
$$
\frac{dy}{dx} = \frac{3(4) - 1}{2(2)} = \frac{11}{4}
$$

**Step 4 — Find the coordinates at $t = 2$.**
$$
x = 2^2 = 4, \qquad y = 2^3 - 2 = 6
$$
So the point is $(4, 6)$.

**Step 5 — Write the tangent equation** using $y - y_1 = m(x - x_1)$:
$$
y - 6 = \frac{11}{4}(x - 4)
$$
$$
y = \frac{11}{4}x - 11 + 6 = \frac{11}{4}x - 5
$$

The tangent is $\boxed{y = \dfrac{11}{4}x - 5}$.
===NOTE===
type: tip
title: Parametric Equations — Exam Tips & Common Mistakes
---
- For $\frac{dy}{dx}$, divide $\frac{dy}{dt}$ **by** $\frac{dx}{dt}$ — don't multiply, and don't differentiate the Cartesian equation by mistake.
- When eliminating the parameter with trig, look for the **right identity**: $\sin^2 + \cos^2 = 1$ for $\sin/\cos$, and $1 + \tan^2 = \sec^2$ for $\tan/\sec$.
- Always **state domain/range restrictions** carried over from the parametric form (e.g. $x = \cos\theta$ means $-1 \leq x \leq 1$).
- For areas, you **must convert the limits** from $x$-values to $t$-values, and remember the extra $\frac{dx}{dt}$ factor in the integrand.
- A common error is finding the point but forgetting to substitute $t$ into **both** $x$ and $y$.
- Vertical tangents (where $\frac{dx}{dt} = 0$) are easy to miss — these give an undefined $\frac{dy}{dx}$.
- Keep gradients as exact fractions, not rounded decimals, unless the question says otherwise.

===TOPIC=== differential-equations
===NOTE===
type: concept
title: Differential Equations — Revision Notes
---
## What is a Differential Equation?

A **differential equation (DE)** relates a function to its derivatives. A **first-order** DE involves only $\frac{dy}{dx}$. They model rates of change — growth, cooling, motion, mixing problems and more.

## Forming Differential Equations

Translate a rate statement into an equation. Key phrases:
- "rate of change of $P$" $\to \frac{dP}{dt}$.
- "proportional to" $\to$ introduce a constant $k$.

For example, "the population grows at a rate proportional to its size" becomes:
$$
\frac{dP}{dt} = kP
$$
"The rate of cooling is proportional to the temperature difference above the surroundings ($\theta_s$)" becomes:
$$
\frac{d\theta}{dt} = -k(\theta - \theta_s)
$$

## Solving by Separation of Variables

If a DE can be written as $\dfrac{dy}{dx} = f(x)g(y)$, separate the variables:
$$
\int \frac{1}{g(y)}\,dy = \int f(x)\,dx
$$
Steps:
1. Move all $y$ terms (with $dy$) to one side and all $x$ terms (with $dx$) to the other.
2. Integrate both sides.
3. Include a **single constant of integration** $c$.
4. Apply any boundary/initial conditions to find $c$ — this gives the **particular solution**.

## General and Particular Solutions

- The **general solution** contains the arbitrary constant $c$.
- The **particular solution** uses given conditions to fix $c$.

## Exponential Growth and Decay

The DE $\frac{dy}{dt} = ky$ has solution:
$$
y = Ae^{kt}
$$
- $k > 0$ gives growth; $k < 0$ gives decay.
- $A$ is the value of $y$ when $t = 0$.

## Modelling and Interpretation

- Always **define your variables** and state assumptions.
- Interpret the solution in context (e.g. long-term behaviour as $t \to \infty$).
- A limitation of many models is that they predict unbounded growth, which is unrealistic; refined models (like logistic growth) address this.
===NOTE===
type: formula
title: Differential Equations — Key Formulas
---
**Separation of variables**
$$
\frac{dy}{dx} = f(x)g(y) \implies \int \frac{1}{g(y)}\,dy = \int f(x)\,dx
$$

**Exponential growth/decay**
$$
\frac{dy}{dt} = ky \implies y = Ae^{kt}
$$
- $A = y$ when $t = 0$
- $k > 0$: growth, $k < 0$: decay

**Newton's law of cooling**
$$
\frac{d\theta}{dt} = -k(\theta - \theta_s)
$$

**Proportionality statements**
- Rate proportional to amount: $\dfrac{dP}{dt} = kP$
- Rate inversely proportional: $\dfrac{dP}{dt} = \dfrac{k}{P}$

**Standard integrals used**
$$
\int \frac{1}{y}\,dy = \ln|y| + c, \qquad \int e^{ky}\,dy = \frac{1}{k}e^{ky} + c
$$
===NOTE===
type: worked_example
title: Solving by separation of variables
---
Solve $\dfrac{dy}{dx} = \dfrac{2x}{y}$ given that $y = 3$ when $x = 0$.

**Step 1 — Separate the variables.** Move $y$ to the left and $x$ to the right:
$$
y\,dy = 2x\,dx
$$

**Step 2 — Integrate both sides.**
$$
\int y\,dy = \int 2x\,dx
$$
$$
\frac{y^2}{2} = x^2 + c
$$

**Step 3 — Apply the initial condition** $y = 3, x = 0$:
$$
\frac{9}{2} = 0 + c \implies c = \frac{9}{2}
$$

**Step 4 — Substitute $c$ back.**
$$
\frac{y^2}{2} = x^2 + \frac{9}{2}
$$

**Step 5 — Rearrange for $y$.** Multiply by $2$:
$$
y^2 = 2x^2 + 9 \implies y = \sqrt{2x^2 + 9}
$$
(Positive root chosen since $y = 3 > 0$.)

The particular solution is $\boxed{y = \sqrt{2x^2 + 9}}$.
===NOTE===
type: worked_example
title: Exponential decay model
---
A radioactive sample decays so that $\dfrac{dm}{dt} = -km$, where $m$ is the mass in grams and $t$ is time in years. Initially $m = 50$ g, and after $10$ years $m = 40$ g. Find $m$ in terms of $t$.

**Step 1 — Separate and integrate.**
$$
\int \frac{1}{m}\,dm = \int -k\,dt
$$
$$
\ln m = -kt + c
$$

**Step 2 — Solve for $m$** by exponentiating:
$$
m = e^{-kt + c} = Ae^{-kt}, \quad \text{where } A = e^c
$$

**Step 3 — Use $m = 50$ at $t = 0$.**
$$
50 = Ae^{0} \implies A = 50
$$
So $m = 50e^{-kt}$.

**Step 4 — Use $m = 40$ at $t = 10$ to find $k$.**
$$
40 = 50e^{-10k} \implies e^{-10k} = 0.8
$$
$$
-10k = \ln 0.8 \implies k = -\frac{\ln 0.8}{10} \approx 0.0223
$$

**Step 5 — Write the final model.**
$$
\boxed{m = 50e^{-0.0223t}}
$$
===NOTE===
type: tip
title: Differential Equations — Exam Tips & Common Mistakes
---
- When separating variables, **keep the $dy$ and $dx$** with their correct sides — treat them like algebraic quantities for this purpose.
- Only add **one constant of integration**, and add it immediately after integrating (often easiest on the $x$-side).
- Apply boundary conditions **as early as possible** — finding $c$ before over-rearranging avoids algebra errors.
- For growth/decay, $y = Ae^{kt}$: a **negative $k$** means decay. Read the context to decide the sign.
- Remember $\int \frac{1}{y}\,dy = \ln|y|$, and exponentiate carefully: $e^{kt + c} = e^c e^{kt}$, so the constant becomes a **multiplier** $A$.
- Don't forget to give the **particular solution** when conditions are provided — leaving $c$ in loses marks.
- When asked to interpret, comment on **long-term behaviour** and any limitations of the model.
- Watch units and round only at the **final step**.

===TOPIC=== numerical-methods
===NOTE===
type: concept
title: Numerical Methods — Revision Notes
---
## Why Numerical Methods?

Some equations cannot be solved exactly (algebraically). **Numerical methods** find approximate solutions to any required accuracy.

## Locating Roots — Change of Sign

If $f(x)$ is **continuous** on $[a, b]$ and $f(a)$ and $f(b)$ have **opposite signs**, then there is at least one root in $(a, b)$:
$$
f(a) \times f(b) < 0
$$
Limitations:
- The sign may not change if there is an **even number of roots** (e.g. a repeated root or two close roots) in the interval.
- The method fails near a **discontinuity** (e.g. asymptote), which can also produce a sign change without a root.

## Iteration

Rearrange $f(x) = 0$ into the form $x = g(x)$, then iterate:
$$
x_{n+1} = g(x_n)
$$
Starting from $x_0$, repeatedly apply $g$ to generate $x_1, x_2, \ldots$ which may **converge** to a root.

- Convergence depends on the rearrangement; different rearrangements behave differently.
- A **staircase** or **cobweb** diagram on the graphs of $y = x$ and $y = g(x)$ illustrates the behaviour.
- Convergence occurs (near the root) when $|g'(x)| < 1$.

## The Newton-Raphson Method

A faster iteration using the gradient:
$$
x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}
$$
- Usually converges very quickly.
- Can **fail** if $f'(x_n) = 0$ (horizontal tangent sends the next value far away) or if the starting value is poor.

## Numerical Integration — The Trapezium Rule

Approximate $\int_a^b y\,dx$ by dividing $[a, b]$ into $n$ strips of equal width $h = \frac{b - a}{n}$:
$$
\int_a^b y\,dx \approx \frac{h}{2}\Big[y_0 + y_n + 2(y_1 + y_2 + \cdots + y_{n-1})\Big]
$$
- The first and last ordinates are counted once; all interior ordinates are doubled.
- The rule **overestimates** for a curve that is concave up (convex), and **underestimates** for concave down — judge by the curvature.
- Accuracy improves as $n$ increases (strips get thinner).
===NOTE===
type: formula
title: Numerical Methods — Key Formulas
---
**Change of sign (root in $[a,b]$)**
$$
f(a)\times f(b) < 0 \quad (f \text{ continuous})
$$

**Fixed-point iteration**
$$
x_{n+1} = g(x_n)
$$
Converges near a root when $|g'(x)| < 1$.

**Newton-Raphson**
$$
x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}
$$

**Trapezium rule** with $h = \dfrac{b-a}{n}$:
$$
\int_a^b y\,dx \approx \frac{h}{2}\Big[y_0 + y_n + 2(y_1 + y_2 + \cdots + y_{n-1})\Big]
$$

- Concave up curve: trapezium rule **overestimates**.
- Concave down curve: trapezium rule **underestimates**.
===NOTE===
type: worked_example
title: Locating a root by change of sign
---
Show that the equation $x^3 - 4x + 1 = 0$ has a root between $x = 1$ and $x = 2$.

**Step 1 — Define $f(x)$.**
$$
f(x) = x^3 - 4x + 1
$$
This is a polynomial, so it is continuous everywhere.

**Step 2 — Evaluate at the endpoints.**
$$
f(1) = 1^3 - 4(1) + 1 = 1 - 4 + 1 = -2
$$
$$
f(2) = 2^3 - 4(2) + 1 = 8 - 8 + 1 = 1
$$

**Step 3 — Compare signs.**
$$
f(1) = -2 < 0 \quad \text{and} \quad f(2) = 1 > 0
$$
Since $f(1)$ and $f(2)$ have opposite signs and $f$ is continuous on $[1, 2]$, there is **at least one root in the interval $(1, 2)$**.

This is the required conclusion. $\boxed{\text{Root exists between } x = 1 \text{ and } x = 2.}$
===NOTE===
type: worked_example
title: Newton-Raphson iteration
---
Use the Newton-Raphson method with $x_0 = 2$ to find a root of $f(x) = x^3 - 5$, giving $x_2$ to 5 decimal places.

**Step 1 — Differentiate $f(x)$.**
$$
f(x) = x^3 - 5 \implies f'(x) = 3x^2
$$

**Step 2 — Write the iteration formula.**
$$
x_{n+1} = x_n - \frac{x_n^3 - 5}{3x_n^2}
$$

**Step 3 — Compute $x_1$ from $x_0 = 2$.**
$$
x_1 = 2 - \frac{2^3 - 5}{3(2)^2} = 2 - \frac{8 - 5}{12} = 2 - \frac{3}{12} = 2 - 0.25 = 1.75
$$

**Step 4 — Compute $x_2$ from $x_1 = 1.75$.**
$$
x_1^3 = 1.75^3 = 5.359375, \qquad 3x_1^2 = 3(3.0625) = 9.1875
$$
$$
x_2 = 1.75 - \frac{5.359375 - 5}{9.1875} = 1.75 - \frac{0.359375}{9.1875}
$$
$$
x_2 = 1.75 - 0.039116\ldots = 1.710884\ldots
$$

To 5 decimal places, $\boxed{x_2 = 1.71088}$. (The true value is $\sqrt[3]{5} \approx 1.70998$.)
===NOTE===
type: tip
title: Numerical Methods — Exam Tips & Common Mistakes
---
- For a change-of-sign argument, **always state that $f$ is continuous** and show both function values explicitly — quoting just "sign change" loses marks.
- Remember change of sign can **miss roots** (even number in the interval) and can be **fooled by asymptotes**; mention these limitations if asked.
- For iteration, set your calculator to **answer-recall** (ANS) mode to iterate quickly, and quote each $x_n$ to enough decimal places.
- To show a root is correct to a given accuracy, evaluate $f$ at the **two ends of the rounding interval** (e.g. $1.7305$ and $1.7315$) and show a sign change.
- In Newton-Raphson, the method **fails if $f'(x_n) = 0$** — always check the derivative isn't zero near your start point.
- For the trapezium rule, with $n$ strips there are $n + 1$ ordinates ($y_0$ to $y_n$). A classic mistake is using the wrong number of ordinates.
- Decide over/underestimate by considering the **concavity** of the curve, ideally with a quick sketch.
- Keep full calculator accuracy throughout and round **only at the end**.
