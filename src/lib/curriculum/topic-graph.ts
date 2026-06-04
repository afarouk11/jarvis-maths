// Topic dependency graph — defines which topics connect to which
// Edges represent [prerequisite, dependent]: understand prereq before dependent
export const TOPIC_EDGES: [string, string][] = [
  // Algebra foundations
  ['algebra-functions', 'coordinate-geometry'],
  ['algebra-functions', 'sequences-series'],
  ['algebra-functions', 'further-algebra'],
  ['algebra-functions', 'proof'],
  ['algebra-functions', 'functions'],

  // Calculus chain
  ['differentiation', 'integration'],
  ['differentiation', 'further-calculus'],
  ['differentiation', 'differential-equations'],
  ['differentiation', 'parametric-equations'],
  ['integration', 'further-calculus'],
  ['integration', 'differential-equations'],

  // Trig links
  ['trigonometry', 'differentiation'],
  ['trigonometry', 'integration'],
  ['trigonometry', 'further-calculus'],

  // Exponentials
  ['exponentials-logarithms', 'differentiation'],
  ['exponentials-logarithms', 'integration'],
  ['exponentials-logarithms', 'differential-equations'],

  // Coordinate geometry
  ['coordinate-geometry', 'vectors'],
  ['coordinate-geometry', 'parametric-equations'],

  // Functions
  ['functions', 'further-calculus'],
  ['functions', 'differential-equations'],

  // Stats chain
  ['statistical-sampling', 'data-presentation'],
  ['data-presentation', 'probability'],
  ['probability', 'statistical-distributions'],
  ['statistical-distributions', 'hypothesis-testing'],
  ['hypothesis-testing', 'regression-correlation'],
  ['statistical-distributions', 'normal-distribution'],
  ['normal-distribution', 'hypothesis-testing'],

  // Mechanics chain
  ['quantities-units', 'kinematics'],
  ['kinematics', 'forces-newtons-laws'],
  ['forces-newtons-laws', 'moments'],
  ['forces-newtons-laws', 'projectiles'],
  ['forces-newtons-laws', 'friction'],
  ['differentiation', 'kinematics'],
  ['vectors', 'forces-newtons-laws'],
  ['vectors', 'kinematics'],

  // Numerical methods needs calculus
  ['differentiation', 'numerical-methods'],
  ['integration', 'numerical-methods'],

  // Sequences
  ['sequences-series', 'further-algebra'],
  ['algebra-functions', 'numerical-methods'],
]

/** Returns the prerequisite slugs for a given topic slug */
export function getPrerequisites(slug: string): string[] {
  return TOPIC_EDGES.filter(([, dep]) => dep === slug).map(([pre]) => pre)
}

/** A topic is "locked" if any prerequisite has p_known < LOCK_THRESHOLD */
const LOCK_THRESHOLD = 0.25

export function isTopicLocked(slug: string, progressMap: Map<string, number>): boolean {
  const prereqs = getPrerequisites(slug)
  if (prereqs.length === 0) return false
  return prereqs.some(pre => (progressMap.get(pre) ?? 0) < LOCK_THRESHOLD)
}

/** Topics that list this slug as a prerequisite (the inverse edges). */
export function getDependents(slug: string): string[] {
  return TOPIC_EDGES.filter(([pre]) => pre === slug).map(([, dep]) => dep)
}

const WEAK_THRESHOLD = 0.4

/** Direct prerequisites of a topic whose mastery is below the weak threshold. */
export function weakPrerequisites(
  slug: string,
  pKnownBySlug: Map<string, number>,
  weakThreshold = WEAK_THRESHOLD,
): string[] {
  return getPrerequisites(slug)
    .filter(pre => (pKnownBySlug.get(pre) ?? 0) < weakThreshold)
    .sort((a, b) => (pKnownBySlug.get(a) ?? 0) - (pKnownBySlug.get(b) ?? 0))
}

/**
 * Walks the prerequisite chain to find the deepest weak topic blocking `slug`.
 * This is the "fix this first" diagnosis: there's no point grinding integration
 * if differentiation (its prerequisite) is the real problem.
 */
export function rootWeakPrerequisite(
  slug: string,
  pKnownBySlug: Map<string, number>,
  weakThreshold = WEAK_THRESHOLD,
  seen: Set<string> = new Set(),
): string | null {
  if (seen.has(slug)) return null
  seen.add(slug)

  const weak = weakPrerequisites(slug, pKnownBySlug, weakThreshold)
  if (weak.length === 0) return null

  const weakest = weak[0] // already sorted weakest-first
  const deeper = rootWeakPrerequisite(weakest, pKnownBySlug, weakThreshold, seen)
  return deeper ?? weakest
}

/**
 * Orders a set of topic slugs so that prerequisites always come before the
 * topics that depend on them (a topological sort restricted to the given set).
 */
export function topologicalOrder(slugs: string[]): string[] {
  const set = new Set(slugs)
  const visited = new Set<string>()
  const order: string[] = []

  const visit = (slug: string): void => {
    if (visited.has(slug)) return
    visited.add(slug)
    for (const pre of getPrerequisites(slug)) {
      if (set.has(pre)) visit(pre)
    }
    if (set.has(slug)) order.push(slug)
  }

  for (const s of slugs) visit(s)
  return order
}
