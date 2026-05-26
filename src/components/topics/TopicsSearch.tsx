'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { masteryColor, masteryLabel } from '@/lib/bkt/bayesian-knowledge-tracing'

interface Topic {
  slug: string
  name: string
  icon: string | null
}

interface Props {
  topics: Topic[]
  categories: Record<string, string[]>
  progressMap: Record<string, number>
}

export function TopicsSearch({ topics, categories, progressMap }: Props) {
  const [query, setQuery] = useState('')
  const q = query.toLowerCase().trim()

  const filteredCategories = Object.entries(categories).reduce<Record<string, string[]>>(
    (acc, [cat, slugs]) => {
      const matching = q
        ? slugs.filter(s => topics.find(x => x.slug === s)?.name.toLowerCase().includes(q))
        : slugs
      if (matching.length > 0) acc[cat] = matching
      return acc
    },
    {}
  )

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#3a4a5c' }} />
        <input
          type="text"
          placeholder="Search topics…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
      </div>

      {Object.keys(filteredCategories).length === 0 && (
        <p className="text-sm py-12 text-center" style={{ color: '#5a7aaa' }}>
          No topics match &ldquo;{query}&rdquo;
        </p>
      )}

      {Object.entries(filteredCategories).map(([category, slugs]) => {
        const categoryTopics = topics.filter(t => slugs.includes(t.slug))
        const studied = categoryTopics.filter(t => (progressMap[t.slug] ?? 0) > 0).length
        return (
          <section key={category}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">{category}</h2>
                <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
                  {studied} of {categoryTopics.length} started
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryTopics.map(topic => {
                const pKnown = progressMap[topic.slug] ?? 0
                const label = masteryLabel(pKnown)
                const color = masteryColor(pKnown)
                const started = pKnown > 0
                return (
                  <Link
                    key={topic.slug}
                    href={`/topics/${topic.slug}`}
                    className="group flex items-start gap-3 p-4 rounded-xl transition-all hover:scale-[1.01]"
                    style={{
                      background: started ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                      border: started ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <span className="text-xl mt-0.5 shrink-0">{topic.icon ?? '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm leading-tight">{topic.name}</p>
                      <p className="text-xs mt-1" style={{ color: started ? color : '#3a4a5c' }}>
                        {started ? label : 'Not started'}
                      </p>
                      <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(pKnown * 100)}%`, background: color }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
