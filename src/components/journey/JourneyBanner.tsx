'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ArrowRight, Loader2, X, Timer } from 'lucide-react'
import type { StepOutcome } from '@/lib/journey/types'

interface Props {
  phaseLabel: string
  topicName?: string
  outcome?: StepOutcome
  /** Parent flips this true to trigger the 5s final countdown (e.g. practice after N questions). */
  autoRedirect?: boolean
  /** Visible study timer: counts down from this many ms, then triggers 5s redirect countdown. */
  autoRedirectAfterMs?: number
  /** Practice session progress dots shown in the banner. */
  questionProgress?: { answered: number; total: number }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function JourneyBanner({
  phaseLabel,
  topicName,
  outcome,
  autoRedirect,
  autoRedirectAfterMs,
  questionProgress,
}: Props) {
  const [journeyId, setJourneyId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [studySecondsLeft, setStudySecondsLeft] = useState<number | null>(null)
  const [finalCountdown, setFinalCountdown] = useState<number | null>(null)
  const [cancelled, setCancelled] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setJourneyId(new URLSearchParams(window.location.search).get('journey'))
  }, [])

  const advance = useCallback(async () => {
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

  const startFinalCountdown = useCallback(() => {
    setStudySecondsLeft(null)
    setFinalCountdown(5)
    timerRef.current = setInterval(() => {
      setFinalCountdown(prev => {
        if (prev === null) return null
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          void advance()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [advance])

  const cancelAll = useCallback(() => {
    setCancelled(true)
    setFinalCountdown(null)
    setStudySecondsLeft(null)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  // Parent-triggered (practice: after N questions answered)
  useEffect(() => {
    if (!autoRedirect || !journeyId || cancelled) return
    startFinalCountdown()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoRedirect, journeyId, cancelled, startFinalCountdown])

  // Mount-based study timer (notes: counts down from estimated reading time)
  useEffect(() => {
    if (!autoRedirectAfterMs || !journeyId || cancelled) return
    const totalSeconds = Math.round(autoRedirectAfterMs / 1000)
    setStudySecondsLeft(totalSeconds)
    timerRef.current = setInterval(() => {
      setStudySecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          startFinalCountdown()
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRedirectAfterMs, journeyId])

  if (!journeyId) return null

  const isCountingDown = finalCountdown !== null

  return (
    <motion.div
      initial={{ y: -14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 mb-4"
      style={{
        background: isCountingDown ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.10)',
        border: `1px solid ${isCountingDown ? 'rgba(99,102,241,0.50)' : 'rgba(99,102,241,0.30)'}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left: phase label */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Brain size={16} className="shrink-0" style={{ color: '#818cf8' }} />
        <p className="text-xs sm:text-sm truncate" style={{ color: '#c7d2fe' }}>
          <span className="font-semibold uppercase tracking-wider" style={{ color: '#818cf8' }}>
            SPOK&apos;s plan
          </span>
          <span className="mx-1.5 opacity-40">·</span>
          {phaseLabel}
          {topicName ? <span className="opacity-70"> · {topicName}</span> : null}
        </p>
      </div>

      {/* Right: context-dependent controls */}
      <div className="flex items-center gap-2 shrink-0">
        {isCountingDown ? (
          <>
            <span className="text-xs hidden sm:inline" style={{ color: '#c7d2fe' }}>
              Back in <span className="font-bold text-white tabular-nums">{finalCountdown}s</span>
            </span>
            <button
              onClick={cancelAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03]"
              style={{ background: 'rgba(99,102,241,0.22)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
            >
              <X size={11} /> Stay
            </button>
          </>
        ) : studySecondsLeft !== null ? (
          <>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}
            >
              <Timer size={12} />
              {formatTime(studySecondsLeft)}
            </div>
            <button
              onClick={advance}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50"
              style={{ background: 'rgba(99,102,241,0.22)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : null}
              Ready →
            </button>
          </>
        ) : questionProgress ? (
          <>
            <div className="flex items-center gap-1">
              {Array.from({ length: questionProgress.total }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block w-2 h-2 rounded-full transition-all duration-300"
                  style={{ background: i < questionProgress.answered ? '#818cf8' : 'rgba(99,102,241,0.20)' }}
                />
              ))}
            </div>
            <span className="text-xs tabular-nums font-semibold" style={{ color: '#818cf8' }}>
              {questionProgress.answered}/{questionProgress.total}
            </span>
          </>
        ) : (
          <button
            onClick={advance}
            disabled={busy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
            style={{ background: 'rgba(99,102,241,0.22)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : null}
            Done — back to SPOK
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
