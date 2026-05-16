'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Zap, Crown } from 'lucide-react'
import { getXPLevel } from '@/lib/xp-levels'

type Entry = {
  rank: number
  name: string
  xp: number
  streak: number
  isMe: boolean
  level: ReturnType<typeof getXPLevel>
}

type Data = {
  top: Entry[]
  userRank: number | null
  userXP: number
  userStreak: number
}

const RANK_STYLES: Record<number, { color: string; bg: string; border: string; label: string }> = {
  1: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', label: '🥇' },
  2: { color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.18)', label: '🥈' },
  3: { color: '#fb923c', bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.2)', label: '🥉' },
}

export default function LeaderboardClient() {
  const [tab, setTab] = useState<'xp' | 'streak'>('xp')
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?tab=${tab}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [tab])

  const meInTop = data?.top.some(e => e.isMe)

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Trophy size={20} style={{ color: '#fbbf24' }} />
        </div>
        <div>
          <h1 className="font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 24, letterSpacing: '-0.02em' }}>
            Leaderboard
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>Top students on StudiQ</p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="inline-flex items-center rounded-xl p-1 gap-1 mb-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['xp', 'streak'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: tab === t ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: tab === t ? '#60a5fa' : '#4a6070',
              border: tab === t ? '1px solid rgba(59,130,246,0.28)' : '1px solid transparent',
            }}>
            {t === 'xp' ? <Zap size={13} /> : <Flame size={13} />}
            {t === 'xp' ? 'XP' : 'Streak'}
          </button>
        ))}
      </div>

      {/* User's own rank card (if outside top 20) */}
      {!loading && data && data.userRank !== null && !meInTop && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl mb-4 flex items-center gap-3"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.22)' }}>
          <span className="text-sm font-bold w-8 text-center" style={{ color: '#60a5fa', fontFamily: 'var(--font-space-grotesk)' }}>
            #{data.userRank}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">You</p>
            <p className="text-xs" style={{ color: '#5a7aaa' }}>
              {tab === 'xp' ? `${data.userXP} XP` : `${data.userStreak} day streak`}
            </p>
          </div>
          <div className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>
            Keep going!
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
          ))
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {data?.top.map((entry) => {
                const rs = RANK_STYLES[entry.rank]
                const isTopThree = entry.rank <= 3
                return (
                  <motion.div
                    key={`${tab}-${entry.rank}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: entry.rank * 0.04 }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl relative overflow-hidden"
                    style={{
                      background: entry.isMe
                        ? 'rgba(59,130,246,0.09)'
                        : isTopThree ? rs.bg : 'rgba(255,255,255,0.025)',
                      border: entry.isMe
                        ? '1px solid rgba(59,130,246,0.28)'
                        : isTopThree ? `1px solid ${rs.border}` : '1px solid rgba(255,255,255,0.05)',
                    }}>

                    {/* Top-3 subtle glow */}
                    {isTopThree && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
                        background: `radial-gradient(ellipse at 10% 50%, ${rs.color}08 0%, transparent 60%)`,
                        pointerEvents: 'none',
                      }} />
                    )}

                    {/* Rank */}
                    <div className="w-8 text-center shrink-0" style={{ position: 'relative' }}>
                      {isTopThree ? (
                        <span className="text-lg">{rs.label}</span>
                      ) : (
                        <span className="text-sm font-bold" style={{ color: entry.isMe ? '#60a5fa' : '#3a4a5a', fontFamily: 'var(--font-space-grotesk)' }}>
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Name + level */}
                    <div className="flex-1 min-w-0" style={{ position: 'relative' }}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: entry.isMe ? '#93c5fd' : '#e2e8f0' }}>
                          {entry.isMe ? `${entry.name} (you)` : entry.name}
                        </p>
                        {entry.rank === 1 && <Crown size={12} style={{ color: '#fbbf24', flexShrink: 0 }} />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 rounded-full overflow-hidden" style={{ width: 48, background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.round(entry.level.progress * 100)}%`, background: entry.level.color }} />
                        </div>
                        <span className="text-xs" style={{ color: entry.level.color }}>
                          Lv.{entry.level.level} {entry.level.title}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0" style={{ position: 'relative' }}>
                      {tab === 'xp' ? (
                        <div className="flex items-center gap-1 justify-end">
                          <Zap size={12} style={{ color: entry.level.color }} />
                          <span className="font-bold text-sm" style={{ color: isTopThree ? rs.color : entry.isMe ? '#60a5fa' : '#94a3b8', fontFamily: 'var(--font-space-grotesk)' }}>
                            {entry.xp.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 justify-end">
                          <Flame size={12} style={{ color: '#f97316' }} />
                          <span className="font-bold text-sm" style={{ color: isTopThree ? rs.color : entry.isMe ? '#60a5fa' : '#94a3b8', fontFamily: 'var(--font-space-grotesk)' }}>
                            {entry.streak}d
                          </span>
                        </div>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: '#3a4a5a' }}>
                        {tab === 'xp' ? 'XP' : 'streak'}
                      </p>
                    </div>
                  </motion.div>
                )
              })}

              {data?.top.length === 0 && (
                <div className="text-center py-16">
                  <Trophy size={32} className="mx-auto mb-3" style={{ color: '#2d3a4a' }} />
                  <p className="text-sm" style={{ color: '#4a6070' }}>No data yet — start practising to appear here!</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
