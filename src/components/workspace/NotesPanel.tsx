'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { BlockRenderer } from '@/components/lessons/LessonBlocks'
import type { Lesson } from '@/types'

interface Props {
  topicSlug: string
  topicName: string
  onDone: () => void
}

/**
 * The topic's notes rendered inside the SPOK workspace panel — same
 * progressive block flow as the full lesson page, without leaving SPOK.
 */
export function NotesPanel({ topicSlug, topicName, onDone }: Props) {
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch(`/api/lesson?topic=${encodeURIComponent(topicSlug)}`)
      .then(r => (r.ok ? r.json() : []))
      .then((rows: Lesson[]) => {
        setLessons(rows)
        if (rows.length === 1) setLesson(rows[0])
      })
      .catch(() => setLessons([]))
  }, [topicSlug])

  async function generateLesson() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: topicSlug }),
      })
      const data = await res.json()
      if (res.ok) {
        setLesson(data)
        setLessons(prev => [...(prev ?? []), data])
      } else if (res.status === 403) {
        setGenError('Generating fresh notes needs Pro — but SPOK can still teach you this topic in chat.')
      } else {
        setGenError('Could not generate notes right now — ask SPOK to teach it in chat instead.')
      }
    } catch {
      setGenError('Could not generate notes right now — ask SPOK to teach it in chat instead.')
    } finally {
      setGenerating(false)
    }
  }

  function completeBlock(i: number) {
    if (!lesson) return
    setCompletedSet(prev => {
      const next = new Set([...prev, i])
      // Award lesson-completion progress once everything is read.
      if (next.size === lesson.content.length && prev.size !== lesson.content.length) {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId: topicSlug, correct: true, quality: 4, timeSeconds: 120 }),
        }).catch(() => {})
      }
      return next
    })
    if (i < lesson.content.length - 1) setActiveIndex(prev => Math.max(prev, i + 1))
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (lessons === null) {
    return (
      <div className="flex items-center gap-2 text-sm py-10 justify-center" style={{ color: '#5a7aaa' }}>
        <Loader2 size={15} className="animate-spin" /> Loading notes…
      </div>
    )
  }

  // ── No lesson chosen yet ───────────────────────────────────────────────────
  if (!lesson) {
    return (
      <div className="space-y-3">
        {lessons.length === 0 ? (
          <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}>
            <p className="text-sm mb-4" style={{ color: '#5a7aaa' }}>No notes for {topicName} yet.</p>
            <button onClick={generateLesson} disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)' }}>
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generating ? 'SPOK is writing your notes…' : 'Generate notes'}
            </button>
            {genError ? <p className="text-xs mt-3" style={{ color: '#fca5a5' }}>{genError}</p> : null}
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#5a7aaa' }}>
              Pick a lesson
            </p>
            {lessons.map((l, i) => (
              <button key={l.id} onClick={() => setLesson(l)}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <span className="text-blue-400 font-mono text-sm w-6">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{l.title}</p>
                  <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color: '#5a7aaa' }}>
                    {l.estimated_minutes ? <span className="flex items-center gap-1"><Clock size={11} />~{l.estimated_minutes} min</span> : null}
                    <span>Difficulty {l.difficulty}/5</span>
                  </p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    )
  }

  // ── Lesson flow ────────────────────────────────────────────────────────────
  const blocks = lesson.content
  const isComplete = completedSet.size === blocks.length

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={13} style={{ color: '#3b82f6' }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#3b82f6' }}>{topicName}</span>
        </div>
        <h2 className="text-lg font-bold text-white">{lesson.title}</h2>
        <div className="h-1 rounded-full bg-slate-800 mt-3">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
            animate={{ width: `${Math.round((completedSet.size / blocks.length) * 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {blocks.slice(0, activeIndex + 1).map((block, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}>
          <BlockRenderer
            block={block}
            index={i}
            completed={completedSet.has(i)}
            active={i === activeIndex}
            onComplete={() => completeBlock(i)}
          />
        </motion.div>
      ))}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl text-center"
          style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p className="text-green-400 font-bold">Notes complete</p>
          <p className="text-sm mt-1 mb-4" style={{ color: '#5a7aaa' }}>
            Tell SPOK you&apos;re done — it&apos;ll check you&apos;re ready before practice.
          </p>
          <button onClick={onDone}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)' }}>
            Done — back to SPOK <ArrowRight size={13} className="inline ml-1" />
          </button>
        </motion.div>
      )}
    </div>
  )
}
