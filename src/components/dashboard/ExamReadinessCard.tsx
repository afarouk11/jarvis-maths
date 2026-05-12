'use client'

import { motion } from 'framer-motion'
import type { ExamReadiness } from '@/lib/exam-readiness'

interface Props {
  readiness: ExamReadiness
}

export function ExamReadinessCard({ readiness }: Props) {
  const circumference = 2 * Math.PI * 38
  const dashOffset    = circumference * (1 - readiness.score / 100)

  const isGold = readiness.score >= 90

  return (
    <div
      className="p-5 rounded-2xl relative overflow-hidden"
      style={{
        background: isGold ? 'rgba(245,158,11,0.07)' : 'rgba(10,16,30,0.8)',
        border: `1px solid ${isGold ? 'rgba(245,158,11,0.25)' : `${readiness.color}20`}`,
        boxShadow: isGold ? '0 0 40px rgba(245,158,11,0.08)' : undefined,
      }}
    >
      {/* Background radial glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${readiness.color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div className="flex items-center gap-2 mb-4" style={{ position: 'relative' }}>
        <p className="text-xs uppercase tracking-wider font-medium" style={{ color: '#4a6070' }}>
          Exam Readiness
        </p>
      </div>

      <div className="flex items-center gap-4" style={{ position: 'relative' }}>
        {/* Ring */}
        <div className="relative shrink-0">
          <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            {/* Progress */}
            <motion.circle
              cx="45" cy="45" r="38" fill="none"
              stroke={readiness.color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              style={{ filter: `drop-shadow(0 0 6px ${readiness.color}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold leading-none"
              style={{
                color: readiness.color,
                fontFamily: 'var(--font-space-grotesk)',
                textShadow: `0 0 16px ${readiness.color}60`,
              }}
            >
              {readiness.score}
            </motion.span>
            <span className="text-xs mt-0.5" style={{ color: '#4a6070' }}>/100</span>
          </div>
        </div>

        {/* Label + grade */}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {readiness.label}
          </p>
          <p className="text-sm mt-0.5" style={{ color: readiness.color }}>
            Grade trajectory: <strong>{readiness.gradeTrajectory}</strong>
          </p>
          {readiness.daysToExam !== null && (
            <p className="text-xs mt-2" style={{
              color: readiness.daysToExam <= 14 ? '#f87171' : '#5a7aaa',
            }}>
              {readiness.daysToExam}d until exam
            </p>
          )}
        </div>
      </div>

      {/* Nudge */}
      {readiness.improvementNeeded && (
        <p className="text-xs mt-4 leading-relaxed" style={{ color: '#5a7aaa', position: 'relative' }}>
          {readiness.improvementNeeded}
        </p>
      )}
    </div>
  )
}
