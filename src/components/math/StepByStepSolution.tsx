'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { MixedMath } from './MathRenderer'
import { WorkedStep } from '@/types'

interface Props {
  steps: WorkedStep[]
  autoAdvance?: boolean
  /** Total marks for the question — shown in the header and used to sanity-check the steps. */
  marks?: number
}

// Mark-scheme code → colour + meaning. M = method, A = accuracy, B = independent, ft = follow-through.
const MARK_STYLE: Record<string, { bg: string; border: string; color: string; title: string }> = {
  M: { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.35)',  color: '#60a5fa', title: 'Method mark' },
  A: { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.35)',   color: '#4ade80', title: 'Accuracy mark' },
  B: { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.35)',  color: '#fbbf24', title: 'Independent mark' },
  F: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.35)', color: '#cbd5e1', title: 'Follow-through' },
}

// Pull mark-scheme codes (M1, A1, B1, ft, dM1…) out of a step label.
function extractMarks(label: string): string[] {
  const matches = label.match(/\b(?:d?M\d|A\d|B\d|ft)\b/gi)
  return matches ? matches.map(m => m.toUpperCase()) : []
}

function markStyleFor(code: string) {
  if (code.startsWith('FT')) return MARK_STYLE.F
  const letter = code.replace(/^D/, '').charAt(0) // strip leading "d" in dM1
  return MARK_STYLE[letter] ?? MARK_STYLE.M
}

// Marks earned by a code: the digit after the letter (M1→1, A2→2); ft scores 0.
function marksValue(code: string): number {
  const digit = code.match(/\d/)
  return digit ? Number(digit[0]) : 0
}

// Strip the "[M1]" style tag from a label since we render it as a badge instead.
function cleanLabel(label: string): string {
  return label.replace(/\s*\[[^\]]*\]\s*/g, ' ').trim()
}

export function StepByStepSolution({ steps, autoAdvance = false, marks }: Props) {
  const [revealed, setRevealed] = useState(autoAdvance ? steps.length : 1)

  // Total marks shown to the student: prefer the question's mark allocation,
  // otherwise add up the codes found in the worked solution.
  const computedMarks = steps.reduce((sum, s) => sum + extractMarks(s.label).reduce((a, c) => a + marksValue(c), 0), 0)
  const totalMarks = marks ?? (computedMarks > 0 ? computedMarks : undefined)
  const hasAnyMarks = steps.some(s => extractMarks(s.label).length > 0)

  return (
    <div className="space-y-3">
      {/* Mark-scheme legend — shows the student exactly where each mark is earned */}
      {hasAnyMarks && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {totalMarks !== undefined && (
            <span className="font-semibold px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
              {totalMarks} mark{totalMarks !== 1 ? 's' : ''}
            </span>
          )}
          <span style={{ color: '#5a7aaa' }}>where marks are awarded:</span>
          {(['M', 'A', 'B'] as const).map(k => (
            <span key={k} className="inline-flex items-center gap-1" title={MARK_STYLE[k].title}>
              <span className="px-1.5 py-0.5 rounded font-bold"
                style={{ background: MARK_STYLE[k].bg, border: `1px solid ${MARK_STYLE[k].border}`, color: MARK_STYLE[k].color, fontSize: 10 }}>
                {k}
              </span>
              <span style={{ color: '#5a7aaa' }}>{MARK_STYLE[k].title.replace(' mark', '')}</span>
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {steps.slice(0, revealed).map((step, i) => {
          const codes = extractMarks(step.label)
          const label = cleanLabel(step.label)
          return (
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
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <p className="text-xs font-semibold text-blue-400">{label}</p>
                  {codes.map((code, ci) => {
                    const st = markStyleFor(code)
                    return (
                      <span key={ci} title={st.title}
                        className="px-1.5 py-0.5 rounded font-bold"
                        style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color, fontSize: 10 }}>
                        {code}
                      </span>
                    )
                  })}
                </div>
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
          )
        })}
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
