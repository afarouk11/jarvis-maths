import { create, all } from 'mathjs'

const math = create(all, {})

export type EquivVerdict = 'equivalent' | 'different' | 'uncertain'

// Convert common LaTeX / exam notation into something mathjs can parse.
function normalize(raw: string): string {
  let s = raw.trim()
  // Strip math delimiters
  s = s.replace(/\$\$?|\\\(|\\\)|\\\[|\\\]/g, ' ')
  // If it's an equation/assignment, keep the right-hand side ("x = 3" → "3").
  if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1)
  s = s
    .replace(/\\left|\\right/g, '')
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, 'sqrt($1)')
    .replace(/\\times|\\cdot/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\pi/g, 'pi')
    .replace(/\^\s*\{([^{}]*)\}/g, '^($1)')
    .replace(/\\[a-zA-Z]+/g, '') // drop any remaining LaTeX commands
    .replace(/[{}]/g, '')
    .replace(/\s+/g, '')
  return s
}

function tryEvalNumber(expr: string): number | null {
  try {
    const v = math.evaluate(expr)
    return typeof v === 'number' && isFinite(v) ? v : null
  } catch {
    return null
  }
}

/**
 * Deterministically checks whether a student's final answer is mathematically
 * equivalent to the mark-scheme answer. Numeric answers are compared directly;
 * single-variable expressions are compared by sampling several x values.
 * Returns 'uncertain' whenever it can't safely decide, so the caller falls back
 * to the LLM rather than mismarking.
 */
export function checkAnswerEquivalence(student: string, correct: string): EquivVerdict {
  const a = normalize(student)
  const b = normalize(correct)
  if (!a || !b) return 'uncertain'

  const tol = (ref: number) => 1e-6 * Math.max(1, Math.abs(ref))

  // 1) Pure numeric comparison (handles 0.5 vs 1/2 vs \frac12).
  const na = tryEvalNumber(a)
  const nb = tryEvalNumber(b)
  if (na !== null && nb !== null) {
    return Math.abs(na - nb) <= tol(nb) ? 'equivalent' : 'different'
  }

  // 2) Symbolic comparison by sampling f(x) - g(x) at several points.
  try {
    const code = math.parse(`(${a}) - (${b})`).compile()
    let evaluated = 0
    let maxErr = 0
    for (const x of [-2.3, -1.1, 0.7, 1.9, 3.3, 5.1]) {
      try {
        const v = code.evaluate({ x })
        if (typeof v === 'number' && isFinite(v)) {
          evaluated++
          maxErr = Math.max(maxErr, Math.abs(v))
        }
      } catch { /* undefined at this x — skip */ }
    }
    if (evaluated >= 3) return maxErr <= 1e-6 ? 'equivalent' : 'different'
  } catch {
    /* not parseable — fall through */
  }

  return 'uncertain'
}
