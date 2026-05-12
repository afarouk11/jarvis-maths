'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'

const GRADE_ORDER = ['A*', 'A', 'B', 'C', 'D', 'E']

const GRADE_COLOR: Record<string, string> = {
  'A*': '#22c55e',
  'A':  '#3b82f6',
  'B':  '#8b5cf6',
  'C':  '#f59e0b',
  'D':  '#ef4444',
  'E':  '#6b7280',
}

interface Props {
  avgPKnown: number
  targetGrade?: string
}

export function GradePrediction({ avgPKnown, targetGrade }: Props) {
  const grade = predictedGrade(avgPKnown)
  const color = GRADE_COLOR[grade] ?? '#3b82f6'
  const pct = Math.round(avgPKnown * 100)

  const targetIdx = GRADE_ORDER.indexOf(targetGrade ?? 'A*')
  const currentIdx = GRADE_ORDER.indexOf(grade)
  const onTrack = currentIdx <= targetIdx

  return (
    <div className="p-5 rounded-2xl"
      style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#5a7aaa' }}>
            Predicted Grade
          </p>
          <motion.div
            className="text-5xl font-bold"
            style={{ color }}
            key={grade}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}>
            {grade}
          </motion.div>
          <p className="text-xs mt-1" style={{ color: '#5a7aaa' }}>
            {pct}% average mastery
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs"
            style={{ color: onTrack ? '#22c55e' : '#f59e0b' }}>
            <TrendingUp size={12} />
            {onTrack ? 'On track' : 'Needs work'}
          </div>
          {targetGrade && (
            <p className="text-xs mt-1" style={{ color: '#5a7aaa' }}>
              Target: {targetGrade}
            </p>
          )}
        </div>
      </div>

      {/* Grade scale */}
      <div className="flex gap-1">
        {GRADE_ORDER.map((g, i) => {
          const isActive = g === grade
          const isTarget = g === targetGrade
          return (
            <div key={g} className="flex-1 text-center">
              <div
                className="h-1.5 rounded-full mb-1"
                style={{
                  background: isActive ? GRADE_COLOR[g] : 'rgba(255,255,255,0.06)',
                  border: isTarget ? `1px solid ${GRADE_COLOR[g]}` : 'none',
                }} />
              <span className="text-xs" style={{ color: isActive ? GRADE_COLOR[g] : '#374151', fontWeight: isActive ? 700 : 400 }}>
                {g}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
