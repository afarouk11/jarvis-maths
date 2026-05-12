'use client'

import { useState, useCallback, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { masteryLabel } from '@/lib/bkt/bayesian-knowledge-tracing'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import type { StudentProgress } from '@/types'

const BrainScene = dynamic(() => import('./BrainScene'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060d1f' }}>
      <p style={{ color: '#f59e0b', fontSize: 13, letterSpacing: '0.15em', animation: 'pulse 1.5s infinite' }}>
        INITIALISING NEURAL MAP...
      </p>
    </div>
  ),
})

function pHex(p: number): string {
  if (p <= 0.5) {
    const t = p / 0.5
    return '#' + [255, Math.round(t * 160), 0].map(v => v.toString(16).padStart(2, '0')).join('')
  }
  const t = (p - 0.5) / 0.5
  return '#' + [
    Math.round(255 * (1 - t)),
    Math.round(160 * (1 - t) + 100 * t),
    Math.round(255 * t),
  ].map(v => v.toString(16).padStart(2, '0')).join('')
}

interface Props {
  progress: StudentProgress[]
  avgPKnown: number
  grade: string
  topicsActive: number
  totalTopics: number
}

interface SelectedTopic {
  name: string
  slug: string
  pKnown: number
  icon: string | null
  prog: StudentProgress | null
}

