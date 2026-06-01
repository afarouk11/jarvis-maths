===TOPIC=== quantities-units
===NOTE===
type: concept
title: Quantities & Units in Mechanics — Revision Notes
---
## Introduction

Mechanics is the study of how objects move and how forces affect them. Before tackling kinematics or dynamics, you must be fluent with the physical **quantities** involved, their **SI units**, and the crucial distinction between **scalars** and **vectors**.

## Scalars and Vectors

- A **scalar** has magnitude (size) only. Examples: distance, speed, mass, time, energy.
- A **vector** has both magnitude *and* direction. Examples: displacement, velocity, acceleration, force, weight, momentum.

The pairing matters in exams:

- **Distance** (scalar) vs **displacement** (vector) — displacement is the straight-line position change from start to finish.
- **Speed** (scalar) vs **velocity** (vector) — velocity includes direction; a sign change indicates a reversal.

## Fundamental (Base) Quantities and SI Units

The SI base quantities used in A-level Mechanics are:

- **Mass** — kilogram (kg)
- **Length / distance / displacement** — metre (m)
- **Time** — second (s)

## Derived Quantities

These are built from the base units:

- **Speed / velocity** — metres per second, $\text{m s}^{-1}$
- **Acceleration** — metres per second squared, $\text{m s}^{-2}$
- **Force / weight** — newton (N), where $1\ \text{N} = 1\ \text{kg m s}^{-2}$
- **Momentum** — $\text{kg m s}^{-1}$
- **Weight** — $W = mg$, a force measured in newtons

## Mass vs Weight

- **Mass** is the amount of matter in a body (kg) — it is constant everywhere.
- **Weight** is the gravitational force on the body, $W = mg$ (N) — it varies with $g$.
- Take $g = 9.8\ \text{m s}^{-2}$ unless told otherwise.

## Modelling Assumptions

A-level Mechanics relies on simplifying language. Know these standard terms:

- **Particle** — a body with negligible size; mass concentrated at a point (ignore rotation/air resistance on shape).
- **Light** — of negligible mass (e.g. a light string or rod).
- **Inextensible** (string) — does not stretch, so connected objects share the same acceleration.
- **Smooth** — frictionless surface or contact.
- **Rough** — surface exerts friction.
- **Rigid** — does not bend or deform.
- **Uniform** — mass evenly distributed, so the centre of mass is at the geometric centre.
- **Thin** — negligible thickness.

## Standard Conventions

- Choose a **positive direction** and stick to it; quantities opposing it become negative.
- Up is usually positive for vertical motion; if so, $g$ acts in the negative direction.
- State units in every final answer.

