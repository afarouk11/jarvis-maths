'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, X } from 'lucide-react'

const PRESETS = [
  { label: '15 min', work: 15, break: 5 },
  { label: '25 min', work: 25, break: 5 },
  { label: '45 min', work: 45, break: 10 },
]

type Phase = 'idle' | 'work' | 'break'

interface Props {
  onClose: () => void
}

export function ADHDTimer({ onClose }: Props) {
  const [preset,    setPreset]    = useState(1) // default 25 min
  const [phase,     setPhase]     = useState<Phase>('idle')
  const [seconds,   setSeconds]   = useState(PRESETS[1].work * 60)
  const [running,   setRunning]   = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const totalSeconds = phase === 'break'
    ? PRESETS[preset].break * 60
    : PRESETS[preset].work * 60

  const progress = 1 - seconds / totalSeconds

  function playChime() {
    try {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const freqs = [523, 659, 784]
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        const t = ctx.currentTime + i * 0.3
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
        osc.start(t)
        osc.stop(t + 0.8)
      })
    } catch {}
  }

  const tick = useCallback(() => {
    setSeconds(s => {
      if (s <= 1) {
        playChime()
        setRunning(false)
        setPhase(prev => {
          if (prev === 'work') {
            setSeconds(PRESETS[preset].break * 60)
            return 'break'
          }
          setSeconds(PRESETS[preset].work * 60)
          return 'idle'
        })
        return 0
      }
      return s - 1
    })
  }, [preset])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

  function start() {
    if (phase === 'idle') setPhase('work')
    setRunning(true)
  }

  function pause() { setRunning(false) }

  function reset() {
    setRunning(false)
    setPhase('idle')
    setSeconds(PRESETS[preset].work * 60)
  }

  function selectPreset(i: number) {
    setPreset(i)
    setRunning(false)
    setPhase('idle')
    setSeconds(PRESETS[i].work * 60)
  }

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  const r = 44
  const circ = 2 * Math.PI * r
  const strokeDash = circ * (1 - progress)

  const color = phase === 'break' ? '#4ade80' : phase === 'work' ? '#f59e0b' : '#3b82f6'
  const phaseLabel = phase === 'break' ? 'Break time' : phase === 'work' ? 'Focus session' : 'Ready'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed bottom-24 right-6 z-50 rounded-2xl p-5 w-64"
      style={{
        background: 'rgba(8,13,25,0.97)',
        border: '1px solid rgba(245,158,11,0.2)',
        boxShadow: '0 0 30px rgba(245,158,11,0.1), 0 20px 40px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px)',
      }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>Focus Timer</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
          <X size={13} style={{ color: '#5a7aaa' }} />
        </button>
      </div>

      {/* Preset selector */}
      <div className="flex gap-1.5 mb-5">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => selectPreset(i)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: preset === i ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${preset === i ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: preset === i ? '#f59e0b' : '#5a7aaa',
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Ring timer */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r={r} fill="none"
              stroke={color} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={strokeDash}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums" style={{ color: '#e8f0fe' }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-[10px] mt-0.5" style={{ color }}>{phaseLabel}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={reset}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <RotateCcw size={14} style={{ color: '#5a7aaa' }} />
        </button>
        <button
          onClick={running ? pause : start}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03]"
          style={{ background: `rgba(${phase === 'break' ? '74,222,128' : '245,158,11'},0.15)`, border: `1px solid ${color}40`, color }}>
          {running ? <><Pause size={13} /> Pause</> : <><Play size={13} /> {phase === 'idle' ? 'Start' : 'Resume'}</>}
        </button>
      </div>

      {/* Break reminder */}
      {phase === 'break' && (
        <p className="text-center text-xs mt-4" style={{ color: '#4ade80' }}>
          Step away from the screen. Stretch. Breathe.
        </p>
      )}
    </motion.div>
  )
}
