/**
 * Stable accent colours for each A-level and GCSE strand.
 * Shared between BrainScene (3-D labels / neuron halos) and BrainMap (pills / legend).
 *
 * Mapping rationale
 * -----------------
 * Pure Mathematics / Number   → blue   (#3b82f6)  — analytical, cool, dominant subject
 * Statistics / Stat&Prob      → purple (#a78bfa)  — data, uncertainty
 * Mechanics                   → amber  (#f59e0b)  — energy, motion, SPOK accent colour
 * Algebra                     → green  (#4ade80)  — growth, symbolic manipulation
 * Geometry & Measures         → amber  (#f59e0b)  — shares Mechanics' spatial flavour
 */

export const STRAND_COLORS: Record<string, string> = {
  // A-level
  'Pure Mathematics': '#3b82f6',
  'Statistics':       '#a78bfa',
  'Mechanics':        '#f59e0b',
  // GCSE
  'Number':                   '#3b82f6',
  'Algebra':                  '#4ade80',
  'Geometry & Measures':      '#f59e0b',
  'Statistics & Probability': '#a78bfa',
}

/** Returns the strand accent colour, falling back to a neutral slate if unknown. */
export function strandColor(section: string): string {
  return STRAND_COLORS[section] ?? '#94a3b8'
}
