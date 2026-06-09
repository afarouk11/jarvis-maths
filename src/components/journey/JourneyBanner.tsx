'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ArrowRight, Loader2 } from 'lucide-react'
import type { StepOutcome } from '@/lib/journey/types'

interface Props {
  /** Short label for the current phase, e.g. "Notes", "Practice", "Predicted paper". */
  phaseLabel: string
  topicName?: string
  /** Outcome to record when the student finishes this phase (e.g. accuracy, paper id). */
  outcome?: StepOutcome
}

/**
 * Shown on the notes / practice / papers pages when the student arrived from an
 * active journey (`?journey=...`). Advancing returns them to SPOK, who narrates
 * the next phase of the cycle.
 *
 * Reads the query param via window.location to avoid a useSearchParams Suspense
 * boundary on pages that don't otherwise need one.
 */
export function JourneyBanner({ phaseLabel, topicName, outcome }: Props) {
  const [journeyId, setJourneyId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setJourneyId(new URLSearchParams(window.location.search).get('journey'))
  }, [])

  if (!journeyId) return null

  async function done() {
    setBusy(true)
    try {
      await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance', outcome }),
      })
    } catch {
      /* non-fatal — still return to SPOK */
    }
    window.location.href = '/jarvis'
  }

  return (
    <motion.div
      initial={{ y: -14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 mb-4"
      style={{
        background: 'rgba(99,102,241,0.10)',
        border: '1px solid rgba(99,102,241,0.30)',
        backdropFilter: 'blur(8px)',
      }}
    >
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
    </motion.div>
  )
}
