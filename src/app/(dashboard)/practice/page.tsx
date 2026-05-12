'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { StepByStepSolution } from '@/components/math/StepByStepSolution'
import { MixedMath } from '@/components/math/MathRenderer'
import { Question } from '@/types'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS } from '@/lib/curriculum/gcse-topics'
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface MarkResult {
  correct: boolean
  quality: number
  feedback: string
  partialCredit: boolean
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
  const [revealed, setRevealed] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [submitted, setSubmitted] = useState(false)
  const [xpGain,    setXpGain]    = useState<number | null>(null)

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
    setRevealed(false)
    setQuestion(null)
    setStudentAnswer('')
    setMarkResult(null)
    setSubmitted(false)
    setStartTime(Date.now())

    const topic = allTopics.find(t => t.slug === slug)!
    const res = await fetch('/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId: slug, topicName: topic.name, difficulty: 3 }),
    })
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
  }

  async function generateQuestion() {
    generateQuestionForSlug(selectedSlug)
  }

  async function submitAnswer() {
    if (!question || !studentAnswer.trim()) return
    setMarking(true)
    setSubmitted(true)

    const res = await fetch('/api/mark-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stem: question.stem,
        correctAnswer: question.answer,
        studentAnswer,
        workedSolution: question.worked_solution,
      }),
    })
    const result = await res.json()
    setMarkResult(result)
    setMarking(false)
    setRevealed(true)
  }

  async function recordAndNext(quality: number) {
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
          <h1 className="text-2xl font-bold text-white">Practice</h1>
          <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>Adaptive questions · Auto-marked by Spok</p>
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
        <div className="mb-6 flex items-center gap-3">
          <select
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#e8f0fe' }}>
            {allTopics.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={generateQuestion} disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
            {loading ? 'Generating...' : question ? 'New question' : 'Start'}
          </motion.button>
        </div>
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
                <span className="text-xs font-medium text-blue-400">
                  {allTopics.find(t => t.slug === selectedSlug)?.name} · {question.marks} mark{question.marks !== 1 ? 's' : ''}
                </span>
                <span className="text-xs" style={{ color: '#5a7aaa' }}>
                  {'★'.repeat(question.difficulty)}{'☆'.repeat(5 - question.difficulty)}
                </span>
              </div>
              <div className="text-white leading-relaxed">
                <MixedMath content={question.stem} />
              </div>
            </div>

            {/* Answer input */}
            {!submitted && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a7aaa' }}>
                  Your answer
                </p>
                <textarea
                  value={studentAnswer}
                  onChange={e => setStudentAnswer(e.target.value)}
                  placeholder="Type your answer here... (you can use plain text, e.g. x = 3 or x^2 + 2x)"
                  rows={4}
                  className="w-full rounded-xl p-4 text-sm outline-none resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    color: '#e8f0fe',
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={submitAnswer}
                    disabled={!studentAnswer.trim() || marking}
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Worked solution + answer */}
            <AnimatePresence>
              {revealed && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                  {question.worked_solution && question.worked_solution.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Worked Solution</p>
                      <StepByStepSolution steps={question.worked_solution} />
                    </div>
                  )}
                  <div className="p-3 rounded-lg"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p className="text-xs font-medium text-green-400 mb-1">Answer</p>
                    <div className="text-white text-sm"><MixedMath content={question.answer} /></div>
                  </div>
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
                      onClick={() => recordAndNext(markResult?.quality ?? opt.value)}
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
