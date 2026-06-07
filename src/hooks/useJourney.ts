'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LearningJourney, JourneyStep, StepOutcome } from '@/lib/journey/types'
import type { Level } from '@/lib/curriculum'
import type { StudentProgress } from '@/types'

interface JourneyState {
  journey: LearningJourney | null
  steps: JourneyStep[]
  focusSlug: string | null
  progress: StudentProgress[]
  level: Level
}

const EMPTY: JourneyState = {
  journey: null,
  steps: [],
  focusSlug: null,
  progress: [],
  level: 'A-Level',
}

/**
 * Reads and drives the student's active learning journey. Mirrors the
 * `/api/journey` route: refresh after every mutation so the brain + UI track
 * the server-side state machine.
 */
export function useJourney() {
  const [state, setState] = useState<JourneyState>(EMPTY)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/journey')
      if (!res.ok) return
      const data = await res.json()
      setState({
        journey: data.journey ?? null,
        steps: data.steps ?? [],
        focusSlug: data.focusSlug ?? null,
        progress: data.progress ?? [],
        level: data.level ?? 'A-Level',
      })
    } catch {
      /* network — keep last state */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const post = useCallback(async (action: 'start' | 'advance' | 'end', outcome?: StepOutcome) => {
    try {
      await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, outcome }),
      })
    } catch {
      /* non-fatal */
    }
    await refresh()
  }, [refresh])

  const start = useCallback(() => post('start'), [post])
  const advance = useCallback((outcome?: StepOutcome) => post('advance', outcome), [post])
  const end = useCallback(() => post('end'), [post])

  return { ...state, loading, refresh, start, advance, end }
}
