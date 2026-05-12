'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronRight, Send } from 'lucide-react'
import { MixedMath } from '@/components/math/MathRenderer'
import type { TryItBlock as TryItBlockType } from '@/types'

interface Props {
  block: TryItBlockType
  onComplete: () => void
}

interface Marking {
  correct: boolean
  quality: number
  feedback: string
  partialCredit: boolean
}

export function TryItBlock({ block, onComplete }: Props) {
  const [showHint, setShowHint] = useState(false)
  const [answer, setAnswer] = useState('')
  const [marking, setMarking] = useState<Marking | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!answer.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/mark-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stem: block.problem,
          correctAnswer: block.answer,
          studentAnswer: answer,
        }),
      })
      if (res.ok) setMarking(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const qualityColor = marking
    ? marking.quality >= 4 ? '#4ade80'
      : marking.quality >= 2 ? '#fbbf24'
      : '#f87171'
    : '#94a3b8'

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.25)' }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ background: 'rgba(139,92,246,0.07)', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">Try It Yourself</span>
        {block.hint && (
          <button
            onClick={() => setShowHint(h => !h)}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: showHint ? '#fbbf24' : '#64748b' }}>
            <Lightbulb size={12} />
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Problem */}
        <div className="text-sm text-slate-200 leading-relaxed">
          <MixedMath content={block.problem} />
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && block.hint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', color: '#fcd34d' }}>
              <Lightbulb size={12} className="inline mr-2 opacity-70" />
              {block.hint}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer input */}
        {!marking && (
          <div className="space-y-3">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here — use plain text, e.g. dy/dx = 20x^4 - 3"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
              }}
            />
            <button
              onClick={submit}
              disabled={!answer.trim() || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd' }}>
              <Send size={13} />
              {loading ? 'Spok is marking...' : 'Submit answer'}
            </button>
          </div>
        )}

        {/* Marking feedback */}
        <AnimatePresence>
          {marking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3">
              {/* Quality indicator */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className="w-5 h-1.5 rounded-full transition-all"
                      style={{ background: n <= marking.quality ? qualityColor : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: qualityColor }}>
                  {marking.quality >= 4 ? 'Excellent' : marking.quality >= 3 ? 'Good' : marking.quality >= 2 ? 'Partially correct' : 'Needs work'}
                </span>
              </div>

              {/* Spok feedback */}
              <div className="p-4 rounded-xl text-sm"
                style={{
                  background: 'rgba(30,41,59,0.6)',
                  border: `1px solid ${qualityColor}30`,
                }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: qualityColor }}>
                  SPOK
                </p>
                <p className="text-slate-300 leading-relaxed">{marking.feedback}</p>
              </div>

              {/* Model answer */}
              <div className="p-4 rounded-xl text-sm"
                style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <p className="text-xs font-semibold text-blue-400 mb-2">Model Answer</p>
                <MixedMath content={block.answer} />
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onComplete}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                Continue <ChevronRight size={14} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
