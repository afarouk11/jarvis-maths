'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { JarvisState } from '@/types'

interface Props {
  state: JarvisState
  size?: number
  amplitude?: number   // 0-1 live audio level
}

export function JarvisAvatar({ state, size = 56, amplitude = 0 }: Props) {
  const isListening = state === 'listening'
  const isThinking  = state === 'thinking'
  const isSpeaking  = state === 'speaking'
  const isIdle      = state === 'idle'

  // Listening shifts colour slightly cyan; speaking stays teal
  const primary  = isListening ? '#00e5ff' : '#00ffaa'
  const glow     = isListening ? 'rgba(0,229,255,0.6)' : 'rgba(0,255,170,0.55)'
  const glowDim  = isListening ? 'rgba(0,229,255,0.2)' : 'rgba(0,255,170,0.18)'

  // Crest grows with live audio
  const crestScale = 1 + amplitude * 0.1

  // Show decoration only when large enough to matter
  const showGrid    = size >= 80
  const showScanline = size >= 80

  const r = size / 2

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>

      {/* Dark circular backdrop */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,18,12,0.96) 0%, rgba(0,6,4,0.99) 100%)',
        border: `1px solid rgba(0,255,170,0.14)`,
        overflow: 'hidden',
      }}>
        {/* HUD grid — only rendered at display sizes ≥ 80px */}
        {showGrid && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            backgroundSize: '20px 20px',
            backgroundImage: [
              'linear-gradient(to right, rgba(0,255,170,0.025) 1px, transparent 1px)',
              'linear-gradient(to bottom, rgba(0,255,170,0.025) 1px, transparent 1px)',
            ].join(', '),
          }} />
        )}

        {/* Scanner line */}
        {showScanline && <div className="spok-scanline" />}
      </div>

      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: isListening ? [0.6, 1, 0.6] : [0.3, 0.7, 0.3] }}
        transition={{ duration: isListening ? 0.9 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: -size * 0.2, borderRadius: '50%',
          background: `radial-gradient(circle, ${glow.replace('0.6', '0.35')} 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Outer HUD ring — slow CW rotation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: isListening ? 7 : 28, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `1px solid ${isListening ? 'rgba(0,229,255,0.32)' : 'rgba(0,255,170,0.22)'}`,
          boxShadow: `0 0 ${size * 0.14}px ${glowDim}`,
        }}
      />

      {/* Mid HUD ring — CCW, amplitude-reactive scale */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: isListening ? 5 : 14, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: Math.round(size * 0.09),
          borderRadius: '50%',
          border: `${isSpeaking || isListening ? 2 : 1.5}px ${isListening ? 'dashed' : 'solid'} ${isListening ? 'rgba(0,229,255,0.42)' : 'rgba(0,255,170,0.30)'}`,
          transform: `scale(${1 + amplitude * 0.14})`,
          transition: 'transform 0.08s ease-out',
          boxShadow: `0 0 ${size * 0.1}px ${glowDim}`,
        }}
      />

      {/* Inner HUD ring — double-border style, CW */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: Math.round(size * 0.18),
          borderRadius: '50%',
          border: `1px solid rgba(0,255,170,0.18)`,
          borderTopColor: primary,
          boxShadow: `0 0 ${size * 0.08}px rgba(0,255,170,0.14)`,
        }}
      />

      {/* ── Thinking: fast spin arc ─────────────────────────────────────── */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            key="think"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{
              rotate:  { duration: 0.85, repeat: Infinity, ease: 'linear' },
              opacity: { duration: 0.2 },
            }}
            style={{
              position: 'absolute', inset: Math.round(size * 0.04),
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#00ffaa',
              borderRightColor: 'rgba(0,255,170,0.28)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Listening: expanding pulse rings ───────────────────────────── */}
      <AnimatePresence>
        {isListening && [0, 0.38, 0.76].map((delay, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0.85 }}
            animate={{ scale: 1.55, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, delay, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: Math.round(size * 0.11),
              borderRadius: '50%',
              border: `1px solid rgba(0,229,255,0.6)`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Speaking/chatting: audio-reactive pulse rings ───────────────── */}
      <AnimatePresence>
        {isSpeaking && [0, 0.28].map((delay, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0.75 }}
            animate={{ scale: 1.35, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, repeat: Infinity, delay, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: Math.round(size * 0.14),
              borderRadius: '50%',
              border: `1px solid rgba(0,255,170,0.55)`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Central geometric crest ─────────────────────────────────────── */}
      <div
        className={isIdle ? 'spok-crest-idle' : isListening ? 'spok-crest-listen' : undefined}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${crestScale})`,
          transition: 'transform 0.08s ease-out',
          filter: `drop-shadow(0 0 ${size * 0.18}px ${glow})`,
        }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={size * 0.62}
          height={size * 0.62}
        >
          <defs>
            <linearGradient id="spokCrest" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={primary} />
              <stop offset="100%" stopColor="#006644" />
            </linearGradient>
          </defs>
          <g stroke="url(#spokCrest)" strokeWidth="1.8" strokeLinejoin="round">
            {/* Outer shell */}
            <polygon points="100,25 150,55 150,120 100,175 50,120 50,55"
              fill="rgba(0,255,170,0.03)" />
            {/* Inner structure */}
            <polygon points="100,45 135,70 135,115 100,150 65,115 65,70"
              fill="rgba(0,255,170,0.055)" />
            {/* Central diamond — lit by amplitude */}
            <polygon points="100,70 120,95 100,125 80,95"
              fill={`rgba(0,255,170,${0.08 + amplitude * 0.28})`} />
            {/* Grid lines */}
            <line x1="100" y1="25"  x2="100" y2="175" />
            <line x1="50"  y1="55"  x2="150" y2="55"  />
            <line x1="50"  y1="120" x2="135" y2="115" />
            <line x1="150" y1="120" x2="65"  y2="115" />
            <line x1="100" y1="70"  x2="50"  y2="55"  />
            <line x1="100" y1="70"  x2="150" y2="55"  />
          </g>
        </svg>
      </div>

    </div>
  )
}
