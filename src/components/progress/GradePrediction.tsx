'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'
import { gradeColor } from '@/lib/grade'

const ALEVEL_ORDER = ['A*', 'A', 'B', 'C', 'D', 'E', 'U']
const GCSE_ORDER   = ['9', '8', '7', '6', '5', '4', '3', 'U']

interface Props {
  avgPKnown: number
  targetGrade?: string
  attemptedAvgPKnown?: number
  attemptedCount?: number
  level?: string | null
}

export function GradePrediction({ avgPKnown, targetGrade, attemptedAvgPKnown, attemptedCount, level }: Props) {
  const grade = predictedGrade(avgPKnown, level)
  const gradeOrder = (level ?? '').trim().toLowerCase() === 'gcse' ? GCSE_ORDER : ALEVEL_ORDER
  const color = gradeColor(grade)
  const pct = Math.round(avgPKnown * 100)

  const targetIdx = gradeOrder.indexOf(targetGrade ?? gradeOrder[0])
  const currentIdx = gradeOrder.indexOf(grade)
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
            {pct}% across all topics
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

      {/* Secondary stat — mastery within studied topics only */}
      {attemptedAvgPKnown !== undefined && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-xs font-semibold" style={{ color: '#93c5fd' }}>
              {Math.round(attemptedAvgPKnown * 100)}%
            </p>
            <p className="text-xs" style={{ color: '#4a6070' }}>
              mastery within studied topics{attemptedCount !== undefined ? ` (${attemptedCount})` : ''}
            </p>
          </div>
          <p className="text-xs text-right" style={{ color: '#374151', maxWidth: 100 }}>
            Overall grade includes unstudied topics
          </p>
        </div>
      )}

      {/* Grade scale */}
      <div className="flex gap-1">
        {gradeOrder.map(g => {
          const isActive = g === grade
          const isTarget = g === targetGrade
          return (
            <div key={g} className="flex-1 text-center">
              <div
                className="h-1.5 rounded-full mb-1"
                style={{
                  background: isActive ? gradeColor(g) : 'rgba(255,255,255,0.06)',
                  border: isTarget ? `1px solid ${gradeColor(g)}` : 'none',
                }} />
              <span className="text-xs" style={{ color: isActive ? gradeColor(g) : '#374151', fontWeight: isActive ? 700 : 400 }}>
                {g}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
