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
