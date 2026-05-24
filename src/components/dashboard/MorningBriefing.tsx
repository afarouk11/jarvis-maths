'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, Target, BookOpen } from 'lucide-react'

interface BriefingData {
  dueCount: number
  weakestTopic: string | null
  daysToExam: number | null
  avgMastery: number
  firstName: string | null
}

export function MorningBriefing() {
  const [data, setData] = useState<BriefingData | null>(null)

  useEffect(() => {
    fetch('/api/morning-briefing')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return null
  if (data.dueCount === 0 && !data.weakestTopic && data.daysToExam === null) return null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#f59e0b' }} />
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
          {greeting}{data.firstName ? `, ${data.firstName}` : ''} · Today&apos;s briefing
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.dueCount > 0 && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Clock size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <p className="text-xs font-bold text-white">{data.dueCount} due</p>
              <p className="text-xs" style={{ color: '#5a7aaa' }}>for review</p>
            </div>
          </div>
        )}

        {data.weakestTopic && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Target size={14} style={{ color: '#f87171', flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{data.weakestTopic}</p>
              <p className="text-xs" style={{ color: '#5a7aaa' }}>weakest topic</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Zap size={14} style={{ color: '#a5b4fc', flexShrink: 0 }} />
          <div>
            <p className="text-xs font-bold text-white">{data.avgMastery}%</p>
            <p className="text-xs" style={{ color: '#5a7aaa' }}>avg mastery</p>
          </div>
        </div>

        {data.daysToExam !== null && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{
              background: data.daysToExam < 14 ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)',
              border: `1px solid ${data.daysToExam < 14 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
            }}>
            <BookOpen size={14} style={{ color: data.daysToExam < 14 ? '#f87171' : '#34d399', flexShrink: 0 }} />
            <div>
              <p className="text-xs font-bold text-white">{data.daysToExam}d</p>
              <p className="text-xs" style={{ color: '#5a7aaa' }}>to exam</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
