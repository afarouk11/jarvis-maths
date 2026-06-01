===TOPIC=== statistical-sampling
===NOTE===
type: concept
title: Statistical Sampling — Revision Notes
---
## Populations and Samples

- A **population** is the entire set of items or individuals you are interested in. It can be finite (every student in a school) or effectively infinite (every possible measurement of a length).
- A **sample** is a selected subset of the population, used to make inferences about the whole population.
- A **census** observes every member of the population. It gives an exact picture but is often expensive, time-consuming, and sometimes impossible (e.g. testing destroys items).
- A **sampling unit** is an individual member of the population.
- A **sampling frame** is a list of all sampling units (e.g. a register, a database). If no such list exists, only certain methods are possible.

## Why Sample?

- Cheaper and faster than a census.
- Necessary when testing is destructive.
- The trade-off: a sample gives only an estimate, and may not perfectly represent the population.

## Random Sampling Methods

### Simple Random Sampling
- Every possible sample of size $n$ has an **equal chance** of being selected.
- Requires a sampling frame. Each unit is numbered, and units are chosen using random numbers or a lottery (names from a hat).
- **Advantage:** free of bias, easy for small populations. **Disadvantage:** needs a full frame; can be unrepresentative by chance.

### Systematic Sampling
- Choose units at **regular intervals** from an ordered list. Interval $k = \dfrac{N}{n}$ where $N$ is population size and $n$ is sample size.
- Choose a random starting point between $1$ and $k$, then take every $k$th unit.
- **Advantage:** simple, spread across the population. **Disadvantage:** can introduce bias if the list has a periodic pattern.

### Stratified Sampling
- The population is divided into **strata** (non-overlapping groups, e.g. by age or gender). The sample drawn from each stratum is **proportional** to the stratum's size.
- Number from a stratum $= \dfrac{\text{stratum size}}{\text{population size}} \times \text{sample size}$.
- **Advantage:** reflects population structure, reducing sampling error. **Disadvantage:** strata must be clearly identifiable.

## Non-Random Sampling Methods

### Quota Sampling
- The interviewer selects units (non-randomly) to fill set quotas matching the population's structure.
- **Advantage:** no sampling frame needed, quick. **Disadvantage:** non-random, so prone to interviewer bias; not truly representative.

### Opportunity (Convenience) Sampling
- Sample taken from those who are available and willing at the time.
- **Advantage:** very cheap and easy. **Disadvantage:** highly unrepresentative and biased.

## Choosing a Method

- Consider whether a sampling frame exists, the cost, and the need to avoid bias. Random methods reduce bias but need a frame; non-random methods are convenient but riskier.
===NOTE===
type: formula
title: Statistical Sampling — Key Formulas
---
**Systematic sampling interval:**
$$
k = \frac{N}{n}
$$
where $N$ = population size, $n$ = sample size.

**Stratified sampling — number selected from a stratum:**
$$
n_{\text{stratum}} = \frac{\text{size of stratum}}{N} \times n
$$

**Key relationships:**
- Sample size $n$, population size $N$.
- Census: $n = N$ (every unit observed).
- In simple random sampling every sample of size $n$ is equally likely.
===NOTE===
type: worked_example
title: Calculating a stratified sample
---
A college has 1200 students: 540 in Year 12 and 660 in Year 13. A stratified sample of 80 students is required. How many should be taken from each year group?

**Step 1 — Sampling fraction.** The overall fraction is
$$
\frac{n}{N} = \frac{80}{1200} = \frac{1}{15}.
$$

**Step 2 — Year 12.** Multiply the stratum size by the fraction:
$$
540 \times \frac{1}{15} = 36.
$$

**Step 3 — Year 13.**
$$
660 \times \frac{1}{15} = 44.
$$

**Step 4 — Check.** $36 + 44 = 80$, matching the required sample size.

**Take 36 students from Year 12 and 44 from Year 13.**
===NOTE===
type: worked_example
title: Systematic sampling from a list
---
A factory produces 2000 items in a shift, listed in production order. A quality inspector wants a sample of 50. Describe how to use systematic sampling and identify which items are chosen if the random start is 14.

**Step 1 — Find the interval.**
$$
k = \frac{N}{n} = \frac{2000}{50} = 40.
$$

**Step 2 — Random start.** Choose a random number between 1 and 40. Here it is given as 14, so the first item selected is item number **14**.

**Step 3 — Select every 40th item afterwards.** The selected items are:
$$
14, \; 54, \; 94, \; 134, \; \dots
$$
i.e. item number $14 + 40(r-1)$ for the $r$th item.

**Step 4 — Final item.** For $r = 50$: $14 + 40(49) = 1974$, which is within 2000, so 50 items are obtained.

