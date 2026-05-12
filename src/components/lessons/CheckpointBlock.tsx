'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { MixedMath } from '@/components/math/MathRenderer'
import type { CheckpointBlock as CheckpointBlockType } from '@/types'

interface Props {
  block: CheckpointBlockType
  onComplete: () => void
}

export function CheckpointBlock({ block, onComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [done, setDone] = useState(false)

  const isCorrect = selected === block.correct
  const canProceed = done || (attempts >= 2 && showExplanation)

  function choose(i: number) {
    if (done || showExplanation) return
    setSelected(i)
    setAttempts(a => a + 1)

    if (i === block.correct) {
      setShowExplanation(true)
      setDone(true)
    } else if (attempts + 1 >= 2) {
      setShowExplanation(true)
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(251,191,36,0.2)' }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ background: 'rgba(251,191,36,0.06)', borderBottom: '1px solid rgba(251,191,36,0.15)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest text-yellow-400">Checkpoint</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Question */}
        <div className="text-sm text-slate-200">
          <MixedMath content={block.question} />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2">
          {block.options.map((opt, i) => {
            const isSelected = selected === i
            const isRight = i === block.correct
            let borderColor = 'rgba(255,255,255,0.08)'
            let bg = 'rgba(255,255,255,0.03)'
            let textColor = '#94a3b8'

            if (isSelected || (showExplanation && isRight)) {
              if (isRight) {
                borderColor = 'rgba(34,197,94,0.4)'
                bg = 'rgba(34,197,94,0.08)'
                textColor = '#4ade80'
              } else if (isSelected && !isRight) {
                borderColor = 'rgba(239,68,68,0.4)'
                bg = 'rgba(239,68,68,0.08)'
                textColor = '#f87171'
              }
            }

            return (
              <motion.button
                key={i}
                onClick={() => choose(i)}
                disabled={done || (showExplanation && !isRight)}
                whileTap={!done ? { scale: 0.98 } : {}}
                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3"
                style={{ border: `1px solid ${borderColor}`, background: bg, color: textColor }}>
                <span className="font-mono text-xs opacity-60 shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">
                  <MixedMath content={opt} />
                </span>
                {showExplanation && isRight && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                {isSelected && !isRight && <XCircle size={14} className="text-red-400 shrink-0" />}
              </motion.button>
            )
          })}
        </div>

        {/* Wrong answer nudge (before explanation shown) */}
        {selected !== null && !isCorrect && !showExplanation && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-400 px-1">
            Not quite — have another look. {attempts < 2 ? 'Try again.' : ''}
          </motion.p>
        )}

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl text-sm"
              style={{
                background: done ? 'rgba(34,197,94,0.06)' : 'rgba(251,191,36,0.06)',
                border: `1px solid ${done ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)'}`,
              }}>
              <p className="font-semibold mb-1" style={{ color: done ? '#4ade80' : '#fbbf24' }}>
                {done ? 'Correct!' : `The answer is ${String.fromCharCode(65 + block.correct)}.`}
              </p>
              <p className="text-slate-300 leading-relaxed">
                <MixedMath content={block.explanation} />
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue */}
        {canProceed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            Continue <ChevronRight size={14} />
          </motion.button>
        )}
      </div>
    </div>
  )
}
