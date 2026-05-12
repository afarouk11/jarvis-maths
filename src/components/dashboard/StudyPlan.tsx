'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, BookOpen, FileText, RefreshCw } from 'lucide-react'

interface Session {
  time:     string
  topic:    string
  activity: string
  priority: 'high' | 'medium' | 'low'
}

interface Plan {
  sessions:     Session[]
  tip:          string
  totalMinutes: number
}

const PRIORITY_COLOR = {
  high:   { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#f87171' },
  medium: { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  text: '#fbbf24' },
  low:    { bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
}

function activityIcon(activity: string) {
  const a = activity.toLowerCase()
  if (a.includes('past paper') || a.includes('mock')) return <FileText size={13} />
  if (a.includes('practice') || a.includes('question')) return <Zap size={13} />
  return <BookOpen size={13} />
}

export function StudyPlan() {
  const [plan,    setPlan]    = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchPlan() {
    setLoading(true)
    setPlan(null)
    try {
      const res  = await fetch('/api/study-plan')
      const data = await res.json()
      setPlan(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchPlan() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
          Today's Plan
        </h2>
        <button onClick={fetchPlan} disabled={loading}
          className="text-xs flex items-center gap-1 transition-colors disabled:opacity-40"
          style={{ color: '#5a7aaa' }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      )}

      {plan && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {plan.sessions.map((s, i) => {
            const c = PRIORITY_COLOR[s.priority] ?? PRIORITY_COLOR.low
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <div className="mt-0.5 shrink-0" style={{ color: c.text }}>
                  {activityIcon(s.activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.topic}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#94a3b8' }}>{s.activity}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0" style={{ color: '#5a7aaa' }}>
                  <Clock size={11} />
                  <span className="text-xs">{s.time}</span>
                </div>
              </motion.div>
            )
          })}

          {plan.tip && (
            <div className="mt-3 p-3 rounded-xl text-xs leading-relaxed italic"
              style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)', color: '#94a3b8' }}>
              "{plan.tip}"
            </div>
          )}

          <p className="text-xs text-right mt-1" style={{ color: '#3d5270' }}>
            {plan.totalMinutes} min total
          </p>
        </motion.div>
      )}
    </div>
  )
}