**Sample items: 14, 54, 94, ... up to 1974 (every 40th item starting from 14).**
===NOTE===
type: tip
title: Statistical Sampling — Exam Tips & Common Mistakes
---
- **Always round stratified numbers sensibly** so they sum to the required total — re-check the total after rounding.
- State a **sampling frame is needed** for simple random and systematic sampling, but NOT for quota or opportunity sampling — this is a common mark.
- When asked to "describe a method", give a clear numbered procedure: number the units, use random numbers, etc.
- Do not confuse **stratified** (proportional groups) with **quota** (non-random group filling).
- Common mistake: saying a census is "always best". State its drawbacks (cost, time, destructive testing).
- For systematic sampling, remember the start must be chosen **randomly** within the first interval, otherwise it is not a valid random method.
- Give an **advantage and a disadvantage** when comparing methods — examiners often want both.

===TOPIC=== data-presentation
===NOTE===
type: concept
title: Data Presentation & Interpretation — Revision Notes
---
## Types of Data

- **Quantitative** data is numerical; **qualitative** data is categorical (e.g. colour).
- **Discrete** data takes only specific values (number of pets); **continuous** data can take any value in a range (height).

## Measures of Location

- **Mean:** $\bar{x} = \dfrac{\sum x}{n}$. For frequency data $\bar{x} = \dfrac{\sum fx}{\sum f}$.
- **Median:** the middle value when data is ordered. For $n$ values it is the $\frac{n+1}{2}$th value (raw) or the $\frac{n}{2}$th position for grouped data via interpolation.
- **Mode:** the most frequent value (or modal class).

## Measures of Spread

- **Range** = largest − smallest.
- **Interquartile range (IQR)** $= Q_3 - Q_1$, the spread of the middle 50%.
- **Percentiles** split data into hundredths; the 10th to 90th interpercentile range is sometimes used.
- **Variance** and **standard deviation** measure spread about the mean (see formula note).

## Coding

- If $y = \dfrac{x - a}{b}$, then $\bar{x} = b\,\bar{y} + a$ and $\sigma_x = b\,\sigma_y$. Coding simplifies arithmetic with large numbers.

## Outliers

- A common rule: an outlier is any value
  - more than $1.5 \times \text{IQR}$ above $Q_3$, or
  - more than $1.5 \times \text{IQR}$ below $Q_1$.
- Another rule uses more than 2 standard deviations from the mean.
- **Cleaning data** means removing or correcting errors and anomalies before analysis.

## Diagrams

### Box Plots
- Show minimum, $Q_1$, median, $Q_3$, maximum (and outliers as crosses). Useful for comparing distributions.

### Histograms
- For continuous grouped data. **Frequency density** $= \dfrac{\text{frequency}}{\text{class width}}$. **Area is proportional to frequency.**

### Cumulative Frequency Graphs
- Plot cumulative frequency against the **upper class boundary**. Used to estimate the median, quartiles, and percentiles.

### Scatter Diagrams
- Show the relationship between two variables; indicate correlation (positive, negative, none).

## Skewness

- **Positive (right) skew:** mean > median > mode; tail to the right.
- **Negative (left) skew:** mean < median < mode; tail to the left.
- Using quartiles: if $Q_3 - Q_2 > Q_2 - Q_1$ the distribution is positively skewed.
- A measure: $\dfrac{3(\text{mean} - \text{median})}{\text{standard deviation}}$.

## Interpreting Comparisons

- When comparing two data sets, always compare **a measure of location AND a measure of spread**, and put it in context.
===NOTE===
type: formula
title: Data Presentation — Key Formulas
---
**Mean (frequency data):**
$$
\bar{x} = \frac{\sum fx}{\sum f}
$$

**Variance:**
$$
\sigma^2 = \frac{\sum f x^2}{\sum f} - \bar{x}^2 = \frac{S_{xx}}{n}, \qquad S_{xx} = \sum x^2 - \frac{(\sum x)^2}{n}
$$

**Standard deviation:** $\sigma = \sqrt{\sigma^2}$.

**Interquartile range:** $\text{IQR} = Q_3 - Q_1$.

**Outlier rule:** $x < Q_1 - 1.5\,\text{IQR}$ or $x > Q_3 + 1.5\,\text{IQR}$.

**Frequency density:** $\dfrac{\text{frequency}}{\text{class width}}$.

**Coding:** if $y = \dfrac{x-a}{b}$ then $\bar{x} = b\bar{y} + a$ and $\sigma_x = b\,\sigma_y$.

**Linear interpolation (median):**
$$
\text{median} = L + \left(\frac{\tfrac{n}{2} - F}{f}\right) w
$$
where $L$ = lower boundary, $F$ = cumulative frequency before the class, $f$ = class frequency, $w$ = class width.
===NOTE===
type: worked_example
title: Mean and standard deviation with summary statistics
---
For 30 observations it is given that $\sum x = 645$ and $\sum x^2 = 14\,250$. Find the mean and standard deviation.

**Step 1 — Mean.**
$$
\bar{x} = \frac{\sum x}{n} = \frac{645}{30} = 21.5.
$$

**Step 2 — Variance** using $\sigma^2 = \dfrac{\sum x^2}{n} - \bar{x}^2$:
$$
\sigma^2 = \frac{14\,250}{30} - 21.5^2 = 475 - 462.25 = 12.75.
$$

