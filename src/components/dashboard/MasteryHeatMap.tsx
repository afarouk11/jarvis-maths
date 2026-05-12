'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AQA_TOPICS, TOPIC_CATEGORIES } from '@/lib/curriculum/aqa-topics'
import { masteryColor } from '@/lib/bkt/bayesian-knowledge-tracing'
import { isTopicLocked } from '@/lib/curriculum/topic-graph'
import { Lock } from 'lucide-react'

interface TopicMastery {
  topicSlug: string
  pKnown: number
}

interface Props {
  topicMastery: TopicMastery[]  // only studied topics
}

function cellBg(pKnown: number | undefined, locked: boolean): string {
  if (locked) return 'rgba(255,255,255,0.02)'
  if (pKnown === undefined) return 'rgba(255,255,255,0.03)'
  if (pKnown >= 0.85) return 'rgba(34,197,94,0.12)'
  if (pKnown >= 0.65) return 'rgba(59,130,246,0.12)'
  if (pKnown >= 0.45) return 'rgba(245,158,11,0.12)'
  if (pKnown >= 0.25) return 'rgba(239,68,68,0.12)'
  return 'rgba(239,68,68,0.07)'
}

function cellBorder(pKnown: number | undefined, locked: boolean): string {
  if (locked) return 'rgba(255,255,255,0.05)'
  if (pKnown === undefined) return 'rgba(255,255,255,0.06)'
  return `${masteryColor(pKnown)}30`
}

function heatLabel(pKnown: number | undefined): string {
  if (pKnown === undefined) return 'Not started'
  if (pKnown >= 0.85) return 'Mastered'
  if (pKnown >= 0.65) return 'Proficient'
  if (pKnown >= 0.45) return 'Developing'
  if (pKnown >= 0.25) return 'Weak'
  return 'Critical gap'
}

export function MasteryHeatMap({ topicMastery }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const masteryMap = new Map(topicMastery.map(t => [t.topicSlug, t.pKnown]))
  const pKnownMap  = new Map(topicMastery.map(t => [t.topicSlug, t.pKnown]))

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { label: 'Mastered',    color: '#22c55e' },
          { label: 'Proficient',  color: '#3b82f6' },
          { label: 'Developing',  color: '#f59e0b' },
          { label: 'Weak',        color: '#ef4444' },
          { label: 'Not started', color: '#374151' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color, opacity: 0.8 }} />
            <span className="text-xs" style={{ color: '#5a7aaa' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Categories */}
      {Object.entries(TOPIC_CATEGORIES).map(([category, slugs]) => (
        <div key={category}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#4a6070' }}>
            {category}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {AQA_TOPICS.filter(t => slugs.includes(t.slug)).map((topic, i) => {
              const pKnown = masteryMap.get(topic.slug)
              const locked = isTopicLocked(topic.slug, pKnownMap)
              const isHovered = hovered === topic.slug
              const color = pKnown !== undefined ? masteryColor(pKnown) : '#374151'

              return (
                <motion.div
                  key={topic.slug}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onMouseEnter={() => setHovered(topic.slug)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Link href={`/topics/${topic.slug}`}>
                    <div
                      className="relative p-3 rounded-xl transition-all duration-200 cursor-pointer"
                      style={{
                        background: isHovered
                          ? (pKnown !== undefined ? `${masteryColor(pKnown)}18` : 'rgba(59,130,246,0.08)')
                          : cellBg(pKnown, locked),
                        border: `1px solid ${isHovered ? (color + '50') : cellBorder(pKnown, locked)}`,
                        transform: isHovered ? 'translateY(-1px)' : undefined,
                        boxShadow: isHovered ? `0 4px 16px ${color}20` : undefined,
                        opacity: locked ? 0.45 : 1,
                      }}
                    >
                      {locked && (
                        <div className="absolute top-1.5 right-1.5">
                          <Lock size={9} style={{ color: '#374151' }} />
                        </div>
                      )}

                      {/* Color dot */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            background: pKnown !== undefined ? color : '#374151',
                            opacity: pKnown !== undefined ? 0.9 : 0.3,
                            boxShadow: pKnown !== undefined ? `0 0 4px ${color}80` : undefined,
                          }}
                        />
                        <span className="text-base leading-none">{topic.icon}</span>
                      </div>

                      <p
                        className="text-xs font-medium leading-tight"
                        style={{ color: locked ? '#374151' : pKnown !== undefined ? '#e8f0fe' : '#6b7280' }}
                      >
                        {topic.name}
                      </p>

                      {pKnown !== undefined && (
                        <div className="mt-2">
                          {/* Mastery bar */}
                          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${Math.round(pKnown * 100)}%`, background: color }}
                            />
                          </div>
                          <p className="text-xs mt-1 font-medium" style={{ color }}>
                            {Math.round(pKnown * 100)}%
                          </p>
                        </div>
                      )}

                      {pKnown === undefined && !locked && (
                        <p className="text-xs mt-1" style={{ color: '#374151' }}>Start</p>
                      )}
                    </div>
                  </Link>

                  {/* Tooltip */}
                  {isHovered && (
                    <div
                      className="absolute z-50 px-2.5 py-1.5 rounded-lg text-xs font-medium pointer-events-none whitespace-nowrap"
                      style={{
                        background: 'rgba(8,13,25,0.95)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        color: '#e8f0fe',
                        marginTop: 4,
                      }}
                    >
                      {topic.name} · {heatLabel(pKnown)}
                      {pKnown !== undefined && ` · ${Math.round(pKnown * 100)}%`}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
