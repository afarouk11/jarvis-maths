'use client'

import { motion } from 'framer-motion'
import { masteryColor, masteryLabel } from '@/lib/bkt/bayesian-knowledge-tracing'
import { AQA_TOPICS, TOPIC_CATEGORIES } from '@/lib/curriculum/aqa-topics'
import type { StudentProgress } from '@/types'

interface Props {
  progress: StudentProgress[]
}

export function TopicMasteryMap({ progress }: Props) {
  const progressMap = new Map(progress.map(p => [p.topic_id, p]))

  return (
    <div className="space-y-6">
      {Object.entries(TOPIC_CATEGORIES).map(([category, slugs]) => (
        <div key={category}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#5a7aaa' }}>
            {category}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {slugs.map(slug => {
              const topic = AQA_TOPICS.find(t => t.slug === slug)
              if (!topic) return null
              const prog = progressMap.get(slug)
              const pKnown = prog?.p_known ?? 0
              const color = masteryColor(pKnown)

              return (
                <motion.div
                  key={slug}
                  whileHover={{ scale: 1.04 }}
                  title={`${topic.name}: ${masteryLabel(pKnown)} (${Math.round(pKnown * 100)}%)`}
                  className="relative p-2 rounded-lg cursor-default"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}40`,
                    minHeight: 60,
                  }}>
                  <div className="text-lg mb-1">{topic.icon}</div>
                  <p className="text-xs text-white font-medium leading-tight truncate">{topic.name}</p>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-800">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(pKnown * 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