**Step 3 — Standard deviation.**
$$
\sigma = \sqrt{12.75} = 3.5707\ldots
$$

**Mean = 21.5, standard deviation = 3.57 (3 s.f.).**
===NOTE===
type: worked_example
title: Estimating the median by linear interpolation
---
The grouped data below shows times (minutes) for 40 people. Estimate the median.

| Time (min) | Frequency |
|---|---|
| 0–10 | 6 |
| 10–20 | 14 |
| 20–30 | 12 |
| 30–40 | 8 |

**Step 1 — Median position.** $\frac{n}{2} = \frac{40}{2} = 20$, so the median is the 20th value.

**Step 2 — Locate the class.** Cumulative frequencies: 6, then 20 after the 10–20 class. The 20th value lies in the **10–20** class (cumulative reaches 20 here). Use the 20–30 class boundaries since the 20th value is at the boundary; take the class where cumulative frequency first reaches 20, i.e. up to and including 10–20.

**Step 3 — Interpolate** with $L = 10$, $F = 6$, $f = 14$, $w = 10$:
$$
\text{median} = 10 + \left(\frac{20 - 6}{14}\right) \times 10 = 10 + \frac{14}{14}\times 10 = 10 + 10 = 20.
$$

**Estimated median = 20 minutes.**
===NOTE===
type: tip
title: Data Presentation — Exam Tips & Common Mistakes
---
- For histograms, **plot frequency density, not frequency** — and remember area represents frequency, so you may have to work backwards from a bar's area to find a frequency.
- Always use **upper class boundaries** when plotting cumulative frequency.
- When comparing distributions, mention **both** location and spread, and interpret **in context** (use the variable's name and units).
- For coding, the constant $a$ does NOT affect the standard deviation — only the scale factor $b$ does.
- A common error in interpolation is using the wrong boundaries or forgetting the class width.
- State the outlier rule precisely ($1.5 \times \text{IQR}$) — don't just "eyeball" it.
- Skewness direction is named after the **tail**: a long right tail = positive skew.

===TOPIC=== probability
===NOTE===
type: concept
title: Probability — Revision Notes
---
## Basic Definitions

- An **experiment** has a set of possible **outcomes**; the **sample space** $S$ is the set of all outcomes.
- An **event** is a subset of the sample space.
- For equally likely outcomes, $P(A) = \dfrac{\text{number of favourable outcomes}}{\text{total number of outcomes}}$.
- All probabilities satisfy $0 \le P(A) \le 1$, and $\sum P = 1$ over the whole sample space.

## Set Notation

- $A \cup B$ = "A or B" (union).
- $A \cap B$ = "A and B" (intersection).
- $A'$ = complement of $A$ (not A), with $P(A') = 1 - P(A)$.

## The Addition Rule

$$
P(A \cup B) = P(A) + P(B) - P(A \cap B)
$$

If $A$ and $B$ are **mutually exclusive** (cannot both happen), $P(A \cap B) = 0$ so $P(A \cup B) = P(A) + P(B)$.

## Conditional Probability

- $P(A \mid B)$ is the probability of $A$ given $B$ has occurred:
$$
P(A \mid B) = \frac{P(A \cap B)}{P(B)}.
$$

## Independence

- Events $A$ and $B$ are **independent** if the occurrence of one does not affect the other:
$$
P(A \cap B) = P(A) \times P(B).
$$
- Equivalently, $P(A \mid B) = P(A)$.

## Venn Diagrams

- Useful for organising overlapping events. The regions represent $A \cap B$, $A$ only, $B$ only, and neither.
- Always fill in the **intersection first**, then work outwards.

## Tree Diagrams

- Show sequences of events. **Multiply** along branches; **add** between different paths that give the desired outcome.
- Branches at each stage sum to 1. Useful for "with/without replacement" problems — probabilities change on the second draw if without replacement.

## Two-Way Tables

- Display frequencies for two categorical variables; probabilities are read off as proportions of the relevant total.

## Useful Strategies

