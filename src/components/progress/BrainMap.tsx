'use client'

import { useState, useCallback, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { masteryLabel } from '@/lib/bkt/bayesian-knowledge-tracing'
import { createClient } from '@/lib/supabase/client'
import type { StudentProgress, Topic } from '@/types'

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

// red(0) → blue(0.5) → green(1)
function pHex(p: number): string {
  if (p <= 0.5) {
    const t = p / 0.5
    // red #ef4444 → blue #3b82f6
    return '#' + [
      Math.round(239 + (59  - 239) * t),
      Math.round(68  + (130 - 68)  * t),
      Math.round(68  + (246 - 68)  * t),
    ].map(v => v.toString(16).padStart(2, '0')).join('')
  }
  const t = (p - 0.5) / 0.5
  // blue #3b82f6 → green #22c55e
  return '#' + [
    Math.round(59  + (34  - 59)  * t),
    Math.round(130 + (197 - 130) * t),
    Math.round(246 + (94  - 246) * t),
  ].map(v => v.toString(16).padStart(2, '0')).join('')
}

interface Props {
  progress: StudentProgress[]
  avgPKnown: number
  grade: string
  topicsActive: number
  totalTopics: number
  topics: Omit<Topic, 'id' | 'parent_id'>[]
  topicCategories: Record<string, string[]>
}

interface SelectedTopic {
  name: string
  slug: string
  pKnown: number
  icon: string | null
  prog: StudentProgress | null
}

interface MilestoneToast {
  topicName: string
  message: string
  color: string
}

// Thresholds in ascending order
const MILESTONES: Array<{ threshold: number; message: string; color: string }> = [
  { threshold: 0.3, message: 'Signal detected',   color: '#f59e0b' },
  { threshold: 0.5, message: 'Pathway forming',   color: '#3b82f6' },
  { threshold: 0.7, message: '⚡ Topic mastered!', color: '#22c55e' },
  { threshold: 0.9, message: '🧠 Full mastery!',   color: '#22c55e' },
]

function getHighestCrossed(oldVal: number, newVal: number): { message: string; color: string } | null {
  // Find highest threshold that newVal >= but oldVal <
  let result: { message: string; color: string } | null = null
  for (const m of MILESTONES) {
    if (newVal >= m.threshold && oldVal < m.threshold) {
      result = { message: m.message, color: m.color }
    }
  }
  return result
}

export function BrainMap({ progress, avgPKnown, grade, topicsActive, totalTopics, topics, topicCategories }: Props) {
  const router = useRouter()
  const [liveProgress, setLiveProgress] = useState<StudentProgress[]>(progress)
  const [hovered, setHovered] = useState<{ name: string; slug: string; pKnown: number } | null>(null)
  const [selected, setSelected] = useState<SelectedTopic | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [gapsOpen, setGapsOpen] = useState(false)
  const [refreshing, startRefresh] = useTransition()
  const [sidebarW, setSidebarW] = useState('4rem')
  const [isMobile, setIsMobile] = useState(false)
  const [sectionFilter, setSectionFilter] = useState<string | null>(null)
  const [toast, setToast] = useState<MilestoneToast | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) return

      channel = supabase
        .channel(`brain-progress-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'student_progress',
            filter: `student_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newRow = payload.new as StudentProgress
              setLiveProgress(prev => {
                const oldRow = prev.find(p => p.topic_id === newRow.topic_id)
                const oldVal = oldRow?.p_known ?? 0
                const newVal = newRow.p_known

                // Milestone check
                const crossed = getHighestCrossed(oldVal, newVal)
                if (crossed) {
                  const topic = topics.find(t => t.slug === newRow.topic_id)
                  const topicName = topic?.name ?? newRow.topic_id
                  if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
                  setToast({ topicName, message: crossed.message, color: crossed.color })
                  toastTimerRef.current = setTimeout(() => setToast(null), 3000)
                }

                if (oldRow) {
                  return prev.map(p => p.topic_id === newRow.topic_id ? newRow : p)
                } else {
                  return [...prev, newRow]
                }
              })
            }
          }
        )
        .subscribe()
    })

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const gradeColor = grade === 'A*' ? '#fbbf24' : grade === 'A' ? '#4ade80' : grade === 'B' ? '#60a5fa' : grade === 'C' ? '#f97316' : '#ef4444'

  const handleClick = useCallback((slug: string) => {
    const topic = topics.find(t => t.slug === slug)
    if (!topic) return
    const prog = liveProgress.find(p => p.topic_id === slug) ?? null
    setSelected({ name: topic.name, slug, pKnown: prog?.p_known ?? 0, icon: topic.icon, prog })
  }, [liveProgress])

  function startScan() {
    if (scanning) return
    setScanOpen(false)
    setGapsOpen(false)
    setSelected(null)
    setScanning(true)
  }

  // Build gap data: all non-mastered topics sorted by priority
  const gapTopics = topics.map(topic => {
    const prog = liveProgress.find(p => p.topic_id === topic.slug)
    return {
      slug: topic.slug,
      name: topic.name,
      icon: topic.icon,
      pKnown: prog?.p_known ?? 0,
      attempted: prog?.questions_attempted ?? 0,
      section: (Object.entries(topicCategories) as [string, string[]][]).find(([, slugs]) => slugs.includes(topic.slug))?.[0] ?? '',
    }
  })
    .filter(t => t.pKnown < 0.7)
    .sort((a, b) => {
      // not started first, then by lowest p_known
      const aScore = a.attempted === 0 ? -1 : a.pKnown
      const bScore = b.attempted === 0 ? -1 : b.pKnown
      return aScore - bScore
    })

  const notStartedCount = gapTopics.filter(t => t.attempted === 0).length
  const weakCount = gapTopics.filter(t => t.attempted > 0).length

  // Brain health score: sum p_known across all topics / topics.length
  const healthScore = Math.round(
    topics.reduce((sum, topic) => {
      const prog = liveProgress.find(p => p.topic_id === topic.slug)
      return sum + (prog?.p_known ?? 0)
    }, 0) / topics.length * 100
  )

  return (
    <div style={{ position: 'fixed', top: 0, left: sidebarW, right: 0, bottom: 0, zIndex: 5 }}>

      {/* Canvas fills entire container */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <BrainScene
          progress={liveProgress}
          onHover={setHovered}
          onClick={handleClick}
          sectionFilter={sectionFilter}
          topics={topics}
          topicCategories={topicCategories}
        />
      </div>

      {/* ── Scanner sweep overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            key="scanner-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none', overflow: 'hidden' }}
          >
            {/* Subtle blue tint during scan */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(30,80,180,0.04)',
            }} />

            {/* The scan line */}
            <motion.div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 2,
                background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 15%, #93c5fd 40%, #bfdbfe 50%, #93c5fd 60%, rgba(59,130,246,0.5) 85%, transparent 100%)',
                boxShadow: '0 0 6px 2px rgba(96,165,250,0.7), 0 0 18px 6px rgba(59,130,246,0.35)',
              }}
              animate={{ top: ['0%', '100%', '0%', '100%'] }}
              transition={{ duration: 2.6, ease: 'linear', times: [0, 0.33, 0.67, 1] }}
              onAnimationComplete={() => {
                setScanning(false)
                setScanOpen(true)
              }}
            />

            {/* Gradient trail below the line */}
            <motion.div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 80,
                background: 'linear-gradient(to bottom, rgba(59,130,246,0.08), transparent)',
                pointerEvents: 'none',
              }}
              animate={{ top: ['0%', '100%', '0%', '100%'] }}
              transition={{ duration: 2.6, ease: 'linear', times: [0, 0.33, 0.67, 1] }}
            />

            {/* Scanning label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.6, times: [0, 0.1, 0.9, 1] }}
              style={{
                position: 'absolute',
                bottom: 32,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 9,
                letterSpacing: '0.3em',
                color: '#60a5fa',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Scanning neural pathways...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

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

          {/* SCAN button */}
          <button
            onClick={startScan}
            disabled={scanning}
            title="Scan brain by section"
            style={{
              background: scanOpen ? 'rgba(245,158,11,0.12)' : scanning ? 'rgba(59,130,246,0.15)' : 'none',
              border: scanOpen ? '1px solid rgba(245,158,11,0.3)' : scanning ? '1px solid rgba(96,165,250,0.4)' : '1px solid transparent',
              borderRadius: 8,
              cursor: scanning ? 'default' : 'pointer',
              padding: '2px 8px',
              color: scanOpen ? '#f59e0b' : scanning ? '#60a5fa' : '#3a5070',
              fontSize: 9,
              letterSpacing: '0.15em',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s',
            }}>
            <motion.span
              animate={scanning ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={{ duration: 0.8, repeat: scanning ? Infinity : 0 }}
            >
              ◉
            </motion.span>
            {scanning ? 'SCANNING...' : 'SCAN'}
          </button>

          {/* GAPS button */}
          <button
            onClick={() => { setGapsOpen(v => !v); setScanOpen(false); setSelected(null) }}
            title="Show knowledge gaps"
            style={{
              background: gapsOpen ? 'rgba(239,68,68,0.12)' : 'none',
              border: gapsOpen ? '1px solid rgba(239,68,68,0.35)' : '1px solid transparent',
              borderRadius: 8,
              cursor: 'pointer',
              padding: '2px 8px',
              color: gapsOpen ? '#f87171' : '#3a5070',
              fontSize: 9,
              letterSpacing: '0.15em',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s',
            }}>
            ⚠ GAPS
          </button>
        </div>

        {/* Stat chips row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <StatChip label="Grade" value={grade} color={gradeColor} />
          <StatChip label="Mastery" value={`${Math.round(avgPKnown * 100)}%`} color="#f59e0b" />
          <StatChip label="Topics" value={`${topicsActive}/${totalTopics}`} color="#94a3b8" />
          <StatChip label="Health" value={`${healthScore}%`} color={pHex(healthScore / 100)} />
        </div>

        {/* Section filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['ALL', ...Object.keys(topicCategories)].map(pill => {
            const isActive = pill === 'ALL' ? sectionFilter === null : sectionFilter === pill
            const label = pill === 'ALL' ? 'ALL' : pill.split(' ')[0].toUpperCase().slice(0, 5)
            return (
              <button
                key={pill}
                onClick={() => setSectionFilter(pill === 'ALL' ? null : pill)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 99,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(245,158,11,0.12)' : 'rgba(4,6,16,0.7)',
                  border: isActive ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: isActive ? '#f59e0b' : '#4a6080',
                  transition: 'all 0.15s',
                }}>
                {label}
              </button>
            )
          })}
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
            <button
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: 14, right: 16, color: '#4a6080', fontSize: 18, lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none' }}>
              ×
            </button>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>{selected.icon}</span>
              <p style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 700, color: pHex(selected.pKnown), textTransform: 'uppercase', marginBottom: 5 }}>
                {masteryLabel(selected.pKnown)}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                {selected.name}
              </p>
            </div>

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
                onClick={() => router.push(`/jarvis?topic=${selected.slug}`)}
                style={{
                  padding: '9px 0', borderRadius: 12, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.35)',
                  color: '#818cf8',
                }}>
                Ask SPOK →
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

      {/* ── Scan panel ────────────────────────────────────────────── */}
      <AnimatePresence>
        {scanOpen && (
          <motion.div
            initial={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: -40 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
            exit={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={isMobile ? {
              position: 'absolute', bottom: 76, left: 12, right: 12, zIndex: 10,
              background: 'rgba(4,6,16,0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 20,
              padding: 20,
              maxHeight: '65vh',
              overflowY: 'auto',
            } : {
              position: 'absolute', top: 160, left: 24, width: 280, zIndex: 10,
              background: 'rgba(4,6,16,0.93)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 20,
              padding: 22,
              maxHeight: 'calc(100vh - 150px)',
              overflowY: 'auto',
            }}>
            <button
              onClick={() => setScanOpen(false)}
              style={{ position: 'absolute', top: 14, right: 16, color: '#4a6080', fontSize: 18, lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none' }}>
              ×
            </button>
            <p style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 16 }}>
              Brain Scan
            </p>
            {(Object.entries(topicCategories) as [string, string[]][]).map(([sectionName, slugs]) => {
              const sectionTopics = slugs.map(slug => {
                const topic = topics.find(t => t.slug === slug)!
                const prog = liveProgress.find(p => p.topic_id === slug)
                return { slug, name: topic?.name ?? slug, icon: topic?.icon ?? '', pKnown: prog?.p_known ?? 0, attempted: prog?.questions_attempted ?? 0 }
              })
              const attempted = sectionTopics.filter(t => t.attempted > 0)
              const avgMastery = attempted.length
                ? attempted.reduce((s, t) => s + t.pKnown, 0) / attempted.length
                : 0
              const mastered = sectionTopics.filter(t => t.pKnown >= 0.7).length
              const developing = sectionTopics.filter(t => t.pKnown > 0 && t.pKnown < 0.7).length
              const notStarted = sectionTopics.filter(t => t.attempted === 0).length
              const sectionColor = pHex(avgMastery)
              return (
                <div key={sectionName} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#c0d0e0' }}>{sectionName}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, color: attempted.length ? sectionColor : '#2a3a50' }}>
                      {attempted.length ? `${Math.round(avgMastery * 100)}%` : '—'}
                    </span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.05)', marginBottom: 8 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(avgMastery * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 99, background: attempted.length ? sectionColor : 'transparent' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 9, color: '#22c55e', letterSpacing: '0.08em' }}>● {mastered} mastered</span>
                    <span style={{ fontSize: 9, color: '#3b82f6', letterSpacing: '0.08em' }}>● {developing} developing</span>
                    <span style={{ fontSize: 9, color: '#3a5070', letterSpacing: '0.08em' }}>● {notStarted} untouched</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {sectionTopics.map(t => (
                      <div key={t.slug} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, minWidth: 18 }}>{t.icon}</span>
                        <span style={{ fontSize: 10, color: t.attempted ? pHex(t.pKnown) : '#2a3a50', flex: 1, lineHeight: 1.3 }}>{t.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: t.attempted ? pHex(t.pKnown) : '#2a3a50', minWidth: 28, textAlign: 'right' }}>
                          {t.attempted ? `${Math.round(t.pKnown * 100)}%` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gaps panel ────────────────────────────────────────────── */}
      <AnimatePresence>
        {gapsOpen && (
          <motion.div
            initial={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: -40 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
            exit={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={isMobile ? {
              position: 'absolute', bottom: 76, left: 12, right: 12, zIndex: 10,
              background: 'rgba(4,6,16,0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 20,
              padding: 20,
              maxHeight: '65vh',
              overflowY: 'auto',
            } : {
              position: 'absolute', top: 160, left: 24, width: 280, zIndex: 10,
              background: 'rgba(4,6,16,0.93)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 20,
              padding: 22,
              maxHeight: 'calc(100vh - 150px)',
              overflowY: 'auto',
            }}>
            <button
              onClick={() => setGapsOpen(false)}
              style={{ position: 'absolute', top: 14, right: 16, color: '#4a6080', fontSize: 18, lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none' }}>
              ×
            </button>

            <p style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', marginBottom: 4 }}>
              Knowledge Gaps
            </p>
            <p style={{ fontSize: 11, color: '#4a6080', marginBottom: 16, lineHeight: 1.5 }}>
              {gapTopics.length === 0
                ? 'No gaps detected — all topics mastered.'
                : `${notStartedCount} not started · ${weakCount} need work`}
            </p>

            {gapTopics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: 24, marginBottom: 8 }}>🧠</p>
                <p style={{ fontSize: 13, color: '#4ade80', fontWeight: 700 }}>Full mastery achieved</p>
              </div>
            ) : (
              <>
                {/* Not started */}
                {notStartedCount > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <p style={{ fontSize: 9, letterSpacing: '0.15em', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8 }}>
                      Not started
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {gapTopics.filter(t => t.attempted === 0).map(t => (
                        <div key={t.slug} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: 'rgba(239,68,68,0.06)',
                          border: '1px solid rgba(239,68,68,0.12)',
                          borderRadius: 10, padding: '8px 10px',
                        }}>
                          <span style={{ fontSize: 13, minWidth: 20 }}>{t.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 11, color: '#e0e0e0', fontWeight: 600, lineHeight: 1.2 }}>{t.name}</p>
                            <p style={{ fontSize: 9, color: '#4a6080', marginTop: 1 }}>{t.section}</p>
                          </div>
                          <button
                            onClick={() => router.push(`/practice?topic=${t.slug}`)}
                            style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                              color: '#f87171', background: 'rgba(239,68,68,0.12)',
                              border: '1px solid rgba(239,68,68,0.25)',
                              borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}>
                            START →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Needs work */}
                {weakCount > 0 && (
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: '0.15em', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', marginBottom: 8 }}>
                      Needs improvement
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {gapTopics.filter(t => t.attempted > 0).map(t => (
                        <div key={t.slug} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: `${pHex(t.pKnown)}08`,
                          border: `1px solid ${pHex(t.pKnown)}18`,
                          borderRadius: 10, padding: '8px 10px',
                        }}>
                          <span style={{ fontSize: 13, minWidth: 20 }}>{t.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 11, color: '#e0e0e0', fontWeight: 600, lineHeight: 1.2 }}>{t.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                              <div style={{ flex: 1, height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                                <div style={{ width: `${Math.round(t.pKnown * 100)}%`, height: '100%', borderRadius: 99, background: pHex(t.pKnown) }} />
                              </div>
                              <span style={{ fontSize: 9, color: pHex(t.pKnown), fontWeight: 700, minWidth: 26 }}>
                                {Math.round(t.pKnown * 100)}%
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/practice?topic=${t.slug}`)}
                            style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                              color: pHex(t.pKnown), background: `${pHex(t.pKnown)}15`,
                              border: `1px solid ${pHex(t.pKnown)}30`,
                              borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}>
                            DRILL →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
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
          <span style={{ fontSize: isMobile ? 9 : 11, color: '#ef4444', fontWeight: 500 }}>● Not started</span>
          <span style={{ fontSize: isMobile ? 9 : 11, color: '#3b82f6', fontWeight: 500 }}>● Developing</span>
          <span style={{ fontSize: isMobile ? 9 : 11, color: '#22c55e', fontWeight: 500 }}>● Mastered</span>
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

      {/* ── Milestone toast ────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.message + toast.topicName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: isMobile ? 90 : 60,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              background: 'rgba(4,6,16,0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${toast.color}40`,
              borderRadius: 16,
              padding: '12px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minWidth: 200,
              maxWidth: 280,
              boxShadow: `0 0 24px ${toast.color}20`,
              pointerEvents: 'none',
            }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: toast.color, textAlign: 'center', lineHeight: 1.3 }}>
              {toast.message}
            </p>
            <p style={{ fontSize: 11, color: '#8a9ab0', textAlign: 'center' }}>
              {toast.topicName}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
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
