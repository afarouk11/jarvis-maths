'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ArrowRight, Loader2, X } from 'lucide-react'
import type { StepOutcome } from '@/lib/journey/types'

interface Props {
  phaseLabel: string
  topicName?: string
  outcome?: StepOutcome
  /** When true, start a 5-second countdown then redirect automatically. */
  autoRedirect?: boolean
  /** Auto-redirect this many ms after mount (for read-at-own-pace pages like Notes). */
  autoRedirectAfterMs?: number
}

export function JourneyBanner({ phaseLabel, topicName, outcome, autoRedirect, autoRedirectAfterMs }: Props) {
  const [journeyId, setJourneyId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [cancelled, setCancelled] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setJourneyId(new URLSearchParams(window.location.search).get('journey'))
  }, [])

  const done = useCallback(async () => {
    setBusy(true)
    try {
      await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance', outcome }),
      })
    } catch { /* non-fatal */ }
    window.location.href = '/jarvis'
  }, [outcome])

  const startCountdown = useCallback(() => {
    setCountdown(5)
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          void done()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [done])

  // Triggered by parent (e.g. practice page after self-assessment).
  useEffect(() => {
    if (!autoRedirect || !journeyId || cancelled) return
    startCountdown()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoRedirect, journeyId, cancelled, startCountdown])

  // Mount-based delay (e.g. notes page — give them reading time first).
  useEffect(() => {
    if (!autoRedirectAfterMs || !journeyId || cancelled) return
    const timeout = setTimeout(() => {
      if (!cancelled) startCountdown()
    }, autoRedirectAfterMs)
    return () => clearTimeout(timeout)
  }, [autoRedirectAfterMs, journeyId, cancelled, startCountdown])

  if (!journeyId) return null

  const bannerStyle = {
    background: countdown !== null ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.10)',
    border: `1px solid ${countdown !== null ? 'rgba(99,102,241,0.50)' : 'rgba(99,102,241,0.30)'}`,
    backdropFilter: 'blur(8px)',
  }

  return (
    <motion.div
      initial={{ y: -14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 mb-4"
      style={bannerStyle}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Brain size={16} className="shrink-0" style={{ color: '#818cf8' }} />
        {countdown !== null ? (
          <p className="text-xs sm:text-sm" style={{ color: '#c7d2fe' }}>
            <span className="font-semibold" style={{ color: '#818cf8' }}>SPOK</span>
            {' '}is bringing you back in{' '}
            <span className="font-bold text-white tabular-nums">{countdown}s</span>
          </p>
        ) : (
          <p className="text-xs sm:text-sm truncate" style={{ color: '#c7d2fe' }}>
            <span className="font-semibold uppercase tracking-wider" style={{ color: '#818cf8' }}>
              SPOK&apos;s plan
            </span>
            <span className="mx-1.5 opacity-40">·</span>
            {phaseLabel}
            {topicName ? <span className="opacity-70"> · {topicName}</span> : null}
          </p>
        )}
      </div>
      {countdown !== null ? (
        <button
          onClick={() => { setCancelled(true); setCountdown(null); if (intervalRef.current) clearInterval(intervalRef.current) }}
          className="flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{ background: 'rgba(99,102,241,0.22)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
        >
          <X size={13} />
          Stay here
        </button>
      ) : (
        <button
          onClick={done}
          disabled={busy}
          className="flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
          style={{ background: 'rgba(99,102,241,0.22)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : null}
          Done — back to SPOK
          <ArrowRight size={13} />
        </button>
      )}
    </motion.div>
  )
}
