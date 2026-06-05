// Sub-skill taxonomy: the distinct techniques inside a broad topic. Topic-level
// mastery (student_progress) stays the authoritative signal; sub-skills add
// granularity so practice can target the specific technique a student is weak on
// (e.g. "Integration by parts" rather than just "Integration").

export const TOPIC_SUBSKILLS: Record<string, string[]> = {
  'differentiation': ['Power rule', 'Chain rule', 'Product rule', 'Quotient rule', 'Implicit differentiation'],
  'integration': ['By inspection', 'By substitution', 'By parts', 'Partial fractions', 'Definite integrals and area'],
  'trigonometry': ['Identities', 'Solving equations', 'Double angle formulae', 'R-form', 'Inverse and graphs'],
  'algebra-functions': ['Indices and surds', 'Quadratics', 'Simultaneous equations', 'Inequalities', 'Polynomial division'],
  'exponentials-logarithms': ['Laws of logarithms', 'Solving exponential equations', 'Exponential modelling', 'ln and e'],
  'sequences-series': ['Arithmetic series', 'Geometric series', 'Sigma notation', 'Sum to infinity', 'Recurrence relations'],
  'coordinate-geometry': ['Straight lines', 'Circles', 'Tangents and normals', 'Intersections'],
  'vectors': ['Magnitude and direction', 'Dot product', 'Vector equations of lines', 'Geometric proof'],
  'statistical-distributions': ['Binomial distribution', 'Normal distribution', 'Conditional probability'],
  'hypothesis-testing': ['Binomial test', 'Normal test', 'Critical regions', 'p-values'],
  'kinematics': ['SUVAT', 'Variable acceleration', 'Velocity-time graphs', 'Projectiles'],
  'forces-newtons-laws': ['Resolving forces', 'Connected particles', 'Inclined planes', 'Friction'],
}

export function getSubskills(slug: string): string[] {
  return TOPIC_SUBSKILLS[slug] ?? []
}