- For "at least one" problems, use the complement: $P(\text{at least one}) = 1 - P(\text{none})$.
- Check independence by testing whether $P(A \cap B) = P(A)P(B)$.
===NOTE===
type: formula
title: Probability — Key Formulas
---
**Complement:**
$$
P(A') = 1 - P(A)
$$

**Addition rule:**
$$
P(A \cup B) = P(A) + P(B) - P(A \cap B)
$$

**Mutually exclusive:** $P(A \cap B) = 0$.

**Conditional probability:**
$$
P(A \mid B) = \frac{P(A \cap B)}{P(B)}
$$

**Multiplication / independence:**
$$
P(A \cap B) = P(A)\,P(B \mid A)
$$
and if independent, $P(A \cap B) = P(A)\,P(B)$.

**At least one:** $P(\text{at least one}) = 1 - P(\text{none})$.
===NOTE===
type: worked_example
title: Conditional probability from a Venn diagram
---
In a class, $P(A) = 0.5$, $P(B) = 0.4$, and $P(A \cap B) = 0.25$, where $A$ = studies Art, $B$ = studies Biology. Find $P(A \mid B)$ and determine whether $A$ and $B$ are independent.

**Step 1 — Apply the conditional formula.**
$$
P(A \mid B) = \frac{P(A \cap B)}{P(B)} = \frac{0.25}{0.4} = 0.625.
$$

**Step 2 — Test independence.** For independence we need $P(A \cap B) = P(A)\,P(B)$:
$$
P(A)\,P(B) = 0.5 \times 0.4 = 0.20.
$$

**Step 3 — Compare.** $P(A \cap B) = 0.25 \neq 0.20$.

**$P(A \mid B) = 0.625$; since $0.25 \ne 0.20$, the events are NOT independent.**
===NOTE===
type: worked_example
title: Tree diagram without replacement
---
A bag contains 5 red and 3 blue counters. Two are drawn without replacement. Find the probability that both are the same colour.

**Step 1 — First draw probabilities.** $P(\text{red}) = \frac{5}{8}$, $P(\text{blue}) = \frac{3}{8}$.

**Step 2 — Both red** (second draw from 7 counters, 4 red):
$$
\frac{5}{8} \times \frac{4}{7} = \frac{20}{56}.
$$

**Step 3 — Both blue** (second draw from 7, 2 blue):
$$
\frac{3}{8} \times \frac{2}{7} = \frac{6}{56}.
$$

**Step 4 — Add the two paths.**
$$
\frac{20}{56} + \frac{6}{56} = \frac{26}{56} = \frac{13}{28}.
$$

**P(same colour) = $\dfrac{13}{28} \approx 0.464$.**
===NOTE===
type: tip
title: Probability — Exam Tips & Common Mistakes
---
- For "without replacement" tree diagrams, **reduce the totals** on the second branch — forgetting this is a frequent error.
- Use the complement for "at least one" — computing every case is slow and error-prone.
- Independence is tested by $P(A \cap B) = P(A)P(B)$; do not assume events are independent unless told or shown.
- Fill in **intersections first** on Venn diagrams, then subtract to get "only" regions.
- Keep fractions exact where possible, and only round at the final answer.
- A common slip: confusing mutually exclusive ($P(A\cap B)=0$) with independent ($P(A\cap B)=P(A)P(B)$) — they are different.
- Read conditional questions carefully: "given that" tells you the denominator.

===TOPIC=== statistical-distributions
===NOTE===
type: concept
title: Statistical Distributions — Revision Notes
---
## Discrete Random Variables

- A **discrete random variable** $X$ takes a countable set of values, each with a probability.
- A **probability distribution** lists each value $x$ with its probability $P(X = x)$.
- The probabilities must satisfy $\sum P(X = x) = 1$.

## The Binomial Distribution

The binomial distribution models the number of "successes" in a fixed number of independent trials. Write $X \sim B(n, p)$.

**Conditions for a binomial model:**
- A **fixed number** of trials, $n$.
- Each trial has only **two outcomes** (success/failure).
- The probability of success $p$ is **constant** for every trial.
- The trials are **independent**.

## Probability Mass Function

$$
P(X = r) = \binom{n}{r} p^r (1-p)^{n-r}, \qquad r = 0, 1, 2, \dots, n
$$

where $\binom{n}{r} = \dfrac{n!}{r!(n-r)!}$ is the number of ways to choose which $r$ trials are successes.

## Cumulative Probabilities

- $P(X \le r)$ is the cumulative probability; calculators and tables give these directly.
- Useful identities:
  - $P(X < r) = P(X \le r - 1)$,
  - $P(X \ge r) = 1 - P(X \le r - 1)$,
  - $P(X > r) = 1 - P(X \le r)$.

## Mean and Variance

For $X \sim B(n, p)$:
- **Mean (expected value):** $E(X) = np$.
- **Variance:** $\text{Var}(X) = np(1-p)$.

## Modelling Assumptions

- Real situations rarely satisfy the conditions perfectly. Always state which conditions are reasonable and which may be violated (e.g. trials may not be truly independent, $p$ may vary).

## Other Distributions

- The **discrete uniform distribution** assigns equal probability to each of $n$ outcomes: $P(X = x) = \frac{1}{n}$.
- You may be given a distribution defined by a formula and asked to find an unknown constant by using $\sum P = 1$.
===NOTE===
type: formula
title: Statistical Distributions — Key Formulas
---
**Binomial probability** ($X \sim B(n,p)$):
$$
P(X = r) = \binom{n}{r} p^r (1-p)^{n-r}
$$

**Binomial coefficient:**
$$
\binom{n}{r} = \frac{n!}{r!\,(n-r)!}
$$

**Cumulative identities:**
$$
P(X \ge r) = 1 - P(X \le r-1), \qquad P(X > r) = 1 - P(X \le r)
$$

**Mean and variance:**
$$
E(X) = np, \qquad \text{Var}(X) = np(1-p)
$$

**Sum of probabilities:** $\sum_{r=0}^{n} P(X = r) = 1$.
===NOTE===
type: worked_example
title: Exact and cumulative binomial probabilities
---
A fair die is rolled 10 times. Let $X$ be the number of sixes. Find $P(X = 2)$ and $P(X \ge 2)$.

**Step 1 — Identify the model.** Each roll is independent, $p = \frac{1}{6}$, $n = 10$, so $X \sim B\!\left(10, \tfrac{1}{6}\right)$.

**Step 2 — Exact probability** using the pmf:
$$
P(X = 2) = \binom{10}{2}\left(\tfrac{1}{6}\right)^2 \left(\tfrac{5}{6}\right)^8.
$$
$\binom{10}{2} = 45$, so
$$
P(X = 2) = 45 \times \frac{1}{36} \times 0.23256\ldots = 0.2907\ldots
$$

**Step 3 — Cumulative.** Use $P(X \ge 2) = 1 - P(X \le 1)$.
$$
P(X = 0) = \left(\tfrac{5}{6}\right)^{10} = 0.16151\ldots, \quad P(X = 1) = 10\cdot\tfrac{1}{6}\cdot\left(\tfrac{5}{6}\right)^9 = 0.32301\ldots
$$
$$
P(X \le 1) = 0.16151 + 0.32301 = 0.48453.
$$

**Step 4 — Subtract.** $P(X \ge 2) = 1 - 0.48453 = 0.51547$.

**$P(X = 2) = 0.291$ and $P(X \ge 2) = 0.515$ (3 s.f.).**
===NOTE===
type: worked_example
title: Mean, variance and a "between" probability
---
$X \sim B(20, 0.3)$. Find the mean and variance of $X$, and find $P(4 \le X \le 7)$.

**Step 1 — Mean.** $E(X) = np = 20 \times 0.3 = 6$.

**Step 2 — Variance.** $\text{Var}(X) = np(1-p) = 20 \times 0.3 \times 0.7 = 4.2$.

**Step 3 — Rewrite the probability** using cumulatives:
$$
P(4 \le X \le 7) = P(X \le 7) - P(X \le 3).
$$

**Step 4 — Read cumulative values** (from a calculator):
$$
P(X \le 7) = 0.7723\ldots, \qquad P(X \le 3) = 0.1071\ldots
$$

**Step 5 — Subtract.**
$$
P(4 \le X \le 7) = 0.7723 - 0.1071 = 0.6652.
$$

**Mean = 6, variance = 4.2, and $P(4 \le X \le 7) = 0.665$ (3 s.f.).**
===NOTE===
type: tip
title: Statistical Distributions — Exam Tips & Common Mistakes
---
- Always **state the model**: write $X \sim B(n, p)$ clearly and check the four conditions if asked to justify it.
- Be careful converting inequalities: $P(X \ge r) = 1 - P(X \le r-1)$ — the most common error is an off-by-one mistake.
- "More than" ($>$) and "at least" ($\ge$) are different — read the wording precisely.
- Use the calculator's binomial cumulative function for ranges rather than summing many terms.
- For "between" probabilities, subtract cumulative values; mind whether endpoints are included.
- When justifying assumptions, comment specifically on **independence** and **constant $p$**, not just generic statements.
- Don't confuse mean $np$ with variance $np(1-p)$.

===TOPIC=== hypothesis-testing
===NOTE===
type: concept
title: Hypothesis Testing — Revision Notes
---
## The Idea

A **hypothesis test** uses sample data to decide between two competing claims about a population parameter (for A-level: a binomial probability $p$, or for the second year a Normal mean or correlation).

## Hypotheses

- **Null hypothesis $H_0$:** the default assumption, stated as an equality, e.g. $H_0: p = 0.3$.
- **Alternative hypothesis $H_1$:** what we test for. It is either
  - **one-tailed:** $H_1: p > 0.3$ or $H_1: p < 0.3$, or
  - **two-tailed:** $H_1: p \neq 0.3$.

## Test Statistic and Significance

- The **test statistic** is the observed sample result (e.g. number of successes $X$).
- The **significance level** $\alpha$ (commonly 5%, 1%, 10%) is the probability of rejecting $H_0$ when it is actually true.
- We assume $H_0$ is true and compute how likely the observed result (or more extreme) is.

## Critical Regions

- The **critical region** is the set of values of the test statistic for which we reject $H_0$.
- The **critical value** is the boundary of this region.
- The **actual significance level** is the true probability of landing in the critical region (often less than the nominal $\alpha$ because $X$ is discrete).

## Carrying Out a Binomial Test

1. Define $X$ and state $X \sim B(n, p)$ under $H_0$.
2. State $H_0$ and $H_1$.
3. Assume $H_0$ true; calculate $P(X \ge x)$ (upper tail) or $P(X \le x)$ (lower tail).
4. Compare with $\alpha$ (for two-tailed, compare with $\frac{\alpha}{2}$).
5. **Conclude:** if the probability $< \alpha$ (or $\frac{\alpha}{2}$), reject $H_0$; otherwise do not reject $H_0$.
6. **Interpret in context.**

## Two-Tailed Tests

- Split the significance level: each tail gets $\frac{\alpha}{2}$.
- Compare the observed tail probability with $\frac{\alpha}{2}$.

## Errors and Wording

- Reject $H_0$ → "there is sufficient evidence that..."
- Do not reject $H_0$ → "there is insufficient evidence that..." (never "accept $H_0$").
- Conclusions must always be non-committal about $H_0$ being "true".
===NOTE===
type: formula
title: Hypothesis Testing — Key Formulas
---
**Model under $H_0$:** $X \sim B(n, p_0)$.

**Upper-tail p-value:**
$$
P(X \ge x) = 1 - P(X \le x - 1)
$$

**Lower-tail p-value:**
$$
P(X \le x)
$$

**Decision rule (one-tailed):** reject $H_0$ if p-value $< \alpha$.

**Decision rule (two-tailed):** reject $H_0$ if the relevant tail probability $< \dfrac{\alpha}{2}$.

**Critical region:** smallest/largest set of values with tail probability $\le \alpha$ (or $\frac{\alpha}{2}$).

**Actual significance level** = total probability of the critical region(s).
===NOTE===
type: worked_example
title: One-tailed binomial test
---
A seed company claims 80% of its seeds germinate. A gardener plants 20 seeds and 12 germinate. Test at the 5% level whether the germination rate is **less than** claimed.

**Step 1 — Define and model.** Let $X$ = number germinating. Under $H_0$, $X \sim B(20, 0.8)$.

**Step 2 — Hypotheses.** $H_0: p = 0.8$, $H_1: p < 0.8$ (one-tailed).

**Step 3 — Compute the lower-tail p-value** for the observed $x = 12$:
$$
P(X \le 12) = 0.0321\ldots
$$
(from the binomial cumulative distribution).

**Step 4 — Compare with $\alpha = 0.05$.** Since $0.0321 < 0.05$, the result is significant.

**Step 5 — Conclude.** Reject $H_0$. **There is sufficient evidence at the 5% level that the germination rate is less than 80%.**
===NOTE===
type: worked_example
title: Finding a critical region (two-tailed)
---
$X \sim B(25, 0.5)$ under $H_0$. Find the critical region for a two-tailed test at the 5% level and state the actual significance level.

**Step 1 — Split the level.** Each tail gets $\frac{0.05}{2} = 0.025$.

**Step 2 — Lower tail.** Find the largest $c$ with $P(X \le c) \le 0.025$:
$$
P(X \le 7) = 0.0216\ldots \le 0.025, \quad P(X \le 8) = 0.0539 > 0.025.
$$
So the lower critical region is $X \le 7$.

**Step 3 — Upper tail.** By symmetry ($p = 0.5$, $n = 25$), the upper region is $X \ge 18$, since
$$
P(X \ge 18) = P(X \le 7) = 0.0216\ldots \le 0.025.
$$

**Step 4 — Actual significance level.** Add the two tail probabilities:
$$
0.0216 + 0.0216 = 0.0432 = 4.32\%.
$$

**Critical region: $X \le 7$ or $X \ge 18$; actual significance level $\approx 4.32\%$.**
===NOTE===
type: tip
title: Hypothesis Testing — Exam Tips & Common Mistakes
---
- Always define your variable and state the distribution under $H_0$ explicitly.
- For two-tailed tests, **compare with $\frac{\alpha}{2}$**, not $\alpha$ — a very common error.
- Never write "accept $H_0$"; write "do not reject $H_0$" / "insufficient evidence".
- Always give the conclusion **in context**, referring to the original claim.
- Watch the inequality direction: $H_1: p < p_0$ uses the lower tail; $H_1: p > p_0$ uses the upper tail.
- For critical regions, check the boundary values both ways ($\le$ and the next value) to confirm you have the largest/smallest correct value.
- The actual significance level is usually **less than** the nominal level because $X$ is discrete — state this if asked.
- Use $P(X \ge x) = 1 - P(X \le x-1)$ carefully to avoid off-by-one slips.

===TOPIC=== regression-correlation
===NOTE===
type: concept
title: Regression & Correlation — Revision Notes
---
## Bivariate Data

- **Bivariate data** consists of pairs $(x, y)$. We look for relationships between the two variables.
- A **scatter diagram** plots the pairs and shows the pattern of association.

## Correlation

- **Correlation** measures the strength and direction of a **linear** relationship.
- **Positive correlation:** as $x$ increases, $y$ tends to increase.
- **Negative correlation:** as $x$ increases, $y$ tends to decrease.
- **No (zero) correlation:** no linear pattern.
- The **product moment correlation coefficient (PMCC)**, $r$, ranges from $-1$ to $+1$:
  - $r = 1$: perfect positive linear correlation.
  - $r = -1$: perfect negative linear correlation.
  - $r = 0$: no linear correlation.

## Correlation vs Causation

- A strong correlation does **not** imply that one variable causes the other. There may be a hidden (confounding) variable.

## Regression Lines

- The **least squares regression line of $y$ on $x$** is the line $y = a + bx$ that minimises the sum of squared vertical distances from the points.
- $b$ is the **gradient** (change in $y$ per unit change in $x$); $a$ is the **intercept**.
- We regress the **dependent (response) variable** on the **independent (explanatory) variable**. The explanatory variable is the one controlled or measured without error.

## Interpreting the Equation

- Gradient $b$: the predicted change in $y$ for each unit increase in $x$.
- Intercept $a$: the predicted value of $y$ when $x = 0$ (only meaningful if $x=0$ is sensible).

## Interpolation and Extrapolation

- **Interpolation:** predicting $y$ for an $x$ **within** the observed data range — generally reliable.
- **Extrapolation:** predicting **outside** the range — unreliable, as the relationship may not continue.

## Using the Large Data Set / Coding

- Regression and correlation are unaffected in interpretation by coding, but you must convert coded gradients/intercepts back to the original variables if coding was used.
===NOTE===
type: formula
title: Regression & Correlation — Key Formulas
---
**Sums of squares and products:**
$$
S_{xx} = \sum x^2 - \frac{(\sum x)^2}{n}, \qquad S_{yy} = \sum y^2 - \frac{(\sum y)^2}{n}
$$
$$
S_{xy} = \sum xy - \frac{(\sum x)(\sum y)}{n}
$$

**PMCC:**
$$
r = \frac{S_{xy}}{\sqrt{S_{xx}\,S_{yy}}}
$$

**Regression line $y = a + bx$:**
$$
b = \frac{S_{xy}}{S_{xx}}, \qquad a = \bar{y} - b\bar{x}
$$

**Range:** $-1 \le r \le 1$. The line passes through $(\bar{x}, \bar{y})$.
===NOTE===
type: worked_example
title: Finding the regression line
---
For 8 data points: $\sum x = 40$, $\sum y = 60$, $\sum x^2 = 240$, $\sum xy = 330$. Find the regression line of $y$ on $x$.

**Step 1 — Means.** $\bar{x} = \frac{40}{8} = 5$, $\bar{y} = \frac{60}{8} = 7.5$.

**Step 2 — $S_{xx}$.**
$$
S_{xx} = \sum x^2 - \frac{(\sum x)^2}{n} = 240 - \frac{40^2}{8} = 240 - 200 = 40.
$$

**Step 3 — $S_{xy}$.**
$$
S_{xy} = \sum xy - \frac{(\sum x)(\sum y)}{n} = 330 - \frac{40 \times 60}{8} = 330 - 300 = 30.
$$

**Step 4 — Gradient.** $b = \dfrac{S_{xy}}{S_{xx}} = \dfrac{30}{40} = 0.75.$

**Step 5 — Intercept.** $a = \bar{y} - b\bar{x} = 7.5 - 0.75 \times 5 = 7.5 - 3.75 = 3.75.$

**Regression line: $y = 3.75 + 0.75x$.**
===NOTE===
type: worked_example
title: Calculating and interpreting the PMCC
---
Using $S_{xx} = 40$, $S_{xy} = 30$ from before, and additionally $S_{yy} = 30$, find $r$ and interpret it.

**Step 1 — Apply the PMCC formula.**
$$
r = \frac{S_{xy}}{\sqrt{S_{xx}\,S_{yy}}} = \frac{30}{\sqrt{40 \times 30}}.
$$

**Step 2 — Evaluate the denominator.**
$$
\sqrt{40 \times 30} = \sqrt{1200} = 34.641\ldots
$$

**Step 3 — Compute $r$.**
$$
r = \frac{30}{34.641} = 0.866\ldots
$$

**Step 4 — Interpret.** $r \approx 0.87$ is close to 1, indicating **strong positive linear correlation** between $x$ and $y$.

**$r = 0.866$ (3 s.f.): strong positive correlation.**
===NOTE===
type: tip
title: Regression & Correlation — Exam Tips & Common Mistakes
---
- Use the regression line of $y$ on $x$ only to predict $y$ from $x$ — not the other way round.
- **Interpolation is reliable; extrapolation is not** — always comment on whether the prediction is within the data range.
- Never claim **causation** from correlation alone — mention possible confounding variables.
- Interpret the gradient and intercept **in context** with units.
- Keep $S_{xx}$, $S_{xy}$, $S_{yy}$ accurate — premature rounding badly affects $r$.
- The regression line always passes through $(\bar{x}, \bar{y})$; use this to check your work.
- $r$ near 0 means no **linear** relationship — there could still be a non-linear one.

===TOPIC=== normal-distribution
===NOTE===
type: concept
title: Normal Distribution — Revision Notes
---
## The Normal Distribution

- A **continuous** random variable $X$ that is normally distributed is written $X \sim N(\mu, \sigma^2)$, with mean $\mu$ and variance $\sigma^2$ (standard deviation $\sigma$).
- The graph is a **bell-shaped curve**, symmetric about $\mu$. The total area under the curve is 1.
- Key properties:
  - Symmetrical about $x = \mu$; mean = median = mode.
  - Points of inflection at $x = \mu \pm \sigma$.
  - Asymptotic to the $x$-axis.

## The Empirical Rule

For any normal distribution:
- about **68%** of values lie within $1\sigma$ of the mean,
- about **95%** within $2\sigma$,
- about **99.7%** within $3\sigma$.

## Probabilities as Areas

- $P(X < a)$ is the area to the left of $a$ under the curve.
- Because $X$ is continuous, $P(X = a) = 0$, so $\le$ and $<$ give the same probability.
- Use a calculator's normal cdf or standardise and use tables.

## The Standard Normal Distribution

- $Z \sim N(0, 1)$ is the standard normal. Standardise using
$$
Z = \frac{X - \mu}{\sigma}.
$$
- $\Phi(z) = P(Z \le z)$ gives the cumulative probability. Use symmetry: $P(Z \le -z) = 1 - \Phi(z)$.

## Inverse Normal

- To find a value $x$ given a probability, find $z$ from $P(Z \le z) = p$ (inverse normal), then $x = \mu + z\sigma$.

## Finding Unknown $\mu$ or $\sigma$

- Convert each given probability statement into a $z$-value, set up an equation $\dfrac{x - \mu}{\sigma} = z$, and solve. Two statements give simultaneous equations to find both $\mu$ and $\sigma$.

## Normal Approximation to the Binomial

- If $n$ is large and $p$ close to $0.5$, $B(n, p)$ can be approximated by $N(np,\, np(1-p))$, applying a **continuity correction** ($\pm 0.5$).
===NOTE===
type: formula
title: Normal Distribution — Key Formulas
---
**Distribution:** $X \sim N(\mu, \sigma^2)$.

**Standardising:**
$$
Z = \frac{X - \mu}{\sigma}, \qquad Z \sim N(0, 1)
$$

**Symmetry of $Z$:**
$$
P(Z \le -z) = 1 - P(Z \le z), \qquad P(Z > z) = 1 - \Phi(z)
$$

**Inverse normal:** if $P(Z \le z) = p$ then $x = \mu + z\sigma$.

**Empirical rule:** 68% within $\sigma$, 95% within $2\sigma$, 99.7% within $3\sigma$.

**Normal approximation to binomial:** $X \sim B(n,p) \approx N\big(np,\, np(1-p)\big)$ with continuity correction $\pm 0.5$.
===NOTE===
type: worked_example
title: Standardising to find a probability
---
The masses of apples are $X \sim N(150, 20^2)$ grams. Find $P(X > 170)$.

**Step 1 — Standardise** the boundary $x = 170$:
$$
z = \frac{x - \mu}{\sigma} = \frac{170 - 150}{20} = \frac{20}{20} = 1.
$$

**Step 2 — Rewrite the probability.**
$$
P(X > 170) = P(Z > 1) = 1 - \Phi(1).
$$

**Step 3 — Look up $\Phi(1)$.**
$$
\Phi(1) = 0.8413.
$$

**Step 4 — Subtract.**
$$
P(Z > 1) = 1 - 0.8413 = 0.1587.
$$

**$P(X > 170) = 0.1587$ (about 15.9%).**
===NOTE===
type: worked_example
title: Finding an unknown mean
---
The times $X$ (minutes) to complete a task are normally distributed with standard deviation $\sigma = 4$. It is known that $P(X > 30) = 0.10$. Find the mean $\mu$.

**Step 1 — Find the $z$-value.** We need $z$ with $P(Z > z) = 0.10$, i.e. $P(Z \le z) = 0.90$. From the inverse normal,
$$
z = 1.2816.
$$

**Step 2 — Set up the standardising equation.**
$$
z = \frac{x - \mu}{\sigma} \;\Rightarrow\; 1.2816 = \frac{30 - \mu}{4}.
$$

**Step 3 — Solve for $\mu$.**
$$
30 - \mu = 1.2816 \times 4 = 5.1264,
$$
$$
\mu = 30 - 5.1264 = 24.8736.
$$

**Mean $\mu = 24.9$ minutes (3 s.f.).**
===NOTE===
type: tip
title: Normal Distribution — Exam Tips & Common Mistakes
---
- Remember $N(\mu, \sigma^2)$ uses the **variance**, not the standard deviation — square it where needed and take care on the calculator.
- Draw a quick **sketch** of the bell curve and shade the required area; this prevents sign and tail errors.
- For inverse-normal problems, decide whether you need the upper or lower tail before reading off $z$.
- When finding both $\mu$ and $\sigma$, form **two equations** and solve simultaneously.
- Use the symmetry $P(Z \le -z) = 1 - \Phi(z)$ for negative $z$-values.
- For the normal approximation to the binomial, **always apply the continuity correction** ($\pm 0.5$).
- Since $X$ is continuous, $P(X = a) = 0$; do not lose marks worrying about strict vs non-strict inequalities.
