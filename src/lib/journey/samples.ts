// Fixtures for exercising the journey engine without a database — useful for
// unit tests and local prototyping.

import type { MasteryRow, TopicLite } from './types'

export const SAMPLE_TOPICS: TopicLite[] = [
  { slug: 'algebra-functions', name: 'Algebra & Functions' },
  { slug: 'differentiation',   name: 'Differentiation' },
  { slug: 'integration',       name: 'Integration' },
  { slug: 'trigonometry',      name: 'Trigonometry' },
  { slug: 'vectors',           name: 'Vectors' },
]

/**
 * A student who is strong on algebra, shaky on differentiation, and weak on
 * integration — which depends on differentiation. The engine should diagnose
 * differentiation (the root weak prerequisite), not integration.
 */
export const SAMPLE_PROGRESS: MasteryRow[] = [
  { topic_id: 'algebra-functions', p_known: 0.82 },
  { topic_id: 'trigonometry',      p_known: 0.71 },
  { topic_id: 'differentiation',   p_known: 0.34 },
  { topic_id: 'integration',       p_known: 0.21 },
  { topic_id: 'vectors',           p_known: 0.55 },
]

/** Everything mastered — the engine should report the journey complete (null). */
export const SAMPLE_PROGRESS_MASTERED: MasteryRow[] = SAMPLE_TOPICS.map(t => ({
  topic_id: t.slug,
  p_known: 0.9,
}))
