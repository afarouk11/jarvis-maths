'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { MixedMath } from './MathRenderer'
import { StepByStepSolution } from './StepByStepSolution'
import type { Question } from '@/types'

const SELF_ASSESS = [
  { label: "Didn't know", value: 0, color: '#ef4444' },
  { label: 'Needed help', value: 2, color: '#f59e0b' },
  { label: 'Got it', value: 4, color: '#3b82f6' },
  { label: 'Perfect!', value: 5, color: '#22c55e' },
]

interface Props {
  question: Question
  onAssess: (quality: number, timeTaken: number) => void
  startTime?: number
}

export function QuestionCard({ question, onAssess, startTime = Date.now() }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [assessed, setAssessed] = useState(false)

  function handleAssess(quality: number) {
    if (assessed) return
    setAssessed(true)
    onAssess(quality, Math.round((Date.now() - startTime) / 1000))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(59,130,246,0.15)', background: 'rgba(8,13,25,0.6)' }}>

      {/* Question */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
              {question.marks} mark{question.marks !== 1 ? 's' : ''}
            </span>
            <span className="text-xs" style={{ color: '#5a7aaa' }}>
              Difficulty {question.difficulty}/5
            </span>
          </div>
          {question.source && (
            <span className="text-xs" style={{ color: '#374151' }}>{question.source}</span>
          )}
        </div>
        <div className="text-white text-sm leading-relaxed">
          <MixedMath content={question.stem} />
        </div>
      </div>

      {/* Reveal answer */}
      <div style={{ borderTop: '1px solid rgba(59,130,246,0.08)' }}>
        <button
          onClick={() => setRevealed(r => !r)}
          className="w-full flex items-center gap-2 px-5 py-3 text-xs font-medium transition-colors hover:bg-blue-500/5"
          style={{ color: '#5a7aaa' }}>
          {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
          {revealed ? 'Hide answer' : 'Reveal answer'}
        </button>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden">
              <div className="px-5 pb-4">
                {/* Answer */}
                <div className="mb-4 p-3 rounded-xl"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">Answer</p>
                  <div className="text-white text-sm">
                    <MixedMath content={question.answer} />
                  </div>
                </div>

                {/* Worked solution */}
                {question.worked_solution && question.worked_solution.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#5a7aaa' }}>
                      Worked Solution
                    </p>
                    <StepByStepSolution steps={question.worked_solution} />
                  </div>
                )}

                {/* Self-assessment */}
                {!assessed ? (
                  <div>
                    <p className="text-xs mb-3" style={{ color: '#5a7aaa' }}>How did you do?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SELF_ASSESS.map(({ label, value, color }) => (
                        <button
                          key={value}
                          onClick={() => handleAssess(value)}
                          className="py-2 px-3 rounded-lg text-xs font-medium text-white transition-all hover:scale-[1.02]"
                          style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-center" style={{ color: '#22c55e' }}>
                    Saved — next question coming up
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
