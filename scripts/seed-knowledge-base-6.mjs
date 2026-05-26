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
  // ─── OCR A-specific ───────────────────────────────────────────────────────────
  {
    type: 'tip',
    title: 'OCR A A-Level Maths — formula booklet and specification overview',
    topic_slug: null,
    content: `OCR A A-Level Maths provides a formula booklet in all exams (similar in scope to Edexcel).

OCR A formula booklet includes:
- Pure: standard integrals and derivatives, binomial expansion, logarithm laws, trig addition formulas, double angle formulas
- Statistics: binomial probability formula, normal distribution standardisation
- Mechanics: suvat equations (5 formulas given — unique to OCR A; AQA and Edexcel expect suvat to be memorised)

Must still memorise for OCR A (not provided):
- Arithmetic and geometric series formulas
- Sum to infinity of geometric series
- sin²θ + cos²θ = 1, other Pythagorean identities
- Circle equation (x−a)² + (y−b)² = r²
- Newton-Raphson formula

OCR A specification structure:
- Paper 1: Pure Mathematics (100 marks, 2 hours)
- Paper 2: Pure Mathematics and Statistics (100 marks, 2 hours)
- Paper 3: Pure Mathematics and Mechanics (100 marks, 2 hours)
- No large data set — unlike Edexcel and AQA, OCR A does not require prior knowledge of a specific dataset

OCR A question style:
- Less scaffolding than Edexcel — questions often presented as a single multi-mark part
- Proof questions are common and tend to be longer
- "Show that" answers must have every algebraic step visible
- Contextual interpretation required in Statistics and Mechanics (state answer in words, not just a number)
- Diagram labelling: axes, intercepts, and asymptotes must be fully labelled for full marks`
  },
  {
    type: 'tip',
    title: 'OCR A-Level Maths — question style and exam technique',
    topic_slug: null,
    content: `OCR A-Level Maths (both OCR A and OCR MEI) typically award marks using:
- M marks: method marks (correct approach, even if arithmetic is wrong)
- A marks: accuracy marks (correct answer, dependent on previous M mark)
- B marks: independent marks for a single correct value or statement
- E marks (MEI only): explanation or communication marks — full sentence required

Common OCR question command words and what they mean:
- "Find" — numerical answer needed, show sufficient working
- "Prove" or "Show that" — every step must be shown; no gaps; start from what's given
- "Hence" — must use the previous result; alternative methods score 0
- "Hence or otherwise" — using the hint is faster but alternative methods accepted
- "State" — no working required, just write the answer
- "Interpret" — write what the mathematical answer means in context (include units and real-world language)
- "Comment on the validity" — discuss assumptions or limitations of the model used

OCR GCSE Maths (J560):
- Three papers: J560/01 (non-calculator), J560/02 and J560/03 (calculator)
- The specification explicitly tests mathematical reasoning and problem-solving more than Edexcel GCSE
- Questions often present information in unfamiliar formats (tables, diagrams, worded scenarios)
- "Justify your answer" — brief written explanation required alongside calculation
- Fraction and exact answers are frequently preferred over decimals`
  },
  {
    type: 'tip',
    title: 'OCR A GCSE Maths — specification differences and question style',
    topic_slug: null,
    content: `OCR GCSE Maths (specification J560) covers the same national curriculum content as AQA and Edexcel but emphasises reasoning and problem-solving throughout.

OCR GCSE formula sheet provides: trapezium area, prism volume, sphere and cone volume/surface area, quadratic formula, sine rule, cosine rule, triangle area formula. Same as Edexcel.

What makes OCR GCSE distinctive:
1. More worded/contextual questions — mathematical situations presented in real-world settings where students must identify the correct technique
2. Multi-step problems are often a single question (not split into parts a, b, c) requiring sustained reasoning
3. Algebraic proof appears more frequently at Grade 7–9
4. Financial mathematics contexts (VAT, compound interest, loans) appear regularly
5. Proportionality and inverse proportion questions often combine with graph interpretation

OCR grade descriptors:
- Grade 5: students can apply standard techniques to familiar and unfamiliar contexts, interpret results
- Grade 7: students can construct and evaluate arguments, solve complex multi-step problems
- Grade 9: students demonstrate exceptional problem solving and mathematical communication

Preparation tips for OCR GCSE:
- Practise writing conclusions in context ("therefore the time taken is 3.5 hours")
- Show all working — method marks are available even for wrong answers
- For OCR, "estimate" means round to 1 significant figure and calculate mentally`
  },
  {
    type: 'tip',
    title: 'OCR A Statistics context — data interpretation and modelling',
    topic_slug: null,
    content: `OCR A Statistics (Paper 2) focuses on applying statistical techniques in context rather than rote calculation. Unlike Edexcel (which has a specific large data set), OCR A presents unfamiliar datasets in the exam itself.

Statistical problem solving process for OCR A:
1. Problem specification — identify the question being investigated
2. Planning — state variables, data type, sampling method, and any assumptions
3. Data collection — discuss how data would be collected and potential biases
4. Processing — calculate appropriate statistics (mean, SD, IQR, correlation, etc.)
5. Interpretation — write conclusions in context with reference to original question
6. Evaluation — discuss limitations, validity of model, whether conclusions are reliable

Key OCR A statistics exam techniques:
- When asked to "comment on the suitability of the model", name the distribution tested and explain why the assumptions are or are not met
- For hypothesis tests: always state H₀ and H₁ using the parameter (p or μ), give a p-value or compare test statistic to critical value, write a conclusion in context
- "Critique the data collection method" — mention specific bias: response bias, non-response bias, sampling frame issues, or observer effect
- For regression: state explicitly whether interpolation or extrapolation is used; only interpolation is reliable
- When comparing two datasets: always comment on both a measure of location AND a measure of spread`
  },

  // ─── OCR MEI-specific ─────────────────────────────────────────────────────────
  {
    type: 'tip',
    title: 'OCR MEI A-Level — comprehension paper strategy (Paper 4)',
    topic_slug: null,
    content: `OCR MEI A-Level Maths is unique in requiring a comprehension paper (Paper 4, 15 marks, 1 hour) that no other exam board sets.

What Paper 4 involves:
- A printed mathematical article (4–6 pages) is provided containing new mathematics beyond the A-Level specification
- Students read the article and answer questions that require applying ideas from the article, not prior knowledge
- Questions test mathematical reading, interpretation, and extension — not memory

The article topics vary by year but typically involve:
- Mathematical modelling (population growth, epidemics, physics applications)
- Pure mathematics extensions (iterative methods, number theory, series)
- Historical mathematical context (explaining an old technique in modern notation)
- Statistics in real-world contexts (medical trials, environmental data)

Comprehension paper technique:
1. Skim read the article first to understand the topic and notation used
2. For each question, locate the relevant section of the article before writing anything
3. "Using the result in paragraph 3..." — copy notation exactly from the article
4. When asked to "derive" a result from the article, show each algebraic step
5. "Explain in your own words..." — rephrase the article's idea without copying directly
6. If a formula is given in the article in a different form to what you need, show the conversion

This paper rewards careful reading and clear mathematical writing more than speed. Budget the full hour — do not rush. Students who have practised reading mathematical text perform significantly better.`
  },
  {
    type: 'tip',
    title: 'OCR MEI A-Level — specification differences and extra topics',
    topic_slug: null,
    content: `OCR MEI (Mathematics in Education and Industry) A-Level covers the same core content as other boards but with extra depth in numerical methods and mathematical modelling.

MEI-specific extra content:
1. Numerical Methods (own section, not just Newton-Raphson):
   - Fixed point iteration with cobweb and staircase diagrams
   - Error bounds and interval bisection
   - Step-by-step analysis of convergence/divergence of iteration

2. Mathematical modelling:
   - Setting up differential equations from verbal descriptions
   - Interpreting the behaviour of solutions over time
   - Refining models to better fit real data

3. Data analysis (in Statistics):
   - Spearman's rank correlation coefficient (tested more explicitly than other boards)
   - Interpreting scatter diagrams with context
   - Critique of sampling and data collection in given scenarios

MEI Paper structure:
- Paper 1: Pure Mathematics (2 hours, 100 marks)
- Paper 2: Pure Mathematics and Mechanics (2 hours, 100 marks)
- Paper 3: Pure Mathematics and Statistics (2 hours, 100 marks)
- Paper 4: Comprehension (1 hour, 60 marks scaled to 15) — unique to MEI
- Optional Further Mathematics papers available

MEI formula booklet: similar to OCR A — provides suvat equations, standard integrals and derivatives, binomial and normal distribution formulas. MEI also includes some additional formulas for the comprehension context if needed.

MEI strength: the comprehension paper and modelling emphasis mean MEI students often have stronger mathematical communication skills.`
  },
  {
    type: 'tip',
    title: 'OCR MEI formula booklet — provided formulas and memorisation list',
    topic_slug: null,
    content: `OCR MEI provides a formula booklet (MF27) in all exams. It is more extensive than AQA's booklet.

MF27 provides:
Pure:
- Quadratic formula
- Binomial expansion (both positive integer and general/rational powers with validity)
- Series: arithmetic and geometric sum formulas (UNLIKE AQA — these ARE given for MEI)
- Logarithm laws
- Differentiation: standard results for trigonometric and exponential/log functions
- Integration: extensive table of standard integrals including arcsin and arctan forms
- Vectors: scalar product definition

Statistics:
- Binomial P(X=r) formula and tables for cumulative binomial (not needed with calculator)
- Normal distribution: Z-formula and percentage points table
- Spearman's rank formula: rₛ = 1 − 6Σd²/[n(n²−1)]
- Confidence interval formulas (if applicable)

Mechanics:
- All 5 suvat equations (provided — no need to memorise)
- Impulse-momentum theorem: Ft = mv − mu

Must still memorise for MEI:
- Pythagorean identity sin²θ + cos²θ = 1 (and tan²θ, sec²θ versions)
- Circle equation (x−a)² + (y−b)² = r²
- Factor/remainder theorem
- Newton-Raphson formula (check your year's booklet — sometimes included, sometimes not)

Exam tip: MEI students often over-rely on the booklet. Know the booklet contents so well you can open it directly to the right page without hunting.`
  },
  {
    type: 'tip',
    title: 'OCR MEI Statistics — Spearman rank and contextual interpretation',
    topic_slug: null,
    content: `MEI places greater emphasis on Spearman's rank correlation coefficient than other A-Level boards.

Spearman's rank (rₛ): measures strength of monotonic relationship (does not require linearity, unlike PMCC).
Formula: rₛ = 1 − 6Σd²/[n(n²−1)]  where d = difference in ranks for each pair, n = number of pairs

Method:
1. Rank both variables (1 = smallest or largest — be consistent)
2. For tied values: assign mean of the ranks they would occupy (e.g. two items tying for 3rd get rank 3.5 each)
3. Find d = rank₁ − rank₂ for each pair
4. Compute Σd², substitute into formula

Interpreting rₛ:
- rₛ close to +1: strong positive correlation (as one increases, so does the other)
- rₛ close to −1: strong negative correlation
- rₛ close to 0: little or no monotonic relationship

Hypothesis test for rₛ:
H₀: no correlation in the population (ρₛ = 0)
H₁: positive/negative/non-zero correlation (one- or two-tailed)
Compare calculated |rₛ| to critical value from tables (provided in exam) at given significance level.

PMCC vs Spearman:
- Use PMCC when data is bivariate normal (or roughly so) and relationship is expected to be linear
- Use Spearman when data contains outliers, is ordinal/ranked data, or relationship may be non-linear but monotonic
- MEI exam questions often ask you to choose and justify which is more appropriate`
  },

  // ─── WJEC/Eduqas-specific ─────────────────────────────────────────────────────
  {
    type: 'tip',
    title: 'WJEC/Eduqas A-Level Maths — specification and formula booklet',
    topic_slug: null,
    content: `WJEC (Wales) and Eduqas (England schools choosing WJEC) offer A-Level Mathematics with a structure very similar to AQA but with some distinctive features.

WJEC A-Level paper structure:
- Unit 1: Pure Mathematics A (2.5 hours, 120 marks) — core pure
- Unit 2: Applied Mathematics A (2.5 hours, 120 marks) — statistics and mechanics combined
- Unit 3: Pure Mathematics B (1.5 hours, 75 marks) — further pure
- Unit 4: Applied Mathematics B (1.5 hours, 75 marks) — further applied

WJEC formula booklet: provided in all exams. Contains:
- Quadratic formula, binomial expansion (rational powers), logarithm laws
- Differentiation and integration standard results
- Trig: addition formulas, double angle formulas
- Statistics: binomial formula, normal distribution
- Mechanics: does NOT provide suvat — must be memorised (same as AQA)
- Arithmetic series: sum formula provided; geometric series: sum and sum-to-infinity provided

Must memorise for WJEC (not in booklet):
- All 5 suvat equations
- sin²θ + cos²θ = 1 and derived identities
- Circle equation
- Arithmetic series nth term

WJEC distinctive features:
- Assessment through both written exams and coursework option at some centres
- Questions often include real-world Welsh contexts (geography, industry, Welsh data)
- "Prove from first principles" appears regularly in Unit 1
- WJEC tends to test proof by induction at A-Level more frequently than AQA`
  },
  {
    type: 'tip',
    title: 'WJEC/Eduqas GCSE Maths — specification and exam style',
    topic_slug: null,
    content: `WJEC GCSE Maths (used in Wales) and Eduqas GCSE (used by some English schools) have a distinctive structure compared to AQA and Edexcel.

WJEC GCSE paper structure (Wales):
- Foundation: Unit 1 (non-calculator), Unit 2 (calculator)
- Higher: Unit 1 (non-calculator), Unit 2 (calculator)
- Numeracy papers also required for Welsh students (separate qualification)

Formula sheet: WJEC provides area of a trapezium, curved surface area of a cone, and sphere formulas. Students must memorise more than on Edexcel (e.g. Pythagoras is NOT given).

WJEC/Eduqas distinctive features:
1. Welsh context questions appear in the Wales specification (transport, geography, Welsh statistics)
2. Numeracy (functional maths) is embedded throughout — data interpretation, financial literacy, estimation
3. "Explain your method" is asked more frequently — written justification matters
4. Non-calculator Unit 1 is typically harder proportionally than other boards' non-calculator papers
5. Grade A* equivalent (Grade 9) questions test mathematical reasoning and proof explicitly

Eduqas (England):
- Follows the standard national curriculum but with WJEC-style question formatting
- Three papers (like AQA and Edexcel): 1 non-calculator, 2 calculator
- Formula sheet provided matches national standard (trapezium, cones, quadratic formula, etc.)
- Question style is slightly more worded/contextual than AQA — similar to OCR in this respect`
  },
  {
    type: 'tip',
    title: 'WJEC A-Level — statistics and mechanics applied options',
    topic_slug: null,
    content: `WJEC A-Level Maths covers both statistics and mechanics as compulsory applied content (same as Edexcel), unlike AQA which offers some choice for some specification versions.

WJEC Statistics topics (tested in Unit 2 and Unit 4):
- Probability: Venn diagrams, conditional probability, independence, tree diagrams
- Discrete distributions: binomial (B(n,p)), mean and variance
- Continuous distributions: normal distribution, standardisation, inverse normal
- Hypothesis testing: one-tailed and two-tailed using binomial and normal distributions
- Critical regions, Type I and Type II errors
- Correlation: PMCC, Spearman's rank (both tested), regression and interpolation
- Sampling: simple random, stratified, systematic, quota

WJEC Mechanics topics (tested in Unit 2 and Unit 4):
- Kinematics: suvat, velocity-time graphs, calculus-based motion
- Forces: Newton's laws, equilibrium, resolving forces on inclined planes
- Connected particles: Atwood machines, particles on tables
- Friction: coefficient of friction, limiting equilibrium
- Moments: principle of moments, uniform and non-uniform rods
- Energy: work, kinetic and potential energy, conservation of energy, power

WJEC Unit 4 (further applied) adds:
- Further statistics: Poisson distribution, hypothesis testing with normal
- Further mechanics: impulse and momentum, elastic collisions, projectiles with air resistance

Compared to AQA: WJEC tests Spearman's rank explicitly (AQA does not at standard A-Level), and both Poisson and further mechanics appear in Unit 4 where AQA might not cover these.`
  },

  // ─── Cross-board comparisons ─────────────────────────────────────────────────
  {
    type: 'tip',
    title: 'Comparing A-Level Maths exam boards — AQA vs Edexcel vs OCR vs MEI',
    topic_slug: null,
    content: `All A-Level Maths boards cover the same government-mandated core content (pure maths, statistics, mechanics). Differences are in emphasis, style, and formula support.

Formula booklet comparison:
- AQA: provides least — no suvat, no series formulas. Must memorise most formulas.
- Edexcel: provides similar to AQA — no suvat, no series formulas
- OCR A: provides suvat equations (unusual — most boards don't)
- OCR MEI: most generous — suvat, both series formulas, Spearman's formula, extensive integral table
- WJEC: provides geometric series formulas but NOT suvat

Large data set:
- AQA: has a large data set (varies by cohort — typically crime or health data)
- Edexcel: weather station data (Camborne, Hurn, Leeming, Heathrow, etc.)
- OCR A: no large data set — unfamiliar data given in exam
- OCR MEI: no large data set
- WJEC: no large data set

Unique features:
- OCR MEI: comprehension paper (Paper 4) — unique to MEI
- OCR MEI: stronger emphasis on mathematical modelling and numerical methods
- Edexcel: most heavily scaffolded questions (part a, b, c structure)
- AQA: questions often require students to choose their own method
- WJEC: numeracy qualification required alongside for Welsh students

Choosing a board (for students or schools):
- Students who prefer more formula support: OCR MEI
- Students who prefer structured scaffolding: Edexcel
- Students who prefer flexible problem solving: AQA or OCR A
- Students interested in mathematical reading: OCR MEI (comprehension paper rewards this)
- Welsh students: WJEC`
  },
  {
    type: 'tip',
    title: 'Comparing GCSE Maths exam boards — AQA vs Edexcel vs OCR vs WJEC',
    topic_slug: null,
    content: `GCSE Maths content is nationalised — all boards cover the same topics. Differences are in question style, formula provision, and emphasis.

Formula sheet comparison:
All main boards (AQA, Edexcel, OCR, WJEC/Eduqas) provide: trapezium area, prism volume, sphere/cone volume and surface area, quadratic formula, sine rule, cosine rule, triangle area formula.
Not provided on any sheet: Pythagoras, circle area/circumference, SOH CAH TOA, all angle rules, speed/density/pressure formulas.

Question style by board:
- AQA: mix of short and multi-step questions; problem-solving clearly signposted; foundation/higher papers well-differentiated
- Edexcel: more scaffolded (a, b, c subparts common); large number of 1–2 mark questions; more formulaic approach rewarded
- OCR: most worded/contextual; rewards reasoning and mathematical communication; fewer rote calculation questions
- WJEC: similar to OCR in contextual emphasis; Welsh contexts appear; numeracy (functional maths) integrated throughout

Grade 9 question patterns by board:
- AQA: algebraic proof, circle theorem combinations, harder vectors
- Edexcel: multi-step geometry, iterative methods, function composition
- OCR: extended reasoning tasks, proof, harder problem-solving with minimal structure
- WJEC: mathematical reasoning, justify your method questions

Recommendation:
- Students who prefer clear mark schemes and structured questions: Edexcel or AQA
- Students who prefer contextual problem-solving: OCR
- Students in Wales: WJEC (compulsory)
- For teaching: AQA has the most freely available past paper resources`
  },
  {
    type: 'tip',
    title: 'Formula booklet strategy — using all exam board booklets effectively',
    topic_slug: null,
    content: `Regardless of which exam board you are on, the formula booklet is a tool — using it effectively gains marks; ignoring it loses them.

Universal strategies:
1. Know exactly what IS in your booklet — so you spend time memorising what ISN'T
2. In the exam, open the booklet before you start Paper 1 and find each section's location (30 seconds well spent)
3. When applying a booklet formula: write the formula first exactly as shown, then substitute values on the next line
4. Never copy booklet formulas with errors — this is a very common way to lose accuracy marks

What no booklet provides (must memorise for ALL boards):
- sin²θ + cos²θ = 1 (and tan version: tan²θ + 1 = sec²θ)
- Circle equation: (x−a)² + (y−b)² = r²
- SOH CAH TOA and exact trig values (sin 30°=½, sin 45°=√2/2, sin 60°=√3/2)
- Pythagoras: a² + b² = c²
- Discriminant: b² − 4ac and its interpretation
- Factor theorem: if f(a) = 0 then (x−a) is a factor
- Area and circumference of a circle: πr², 2πr

What AQA specifically does NOT provide but Edexcel/OCR MEI do:
- Suvat equations (AQA: memorise all 5; OCR MEI: given)
- Geometric series sum to infinity (AQA: memorise; MEI: given)
- Spearman's rank formula (AQA: not tested; MEI: given)

The safest approach: memorise everything, then check whether your board provides it. You lose no time knowing the formula and also having it in the booklet — you only lose time hunting for a formula you should know cold.`
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
