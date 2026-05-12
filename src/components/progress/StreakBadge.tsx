'use client'

import { motion } from 'framer-motion'
import { Zap, Star } from 'lucide-react'

const XP_MILESTONES = [100, 250, 500, 1000, 2500, 5000]

interface Props {
  streakDays: number
  xp: number
}

export function StreakBadge({ streakDays, xp }: Props) {
  const nextMilestone = XP_MILESTONES.find(m => m > xp) ?? XP_MILESTONES[XP_MILESTONES.length - 1]
  const prevMilestone = XP_MILESTONES.slice().reverse().find(m => m <= xp) ?? 0
  const xpProgress = prevMilestone === nextMilestone ? 100 : Math.round(((xp - prevMilestone) / (nextMilestone - prevMilestone)) * 100)

  const streakColor = streakDays >= 7 ? '#f59e0b' : streakDays >= 3 ? '#3b82f6' : '#5a7aaa'

  return (
    <div className="flex gap-3">
      {/* Streak */}
      <div className="flex-1 p-4 rounded-2xl"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} style={{ color: streakColor }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a7aaa' }}>
            Streak
          </span>
        </div>
        <motion.p
          className="text-3xl font-bold"
          style={{ color: streakColor }}
          key={streakDays}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}>
          {streakDays}d
        </motion.p>
        <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
          {streakDays === 0 ? 'Start your streak!' : streakDays >= 7 ? 'On fire! 🔥' : 'Keep going!'}
        </p>
      </div>

      {/* XP */}
      <div className="flex-1 p-4 rounded-2xl"
        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Star size={14} style={{ color: '#22c55e' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a7aaa' }}>
            XP
          </span>
        </div>
        <motion.p
          className="text-3xl font-bold text-green-400"
          key={xp}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}>
          {xp}
        </motion.p>
        <div className="mt-2 h-1 rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-green-400"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: '#5a7aaa' }}>
          {nextMilestone - xp} XP to next milestone
        </p>
      </div>
    </div>
  )
}
