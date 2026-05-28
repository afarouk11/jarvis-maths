'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { getXPLevel } from '@/lib/xp-levels'

interface Props {
  streakDays: number
  xp: number
  lastStudiedAt?: string | null
}

const MILESTONES = [
  { days: 7,   label: '7-day',   emoji: '🔥' },
  { days: 14,  label: '2-week',  emoji: '⚡' },
  { days: 30,  label: '1-month', emoji: '💫' },
  { days: 100, label: '100-day', emoji: '👑' },
]

export function StreakCard({ streakDays, xp, lastStudiedAt }: Props) {
  const lvl = getXPLevel(xp)

  const today = new Date().toISOString().slice(0, 10)
  const studiedToday = lastStudiedAt ? lastStudiedAt.slice(0, 10) === today : false
  const atRisk = streakDays > 0 && !studiedToday

  // Build last 7 day dots
  const dots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const daysAgo = 6 - i
    return {
      active: daysAgo < streakDays || (daysAgo === 0 && studiedToday),
      isToday: daysAgo === 0,
      label: d.toLocaleDateString('en-GB', { weekday: 'narrow' }),
    }
  })

  const earnedMilestones = MILESTONES.filter(m => streakDays >= m.days)
  const nextMilestone = MILESTONES.find(m => streakDays < m.days)

  const flameColor = streakDays >= 30 ? '#a78bfa' : streakDays >= 14 ? '#f59e0b' : streakDays >= 7 ? '#f97316' : '#3b82f6'

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{
        background: atRisk
          ? 'rgba(239,68,68,0.05)'
          : streakDays >= 7
            ? 'rgba(249,115,22,0.06)'
            : 'rgba(255,255,255,0.03)',
        border: `1px solid ${atRisk ? 'rgba(239,68,68,0.2)' : streakDays >= 7 ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.07)'}`,
      }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={streakDays > 0 ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
            <Flame size={18} style={{ color: flameColor }} />
          </motion.div>
          <span className="text-sm font-semibold text-white">Study Streak</span>
        </div>
        {atRisk && (
          <span className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
            Study today!
          </span>
        )}
        {!atRisk && studiedToday && streakDays > 0 && (
          <span className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
            ✓ Done today
          </span>
        )}
      </div>

      {/* Big number */}
      <div className="flex items-end gap-3">
        <motion.p
          key={streakDays}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-bold leading-none"
          style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, color: flameColor }}>
          {streakDays}
        </motion.p>
        <div className="pb-2">
          <p className="text-sm font-medium text-white">days</p>
          {nextMilestone && (
            <p className="text-xs" style={{ color: '#5a7aaa' }}>
              {nextMilestone.days - streakDays}d to {nextMilestone.emoji}
            </p>
          )}
        </div>
        {earnedMilestones.length > 0 && (
          <div className="ml-auto pb-1 flex gap-1">
            {earnedMilestones.map(m => (
              <span key={m.days} className="text-lg" title={`${m.label} streak`}>{m.emoji}</span>
            ))}
          </div>
        )}
      </div>

      {/* 7-day dots */}
      <div className="flex items-center gap-1.5">
        {dots.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full rounded-full"
              style={{
                height: 6,
                background: d.active
                  ? flameColor
                  : d.isToday
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(255,255,255,0.06)',
              }}
              initial={false}
              animate={{ opacity: d.active ? 1 : 0.5 }}
            />
            <span className="text-[10px]" style={{ color: d.isToday ? '#94a3b8' : '#3a4a5c' }}>{d.label}</span>
          </div>
        ))}
      </div>

      {/* XP level row */}
      <div className="flex items-center gap-3 pt-1">
        <div className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0"
          style={{ background: `${lvl.color}20`, color: lvl.color, border: `1px solid ${lvl.color}40` }}>
          Lv {lvl.level}
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: '#5a7aaa' }}>{lvl.title}</span>
            <span style={{ color: '#3a4a5c' }}>{xp} XP</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: lvl.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(lvl.progress * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
