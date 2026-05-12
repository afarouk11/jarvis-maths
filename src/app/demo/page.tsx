'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { JarvisAvatar } from '@/components/jarvis/JarvisAvatar'
import { JarvisState } from '@/types'

// ── Mock topic data for knowledge map ─────────────────────────────────────────
const TOPICS = [
  { name: 'Algebra', icon: '𝑓', p: 0.91, cat: 'Pure' },
  { name: 'Coordinate Geom.', icon: '📐', p: 0.83, cat: 'Pure' },
  { name: 'Sequences', icon: '∑', p: 0.72, cat: 'Pure' },
  { name: 'Trigonometry', icon: '△', p: 0.55, cat: 'Pure' },
  { name: 'Exponentials', icon: 'eˣ', p: 0.88, cat: 'Pure' },
  { name: 'Differentiation', icon: 'd/dx', p: 0.79, cat: 'Pure' },
  { name: 'Integration', icon: '∫', p: 0.18, cat: 'Pure' },
  { name: 'Vectors', icon: '→', p: 0.66, cat: 'Pure' },
  { name: 'Proof', icon: '∴', p: 0.94, cat: 'Pure' },
  { name: 'Further Calculus', icon: '∂', p: 0.21, cat: 'Pure' },
  { name: 'Parametric Eq.', icon: 'xy', p: 0.34, cat: 'Pure' },
  { name: 'Probability', icon: 'P()', p: 0.88, cat: 'Stats' },
  { name: 'Distributions', icon: '~B', p: 0.71, cat: 'Stats' },
  { name: 'Hypothesis Test', icon: 'H₀', p: 0.43, cat: 'Stats' },
  { name: 'Kinematics', icon: 'v=u+at', p: 0.85, cat: 'Mechanics' },
  { name: 'Forces', icon: 'F=ma', p: 0.62, cat: 'Mechanics' },
]

function masteryColor(p: number) {
  if (p >= 0.8) return '#22c55e'
  if (p >= 0.55) return '#f59e0b'
  return '#ef4444'
}

// ── Chat sequence ──────────────────────────────────────────────────────────────
const CHAT: { role: 'spok' | 'user'; text: string }[] = [
  {
    role: 'spok',
    text: "I've analysed your last three papers. Integration by parts is costing you 8 marks every time — you're choosing the wrong u. Let me fix that now.",
  },
  {
    role: 'user',
    text: 'Show me how.',
  },
  {
    role: 'spok',
    text: "Rule: let u be whatever simplifies when differentiated. For ∫x·eˣ dx — u = x, dv = eˣ dx. Result: xeˣ − eˣ + C. Now try: ∫x·sin(x) dx.",
  },
]

// ── Typewriter ─────────────────────────────────────────────────────────────────
function useTypewriter(text: string, started: boolean, speed = 22) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!started) { setDisplayed(''); setDone(false); return }
    setDisplayed('')
    setDone(false)
    let i = 0
    const iv = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(iv); setDone(true) }
    }, speed)
    return () => clearInterval(iv)
  }, [text, started, speed])

  return { displayed, done }
}

