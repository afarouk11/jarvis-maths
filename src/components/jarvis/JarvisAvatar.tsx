'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { JarvisState } from '@/types'

interface Props {
  state: JarvisState
  size?: number
}

export function JarvisAvatar({ state, size = 56 }: Props) {
  const r = size / 2

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle cx={r} cy={r} r={r - 2} fill="none"
          stroke="rgba(59,130,246,0.2)" strokeWidth="1" />

        {/* Spinning arc — thinking */}
        <AnimatePresence>
          {state === 'thinking' && (
            <motion.circle
              cx={r} cy={r} r={r - 2}
              fill="none" stroke="#3b82f6" strokeWidth="2"
              strokeDasharray={`${(r - 2) * 2 * Math.PI * 0.3} ${(r - 2) * 2 * Math.PI * 0.7}`}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 360, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 1.2, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.2 } }}
              style={{ transformOrigin: `${r}px ${r}px` }}
            />
          )}
        </AnimatePresence>

        {/* Listening ring — green */}
        <AnimatePresence>
          {state === 'listening' && (
            <motion.circle
              cx={r} cy={r} r={r - 2}
              fill="none" stroke="#22c55e" strokeWidth="2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1, 0.95] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ transformOrigin: `${r}px ${r}px` }}
            />
          )}
        </AnimatePresence>

        {/* Core circle */}
        <motion.circle
          cx={r} cy={r} r={r * 0.55}
          fill="url(#jarvis-gradient)"
          animate={state === 'idle' ? {
            r: [r * 0.53, r * 0.57, r * 0.53],
          } : state === 'speaking' ? {
            r: [r * 0.5, r * 0.6, r * 0.5],
          } : {}}
          transition={{ duration: state === 'idle' ? 3 : 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Arc reactor rings */}
        <circle cx={r} cy={r} r={r * 0.38} fill="none"
          stroke="rgba(59,130,246,0.5)" strokeWidth="1" />
        <circle cx={r} cy={r} r={r * 0.22} fill="rgba(59,130,246,0.3)" />

        {/* Speaking waveform bars */}
        <AnimatePresence>
          {state === 'speaking' && (
            <>
              {[-6, -3, 0, 3, 6].map((x, i) => (
                <motion.rect
                  key={i}
                  x={r + x - 0.75}
                  y={r - 4}
                  width={1.5}
                  rx={0.75}
                  fill="#3b82f6"
                  initial={{ height: 2, y: r - 1 }}
                  animate={{ height: [2, 6 + i * 2, 2], y: [r - 1, r - 3 - i, r - 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <defs>
          <radialGradient id="jarvis-gradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
        </defs>
      </svg>

      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: state === 'listening'
            ? '0 0 16px rgba(34,197,94,0.4)'
            : state !== 'idle'
              ? '0 0 20px rgba(59,130,246,0.5)'
              : '0 0 12px rgba(59,130,246,0.2)',
          transition: 'box-shadow 0.3s',
        }} />
    </div>
  )
}
