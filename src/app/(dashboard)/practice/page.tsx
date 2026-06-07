'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { StepByStepSolution } from '@/components/math/StepByStepSolution'
import { MixedMath } from '@/components/math/MathRenderer'
import { MathKeypad } from '@/components/math/MathKeypad'
import { Question } from '@/types'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS } from '@/lib/curriculum/gcse-topics'
import { CheckCircle, XCircle, Loader2, Zap, Check, X, Pen, Type } from 'lucide-react'
import { DrawingCanvas } from '@/components/ui/DrawingCanvas'
import { VideoExplanation } from '@/components/math/VideoExplanation'
import { sanitizeSvg } from '@/lib/math/sanitize-svg'
import { Skeleton } from '@/components/ui/skeleton'
import { friendlyError } from '@/lib/friendly-error'
import { JourneyBanner } from '@/components/journey/JourneyBanner'

interface MarkingStep {
  line: string
  status: 'correct' | 'error' | 'incomplete'
  comment: string
}

interface MarkResult {
  correct: boolean
  quality: number
  feedback: string
  partialCredit: boolean
  marksAwarded?: number
  marksTotal?: number
  exam_technique_flags?: string[]
  steps?: MarkingStep[] | null
}

function PracticePageInner() {
  const params = useSearchParams()
  const topicParam = params.get('topic')

  const [allTopics, setAllTopics] = useState<typeof AQA_TOPICS>(AQA_TOPICS)

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then((p: { level?: string }) => {
      if (p.level === 'GCSE') setAllTopics(GCSE_TOPICS)
    }).catch(() => {})
  }, [])

  const defaultSlug = topicParam && allTopics.find((t: { slug: string }) => t.slug === topicParam)
    ? topicParam
    : allTopics[0].slug

  const [selectedSlug, setSelectedSlug] = useState(defaultSlug)
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(false)
  const [studentAnswer, setStudentAnswer] = useState('')
  const [marking, setMarking] = useState(false)
  const [markResult, setMarkResult] = useState<MarkResult | null>(null)
  const [reported, setReported] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [submitted, setSubmitted] = useState(false)
  const [xpGain,    setXpGain]    = useState<number | null>(null)
  const [proRequired, setProRequired] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [questionSource, setQuestionSource] = useState<'ai' | 'past-paper'>('ai')
  const [drawMode, setDrawMode] = useState(false)
  const [drawingImage, setDrawingImage] = useState('')

  const answerTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Study Now mode
  const [studyNowMode, setStudyNowMode] = useState(false)
  const [studyNowDone, setStudyNowDone] = useState(false)
  const [dueQueue, setDueQueue] = useState<string[]>([])
  const [dueIdx, setDueIdx] = useState(0)
  const studyNowRef = useRef(false)

  useEffect(() => {
    if (topicParam) generateQuestion()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startStudyNow() {
    const res = await fetch('/api/progress')
    const progress: Array<{ topic_id: string; next_review_at: string; p_known: number }> = await res.json()

    const now = new Date()
    const progressByTopic = new Map(progress.map(p => [p.topic_id, p]))

    // Build queue: due topics first (overdue by next_review_at), then unseen topics
    const dueTopics: string[] = []
    const unseenTopics: string[] = []

    for (const topic of allTopics) {
      const prog = progressByTopic.get(topic.slug)
      if (!prog) {
        unseenTopics.push(topic.slug)
      } else if (new Date(prog.next_review_at) <= now) {
        dueTopics.push(topic.slug)
      }
    }

    const queue = [...dueTopics, ...unseenTopics]
    if (queue.length === 0) return

    setDueQueue(queue)
    setDueIdx(0)
    setStudyNowMode(true)
    studyNowRef.current = true
    setSelectedSlug(queue[0])
    generateQuestionForSlug(queue[0])
  }

  function exitStudyNow(completed = false) {
    setStudyNowMode(false)
    studyNowRef.current = false
    setDueQueue([])
    setDueIdx(0)
    if (completed) setStudyNowDone(true)
  }

  async function generateQuestionForSlug(slug: string) {
    setLoading(true)
    setGenerateError(null)
    setRevealed(false)
    setQuestion(null)
    setStudentAnswer('')
    setDrawingImage('')
    setMarkResult(null)
    setReported(false)
    setSubmitted(false)
    setStartTime(Date.now())

    const topic = allTopics.find(t => t.slug === slug)!
    try {
      let res: Response
      if (questionSource === 'past-paper') {
        res = await fetch(`/api/past-paper-question?topic=${encodeURIComponent(topic.name)}&topicId=${encodeURIComponent(slug)}`)
        if (res.status === 404) {
          // Fall back to AI generation silently
          res = await fetch('/api/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // No difficulty sent — the server picks it adaptively from current mastery
          body: JSON.stringify({ topicId: slug, topicName: topic.name }),
          })
        }
      } else {
        res = await fetch('/api/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // No difficulty sent — the server picks it adaptively from current mastery
          body: JSON.stringify({ topicId: slug, topicName: topic.name }),
        })
      }
      if (!res.ok) {
        setGenerateError(friendlyError(`Server error ${res.status}`))
      } else {
        const data = await res.json()
        setQuestion(data)
      }
    } catch (err: unknown) {
      setGenerateError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  async function generateQuestion() {
    generateQuestionForSlug(selectedSlug)
  }

  async function handleUpgrade() {
    setUpgradeLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly' }),
      })
      const data = await res.json()
      window.location.href = data.url ?? '/pricing'
    } catch {
      window.location.href = '/pricing'
    } finally {
      setUpgradeLoading(false)
    }
  }

  async function submitAnswer() {
    const hasAnswer = drawMode ? !!drawingImage : !!studentAnswer.trim()
    if (!question || !hasAnswer) return
    setMarking(true)
    setSubmitted(true)

    const body: Record<string, unknown> = {
      stem: question.stem,
      correctAnswer: question.answer,
      workedSolution: question.worked_solution,
    }
    if (drawMode) body.studentAnswerImage = drawingImage
    else body.studentAnswer = studentAnswer

    const res = await fetch('/api/mark-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 403) {
      setMarking(false)
      setSubmitted(false)
      setProRequired(true)
      return
    }

    const result = await res.json()
    setMarkResult(result)
    setMarking(false)
    setRevealed(true)
  }

  function reportMarking() {
    if (!question || !markResult) return
    setReported(true)
    fetch('/api/report-marking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stem: question.stem,
        correctAnswer: question.answer,
        studentAnswer: drawMode ? '[handwritten]' : studentAnswer,
        aiFeedback: markResult.feedback,
        aiCorrect: markResult.correct,
        questionId: question.id,
      }),
    }).catch(() => {})
  }

  async function recordAndNext(quality: number, selfRating?: number) {
    if (!question) return
    const timeSeconds = Math.round((Date.now() - startTime) / 1000)
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicId: selectedSlug,
        questionId: question.id,
        correct: quality >= 3,
        timeSeconds,
        quality,
        difficulty: question.difficulty,
        skill: (question as { skill?: string }).skill,
        marksEarned: markResult?.marksAwarded,
        marksAvailable: markResult?.marksTotal,
        format: 'written',
        misconceptions: markResult?.exam_technique_flags ?? [],
        selfRating,
      }),
    })
    const data = await res.json()
    if (data.xpGain) {
      setXpGain(data.xpGain)
      setTimeout(() => setXpGain(null), 2000)
    }

    if (studyNowRef.current) {
      const nextIdx = dueIdx + 1
      if (nextIdx >= dueQueue.length) {
        exitStudyNow(true)
        return
      }
      setDueIdx(nextIdx)
      const nextSlug = dueQueue[nextIdx]
      setSelectedSlug(nextSlug)
      generateQuestionForSlug(nextSlug)
    } else {
      generateQuestion()
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <JourneyBanner
        phaseLabel="Practice"
        topicName={allTopics.find((t: { slug: string; name: string }) => t.slug === selectedSlug)?.name}
      />

      {/* Pro upgrade modal — shown when AI marking requires Pro */}
      <AnimatePresence>
        {proRequired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(8,13,28,0.88)', backdropFilter: 'blur(10px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="relative w-full max-w-sm rounded-3xl p-8"
              style={{ background: 'rgba(12,17,30,0.98)', border: '1px solid rgba(245,158,11,0.25)', boxShadow: '0 0 60px rgba(245,158,11,0.08)' }}>
              <button
                onClick={() => setProRequired(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg"
                style={{ color: '#4a6070' }}>
                <X size={14} />
              </button>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 mx-auto"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Zap size={22} style={{ color: '#f59e0b' }} />
              </div>
              <h2 className="text-lg font-bold text-white text-center mb-1"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Want SPOK to mark this?
              </h2>
              <p className="text-sm text-center mb-5" style={{ color: '#7c98c4' }}>
                With Pro, SPOK checks your working line by line, awards M/A/B marks, and gives AQA-style feedback. No rush — you can still see the full worked answer for free.
              </p>
              <div className="rounded-2xl p-4 mb-5 text-center"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <p className="font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 32 }}>
                  £40<span className="text-sm font-normal" style={{ color: '#5a7aaa' }}>/month</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>or £400/year · cancel anytime</p>
              </div>
              <ul className="space-y-2 mb-6">
                {[
                  'AI marking with M/A/B mark breakdown',
                  'Unlimited SPOK conversations',
                  'AI-generated lessons on any topic',
                  'Past paper AI with citations',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#fde9b8' }}>
                    <Check size={13} className="shrink-0" style={{ color: '#f59e0b' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 24px rgba(245,158,11,0.25)' }}>
                {upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro'}
              </button>
              <button
                onClick={() => { setProRequired(false); setSubmitted(true); setRevealed(true) }}
                className="w-full text-center text-sm mt-3 py-2 rounded-xl transition-colors hover:text-white"
                style={{ color: '#9fb6d9', border: '1px solid rgba(255,255,255,0.08)' }}>
                See the worked answer instead
              </button>
              <button
                onClick={() => setProRequired(false)}
                className="w-full text-center text-xs mt-2 hover:text-white transition-colors"
                style={{ color: '#4a6070' }}>
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {xpGain !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa' }}>
            +{xpGain} XP
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>Practice</h1>
          <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>Adaptive questions tailored to your gaps</p>
        </div>
        {studyNowDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setTimeout(() => setStudyNowDone(false), 3000)}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,191,36,0.15))',
              border: '1px solid rgba(245,158,11,0.5)',
              color: '#f59e0b',
              boxShadow: '0 0 30px rgba(245,158,11,0.2)',
            }}>
            🏆 Session complete — all due topics reviewed!
          </motion.div>
        )}
        {!studyNowMode ? (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={startStudyNow}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))',
              border: '1px solid rgba(245,158,11,0.4)',
              color: '#f59e0b',
            }}>
            <Zap size={14} />
            Study Now
          </motion.button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Study Now Mode</p>
              <p className="text-xs" style={{ color: '#5a7aaa' }}>
                {dueIdx + 1} / {dueQueue.length} topics
              </p>
            </div>
            <button
              onClick={() => exitStudyNow()}
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{ color: '#5a7aaa', border: '1px solid rgba(255,255,255,0.08)' }}>
              Exit
            </button>
          </div>
        )}
      </div>

      {/* Study Now progress bar */}
      <AnimatePresence>
        {studyNowMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
                animate={{ width: `${((dueIdx + 1) / dueQueue.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: '#5a7aaa' }}>
              {allTopics.find(t => t.slug === selectedSlug)?.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topic picker — hidden in Study Now mode */}
      {!studyNowMode && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <select
              value={selectedSlug}
              onChange={e => setSelectedSlug(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none flex-1 min-w-0"
              // Solid (non-translucent) colours so the control and its option list
              // never render white-on-white on light-theme browsers/OSes.
              style={{ background: '#13233f', border: '1px solid rgba(59,130,246,0.35)', color: '#e8f0fe', colorScheme: 'dark' }}>
              {allTopics.map(t => <option key={t.slug} value={t.slug} style={{ background: '#13233f', color: '#e8f0fe' }}>{t.name}</option>)}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={generateQuestion} disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 shrink-0"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
              {loading ? 'Generating...' : question ? 'New question' : 'Start'}
            </motion.button>
          </div>
          {/* AI / Past Paper toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg w-fit"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['ai', 'past-paper'] as const).map(src => (
              <button key={src} onClick={() => setQuestionSource(src)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                style={questionSource === src
                  ? { background: 'rgba(59,130,246,0.25)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.35)' }
                  : { color: '#64748b', border: '1px solid transparent' }}>
                {src === 'ai' ? 'AI Question' : 'Past Paper'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {generateError && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-4 mb-4 flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">Couldn’t load a question</p>
            <p className="text-xs mt-0.5" style={{ color: '#f87171' }}>{generateError}</p>
            <button onClick={generateQuestion}
              className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              Try again
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="rounded-2xl p-6 mb-4" style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div className="flex items-center justify-between mb-4">
              <Skeleton style={{ width: 140, height: 14 }} />
              <Skeleton style={{ width: 80, height: 14 }} />
            </div>
            <Skeleton style={{ width: '90%', height: 18, marginBottom: 8 }} />
            <Skeleton style={{ width: '70%', height: 18, marginBottom: 8 }} />
            <Skeleton style={{ width: '50%', height: 18 }} />
          </div>
          <Skeleton style={{ width: '100%', height: 96, marginBottom: 12 }} />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {question && !loading && (
          <motion.div key={question.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>

            {/* Question */}
            <div className="rounded-2xl p-6 mb-4"
              style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-blue-400">
                    {allTopics.find(t => t.slug === selectedSlug)?.name} · {question.marks} mark{question.marks !== 1 ? 's' : ''}
                  </span>
                  {(question as { skill?: string }).skill && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
                      Focus: {(question as { skill?: string }).skill}
                    </span>
                  )}
                  {(question as { source?: string }).source && (question as { source?: string }).source !== 'ai-generated' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                      {(question as { source?: string }).source}
                    </span>
                  )}
                </div>
                <span className="text-xs flex items-center gap-1.5" style={{ color: '#5a7aaa' }}>
                  <span title="Difficulty adapts to your mastery" style={{ color: '#f59e0b', fontSize: 10, fontWeight: 600 }}>ADAPTIVE</span>
                  {'★'.repeat(question.difficulty)}{'☆'.repeat(5 - question.difficulty)}
                </span>
              </div>
              <div className="text-white leading-relaxed">
                <MixedMath content={question.stem} />
              </div>
              {question.diagram && sanitizeSvg(question.diagram) && (
                <div className="mt-4 rounded-lg p-3 flex justify-center overflow-x-auto"
                  style={{ background: '#f8f9fa', border: '1px solid rgba(255,255,255,0.1)' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(question.diagram) }} />
              )}
            </div>

            {/* Answer input */}
            {!submitted && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a7aaa' }}>Your answer</p>
                  <div className="flex items-center gap-2">
                    {/* Type / Draw toggle */}
                    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
                      <button onClick={() => setDrawMode(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{ background: !drawMode ? 'rgba(59,130,246,0.25)' : 'transparent', color: !drawMode ? '#60a5fa' : '#5a7aaa' }}>
                        <Type size={11} /> Type
                      </button>
                      <button onClick={() => setDrawMode(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{ background: drawMode ? 'rgba(59,130,246,0.25)' : 'transparent', color: drawMode ? '#60a5fa' : '#5a7aaa' }}>
                        <Pen size={11} /> Draw
                      </button>
                    </div>
                  </div>
                </div>

                {drawMode ? (
                  <DrawingCanvas marks={question.marks} onChange={setDrawingImage} />
                ) : (
                  <>
                    <textarea
                      ref={answerTextareaRef}
                      value={studentAnswer}
                      onChange={e => setStudentAnswer(e.target.value)}
                      placeholder={"Show your working step by step — one line per step. SPOK will mark each line.\n\nExample:\nStep 1: formula...\nStep 2: substitution..."}
                      rows={5}
                      className="w-full rounded-xl p-4 text-sm outline-none resize-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.2)', color: '#e8f0fe' }}
                    />
                    <div className="mt-2">
                      <MathKeypad getTextarea={() => answerTextareaRef.current} setValue={setStudentAnswer} />
                    </div>
                  </>
                )}

                <div className="flex gap-2 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={submitAnswer}
                    disabled={(drawMode ? !drawingImage : !studentAnswer.trim()) || marking}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
                    style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa' }}>
                    {marking ? (
                      <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Marking...</span>
                    ) : 'Submit for marking'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setSubmitted(true); setRevealed(true) }}
                    className="px-4 py-2.5 rounded-xl text-sm"
                    style={{ color: '#5a7aaa' }}>
                    Skip — show answer
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Marking result */}
            <AnimatePresence>
              {markResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-4 mb-4 flex items-start gap-3"
                  style={{
                    background: markResult.correct ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${markResult.correct ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  }}>
                  {markResult.correct
                    ? <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
                    : <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: markResult.correct ? '#22c55e' : '#ef4444' }}>
                      {markResult.correct ? 'Correct!' : markResult.partialCredit ? 'Partially correct' : 'Incorrect'}
                    </p>
                    <p className="text-sm" style={{ color: '#d1deff' }}>{markResult.feedback}</p>
                    {reported ? (
                      <p className="text-xs mt-2" style={{ color: '#4ade80' }}>Thanks — we&apos;ll review this mark.</p>
                    ) : (
                      <button onClick={reportMarking} className="text-xs mt-2 underline transition-colors hover:text-slate-300" style={{ color: '#5a7aaa' }}>
                        Marked wrong? Report it
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Line-by-line step marking */}
            {markResult && markResult.steps && markResult.steps.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {markResult.steps.map((s, i) => (
                  <div key={i} className="flex gap-2.5 items-start px-3 py-2 rounded-lg text-xs"
                    style={{
                      background: s.status === 'correct' ? 'rgba(74,222,128,0.06)' : s.status === 'error' ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.06)',
                      border: `1px solid ${s.status === 'correct' ? 'rgba(74,222,128,0.2)' : s.status === 'error' ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.2)'}`,
                    }}>
                    <span className="shrink-0 mt-0.5 text-base leading-none">
                      {s.status === 'correct' ? '✓' : s.status === 'error' ? '✗' : '⚠'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-slate-300">{s.line}</p>
                      {s.comment && <p className="mt-0.5" style={{ color: s.status === 'correct' ? '#86efac' : s.status === 'error' ? '#fca5a5' : '#fcd34d' }}>{s.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exam technique flags */}
            {markResult && markResult.exam_technique_flags && markResult.exam_technique_flags.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {markResult.exam_technique_flags.map((flag, i) => (
                  <div key={i} className="flex gap-2 items-start px-3 py-2 rounded-lg text-xs"
                    style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', color: '#fcd34d' }}>
                    <span className="shrink-0">⚠</span>
                    <span>Exam alert — {flag}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Worked solution + answer */}
            <AnimatePresence>
              {revealed && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                  {question.worked_solution && question.worked_solution.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Worked Solution</p>
                      <StepByStepSolution steps={question.worked_solution} marks={question.marks} />
                    </div>
                  )}
                  <div className="p-3 rounded-lg"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p className="text-xs font-medium text-green-400 mb-1">Answer</p>
                    <div className="text-white text-sm"><MixedMath content={question.answer} /></div>
                  </div>

                  {/* Video explanation — offered when the student didn't fully get it */}
                  {(!markResult || !markResult.correct) && (
                    <div className="mt-3">
                      <VideoExplanation
                        topicName={allTopics.find(t => t.slug === selectedSlug)?.name ?? selectedSlug}
                        topicSlug={selectedSlug}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Self-assess (shown after marking or skip) */}
            {revealed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a7aaa' }}>
                  {markResult ? 'Confirm — how did you find it?' : 'How did you do?'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Didn't know", value: 0, color: '#ef4444' },
                    { label: 'Needed help', value: 2, color: '#f59e0b' },
                    { label: 'Got it', value: 4, color: '#3b82f6' },
                    { label: 'Perfect!', value: 5, color: '#22c55e' },
                  ].map(opt => (
                    <motion.button key={opt.value}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => recordAndNext(markResult?.quality ?? opt.value, opt.value)}
                      className="py-2 rounded-lg text-xs font-medium"
                      style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}40`, color: opt.color }}>
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!question && !loading && (
        <div className="text-center py-16" style={{ color: '#5a7aaa' }}>
          <p className="text-sm">Select a topic and press Start to begin practising.</p>
        </div>
      )}
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense>
      <PracticePageInner />
    </Suspense>
  )
}
