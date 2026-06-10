'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Zap, ArrowRight } from 'lucide-react'
import { MixedMath } from '@/components/math/MathRenderer'
import { StepByStepSolution } from '@/components/math/StepByStepSolution'
import { sanitizeSvg } from '@/lib/math/sanitize-svg'
import { friendlyError } from '@/lib/friendly-error'
import type { Question } from '@/types'

interface MarkResult {
  correct: boolean
  quality: number
  feedback: string
  marksAwarded?: number
  marksTotal?: number
  exam_technique_flags?: string[]
}

interface Props {
  topicSlug: string
  topicName: string
  /** Number of questions in this session (BKT-sized by the caller). */
  total: number
  onDone: (summary: { answered: number; correct: number }) => void
}

/**
 * The practice loop embedded in the SPOK workspace panel: question → answer →
 * marking → next, ramping easy → hard across the set. The student never
 * leaves SPOK's side.
 */
export function PracticePanel({ topicSlug, topicName, total, onDone }: Props) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [marking, setMarking] = useState(false)
  const [markResult, setMarkResult] = useState<MarkResult | null>(null)
  const [freeReveal, setFreeReveal] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [xpGain, setXpGain] = useState<number | null>(null)
  const startTimeRef = useRef(0)
  const answeredRef = useRef(0)

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setQuestion(null)
    setAnswer('')
    setMarkResult(null)
    setFreeReveal(false)
    startTimeRef.current = Date.now()
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topicSlug,
          topicName,
          rampPosition: total > 1 ? Math.min(1, answeredRef.current / (total - 1)) : undefined,
        }),
      })
      if (!res.ok) {
        setError(friendlyError(`Server error ${res.status}`))
      } else {
        setQuestion(await res.json())
      }
    } catch (err: unknown) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [topicSlug, topicName, total])

  // Deferred a tick so StrictMode's double-mounted effect cancels the first
  // call instead of generating two questions.
  useEffect(() => {
    const t = setTimeout(() => { void generate() }, 0)
    return () => clearTimeout(t)
  }, [generate])

  async function submit() {
    if (!question || !answer.trim() || marking) return
    setMarking(true)
    try {
      const res = await fetch('/api/mark-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stem: question.stem,
          correctAnswer: question.answer,
          workedSolution: question.worked_solution,
          studentAnswer: answer,
        }),
      })
      if (res.status === 403) {
        // Free tier: no AI marking — reveal the solution and let them self-assess.
        setFreeReveal(true)
        return
      }
      if (res.ok) setMarkResult(await res.json())
      else setError(friendlyError(`Server error ${res.status}`))
    } catch (err: unknown) {
      setError(friendlyError(err))
    } finally {
      setMarking(false)
    }
  }

  async function recordAndNext(quality: number, wasCorrect: boolean) {
    if (!question) return
    const nextAnswered = answeredRef.current + 1
    answeredRef.current = nextAnswered
    setAnswered(nextAnswered)
    if (wasCorrect) setCorrectCount(c => c + 1)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topicSlug,
          questionId: question.id,
          correct: wasCorrect,
          timeSeconds: Math.round((Date.now() - startTimeRef.current) / 1000),
          quality,
          difficulty: question.difficulty,
          skill: question.skill,
          marksEarned: markResult?.marksAwarded,
          marksAvailable: markResult?.marksTotal,
          format: 'written',
          misconceptions: markResult?.exam_technique_flags ?? [],
        }),
      })
      const data = await res.json()
      if (data.xpGain) {
        setXpGain(data.xpGain)
        setTimeout(() => setXpGain(null), 2000)
      }
    } catch { /* non-fatal — keep the session moving */ }

    if (nextAnswered < total) void generate()
  }

  const sessionDone = answered >= total

  return (
    <div className="flex flex-col h-full">
      {/* Progress dots */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className="inline-block w-2 h-2 rounded-full transition-all duration-300"
              style={{ background: i < answered ? '#818cf8' : 'rgba(99,102,241,0.2)' }} />
          ))}
        </div>
        <span className="text-xs tabular-nums font-semibold" style={{ color: '#818cf8' }}>
          {Math.min(answered, total)}/{total}
        </span>
      </div>

      <AnimatePresence>
        {xpGain !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold mb-3 self-start"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b' }}>
            <Zap size={12} /> +{xpGain} XP
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {sessionDone ? (
          <div className="p-6 rounded-2xl text-center"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p className="text-green-400 font-bold text-lg mb-1">Set complete</p>
            <p className="text-sm mb-5" style={{ color: '#5a7aaa' }}>
              {correctCount}/{total} correct on {topicName}.
            </p>
            <button onClick={() => onDone({ answered, correct: correctCount })}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)' }}>
              Tell SPOK how I did <ArrowRight size={13} className="inline ml-1" />
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-sm py-10 justify-center" style={{ color: '#5a7aaa' }}>
            <Loader2 size={15} className="animate-spin" /> SPOK is writing question {answered + 1}…
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            {error}
            <button onClick={generate} className="block mt-2 underline">Try again</button>
          </div>
        ) : question ? (
          <>
            {/* Question */}
            <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: '#5a7aaa' }}>
                <span>Question {answered + 1}</span>
                <span>·</span>
                <span>{question.marks} mark{question.marks === 1 ? '' : 's'}</span>
                <span>·</span>
                <span>Difficulty {question.difficulty}/5</span>
              </div>
              <div className="text-sm text-slate-200 leading-relaxed">
                <MixedMath content={question.stem} />
              </div>
              {question.diagram ? (
                <div className="mt-3 [&_svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(question.diagram) }} />
              ) : null}
            </div>

            {/* Answer / marking */}
            {!markResult && !freeReveal ? (
              <div className="space-y-3">
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  rows={4}
                  placeholder="Show your working line by line…"
                  className="w-full p-4 rounded-xl text-sm text-slate-200 resize-y outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button
                  onClick={submit}
                  disabled={!answer.trim() || marking}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-40"
                  style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)' }}>
                  {marking ? <Loader2 size={14} className="animate-spin" /> : null}
                  {marking ? 'SPOK is marking…' : 'Submit for marking'}
                </button>
              </div>
            ) : null}

            {/* Marked result */}
            {markResult ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl flex items-start gap-3"
                  style={{
                    background: markResult.correct ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.07)',
                    border: `1px solid ${markResult.correct ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                  {markResult.correct
                    ? <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />}
                  <div className="text-sm" style={{ color: '#d1deff' }}>
                    {typeof markResult.marksAwarded === 'number' && typeof markResult.marksTotal === 'number' ? (
                      <p className="font-semibold mb-1">{markResult.marksAwarded}/{markResult.marksTotal} marks</p>
                    ) : null}
                    <MixedMath content={markResult.feedback} />
                  </div>
                </div>
                {question.worked_solution ? (
                  <StepByStepSolution steps={question.worked_solution} marks={question.marks} />
                ) : null}
                <button
                  onClick={() => recordAndNext(markResult.quality, markResult.correct)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)' }}>
                  {answered + 1 < total ? 'Next question' : 'Finish set'} <ArrowRight size={13} />
                </button>
              </div>
            ) : null}

            {/* Free tier: solution reveal + self-assessment */}
            {freeReveal ? (
              <div className="space-y-3">
                {question.worked_solution ? (
                  <StepByStepSolution steps={question.worked_solution} marks={question.marks} />
                ) : (
                  <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#d1deff' }}>
                    <span className="font-semibold">Answer: </span><MixedMath content={question.answer} />
                  </div>
                )}
                <p className="text-xs" style={{ color: '#5a7aaa' }}>Compare with your working — how did you do?</p>
                <div className="flex gap-2">
                  <button onClick={() => recordAndNext(4, true)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                    I got it right
                  </button>
                  <button onClick={() => recordAndNext(2, false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                    I struggled
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