export function BrainMap({ progress, avgPKnown, grade, topicsActive, totalTopics }: Props) {
  const router = useRouter()
  const [hovered, setHovered] = useState<{ name: string; slug: string; pKnown: number } | null>(null)
  const [selected, setSelected] = useState<SelectedTopic | null>(null)
  const [refreshing, startRefresh] = useTransition()
  const [sidebarW, setSidebarW] = useState('4rem')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 768
      setSidebarW(mobile ? '0px' : '4rem')
      setIsMobile(mobile)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const gradeColor = grade === 'A*' ? '#fbbf24' : grade === 'A' ? '#4ade80' : grade === 'B' ? '#60a5fa' : grade === 'C' ? '#f97316' : '#ef4444'

  const handleClick = useCallback((slug: string) => {
    const topic = AQA_TOPICS.find(t => t.slug === slug)
    if (!topic) return
    const prog = progress.find(p => p.topic_id === slug) ?? null
    setSelected({ name: topic.name, slug, pKnown: prog?.p_known ?? 0, icon: topic.icon, prog })
  }, [progress])

  return (
    <div style={{ position: 'fixed', top: 0, left: sidebarW, right: 0, bottom: 0, zIndex: 5 }}>

      {/* Canvas fills entire container */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <BrainScene
          progress={progress}
          onHover={setHovered}
          onClick={handleClick}
        />
      </div>

      {/* ── Mobile tap hint ───────────────────────────────────────── */}
      {isMobile && !selected && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, fontSize: 10, letterSpacing: '0.12em', color: 'rgba(245,158,11,0.4)',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          TAP A NEURON · PINCH TO ZOOM
        </div>
      )}

      {/* ── Top-left: title + stat chips ──────────────────────────── */}
      <div style={{ position: 'absolute', top: isMobile ? 36 : 24, left: 24, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.25em', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
            Neural Knowledge Map
          </p>
          <button
            onClick={() => startRefresh(() => router.refresh())}
            title="Refresh mastery data"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: refreshing ? '#f59e0b' : '#3a5070', display: 'flex' }}>
            <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
              <RotateCw size={11} />
            </motion.div>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatChip label="Grade" value={grade} color={gradeColor} />
          <StatChip label="Mastery" value={`${Math.round(avgPKnown * 100)}%`} color="#f59e0b" />
          <StatChip label="Topics" value={`${topicsActive}/${totalTopics}`} color="#94a3b8" />
        </div>
      </div>

      {/* ── Top-right: hover tooltip (desktop only — no hover on touch) ─── */}
      {!selected && !isMobile && (
        <div style={{ position: 'absolute', top: 24, right: 24, width: 210, zIndex: 10 }}>
          <AnimatePresence mode="wait">
            {hovered ? (
              <motion.div
                key={hovered.slug}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.14 }}
                style={{
                  background: 'rgba(4,6,16,0.88)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${pHex(hovered.pKnown)}35`,
                  borderRadius: 16,
                  padding: 16,
                }}>
                <p style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 700, color: pHex(hovered.pKnown), textTransform: 'uppercase', marginBottom: 6 }}>
                  {masteryLabel(hovered.pKnown)}
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
                  {hovered.name}
                </p>
                <p style={{ fontSize: 11, color: '#4a6080' }}>Click to open</p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(4,6,16,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(245,158,11,0.07)',
                  borderRadius: 16,
                  padding: 20,
                  textAlign: 'center',
                }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(245,158,11,0.08)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: 11, color: '#2a3a50' }}>Click a neuron to inspect</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Right: topic detail panel ──────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.slug}
            initial={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: 40 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
            exit={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={isMobile ? {
              position: 'absolute', bottom: 72, left: 12, right: 12, zIndex: 10,
              background: 'rgba(4,6,16,0.97)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${pHex(selected.pKnown)}30`,
              borderRadius: 20,
              padding: 20,
            } : {
              position: 'absolute', top: 24, right: 24, width: 260, zIndex: 10,
              background: 'rgba(4,6,16,0.93)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${pHex(selected.pKnown)}30`,
              borderRadius: 20,
              padding: 22,
            }}>
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: 14, right: 16, color: '#4a6080', fontSize: 18, lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none' }}>
              ×
            </button>

            {/* Topic header */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>{selected.icon}</span>
              <p style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 700, color: pHex(selected.pKnown), textTransform: 'uppercase', marginBottom: 5 }}>
                {masteryLabel(selected.pKnown)}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                {selected.name}
              </p>
            </div>

            {/* Mastery bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4a6080', marginBottom: 5 }}>
                <span>Mastery</span>
                <span style={{ color: pHex(selected.pKnown) }}>{Math.round(selected.pKnown * 100)}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(selected.pKnown * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 99, background: pHex(selected.pKnown) }}
                />
              </div>
            </div>

            {/* Stats */}
            {selected.prog && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <MiniStat label="Attempted" value={String(selected.prog.questions_attempted)} />
                <MiniStat
                  label="Accuracy"
                  value={selected.prog.questions_attempted > 0
                    ? `${Math.round((selected.prog.questions_correct / selected.prog.questions_attempted) * 100)}%`
                    : '—'}
                />
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => router.push(`/practice?topic=${selected.slug}`)}
                style={{
                  padding: '11px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: `${pHex(selected.pKnown)}22`,
                  border: `1px solid ${pHex(selected.pKnown)}50`,
                  color: pHex(selected.pKnown),
                }}>
                ⚡ Practice Now
              </button>
              <button
                onClick={() => router.push(`/topics/${selected.slug}`)}
                style={{
                  padding: '9px 0', borderRadius: 12, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#5a7aaa',
                }}>
                View Lessons →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom-left: legend ────────────────────────────────────── */}
      {!selected && (
        <div style={{
          position: 'absolute', bottom: isMobile ? 76 : 20, left: 24, zIndex: 10,
          display: 'flex', gap: isMobile ? 10 : 14, alignItems: 'center',
          background: 'rgba(4,6,16,0.75)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 20, padding: isMobile ? '6px 12px' : '7px 16px',
        }}>
          <span style={{ fontSize: isMobile ? 9 : 11, color: '#ff3300', fontWeight: 500 }}>● Not started</span>
          <span style={{ fontSize: isMobile ? 9 : 11, color: '#ff9900', fontWeight: 500 }}>● Developing</span>
          <span style={{ fontSize: isMobile ? 9 : 11, color: '#0066ff', fontWeight: 500 }}>● Mastered</span>
        </div>
      )}

      {/* ── Bottom-right: hint (desktop only) ──────────────────────── */}
      {!isMobile && (
        <div style={{
          position: 'absolute', bottom: 20, right: 24, zIndex: 10,
          fontSize: 10, letterSpacing: '0.1em', color: '#1a2a3a',
        }}>
          DRAG TO ROTATE · SCROLL TO ZOOM
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      padding: '8px 10px',
    }}>
      <p style={{ fontSize: 9, letterSpacing: '0.12em', color: '#3a5070', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(4,6,16,0.82)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(245,158,11,0.1)',
      borderRadius: 12,
      padding: '8px 14px',
      minWidth: 70,
    }}>
      <p style={{ fontSize: 9, letterSpacing: '0.12em', color: '#3a5070', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
    </div>
  )
}
