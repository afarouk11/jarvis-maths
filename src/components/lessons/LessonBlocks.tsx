'use client'

// Lesson block renderers, shared by the full lesson page and the SPOK
// workspace panel. Extracted verbatim from the lesson page.

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Zap } from 'lucide-react'
import { MixedMath } from '@/components/math/MathRenderer'
import { GraphRenderer } from '@/components/math/GraphRenderer'
import { CheckpointBlock } from '@/components/lessons/CheckpointBlock'
import { TryItBlock } from '@/components/lessons/TryItBlock'
import type { LessonBlock, GraphBlock } from '@/types'

interface BlockProps {
  block: LessonBlock
  index?: number
  completed: boolean
  active?: boolean
  onComplete: () => void
}

export function BlockRenderer({ block, completed, onComplete }: BlockProps) {
  switch (block.type) {
    case 'hook':
      return <HookBlock block={block} completed={completed} onComplete={onComplete} />
    case 'concept':
      return <ConceptBlockView block={block} completed={completed} onComplete={onComplete} />
    case 'worked-example':
      return <WorkedExampleView block={block} completed={completed} onComplete={onComplete} />
    case 'graph':
      return <GraphBlockView block={block as GraphBlock} completed={completed} onComplete={onComplete} />
    case 'checkpoint':
      return <CheckpointBlock block={block} onComplete={onComplete} />
    case 'try-it':
      return <TryItBlock block={block} onComplete={onComplete} />
    case 'summary':
      return <SummaryBlockView block={block} completed={completed} onComplete={onComplete} />
    // Legacy blocks
    default:
      return <LegacyBlockView block={block as { type: string; content: string; label?: string }} completed={completed} onComplete={onComplete} />
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────

function HookBlock({ block, completed, onComplete }: { block: { type: 'hook'; question: string; options: string[] }; completed: boolean; onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)

  function pick(i: number) {
    if (completed) return
    setSelected(i)
    setTimeout(onComplete, 600)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ background: 'rgba(59,130,246,0.06)', borderBottom: '1px solid rgba(59,130,246,0.12)' }}>
        <Zap size={12} className="text-blue-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Think about it</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="text-sm text-slate-200 leading-relaxed">
          <MixedMath content={block.question} />
        </div>
        <div className="grid grid-cols-1 gap-2">
          {block.options.map((opt, i) => (
            <motion.button
              key={i}
              onClick={() => pick(i)}
              disabled={completed}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
              style={{
                background: selected === i ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected === i ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
                color: selected === i ? '#93c5fd' : '#94a3b8',
              }}>
              <span className="font-mono text-xs opacity-50 mr-3">{String.fromCharCode(65 + i)}</span>
              <MixedMath content={opt} />
            </motion.button>
          ))}
        </div>
        {completed && (
          <p className="text-xs text-blue-400">Good — let&apos;s explore this together.</p>
        )}
      </div>
    </div>
  )
}

// ── Concept ────────────────────────────────────────────────────────────────

function ConceptBlockView({ block, completed, onComplete }: { block: { type: 'concept'; label: string; content: string }; completed: boolean; onComplete: () => void }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="px-5 py-3"
        style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>
          {block.label}
        </span>
      </div>
      <div className="p-5 space-y-4">
        <div className="text-sm text-slate-300 leading-relaxed">
          <MixedMath content={block.content} />
        </div>
        {!completed && (
          <button onClick={onComplete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
            Got it <ChevronRight size={13} />
          </button>
        )}
        {completed && (
          <span className="text-xs text-green-500">✓ Done</span>
        )}
      </div>
    </div>
  )
}

// ── Worked Example ─────────────────────────────────────────────────────────

