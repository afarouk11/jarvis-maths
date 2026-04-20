'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { MixedMath } from './MathRenderer'
import { WorkedStep } from '@/types'

interface Props {
  steps: WorkedStep[]
  autoAdvance?: boolean
}

export function StepByStepSolution({ steps, autoAdvance = false }: Props) {
  const [revealed, setRevealed] = useState(autoAdvance ? steps.length : 1)

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {steps.slice(0, revealed).map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: autoAdvance ? i * 0.3 : 0 }}
            className="flex gap-3 p-3 rounded-lg"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
            <div className="flex-shrink-0 mt-0.5">
              {i < revealed - 1 || revealed === steps.length ? (
                <CheckCircle2 size={16} className="text-blue-400" />
              ) : (
                <ChevronRight size={16} className="text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-400 mb-1">{step.label}</p>
              <div className="text-sm text-slate-200 leading-relaxed">
                <MixedMath content={step.content} />
              </div>
              {step.math && (
                <div className="mt-2 text-center">
                  <MixedMath content={`$$${step.math}$$`} />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {!autoAdvance && revealed < steps.length && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRevealed(r => r + 1)}
          className="w-full py-2 text-sm font-medium rounded-lg transition-colors"
          style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
          Next Step →
        </motion.button>
      )}

      {revealed === steps.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-green-400 py-2">
          ✓ Solution complete
        </motion.div>
      )}
    </div>
  )
}
