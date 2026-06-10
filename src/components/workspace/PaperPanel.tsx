'use client'

import { useEffect, useState } from 'react'
import { Loader2, FileText } from 'lucide-react'
import { MockExamView, type MockPaper } from '@/components/papers/MockExamView'

interface Props {
  onDone: () => void
}

/**
 * The assess phase inside SPOK's workspace: generates a predicted paper and
 * sits the student in the fullscreen exam view. Closing the exam returns
 * them to SPOK for the review conversation.
 */
export function PaperPanel({ onDone }: Props) {
  const [paper, setPaper] = useState<MockPaper | null>(null)
  const [focusTopics, setFocusTopics] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/generate-paper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        if (cancelled) return
        if (!res.ok) {
          setError(`SPOK couldn't build the paper (error ${res.status}).`)
          return
        }
        const json = await res.json()
        if (cancelled) return
        setPaper(json.paper)
        setFocusTopics(json.focusTopics ?? [])
      } catch {
        if (!cancelled) setError("SPOK couldn't build the paper — network problem.")
      }
    }, 0)
    return () => { cancelled = true; clearTimeout(t) }
  }, [attempt])

  if (paper) {
    return <MockExamView paper={paper} focusTopics={focusTopics} onClose={onDone} />
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {error ? (
        <>
          <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
          <button
            onClick={() => { setError(null); setAttempt(a => a + 1) }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)' }}>
            Try again
          </button>
        </>
      ) : (
        <>
          <FileText size={22} style={{ color: '#818cf8' }} />
          <p className="text-sm flex items-center gap-2" style={{ color: '#c7d2fe' }}>
            <Loader2 size={14} className="animate-spin" />
            SPOK is writing your predicted paper…
          </p>
          <p className="text-xs max-w-xs" style={{ color: '#5a7aaa' }}>
            Built around your weakest topics. This takes a minute — the exam opens fullscreen when it&apos;s ready.
          </p>
        </>
      )}
    </div>
  )
}