// ── Chat bubble ────────────────────────────────────────────────────────────────
function ChatBubble({ msg, index, activeIndex, large }: {
  msg: typeof CHAT[number]; index: number; activeIndex: number; large?: boolean
}) {
  const started = activeIndex === index
  const visible = activeIndex >= index
  const { displayed } = useTypewriter(msg.text, started, msg.role === 'spok' ? 20 : 32)
  const isSpok = msg.role === 'spok'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex gap-2 ${isSpok ? 'items-start' : 'items-end flex-row-reverse'}`}>
          {isSpok && (
            <div className="shrink-0 mt-1">
              <JarvisAvatar state={started ? 'speaking' : 'idle'} size={large ? 38 : 28} />
            </div>
          )}
          <div
            className={`max-w-[84%] rounded-2xl leading-relaxed ${large ? 'px-5 py-4 text-base' : 'px-4 py-3 text-sm'}`}
            style={{
              background: isSpok ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.15)',
              border: isSpok ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(59,130,246,0.25)',
              color: isSpok ? '#fde68a' : '#bfdbfe',
              borderTopLeftRadius: isSpok ? 4 : undefined,
              borderTopRightRadius: isSpok ? undefined : 4,
            }}>
            {activeIndex > index ? msg.text : displayed}
            {started && activeIndex === index && (
              <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse"
                style={{ background: isSpok ? '#f59e0b' : '#60a5fa' }} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Page wrapper ───────────────────────────────────────────────────────────────
export default function DemoPage() {
  return <Suspense><DemoInner /></Suspense>
}

function DemoInner() {
  const searchParams = useSearchParams()
  const recordMode = searchParams.has('record')

  type Phase = 'intro' | 'problem' | 'map' | 'chat' | 'practice' | 'stats' | 'cta'
  const [phase, setPhase] = useState<Phase>('intro')
  const [problemLine, setProblemLine] = useState(0)   // 0-3
  const [mapVisible, setMapVisible] = useState(false)
  const [chatIndex, setChatIndex] = useState(-1)
  const [jarvisState, setJarvisState] = useState<JarvisState>('idle')
  const [practiceVisible, setPracticeVisible] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearAll() { timeouts.current.forEach(clearTimeout); timeouts.current = [] }
  function t(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms); timeouts.current.push(id)
  }

  function play() {
    clearAll()
    setPhase('intro'); setProblemLine(0); setMapVisible(false)
    setChatIndex(-1); setJarvisState('idle'); setPracticeVisible(false); setStatsVisible(false)

    // ── Problem phase ────────────────────────────────────
    t(() => setPhase('problem'), 1200)
    t(() => setProblemLine(1), 2400)
    t(() => setProblemLine(2), 4000)
    t(() => setProblemLine(3), 5400)

    // ── Map phase ────────────────────────────────────────
    t(() => { setPhase('map'); setMapVisible(false) }, 7200)
    t(() => setMapVisible(true), 7500)

    // ── Chat phase ───────────────────────────────────────
    t(() => { setPhase('chat'); setChatIndex(-1); setJarvisState('idle') }, 14000)
    t(() => { setChatIndex(0); setJarvisState('speaking') }, 14400)
    // msg 0: ~140 chars @ 20ms = ~2.8s → done ~17.2s
    t(() => setJarvisState('idle'), 17200)
    t(() => setChatIndex(1), 17600)
    t(() => { setChatIndex(2); setJarvisState('thinking') }, 19200)
    t(() => setJarvisState('speaking'), 20000)
    // msg 2: ~120 chars @ 20ms = ~2.4s → done ~22.4s
    t(() => setJarvisState('idle'), 22800)

    // ── Practice phase ───────────────────────────────────
    t(() => { setPhase('practice'); setPracticeVisible(false) }, 24000)
    t(() => setPracticeVisible(true), 24400)

    // ── Stats phase ──────────────────────────────────────
    t(() => { setPhase('stats'); setStatsVisible(false) }, 30000)
    t(() => setStatsVisible(true), 30400)

    // ── CTA phase ────────────────────────────────────────
    t(() => setPhase('cta'), 37000)
  }

  useEffect(() => {
    play()
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const containerStyle = recordMode
    ? { width: '100vw', height: '100vh', borderRadius: 0, boxShadow: 'none' }
    : { width: 390, height: 844, borderRadius: 36, boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 40px 120px rgba(0,0,0,0.8)' }

  const pt = recordMode ? 'pt-12' : 'pt-14'
  const px = recordMode ? 'px-8' : 'px-6'

  return (
    <div
      className={recordMode ? '' : 'flex items-center justify-center min-h-screen'}
      style={{ background: '#050912' }}>

      <div
        className="relative overflow-hidden flex flex-col"
        style={{ background: '#080d19', ...containerStyle }}>

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(245,158,11,0.07), transparent)' }} />

        {/* ── INTRO ─────────────────────────────────────── */}
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div key="intro"
              initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}>
                <JarvisAvatar state="idle" size={recordMode ? 96 : 72} />
              </motion.div>
              <div className="flex items-center gap-2.5">
                <div className={`rounded-full flex items-center justify-center font-bold ${recordMode ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'}`}
                  style={{ background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', color: '#fff' }}>S</div>
                <span className={`font-bold text-white tracking-wide ${recordMode ? 'text-2xl' : 'text-lg'}`}>StudiQ</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PROBLEM ───────────────────────────────────── */}
        <AnimatePresence>
          {phase === 'problem' && (
            <motion.div key="problem"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 flex flex-col justify-center z-10 ${px}`}>
              <div className="space-y-5">
                {[
                  { line: "Thousands of A-level students", sub: false },
                  { line: "work hard every day.", sub: false },
                  { line: "And still underperform.", sub: false },
                  { line: "They don't know what to work on.", sub: true },
                ].map((item, i) => (
                  <AnimatePresence key={i}>
                    {problemLine > i && (
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35 }}
                        className={`font-bold leading-tight ${recordMode ? 'text-3xl' : 'text-2xl'}`}
                        style={{ color: item.sub ? '#f59e0b' : '#fff' }}>
                        {item.line}
                      </motion.p>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── KNOWLEDGE MAP ─────────────────────────────── */}
        <AnimatePresence>
          {phase === 'map' && (
            <motion.div key="map"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 flex flex-col z-10 ${px} ${pt} pb-6`}>

              <motion.div className="mb-4"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p className={`font-bold text-white ${recordMode ? 'text-xl' : 'text-base'}`}>Your Knowledge Map</p>
                <p className={`mt-0.5 ${recordMode ? 'text-sm' : 'text-xs'}`} style={{ color: '#5a7aaa' }}>
                  SPOK has found <span style={{ color: '#ef4444', fontWeight: 600 }}>4 critical gaps</span> costing you marks
                </p>
              </motion.div>

              <div className="grid grid-cols-3 gap-2 flex-1 content-start">
                {TOPICS.map((topic, i) => {
                  const color = masteryColor(topic.p)
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={mapVisible ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="rounded-xl p-2.5"
                      style={{
                        background: `${color}12`,
                        border: `1px solid ${color}35`,
                      }}>
                      <div className={`mb-1 ${recordMode ? 'text-lg' : 'text-base'}`}>{topic.icon}</div>
                      <p className={`text-white font-medium leading-tight truncate ${recordMode ? 'text-xs' : 'text-[10px]'}`}>{topic.name}</p>
                      <div className="mt-1.5 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <motion.div className="h-full rounded-full" style={{ background: color }}
                          initial={{ width: 0 }}
                          animate={mapVisible ? { width: `${Math.round(topic.p * 100)}%` } : {}}
                          transition={{ delay: i * 0.05 + 0.2, duration: 0.6 }} />
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <motion.div className="mt-3 flex gap-3 justify-center"
                initial={{ opacity: 0 }} animate={mapVisible ? { opacity: 1 } : {}} transition={{ delay: 1 }}>
                {[{ color: '#22c55e', label: 'Mastered' }, { color: '#f59e0b', label: 'Learning' }, { color: '#ef4444', label: 'Gap' }].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs" style={{ color: '#5a7aaa' }}>{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CHAT ──────────────────────────────────────── */}
        <AnimatePresence>
          {phase === 'chat' && (
            <motion.div key="chat"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col z-10">

              {/* Header */}
              <div className={`flex items-center gap-3 px-5 pb-4 ${recordMode ? 'pt-10' : 'pt-14'}`}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <JarvisAvatar state={jarvisState} size={recordMode ? 46 : 36} />
                <div>
                  <p className={`font-semibold text-white ${recordMode ? 'text-base' : 'text-sm'}`}>SPOK</p>
                  <p className={recordMode ? 'text-sm' : 'text-xs'} style={{ color: '#5a7aaa' }}>
                    {jarvisState === 'thinking' ? 'Analysing your work...' : jarvisState === 'speaking' ? 'Teaching...' : 'Your personal maths tutor'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className={`flex-1 overflow-hidden flex flex-col justify-center px-4 ${recordMode ? 'py-6 gap-5' : 'py-5 gap-4'}`}>
                {CHAT.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} index={i} activeIndex={chatIndex} large={recordMode} />
                ))}
              </div>

              {/* Input */}
              <div className={`px-4 pt-3 ${recordMode ? 'pb-10' : 'pb-10'}`} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className={`flex-1 ${recordMode ? 'text-sm' : 'text-sm'}`} style={{ color: '#374151' }}>Ask SPOK anything...</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <span style={{ color: '#f59e0b', fontSize: 12 }}>↑</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PRACTICE ──────────────────────────────────── */}
        <AnimatePresence>
          {phase === 'practice' && (
            <motion.div key="practice"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 flex flex-col z-10 ${px} ${pt} pb-8`}>

              <motion.div className="mb-4"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p className={`font-semibold uppercase tracking-widest ${recordMode ? 'text-xs' : 'text-[10px]'}`}
                  style={{ color: '#f59e0b' }}>Targeted Practice</p>
                <p className={`mt-1 ${recordMode ? 'text-sm' : 'text-xs'}`} style={{ color: '#5a7aaa' }}>
                  Integration by Parts · appeared in <span style={{ color: '#fde68a' }}>8 of 10</span> recent papers
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={practiceVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4 }}
                className="rounded-2xl p-5 mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-semibold text-white ${recordMode ? 'text-lg' : 'text-base'}`}>
                    Find &nbsp;<span style={{ color: '#fde68a' }}>∫ x · sin(x) dx</span>
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>5 marks</span>
                </div>
                <p className={recordMode ? 'text-sm' : 'text-xs'} style={{ color: '#5a7aaa' }}>
                  Use integration by parts. Show every step.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={practiceVisible ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 }}
                className="rounded-xl px-4 py-3 flex items-start gap-3 mb-5"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <JarvisAvatar state="idle" size={recordMode ? 30 : 24} />
                <p className={recordMode ? 'text-sm' : 'text-xs'} style={{ color: '#fde68a', lineHeight: 1.5 }}>
                  Start with u = x, dv = sin(x) dx. Then du = dx and v = −cos(x).
                </p>
              </motion.div>

              {/* Mock answer input */}
              <motion.div
                initial={{ opacity: 0 }} animate={practiceVisible ? { opacity: 1 } : {}}
                transition={{ delay: 0.9 }}
                className="flex-1 rounded-2xl p-4 flex flex-col"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className={`mb-2 ${recordMode ? 'text-xs' : 'text-[10px]'}`} style={{ color: '#374151' }}>Your working</p>
                <div className={`space-y-2 ${recordMode ? 'text-sm' : 'text-xs'}`} style={{ color: '#5a7aaa', fontFamily: 'monospace' }}>
                  <p>u = x &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; dv = sin(x) dx</p>
                  <p>du = dx &nbsp; v = −cos(x)</p>
                  <p style={{ color: '#fde68a' }}>∫ x·sin(x) dx = −x·cos(x) + ∫ cos(x) dx</p>
                  <p style={{ color: '#fde68a' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= −x·cos(x) + sin(x) + C <span className="inline-block w-0.5 h-3 ml-0.5 align-middle animate-pulse" style={{ background: '#f59e0b' }} /></p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={practiceVisible ? { opacity: 1 } : {}}
                transition={{ delay: 2.2 }}
                className="mt-4 rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span className={recordMode ? 'text-sm' : 'text-xs'} style={{ color: '#86efac' }}>SPOK marks your answer instantly</span>
                <span className={`font-bold ${recordMode ? 'text-lg' : 'text-base'}`} style={{ color: '#22c55e' }}>5 / 5</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STATS ─────────────────────────────────────── */}
        <AnimatePresence>
          {phase === 'stats' && (
            <motion.div key="stats"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 flex flex-col justify-center z-10 ${px}`}>

              <motion.p
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className={`font-semibold uppercase tracking-widest mb-6 text-center ${recordMode ? 'text-xs' : 'text-[10px]'}`}
                style={{ color: '#f59e0b' }}>
                Your Progress
              </motion.p>

              <div className="space-y-3">
                {[
                  { label: 'Predicted Grade', before: 'C', after: 'A*', color: '#fbbf24' },
                  { label: 'Study Streak', value: '12 days', color: '#f97316' },
                  { label: 'Topics Mastered', value: '24 / 28', color: '#22c55e' },
                  { label: 'Marks Recovered', value: '+34 pts', color: '#60a5fa' },
                ].map((s, i) => (
                  <motion.div key={s.label}
                    initial={{ opacity: 0, x: -24 }}
                    animate={statsVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                    className="flex items-center justify-between rounded-2xl px-5 py-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className={recordMode ? 'text-sm' : 'text-sm'} style={{ color: '#5a7aaa' }}>{s.label}</span>
                    {'before' in s ? (
                      <div className="flex items-center gap-2">
                        <span className={`line-through ${recordMode ? 'text-base' : 'text-sm'}`} style={{ color: '#374151' }}>{s.before}</span>
                        <span className={`font-bold ${recordMode ? 'text-2xl' : 'text-xl'}`} style={{ color: s.color }}>{s.after}</span>
                      </div>
                    ) : (
                      <span className={`font-bold ${recordMode ? 'text-2xl' : 'text-xl'}`} style={{ color: s.color }}>{s.value}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA ───────────────────────────────────────── */}
        <AnimatePresence>
          {phase === 'cta' && (
            <motion.div key="cta"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-8 z-10 ${px}`}>

              <JarvisAvatar state="idle" size={recordMode ? 100 : 80} />

              <div className="text-center space-y-3">
                <h1 className={`font-bold text-white leading-tight ${recordMode ? 'text-4xl' : 'text-3xl'}`}>
                  Know exactly<br />what to revise.
                </h1>
                <p className={`leading-relaxed ${recordMode ? 'text-base' : 'text-sm'}`} style={{ color: '#5a7aaa' }}>
                  SPOK maps your knowledge, finds the gaps<br />costing you marks, and closes them.
                </p>
              </div>

              <div className="text-center space-y-3 w-full">
                <div className={`rounded-2xl font-bold text-white text-center ${recordMode ? 'py-4 text-base' : 'py-3.5 text-sm'}`}
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 0 40px rgba(59,130,246,0.4)' }}>
                  Free to start &rarr; studiq.org
                </div>
                <p className={recordMode ? 'text-sm' : 'text-xs'} style={{ color: '#374151' }}>
                  No credit card &middot; AQA &middot; Edexcel &middot; OCR
                </p>
              </div>

              <button onClick={play}
                className="text-xs px-4 py-2 rounded-xl transition-all hover:opacity-80"
                style={{ color: '#5a7aaa', border: '1px solid rgba(255,255,255,0.08)' }}>
                &#8635; Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