function WorkedExampleView({ block, completed, onComplete }: {
  block: { type: 'worked-example'; label?: string; intro: string; steps: Array<{ label: string; content: string }> }
  completed: boolean
  onComplete: () => void
}) {
  const [revealedSteps, setRevealedSteps] = useState(0)
  const allRevealed = revealedSteps >= block.steps.length

  function nextStep() {
    if (revealedSteps < block.steps.length) {
      setRevealedSteps(s => s + 1)
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
      <div className="px-5 py-3"
        style={{ background: 'rgba(34,197,94,0.05)', borderBottom: '1px solid rgba(34,197,94,0.12)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest text-green-400">
          {block.label ?? 'Worked Example'}
        </span>
      </div>
      <div className="p-5 space-y-4">
        {/* Problem statement */}
        <div className="text-sm text-slate-200 leading-relaxed">
          <MixedMath content={block.intro} />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {block.steps.slice(0, revealedSteps).map((step, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-4 py-3 rounded-r-xl text-sm"
              style={{ borderLeft: '2px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.04)' }}>
              <p className="text-xs font-semibold text-green-400 mb-1">{step.label}</p>
              <div className="text-slate-300 leading-relaxed">
                <MixedMath content={step.content} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        {!allRevealed && (
          <button onClick={nextStep}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
            {revealedSteps === 0 ? 'Show first step' : 'Next step'} <ChevronRight size={13} />
          </button>
        )}

        {allRevealed && !completed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onComplete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
            I understand this <ChevronRight size={13} />
          </motion.button>
        )}

        {completed && <span className="text-xs text-green-500">✓ Done</span>}
      </div>
    </div>
  )
}

// ── Summary ────────────────────────────────────────────────────────────────

function SummaryBlockView({ block, completed, onComplete }: { block: { type: 'summary'; content: string }; completed: boolean; onComplete: () => void }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.25)' }}>
      <div className="px-5 py-3"
        style={{ background: 'rgba(139,92,246,0.07)', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">Key Takeaways</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="text-sm text-slate-300 leading-relaxed">
          <MixedMath content={block.content} />
        </div>
        {!completed && (
          <button onClick={onComplete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
            Complete lesson <ChevronRight size={13} />
          </button>
        )}
        {completed && <span className="text-xs text-green-500">✓ Lesson complete</span>}
      </div>
    </div>
  )
}

// ── Graph ──────────────────────────────────────────────────────────────────

function GraphBlockView({ block, completed, onComplete }: { block: GraphBlock; completed: boolean; onComplete: () => void }) {
  return (
    <div className="space-y-3">
      <GraphRenderer spec={block} />
      {!completed && (
        <button onClick={onComplete}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#60a5fa' }}>
          Got it <ChevronRight size={13} />
        </button>
      )}
      {completed && <span className="text-xs text-green-500">✓ Done</span>}
    </div>
  )
}

// ── Legacy blocks (old lessons) ────────────────────────────────────────────

function LegacyBlockView({ block, completed, onComplete }: {
  block: { type: string; content: string; label?: string }
  completed: boolean
  onComplete: () => void
}) {
  const bgMap: Record<string, string> = {
    'math-block': 'rgba(59,130,246,0.05)',
    'note': 'rgba(251,191,36,0.07)',
    'example': 'rgba(34,197,94,0.05)',
    'step': 'rgba(59,130,246,0.06)',
  }
  const borderMap: Record<string, string> = {
    'math-block': 'rgba(59,130,246,0.1)',
    'note': 'rgba(251,191,36,0.2)',
    'example': 'rgba(34,197,94,0.15)',
    'step': 'rgba(59,130,246,0.12)',
  }
  const labelColorMap: Record<string, string> = {
    'note': '#fbbf24',
    'example': '#4ade80',
    'step': '#60a5fa',
  }

  return (
    <div className="space-y-2">
      <div
        className="p-4 rounded-xl text-sm"
        style={{
          background: bgMap[block.type] ?? 'transparent',
          border: borderMap[block.type] ? `1px solid ${borderMap[block.type]}` : 'none',
        }}>
        {block.label && (
          <p className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: labelColorMap[block.type] ?? '#64748b' }}>
            {block.label}
          </p>
        )}
        <div className="text-slate-300 leading-relaxed">
          <MixedMath content={block.content} />
        </div>
      </div>
      {!completed && (
        <button onClick={onComplete}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#60a5fa' }}>
          Continue <ChevronRight size={13} />
        </button>
      )}
    </div>
  )
}
