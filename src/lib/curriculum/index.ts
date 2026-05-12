import { AQA_TOPICS, TOPIC_CATEGORIES } from './aqa-topics'
import { GCSE_TOPICS, GCSE_TOPIC_CATEGORIES } from './gcse-topics'

export type Level = 'GCSE' | 'A-Level'

export function getTopics(level: Level) {
  return level === 'GCSE' ? GCSE_TOPICS : AQA_TOPICS
}

export function getTopicCategories(level: Level) {
  return level === 'GCSE' ? GCSE_TOPIC_CATEGORIES : TOPIC_CATEGORIES
}

export function getLevelLabel(level: Level) {
  return level === 'GCSE' ? 'GCSE Mathematics' : 'A-level Mathematics'
}
