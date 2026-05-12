'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BookOpen, Clock, ChevronRight, Zap } from 'lucide-react'
import { MixedMath } from '@/components/math/MathRenderer'
import { GraphRenderer } from '@/components/math/GraphRenderer'
import { JarvisChat } from '@/components/jarvis/JarvisChat'
import { CheckpointBlock } from '@/components/lessons/CheckpointBlock'
import { TryItBlock } from '@/components/lessons/TryItBlock'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import type { Lesson, LessonBlock, GraphBlock, JarvisState } from '@/types'

const JarvisScene = dynamic(
  () => import('@/components/jarvis/JarvisScene').then(m => m.JarvisScene),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
)

export default function LessonPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeIndex,  setActiveIndex]  = useState(0)
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set())
  const [jarvisState,  setJarvisState]  = useState<JarvisState>('idle')
  const [xpGain,       setXpGain]       = useState<number | null>(null)

  const topic = AQA_TOPICS.find(t => t.slug === slug)

  useEffect(() => {
    fetch(`/api/lesson/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setLesson(data); setLoading(false) })
  }, [id])

  function completeBlock(i: number) {
    setCompletedSet(prev => {
      const next = new Set([...prev, i])
      // Award XP when the final block is completed
      if (lesson && next.size === lesson.content.length) {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId: slug, correct: true, quality: 4, timeSeconds: 120 }),
        }).then(r => r.json()).then(d => {
          if (d.xpGain) { setXpGain(d.xpGain); setTimeout(() => setXpGain(null), 2500) }
        })
      }
      return next
    })
    if (lesson && i < lesson.content.length - 1) {
      setActiveIndex(i + 1)
    }
    setJarvisState('thinking')
    setTimeout(() => setJarvisState('idle'), 900)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-400 text-sm animate-pulse">Loading lesson...</div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-slate-400">Lesson not found.</p>
      </div>
    )
  }

  const blocks      = lesson.content
  const visibleCount = activeIndex + 1
  const progress    = Math.round((completedSet.size / blocks.length) * 100)
  const isComplete  = completedSet.size === blocks.length

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080d19' }}>
      <AnimatePresence>
        {xpGain !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}>
            <Zap size={14} /> +{xpGain} XP — lesson complete!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT — lesson content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-32">

        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-blue-400"
          style={{ color: '#5a7aaa' }}>
          <ArrowLeft size={14} /> Back to {topic?.name ?? 'topic'}
        </button>

        {/* Header */}
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} style={{ color: '#3b82f6' }} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#3b82f6' }}>
              {topic?.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-xs mb-4" style={{ color: '#5a7aaa' }}>
            {lesson.estimated_minutes && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {lesson.estimated_minutes} min
              </span>
            )}
            <span>Difficulty {lesson.difficulty}/5</span>
            <span>{completedSet.size}/{blocks.length} sections</span>
          </div>
          <div className="h-1 rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Blocks */}
        <div className="space-y-6 max-w-2xl">
          {blocks.slice(0, visibleCount).map((block, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}>
              <BlockRenderer
                block={block}
                index={i}
                completed={completedSet.has(i)}
                active={i === activeIndex}
                onComplete={() => completeBlock(i)}
              />
            </motion.div>
          ))}
        </div>

        {/* Completion */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 p-6 rounded-2xl text-center max-w-2xl"
              style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="text-3xl mb-3">🎯</div>
              <p className="text-green-400 font-bold text-lg">Lesson Complete!</p>
              <p className="text-sm mt-1 mb-4" style={{ color: '#5a7aaa' }}>
                Great work. Ask Spok any questions, or head to practice to reinforce this topic.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push('/practice')}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  Go to Practice
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  Back to Topic
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <JarvisChat topicContext={topic?.name} />
      </div>

      {/* ── RIGHT — Spok 3D presence ─────────────────────────────────── */}
      <div className="hidden md:flex w-80 shrink-0 flex-col items-center justify-center relative border-l overflow-hidden"
        style={{ borderColor: 'rgba(245,158,11,0.08)', background: 'rgba(4,7,14,0.6)' }}>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(245,158,11,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Corner brackets */}
        {['top-3 left-3 border-t border-l','top-3 right-3 border-t border-r',
          'bottom-3 left-3 border-b border-l','bottom-3 right-3 border-b border-r'].map((cls, i) => (
          <div key={i} className={`absolute w-5 h-5 ${cls}`}
            style={{ borderColor: 'rgba(245,158,11,0.25)' }} />
        ))}

        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.25), transparent)' }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Three.js sphere */}
        <div className="relative z-10 w-64 h-64">
          <JarvisScene state={jarvisState} amplitude={0} className="w-full h-full" />
        </div>

        {/* Progress ring + label */}
        <div className="relative z-10 mt-4 flex flex-col items-center gap-2">
          <svg width={48} height={48} viewBox="0 0 48 48">
            <circle cx={24} cy={24} r={20} fill="none" stroke="rgba(245,158,11,0.1)" strokeWidth={3} />
            <motion.circle
              cx={24} cy={24} r={20}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 20}`}
              animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progress / 100) }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ transformOrigin: '24px 24px', rotate: '-90deg' }}
            />
            <text x={24} y={28} textAnchor="middle" fontSize={10} fill="#f59e0b" fontFamily="monospace">
              {progress}%
            </text>
          </svg>

          <motion.p
            key={jarvisState}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: isComplete ? '#4ade80' : '#f59e0b' }}>
            {isComplete ? 'Complete' : jarvisState === 'thinking' ? 'Processing' : 'Observing'}
          </motion.p>

          <p className="text-xs font-mono" style={{ color: 'rgba(245,158,11,0.3)' }}>
            {completedSet.size} / {blocks.length} blocks
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Block renderer ─────────────────────────────────────────────────────────

interface BlockProps {
  block: LessonBlock
  index: number
  completed: boolean
  active: boolean
  onComplete: () => void
}

function BlockRenderer({ block, index, completed, active, onComplete }: BlockProps) {
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
          <p className="text-xs text-blue-400">Good — let's explore this together.</p>
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
  const isLast = false // legacy blocks always show a continue button

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