===NOTE===
type: formula
title: Quantities & Units in Mechanics — Key Formulas
---
- Weight: $$W = mg$$
- Take $g = 9.8\ \text{m s}^{-2}$ (Earth's gravitational acceleration) unless stated.
- Newton definition: $1\ \text{N} = 1\ \text{kg m s}^{-2}$
- SI base units: mass (kg), length (m), time (s)
- Derived units: velocity $\text{m s}^{-1}$, acceleration $\text{m s}^{-2}$, force (N), momentum $\text{kg m s}^{-1}$
- Momentum: $$p = mv$$

===NOTE===
type: worked_example
title: Converting units and computing weight
---
A box has mass $4.5\ \text{kg}$. Find its weight on Earth in newtons, then express its weight in kilonewtons.

**Step 1 — Use $W = mg$.**
Take $g = 9.8\ \text{m s}^{-2}$.
$$W = mg = 4.5 \times 9.8$$

**Step 2 — Evaluate.**
$$W = 44.1\ \text{N}$$

**Step 3 — Convert to kilonewtons.**
Since $1\ \text{kN} = 1000\ \text{N}$:
$$W = \frac{44.1}{1000} = 0.0441\ \text{kN}$$

The weight of the box is **$44.1\ \text{N}$ (equivalently $0.0441\ \text{kN}$)**.

===NOTE===
type: worked_example
title: Classifying scalars/vectors and converting speeds
---
A car travels at $54\ \text{km h}^{-1}$. (a) Convert this speed to $\text{m s}^{-1}$. (b) State whether speed and velocity are scalars or vectors.

**Step 1 — Set up the conversion.**
$1\ \text{km} = 1000\ \text{m}$ and $1\ \text{h} = 3600\ \text{s}$, so multiply by $\frac{1000}{3600} = \frac{5}{18}$.

**Step 2 — Convert.**
$$54 \times \frac{5}{18} = \frac{270}{18} = 15\ \text{m s}^{-1}$$

**Step 3 — Classify.**
- Speed has magnitude only, so it is a **scalar**.
- Velocity has magnitude and direction, so it is a **vector**.

The speed is **$15\ \text{m s}^{-1}$**; speed is a **scalar** and velocity is a **vector**.

===NOTE===
type: tip
title: Quantities & Units in Mechanics — Exam Tips & Common Mistakes
---
- Always write units with negative-index notation in answers: $\text{m s}^{-1}$, not "m/s", to match AQA mark schemes.
- Do not confuse mass (kg) with weight (N). "How heavy" in everyday speech often means weight in physics.
- When converting $\text{km h}^{-1}$ to $\text{m s}^{-1}$, multiply by $\frac{5}{18}$; to go back, multiply by $\frac{18}{5}$.
- Read modelling words carefully: "smooth" removes friction, "light" removes mass, "inextensible" means connected bodies share acceleration.
- Keep $g = 9.8\ \text{m s}^{-2}$ unless the question specifies $9.81$ or $10$. Using the wrong value loses accuracy marks.
- State a positive direction at the start of vector problems and apply signs consistently.
- A common slip is treating distance and displacement as identical — they differ whenever the object reverses or follows a curved path.

===TOPIC=== kinematics
===NOTE===
type: concept
title: Kinematics (incl. SUVAT and calculus methods) — Revision Notes
---
## What is Kinematics?

Kinematics describes motion — displacement, velocity, acceleration and time — **without** reference to the forces causing it. There are two toolkits: **SUVAT** equations for constant acceleration, and **calculus** for variable acceleration.

## Key Definitions

- **Displacement** $s$ — vector position change from a fixed origin.
- **Velocity** $v$ — rate of change of displacement, $v = \dfrac{\text{d}s}{\text{d}t}$.
- **Acceleration** $a$ — rate of change of velocity, $a = \dfrac{\text{d}v}{\text{d}t}$.
- **Deceleration** — negative acceleration relative to the direction of motion.

## Motion Graphs

- **Displacement–time graph:** gradient = velocity.
- **Velocity–time graph:** gradient = acceleration; **area under the graph = displacement**.
- **Acceleration–time graph:** area under = change in velocity.

A horizontal line on a velocity–time graph means constant velocity; a straight slope means constant acceleration.

## SUVAT — Constant Acceleration

Use these only when acceleration is constant. The five variables are $s, u, v, a, t$:

- $v = u + at$
- $s = ut + \tfrac{1}{2}at^2$
- $s = vt - \tfrac{1}{2}at^2$
- $s = \tfrac{1}{2}(u+v)t$
- $v^2 = u^2 + 2as$

**Method:** list $s, u, v, a, t$; identify the three you know and the one you want; pick the equation missing the unknown you do not need.

## Vertical Motion Under Gravity

Free fall (ignoring air resistance) is constant acceleration with $a = g = 9.8\ \text{m s}^{-2}$ downwards. Choose a positive direction (often "up positive", giving $a = -9.8$). At the highest point, $v = 0$.

## Variable Acceleration — Calculus

When $a$ depends on $t$, SUVAT fails. Use:

- **Differentiate to go down the chain:** $s \xrightarrow{\frac{\text{d}}{\text{d}t}} v \xrightarrow{\frac{\text{d}}{\text{d}t}} a$.
- **Integrate to go up the chain:** $a \xrightarrow{\int \text{d}t} v \xrightarrow{\int \text{d}t} s$.

Remember the **constant of integration** $+c$; find it using initial conditions (e.g. $v = u$ when $t = 0$).

- Velocity is maximum/minimum when $a = \dfrac{\text{d}v}{\text{d}t} = 0$.
- Distance over $[t_1, t_2]$ is $\displaystyle\int_{t_1}^{t_2} v\,\text{d}t$ (split at sign changes for total distance).

## Vectors in Kinematics

Position, velocity and acceleration can be written in $\mathbf{i}, \mathbf{j}$ form; differentiate/integrate component-wise.

===NOTE===
type: formula
title: Kinematics (incl. SUVAT and calculus methods) — Key Formulas
---
**SUVAT (constant acceleration):**
$$v = u + at$$
$$s = ut + \frac{1}{2}at^2$$
$$s = vt - \frac{1}{2}at^2$$
$$s = \frac{1}{2}(u+v)t$$
$$v^2 = u^2 + 2as$$

**Calculus (variable acceleration):**
$$v = \frac{\text{d}s}{\text{d}t}, \qquad a = \frac{\text{d}v}{\text{d}t} = \frac{\text{d}^2 s}{\text{d}t^2}$$
$$s = \int v\,\text{d}t, \qquad v = \int a\,\text{d}t$$

**Distance travelled between two times:**
$$\text{distance} = \int_{t_1}^{t_2} v\,\text{d}t$$

Use $g = 9.8\ \text{m s}^{-2}$ for vertical motion.

===NOTE===
type: worked_example
title: SUVAT — projectile thrown vertically upward
---
A ball is thrown vertically upward from ground level with speed $21\ \text{m s}^{-1}$. Taking $g = 9.8\ \text{m s}^{-2}$, find the maximum height reached.

**Step 1 — Choose direction and list SUVAT.**
Take up as positive.
$u = 21$, $v = 0$ (at top), $a = -9.8$, $s = ?$, $t$ not needed.

**Step 2 — Select the equation without $t$.**
$$v^2 = u^2 + 2as$$

**Step 3 — Substitute.**
$$0^2 = 21^2 + 2(-9.8)s$$
$$0 = 441 - 19.6s$$

**Step 4 — Solve for $s$.**
$$19.6s = 441 \implies s = \frac{441}{19.6} = 22.5$$

The maximum height reached is **$22.5\ \text{m}$**.

===NOTE===
type: worked_example
title: Variable acceleration — integrating to find displacement
---
A particle moves in a straight line with velocity $v = 3t^2 - 12t + 9\ \text{m s}^{-1}$ at time $t$ seconds. It starts at the origin. Find the displacement when $t = 4$.

**Step 1 — Integrate velocity to get displacement.**
$$s = \int (3t^2 - 12t + 9)\,\text{d}t = t^3 - 6t^2 + 9t + c$$

**Step 2 — Apply the initial condition.**
At $t = 0$, $s = 0$, so $c = 0$.
$$s = t^3 - 6t^2 + 9t$$

**Step 3 — Evaluate at $t = 4$.**
$$s = 4^3 - 6(4^2) + 9(4) = 64 - 96 + 36$$

**Step 4 — Compute.**
$$s = 4$$

The displacement from the origin at $t = 4$ is **$4\ \text{m}$**.

(Note: this is displacement, not total distance — the velocity factorises as $3(t-1)(t-3)$, so the particle reverses between $t=1$ and $t=3$.)

===NOTE===
type: tip
title: Kinematics (incl. SUVAT and calculus methods) — Exam Tips & Common Mistakes
---
- Only use SUVAT when acceleration is **constant**. If $a$ depends on $t$, switch to calculus immediately.
- Always list $s, u, v, a, t$ and choose the equation that omits the variable you neither know nor want.
- For vertical motion, fix a positive direction first; sign errors with $g$ are the most common mistake.
- At the highest point of vertical motion $v = 0$ — but acceleration is still $g$, not zero.
- Never forget the $+c$ when integrating; find it from initial conditions before substituting.
- Displacement and distance differ when the object reverses. For total distance, find when $v = 0$ and integrate $|v|$ over each interval separately.
- On a velocity–time graph, area gives displacement; a triangle/trapezium area is often faster than SUVAT.
- Keep full accuracy in intermediate steps and round only the final answer (usually 3 significant figures).

===TOPIC=== forces-newtons-laws
===NOTE===
type: concept
title: Forces & Newton's Laws — Revision Notes
---
## Forces

A **force** is a push or pull, measured in newtons (N); it is a vector. Common forces in A-level Mechanics:

- **Weight** $W = mg$ — acts vertically downward through the centre of mass.
- **Normal reaction** $R$ (or $N$) — perpendicular to the surface of contact.
- **Tension** $T$ — pull along a string or rod (string can only pull).
- **Thrust / compression** — push in a rod.
- **Friction** $F$ — opposes (attempted) relative motion, parallel to the surface.
- **Driving force / resistance** — applied or resistive forces along motion.

## Newton's Laws of Motion

- **First Law:** a body stays at rest or moves with constant velocity unless acted on by a resultant force. (Equilibrium when resultant $= 0$.)
- **Second Law:** the resultant force equals mass times acceleration, $F = ma$, in the direction of the acceleration.
- **Third Law:** for every action there is an equal and opposite reaction. The two forces act on *different* bodies.

## Resultant Force and Resolving

The **resultant** is the single force equivalent to all forces combined. To analyse a problem:

1. Draw a clear **force diagram** showing every force.
2. **Resolve** forces into perpendicular directions (often horizontal/vertical, or along/perpendicular to a slope).
3. Apply $F = ma$ in each direction (or set resultant $= 0$ for equilibrium).

To resolve a force $F$ at angle $\theta$ to a direction: component along $= F\cos\theta$, component perpendicular $= F\sin\theta$.

## Equilibrium

A particle is in equilibrium when the resultant force is zero. Then in each direction the opposing components balance:
- Horizontal components sum to zero.
- Vertical components sum to zero.

## Connected Particles

For bodies joined by an inextensible string (e.g. over a pulley):

- They share the same **magnitude of acceleration**.
- The string tension is the same throughout (smooth, light pulley).
- Apply $F = ma$ to each body separately, then solve simultaneously. You can also treat the whole system as one to find acceleration, then a single body to find tension.

## Pulleys

For a smooth, light pulley, the tension is equal on both sides and the string is inextensible, so the two connected masses accelerate at the same rate in opposite "directions" along the string.

===NOTE===
type: formula
title: Forces & Newton's Laws — Key Formulas
---
- Newton's Second Law: $$F = ma$$ (resultant force in the direction of acceleration)
- Weight: $$W = mg$$
- Resolving a force $F$ at angle $\theta$: along $= F\cos\theta$, perpendicular $= F\sin\theta$
- Equilibrium: resultant $= 0$, so $\sum F_x = 0$ and $\sum F_y = 0$
- Normal reaction on horizontal ground (no vertical acceleration): $$R = mg$$
- Connected particles: same magnitude of $a$; common tension $T$ in a light inextensible string over a smooth pulley.

===NOTE===
type: worked_example
title: Newton's Second Law on a horizontal surface
---
A block of mass $6\ \text{kg}$ on a smooth horizontal floor is pulled by a horizontal force of $24\ \text{N}$. Find the acceleration and the normal reaction. Take $g = 9.8\ \text{m s}^{-2}$.

**Step 1 — Resolve horizontally and apply $F = ma$.**
The only horizontal force is the $24\ \text{N}$ pull (smooth = no friction).
$$F = ma \implies 24 = 6a$$

**Step 2 — Solve for acceleration.**
$$a = \frac{24}{6} = 4\ \text{m s}^{-2}$$

**Step 3 — Resolve vertically for the reaction.**
No vertical acceleration, so $R = mg$.
$$R = 6 \times 9.8 = 58.8\ \text{N}$$

The acceleration is **$4\ \text{m s}^{-2}$** and the normal reaction is **$58.8\ \text{N}$**.

===NOTE===
type: worked_example
title: Connected particles over a smooth pulley
---
Masses $3\ \text{kg}$ and $5\ \text{kg}$ hang either side of a smooth light pulley by a light inextensible string and are released from rest. Find the acceleration and the tension. Take $g = 9.8\ \text{m s}^{-2}$.

**Step 1 — Set up equations for each mass.**
The $5\ \text{kg}$ mass descends, the $3\ \text{kg}$ rises; let acceleration be $a$ and tension $T$.

For the $5\ \text{kg}$ mass (down positive):
$$5g - T = 5a$$

For the $3\ \text{kg}$ mass (up positive):
$$T - 3g = 3a$$

**Step 2 — Add the equations to eliminate $T$.**
$$5g - 3g = 5a + 3a$$
$$2g = 8a \implies a = \frac{2 \times 9.8}{8} = 2.45\ \text{m s}^{-2}$$

**Step 3 — Substitute back to find $T$.**
$$T = 3g + 3a = 3(9.8) + 3(2.45) = 29.4 + 7.35 = 36.75\ \text{N}$$

The acceleration is **$2.45\ \text{m s}^{-2}$** and the tension is **$36.75\ \text{N}$**.

===NOTE===
type: tip
title: Forces & Newton's Laws — Exam Tips & Common Mistakes
---
- Always draw a force diagram first, marking weight, reaction, tension and friction. Missing a force is the top cause of lost marks.
- Newton's Third Law pair forces act on **different** objects — do not pair weight with normal reaction (they act on the same body).
- Resolve along sensible axes: for slopes, use directions along and perpendicular to the slope, not horizontal/vertical.
- Remember $F = ma$ uses the **resultant** force, not a single force, and points in the direction of acceleration.
- For connected particles, write $F = ma$ for each body separately; tension is the same throughout a light string over a smooth pulley.
- On a horizontal surface $R = mg$ only if there is no vertical component of applied force and no vertical acceleration. An angled pull changes $R$.
- Keep directions consistent: pick "positive" once per axis and apply it to every term.

===TOPIC=== moments
===NOTE===
type: concept
title: Moments — Revision Notes
---
## What is a Moment?

A **moment** is the turning effect of a force about a point (the pivot or fulcrum). It measures how strongly a force tends to rotate an object.

## Calculating a Moment

The moment of a force about a point is:
$$\text{moment} = \text{force} \times \text{perpendicular distance from the point to the line of action}$$

- Units: **newton metres (N m)**.
- A moment has a sense: **clockwise** or **anticlockwise**.
- The distance must be **perpendicular** to the force's line of action. If a force acts at an angle, either use the perpendicular distance or resolve the force.

For a force $F$ acting at distance $d$ from the pivot, at angle $\theta$ to the line joining them:
$$\text{moment} = F \, d \sin\theta$$

## The Principle of Moments

A rigid body is in **rotational equilibrium** about a point when:
$$\text{total clockwise moments} = \text{total anticlockwise moments}$$

For **full equilibrium** of a rigid body, two conditions hold:

1. **Resultant force = 0** (no translation): vertical and horizontal forces balance.
2. **Resultant moment = 0** (no rotation): take moments about any point and set clockwise = anticlockwise.

## Choosing a Pivot

You may take moments about *any* point. Choosing a point where an unknown force acts eliminates that force (its moment is zero), simplifying the algebra. This is the key strategy for beam problems.

## Centre of Mass

- For a **uniform** rod or beam, the weight acts at its **midpoint** (centre of mass).
- Modelling a rod as uniform lets you treat its entire weight as a single downward force at the centre.
- For a non-uniform rod, the centre of mass position may itself be unknown and found using moments.

## Typical Problems

- **Beams on supports:** a uniform beam rests on two supports; find the reaction at each support using the principle of moments and vertical equilibrium.
- **Tilting / on the point of tilting:** when a beam is about to tip about a support, the reaction at the *other* support is zero. Set that reaction to zero and solve.
- **Loaded beams:** people or masses placed on a plank create additional moments.

## Method Summary

1. Draw a diagram with all forces and their distances.
2. Resolve vertically: sum of upward forces = sum of downward forces.
3. Take moments about a convenient point: clockwise = anticlockwise.
4. Solve the resulting equations simultaneously.

===NOTE===
type: formula
title: Moments — Key Formulas
---
- Moment of a force (perpendicular): $$M = F \times d$$
- Moment of a force at angle $\theta$: $$M = F\,d\sin\theta$$
- Units: newton metres (N m)
- Principle of moments (equilibrium): $$\sum M_{\text{clockwise}} = \sum M_{\text{anticlockwise}}$$
- Full rigid-body equilibrium: resultant force $= 0$ **and** resultant moment $= 0$
- On the point of tilting about a support: the reaction at the other support $= 0$
- Uniform rod: weight acts at the midpoint.

===NOTE===
type: worked_example
title: Reactions on a uniform beam with two supports
---
A uniform beam $AB$ of length $4\ \text{m}$ and weight $200\ \text{N}$ rests horizontally on supports at $A$ and $B$. A load of $100\ \text{N}$ hangs $1\ \text{m}$ from $A$. Find the reactions $R_A$ and $R_B$. Take $g = 9.8\ \text{m s}^{-2}$ (weights already given in N).

**Step 1 — Identify forces and distances from $A$.**
- $R_A$ up at $A$ (distance 0)
- $R_B$ up at $B$ (distance 4)
- Beam weight $200\ \text{N}$ down at midpoint (distance 2)
- Load $100\ \text{N}$ down at distance 1

**Step 2 — Take moments about $A$ (eliminates $R_A$).**
Clockwise (loads) = anticlockwise ($R_B$):
$$200(2) + 100(1) = R_B(4)$$
$$400 + 100 = 4R_B \implies 500 = 4R_B$$
$$R_B = 125\ \text{N}$$

**Step 3 — Resolve vertically for $R_A$.**
$$R_A + R_B = 200 + 100 = 300$$
$$R_A = 300 - 125 = 175\ \text{N}$$

The reactions are **$R_A = 175\ \text{N}$** and **$R_B = 125\ \text{N}$**.

===NOTE===
type: worked_example
title: On the point of tilting
---
A uniform plank $PQ$ of length $6\ \text{m}$ and weight $300\ \text{N}$ rests on supports, one at $P$ and one $2\ \text{m}$ from $Q$ (call it $S$). A child of weight $W$ stands at $Q$. The plank is on the point of tilting about $S$. Find $W$.

**Step 1 — Use the tilting condition.**
On the point of tilting about $S$, the reaction at $P$ is zero. So only the weight at the centre, the weight $W$ at $Q$, and the reaction at $S$ act.

**Step 2 — Locate distances from $S$.**
$S$ is $2\ \text{m}$ from $Q$, so $4\ \text{m}$ from $P$. The centre of the plank is at $3\ \text{m}$ from $P$, i.e. $1\ \text{m}$ from $S$ on the $P$ side. The child at $Q$ is $2\ \text{m}$ from $S$ on the $Q$ side.

**Step 3 — Take moments about $S$.**
Anticlockwise (plank weight, tending to tip $P$ side down) = clockwise (child at $Q$):
$$300(1) = W(2)$$

**Step 4 — Solve.**
$$300 = 2W \implies W = 150\ \text{N}$$

The child's weight is **$W = 150\ \text{N}$**.

===NOTE===
type: tip
title: Moments — Exam Tips & Common Mistakes
---
- Take moments about a point where an unknown force acts — its moment is zero, removing it from the equation.
- Use the **perpendicular** distance. For an angled force, either resolve the force or multiply by $\sin\theta$ for the perpendicular component.
- For a uniform beam, the entire weight acts at the midpoint. Forgetting this force is a frequent error.
- "On the point of tilting" means the reaction at the support being lifted off is **zero** — set it to zero, do not ignore the whole condition.
- Always combine the moments equation with vertical equilibrium ($\sum$ up $= \sum$ down) to find both reactions.
- Keep clockwise and anticlockwise senses consistent; label distances carefully from your chosen pivot.
- Units of moments are N m, never N. Check the dimensions of your answer.

===TOPIC=== projectiles
===NOTE===
type: concept
title: Projectiles — Revision Notes
---
## What is a Projectile?

A **projectile** is an object launched into the air and moving freely under gravity alone (air resistance ignored). Its motion is two-dimensional and is analysed by treating **horizontal and vertical motion independently**.

## The Key Principle

- **Horizontal:** no force acts (no air resistance), so horizontal velocity is **constant**; acceleration $= 0$.
- **Vertical:** gravity gives constant acceleration $g = 9.8\ \text{m s}^{-2}$ downward.
- **Time** is the link between the two directions — the same $t$ applies to both.

## Components of Initial Velocity

If launched with speed $u$ at angle $\theta$ above the horizontal:

- Horizontal component: $u_x = u\cos\theta$
- Vertical component: $u_y = u\sin\theta$

## Equations of Motion

**Horizontal (constant velocity):**
$$x = (u\cos\theta)\,t$$

**Vertical (constant acceleration, up positive):**
$$y = (u\sin\theta)\,t - \tfrac{1}{2}gt^2$$
$$v_y = u\sin\theta - gt$$
$$v_y^2 = (u\sin\theta)^2 - 2gy$$

## Key Features of the Trajectory

- **Time to maximum height:** vertical velocity is zero at the top, so $t = \dfrac{u\sin\theta}{g}$.
- **Maximum height:** $H = \dfrac{(u\sin\theta)^2}{2g}$.
- **Time of flight (level ground):** twice the time to the top, $T = \dfrac{2u\sin\theta}{g}$.
- **Range (level ground):** $R = \dfrac{u^2 \sin 2\theta}{g}$, maximised at $\theta = 45°$.
- The path is a **parabola**; the trajectory is symmetric about the highest point for level ground.

## Speed and Direction at a Point

At any instant the velocity has components $v_x = u\cos\theta$ (constant) and $v_y$. Then:

- Speed $= \sqrt{v_x^2 + v_y^2}$.
- Direction (angle to horizontal) $= \arctan\!\left(\dfrac{v_y}{v_x}\right)$.

## Method for Projectile Problems

1. Resolve the initial velocity into horizontal and vertical components.
2. Treat each direction with its own SUVAT (horizontal: $a=0$; vertical: $a=-g$).
3. Use time $t$ to connect the directions.
4. Watch signs: decide up positive, and note the landing height (which may be below launch).

===NOTE===
type: formula
title: Projectiles — Key Formulas
---
**Initial components (speed $u$, angle $\theta$):**
$$u_x = u\cos\theta, \qquad u_y = u\sin\theta$$

**Horizontal motion:**
$$x = (u\cos\theta)\,t$$

**Vertical motion (up positive, $a = -g$):**
$$y = (u\sin\theta)\,t - \frac{1}{2}gt^2$$
$$v_y = u\sin\theta - gt$$

**Standard results (level ground):**
$$\text{time to top} = \frac{u\sin\theta}{g}$$
$$\text{max height } H = \frac{(u\sin\theta)^2}{2g}$$
$$\text{time of flight } T = \frac{2u\sin\theta}{g}$$
$$\text{range } R = \frac{u^2\sin 2\theta}{g}$$

**Speed at a point:** $\sqrt{v_x^2 + v_y^2}$; **direction:** $\arctan(v_y/v_x)$.

===NOTE===
type: worked_example
title: Range and maximum height of a projectile
---
A ball is projected from level ground at $28\ \text{m s}^{-1}$ at $30°$ above the horizontal. Taking $g = 9.8\ \text{m s}^{-2}$, find (a) the maximum height and (b) the horizontal range.

**Step 1 — Resolve the initial velocity.**
$$u_x = 28\cos 30° = 28 \times \frac{\sqrt 3}{2} = 24.25\ \text{m s}^{-1}$$
$$u_y = 28\sin 30° = 28 \times 0.5 = 14\ \text{m s}^{-1}$$

**Step 2 — Maximum height (vertical, $v_y = 0$).**
$$H = \frac{u_y^2}{2g} = \frac{14^2}{2 \times 9.8} = \frac{196}{19.6} = 10\ \text{m}$$

**Step 3 — Time of flight.**
$$T = \frac{2u_y}{g} = \frac{2 \times 14}{9.8} = \frac{28}{9.8} = 2.857\ \text{s}$$

**Step 4 — Range (horizontal distance in time $T$).**
$$R = u_x \times T = 24.25 \times 2.857 = 69.3\ \text{m}$$

The maximum height is **$10\ \text{m}$** and the range is **$69.3\ \text{m}$** (3 s.f.).

===NOTE===
type: worked_example
title: Projectile launched from a height
---
A stone is thrown horizontally at $15\ \text{m s}^{-1}$ from the top of a cliff $20\ \text{m}$ high. Find (a) the time to reach the sea and (b) the horizontal distance travelled. Take $g = 9.8\ \text{m s}^{-2}$.

**Step 1 — Set up vertical motion (down positive).**
Initial vertical velocity $u_y = 0$ (thrown horizontally), $a = 9.8$, $y = 20$.
$$y = u_y t + \tfrac{1}{2}gt^2 \implies 20 = 0 + \tfrac{1}{2}(9.8)t^2$$

**Step 2 — Solve for $t$.**
$$20 = 4.9t^2 \implies t^2 = \frac{20}{4.9} = 4.082$$
$$t = \sqrt{4.082} = 2.02\ \text{s}$$

**Step 3 — Horizontal distance (constant velocity).**
$$x = u_x t = 15 \times 2.02 = 30.3\ \text{m}$$

The stone reaches the sea after **$2.02\ \text{s}$**, landing **$30.3\ \text{m}$** from the base of the cliff (3 s.f.).

===NOTE===
type: tip
title: Projectiles — Exam Tips & Common Mistakes
---
- Resolve the initial velocity into horizontal and vertical components first — this is the single most important step.
- Horizontal velocity is **constant** ($a = 0$); only the vertical motion accelerates. Do not apply $g$ horizontally.
- Use the **same time $t$** for both directions; time is what links them.
- Decide a positive vertical direction and keep signs consistent. If launched from a height, the landing displacement is negative (or use down positive).
- At maximum height the **vertical** velocity is zero, but the horizontal velocity (and hence speed) is not.
- For "speed on landing", combine both components with Pythagoras; for direction use $\arctan(v_y/v_x)$.
- Do not assume the trajectory is symmetric when launch and landing heights differ — only level-ground flights are symmetric.
- Keep $\cos\theta$ and $\sin\theta$ values accurate; rounding early causes range errors.

===TOPIC=== friction
===NOTE===
type: concept
title: Friction — Revision Notes
---
## What is Friction?

**Friction** is a force that opposes (or tends to oppose) relative motion between two surfaces in contact. It acts **parallel to the surface**, in the direction opposing the (attempted) sliding.

## Key Properties

- Friction is a **self-adjusting** force up to a maximum. If a small force is applied to a stationary object, friction matches it exactly so the object stays still.
- Friction cannot exceed its **limiting (maximum) value**. Beyond this, the object begins to slide.
- It depends on the **normal reaction** $R$ and the **coefficient of friction** $\mu$, not on the contact area.

## The Coefficient of Friction

$\mu$ is a dimensionless constant for a given pair of surfaces. The maximum (limiting) friction is:
$$F_{\max} = \mu R$$

- While stationary and not on the point of moving: $F \le \mu R$.
- On the point of moving (**limiting equilibrium**): $F = \mu R$.
- While sliding: $F = \mu R$ (taking $\mu$ as the coefficient of friction).

A **smooth** surface has $\mu = 0$; a **rough** surface has $\mu > 0$.

## Friction on a Horizontal Surface

For a block on level ground with no vertical applied force, $R = mg$, so $F_{\max} = \mu m g$. The object moves only when the applied horizontal force exceeds $\mu m g$.

## Friction on an Inclined Plane

For a particle on a slope inclined at angle $\alpha$:

- Resolve **perpendicular** to the slope: $R = mg\cos\alpha$ (if no other perpendicular force).
- Resolve **along** the slope: the component of weight down the slope is $mg\sin\alpha$.
- Maximum friction is $\mu R = \mu mg\cos\alpha$.

**On the point of slipping down a slope (no other forces):**
$$mg\sin\alpha = \mu mg\cos\alpha \implies \mu = \tan\alpha$$
The angle at which sliding just begins is the **angle of friction**, $\lambda = \arctan\mu$.

## Method for Friction Problems

1. Draw a force diagram including friction (correct direction — opposing motion).
2. Resolve perpendicular to the surface to find $R$.
3. Resolve along the surface and apply $F = ma$ (or equilibrium).
4. Use $F = \mu R$ if sliding or in limiting equilibrium; otherwise $F \le \mu R$.

## Direction Matters

If an object moves up a slope, friction acts down the slope; if it slides down, friction acts up. Always set friction to oppose the actual or impending motion.

===NOTE===
type: formula
title: Friction — Key Formulas
---
- Limiting friction: $$F_{\max} = \mu R$$
- General (stationary): $$F \le \mu R$$
- On a horizontal surface (no vertical applied force): $$R = mg, \qquad F_{\max} = \mu m g$$
- On an inclined plane at angle $\alpha$:
$$R = mg\cos\alpha, \qquad \text{(weight component along slope)} = mg\sin\alpha$$
- Maximum friction on a slope: $$\mu R = \mu m g \cos\alpha$$
- Angle of friction: $$\lambda = \arctan\mu$$
- On the point of sliding down a plane (no other forces): $$\mu = \tan\alpha$$

===NOTE===
type: worked_example
title: Will the block move on a horizontal surface?
---
A block of mass $8\ \text{kg}$ rests on rough horizontal ground with coefficient of friction $\mu = 0.3$. A horizontal force of $20\ \text{N}$ is applied. Determine whether the block moves, and if so find its acceleration. Take $g = 9.8\ \text{m s}^{-2}$.

**Step 1 — Find the normal reaction.**
No vertical applied force, so $R = mg = 8 \times 9.8 = 78.4\ \text{N}$.

**Step 2 — Find maximum (limiting) friction.**
$$F_{\max} = \mu R = 0.3 \times 78.4 = 23.52\ \text{N}$$

**Step 3 — Compare with the applied force.**
Applied force $= 20\ \text{N} < F_{\max} = 23.52\ \text{N}$.
Since the applied force is below the limiting friction, friction adjusts to $20\ \text{N}$ and the block stays still.

**Step 4 — Conclusion.**
The block does **not** move; its acceleration is **$0\ \text{m s}^{-2}$**, and friction acts at $20\ \text{N}$ (less than its maximum).

===NOTE===
type: worked_example
title: Particle sliding down a rough inclined plane
---
A particle of mass $5\ \text{kg}$ slides down a rough plane inclined at $25°$ to the horizontal. The coefficient of friction is $\mu = 0.2$. Find the acceleration. Take $g = 9.8\ \text{m s}^{-2}$.

**Step 1 — Resolve perpendicular to the slope.**
$$R = mg\cos 25° = 5 \times 9.8 \times \cos 25° = 49 \times 0.9063 = 44.41\ \text{N}$$

**Step 2 — Find the friction force (sliding down, so friction acts up the slope).**
$$F = \mu R = 0.2 \times 44.41 = 8.882\ \text{N}$$

**Step 3 — Resolve along the slope and apply $F = ma$ (down positive).**
Weight component down the slope $= mg\sin 25° = 49 \times 0.4226 = 20.71\ \text{N}$.
$$mg\sin 25° - F = ma$$
$$20.71 - 8.882 = 5a$$
$$11.83 = 5a$$

**Step 4 — Solve for acceleration.**
$$a = \frac{11.83}{5} = 2.37\ \text{m s}^{-2}$$

The acceleration down the slope is **$2.37\ \text{m s}^{-2}$** (3 s.f.).

===NOTE===
type: tip
title: Friction — Exam Tips & Common Mistakes
---
- Friction opposes motion or its tendency. Always draw it acting **against** the direction the object moves or would move.
- Use $F = \mu R$ only when the object is **moving** or in **limiting equilibrium**. For a stationary object not on the point of moving, friction is whatever balances the applied force, up to $\mu R$.
- On a slope, $R = mg\cos\alpha$, **not** $mg$. Forgetting the $\cos\alpha$ is the most common error.
- The component of weight down a slope is $mg\sin\alpha$; perpendicular is $mg\cos\alpha$. Do not swap sin and cos.
- "Smooth" means $\mu = 0$ (no friction); "rough" means friction is present.
- Always check whether the applied force exceeds limiting friction before assuming the object accelerates.
- For limiting equilibrium on a plane with no other forces, $\mu = \tan\alpha$ — a quick way to find $\mu$ from the angle of slipping.
- Resolve perpendicular to the surface first to get $R$, then along the surface for motion.
