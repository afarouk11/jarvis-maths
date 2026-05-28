'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface Question {
  question: string
  answer: string
  hint: string
  explanation: string
}

function renderMath(text: string) {
  const parts = text.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g)
  return parts.map((part, i) => {
    if (part.startsWith('\\[') && part.endsWith('\\]')) {
      return <BlockMath key={i} math={part.slice(2, -2).trim()} />
    }
    if (part.startsWith('\\(') && part.endsWith('\\)')) {
      return <InlineMath key={i} math={part.slice(2, -2).trim()} />
    }
    return <span key={i}>{part}</span>
  })
}

export function DailyChallenge() {
  const [question,    setQuestion]    = useState<Question | null>(null)
  const [topicSlug,   setTopicSlug]   = useState('')
  const [loading,     setLoading]     = useState(true)
  const [done,        setDone]        = useState(false)
  const [correct,     setCorrect]     = useState<boolean | null>(null)
  const [xpEarned,    setXpEarned]    = useState(0)
  const [showHint,    setShowHint]    = useState(false)
  const [showAnswer,  setShowAnswer]  = useState(false)
  const [userAnswer,  setUserAnswer]  = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  useEffect(() => {
    fetch('/api/daily-challenge')
      .then(r => r.json())
      .then(d => {
        if (d.done) { setDone(true); setCorrect(d.completion?.correct ?? null); setXpEarned(d.completion?.xp_earned ?? 0) }
        else { setQuestion(d.question); setTopicSlug(d.topicSlug) }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function submit(isCorrect: boolean) {
    setSubmitting(true)
    const res = await fetch('/api/daily-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicSlug, correct: isCorrect }),
    })
    const d = await res.json()
    setCorrect(isCorrect)
    setXpEarned(d.xpEarned ?? 0)
    setDone(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-5 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', height: 120 }} />
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
        <div className="p-1.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <Zap size={14} style={{ color: '#f59e0b' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Daily Challenge</p>
          <p className="text-xs" style={{ color: '#5a7aaa' }}>One question · resets at midnight</p>
        </div>
        {done && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: correct ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', color: correct ? '#4ade80' : '#f87171' }}>
            {correct ? <><Check size={11} /> +{xpEarned} XP</> : <><X size={11} /> +{xpEarned} XP</>}
          </div>
        )}
      </div>

      <div className="px-5 py-4">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-sm font-medium" style={{ color: correct ? '#4ade80' : '#f87171' }}>
                {correct ? "Nailed it! 🎯" : "Not quite — keep practising."}
              </p>
              {question && (
                <div className="text-xs p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', color: '#94a3b8' }}>
                  <p className="font-medium text-white mb-1">Answer: {renderMath(question.answer)}</p>
                  <p>{renderMath(question.explanation)}</p>
                </div>
              )}
            </motion.div>
          ) : question ? (
            <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-sm text-white leading-relaxed">{renderMath(question.question)}</p>

              <input
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Your answer…"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
              />

              <div className="flex gap-2">
                <button onClick={() => submit(false)} disabled={submitting}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  <X size={12} className="inline mr-1" />Wrong
                </button>
                <button onClick={() => submit(true)} disabled={submitting}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                  <Check size={12} className="inline mr-1" />Correct
                </button>
              </div>

              <div className="space-y-1">
                <button onClick={() => setShowHint(h => !h)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: '#5a7aaa' }}>
                  {showHint ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Hint
                </button>
                {showHint && <p className="text-xs pl-4" style={{ color: '#94a3b8' }}>{question.hint}</p>}

                <button onClick={() => setShowAnswer(s => !s)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: '#374151' }}>
                  {showAnswer ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Reveal answer
                </button>
                {showAnswer && (
                  <p className="text-xs pl-4" style={{ color: '#6b7280' }}>{renderMath(question.answer)}</p>
                )}
              </div>
            </motion.div>
          ) : (
            <p className="text-xs" style={{ color: '#5a7aaa' }}>Challenge unavailable today — check back soon.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
