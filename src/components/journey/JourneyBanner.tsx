'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ArrowRight, X, Timer } from 'lucide-react'
import { journeyStorageKeys, clearJourneyStorage } from '@/lib/journey/storage'

interface Props {
  phaseLabel: string
  topicName?: string
  /** Parent flips this true to trigger the final countdown (e.g. practice after N questions). */
  autoRedirect?: boolean
  /**
   * Visible study timer: counts down this many ms, then triggers the redirect
   * countdown. Wall-clock based (the deadline persists in localStorage), so it
   * survives refreshes and keeps honest time in throttled background tabs.
   */
  autoRedirectAfterMs?: number
  /** Practice session progress dots shown in the banner. */
  questionProgress?: { answered: number; total: number }
}

const FINAL_COUNTDOWN_SECONDS = 10

export function JourneyBanner({
  phaseLabel,
  topicName,
  autoRedirect,
  autoRedirectAfterMs,
  questionProgress,
}: Props) {
  const [journeyId, setJourneyId] = useState<string | null>(null)
  const [studySecondsLeft, setStudySecondsLeft] = useState<number | null>(null)
  const [finalCountdown, setFinalCountdown] = useState<number | null>(null)
  const [cancelled, setCancelled] = useState(false)
  const studyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const returningRef = useRef(false)

  useEffect(() => {
    setJourneyId(new URLSearchParams(window.location.search).get('journey'))
  }, [])

  // Returning never advances the journey phase — SPOK gates that itself in
  // chat (readiness check first). We just hand the student back with context.
  const returnToSpok = useCallback(() => {
    if (returningRef.current) return
    returningRef.current = true
    if (journeyId) clearJourneyStorage(journeyId)
    const from = phaseLabel.toLowerCase().replace(/[^a-z]+/g, '-')
    window.location.href = `/jarvis?returned=${from}`
  }, [journeyId, phaseLabel])

  const cancelAll = useCallback(() => {
    setCancelled(true)
    setFinalCountdown(null)
    setStudySecondsLeft(null)
    if (studyTimerRef.current) clearInterval(studyTimerRef.current)
    if (journeyId) localStorage.removeItem(journeyStorageKeys(journeyId).studyDeadline)
  }, [journeyId])

  // Parent-triggered (practice: after N questions answered)
  useEffect(() => {
    if (!autoRedirect || !journeyId || cancelled || finalCountdown !== null) return
    setFinalCountdown(FINAL_COUNTDOWN_SECONDS)
  }, [autoRedirect, journeyId, cancelled, finalCountdown])

  // Study timer (notes): ticks down to a persisted wall-clock deadline, so it
  // survives refreshes and keeps honest time in throttled background tabs. On
  // expiry the tick callback starts the final countdown — never from inside a
  // state updater, where StrictMode's double invocation could start two.
  useEffect(() => {
    if (!autoRedirectAfterMs || !journeyId || cancelled) return
    const key = journeyStorageKeys(journeyId).studyDeadline
    const stored = Number(localStorage.getItem(key))
    const deadline = stored > Date.now() - autoRedirectAfterMs && stored > 0
      ? stored
      : Date.now() + autoRedirectAfterMs
    localStorage.setItem(key, String(deadline))

    const tick = () => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000))
      if (left <= 0) {
        if (studyTimerRef.current) clearInterval(studyTimerRef.current)
        studyTimerRef.current = null
        setStudySecondsLeft(null)
        setFinalCountdown(prev => prev ?? FINAL_COUNTDOWN_SECONDS)
      } else {
        setStudySecondsLeft(left)
      }
    }
    const kickoff = setTimeout(tick, 0)
    studyTimerRef.current = setInterval(tick, 1000)
    return () => {
      clearTimeout(kickoff)
      if (studyTimerRef.current) clearInterval(studyTimerRef.current)
    }
  }, [autoRedirectAfterMs, journeyId, cancelled])

  // Final countdown: one timeout per tick; the callback returns to SPOK
  // exactly once when it reaches the last second.
  useEffect(() => {
    if (finalCountdown === null || cancelled) return
    const t = setTimeout(() => {
      if (finalCountdown <= 1) returnToSpok()
      else setFinalCountdown(finalCountdown - 1)
    }, 1000)
    return () => clearTimeout(t)
  }, [finalCountdown, cancelled, returnToSpok])

  if (!journeyId) return null

  const isCountingDown = finalCountdown !== null
  const totalStudySeconds = autoRedirectAfterMs ? Math.round(autoRedirectAfterMs / 1000) : 0
  const studyLeft = studySecondsLeft ?? totalStudySeconds
  const studyFraction = totalStudySeconds > 0
    ? Math.min(1, Math.max(0, 1 - studyLeft / totalStudySeconds))
    : 0
  const studyMinutesLeft = Math.ceil(studyLeft / 60)
  const dotsFilled = questionProgress
    ? Math.min(questionProgress.answered, questionProgress.total)
    : 0

  const buttonStyle = {
    background: 'rgba(99,102,241,0.22)',
    border: '1px solid rgba(99,102,241,0.4)',
    color: '#a5b4fc',
  }

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

      {/* Screen-reader announcement when the auto-return countdown starts */}
      {isCountingDown ? (
        <span className="sr-only" role="status" aria-live="polite">
          Returning to SPOK in {FINAL_COUNTDOWN_SECONDS} seconds. Press Stay to keep working.
        </span>
      ) : null}

      {/* Right: context-dependent controls */}
      <div className="flex items-center gap-2 shrink-0">
        {isCountingDown ? (
          <>
            <span className="text-xs" style={{ color: '#c7d2fe' }} aria-hidden="true">
              Back in <span className="font-bold text-white tabular-nums">{finalCountdown}s</span>
            </span>
            <button
              onClick={cancelAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03]"
              style={buttonStyle}
            >
              <X size={11} /> Stay
            </button>
          </>
        ) : cancelled || (!questionProgress && !autoRedirectAfterMs) ? (
          <button
            onClick={returnToSpok}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={buttonStyle}
          >
            Done — back to SPOK
            <ArrowRight size={13} />
          </button>
        ) : autoRedirectAfterMs ? (
          <>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}
            >
              <Timer size={12} />
              <span
                className="relative h-1 w-16 rounded-full overflow-hidden"
                style={{ background: 'rgba(99,102,241,0.20)' }}
                role="progressbar"
                aria-valuenow={Math.round(studyFraction * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Study time"
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                  style={{ width: `${studyFraction * 100}%`, background: '#818cf8' }}
                />
              </span>
              <span className="tabular-nums whitespace-nowrap">
                {studyMinutesLeft >= 1 ? `~${studyMinutesLeft} min` : '<1 min'}
              </span>
            </div>
            <button
              onClick={returnToSpok}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03]"
              style={buttonStyle}
            >
              Ready →
            </button>
          </>
        ) : questionProgress ? (
          <>
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: questionProgress.total }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block w-2 h-2 rounded-full transition-all duration-300"
                  style={{ background: i < dotsFilled ? '#818cf8' : 'rgba(99,102,241,0.20)' }}
                />
              ))}
            </div>
            <span className="text-xs tabular-nums font-semibold" style={{ color: '#818cf8' }}>
              {dotsFilled}/{questionProgress.total}
            </span>
          </>
        ) : null}
      </div>
    </motion.div>
  )
}
