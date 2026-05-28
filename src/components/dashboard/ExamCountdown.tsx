'use client'

import { motion } from 'framer-motion'
import { Clock, AlertTriangle } from 'lucide-react'

interface Props {
  examDate: string
  targetGrade: string
  examBoard: string
}

export function ExamCountdown({ examDate, targetGrade, examBoard }: Props) {
  const diff = new Date(examDate).getTime() - Date.now()
  const days = Math.max(0, Math.ceil(diff / 86400000))
  const weeks = Math.floor(days / 7)

  const urgency = days <= 14 ? 'critical' : days <= 30 ? 'high' : days <= 60 ? 'medium' : 'low'

  const colors = {
    critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#f87171', sub: 'rgba(239,68,68,0.6)' },
    high:     { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24', sub: 'rgba(245,158,11,0.6)' },
    medium:   { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.15)', text: '#60a5fa', sub: 'rgba(59,130,246,0.5)' },
    low:      { bg: 'rgba(34,197,94,0.05)',  border: 'rgba(34,197,94,0.12)',  text: '#4ade80', sub: 'rgba(34,197,94,0.4)' },
  }
  const c = colors[urgency]

  const message = days === 0
    ? 'Exam day — give it everything!'
    : days <= 7
      ? 'Final week. Prioritise past papers.'
      : days <= 14
        ? 'Two weeks out. Focus on weak topics.'
        : days <= 30
          ? 'One month left. Intensify your sessions.'
          : weeks <= 8
            ? 'Eight weeks to go. Build the habit now.'
            : 'Start early, finish strong.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {urgency === 'critical' ? (
              <AlertTriangle size={15} style={{ color: c.text }} />
            ) : (
              <Clock size={15} style={{ color: c.text }} />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.sub }}>
              {examBoard} Exam Countdown
            </span>
          </div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#5a7aaa' }}>{message}</p>
        </div>

        <div className="text-right shrink-0">
          <motion.p
            key={days}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="font-bold leading-none"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 44, color: c.text }}>
            {days}
          </motion.p>
          <p className="text-xs font-medium mt-0.5" style={{ color: c.sub }}>
            day{days !== 1 ? 's' : ''} left
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#3a4a5c' }}>
            Target: {targetGrade}
          </p>
        </div>
      </div>

      {/* Progress segments */}
      {days > 0 && (
        <div className="mt-4">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: c.text }}
              initial={{ width: '100%' }}
              animate={{ width: `${Math.min(100, Math.max(2, (days / 365) * 100))}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: '#3a4a5c' }}>now</span>
            <span className="text-[10px]" style={{ color: '#3a4a5c' }}>
              {new Date(examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
