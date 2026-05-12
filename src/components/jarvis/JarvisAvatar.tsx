'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { JarvisState } from '@/types'

interface Props {
  state: JarvisState
  size?: number
  amplitude?: number   // 0-1 live audio level — drives scale + glow pulsation
}

// Pre-defined neural network node positions (normalized 0-1)
const NODES = [
  { x: 0.5,  y: 0.5  }, // centre
  { x: 0.5,  y: 0.18 }, // top
  { x: 0.82, y: 0.32 }, // top-right
  { x: 0.82, y: 0.68 }, // bottom-right
  { x: 0.5,  y: 0.82 }, // bottom
  { x: 0.18, y: 0.68 }, // bottom-left
  { x: 0.18, y: 0.32 }, // top-left
  { x: 0.68, y: 0.24 }, // inner top-right
  { x: 0.76, y: 0.5  }, // inner right
  { x: 0.68, y: 0.76 }, // inner bottom-right
  { x: 0.32, y: 0.76 }, // inner bottom-left
  { x: 0.24, y: 0.5  }, // inner left
  { x: 0.32, y: 0.24 }, // inner top-left
  { x: 0.62, y: 0.38 }, // core ring
  { x: 0.62, y: 0.62 },
  { x: 0.38, y: 0.62 },
  { x: 0.38, y: 0.38 },
]

// Edges connecting nodes
const EDGES = [
  [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
  [1,7],[1,12],[2,7],[2,8],[3,8],[3,9],
  [4,9],[4,10],[5,10],[5,11],[6,11],[6,12],
  [7,13],[8,13],[8,14],[9,14],[9,15],[10,15],[10,16],[11,16],[12,16],[12,13],
  [13,14],[14,15],[15,16],[16,13],
  [1,2],[2,3],[3,4],[4,5],[5,6],[6,1],
]

export function JarvisAvatar({ state, size = 56, amplitude = 0 }: Props) {
  const r = size / 2
  const scale = size / 100

  // Map node coords to SVG space (clipped to circle)
  function nx(node: { x: number; y: number }) { return node.x * size }
  function ny(node: { x: number; y: number }) { return node.y * size }

  const glowColor = state === 'listening'
    ? 'rgba(34,197,94,0.8)'
    : state === 'thinking'
      ? 'rgba(251,191,36,0.9)'
      : state === 'speaking'
        ? 'rgba(251,146,60,0.9)'
        : 'rgba(245,158,11,0.7)'

  const glowShadow = state === 'listening'
    ? `0 0 ${size * 0.4}px rgba(34,197,94,0.5), 0 0 ${size * 0.8}px rgba(34,197,94,0.2)`
    : state === 'thinking'
      ? `0 0 ${size * 0.5}px rgba(251,191,36,0.6), 0 0 ${size}px rgba(251,191,36,0.25)`
      : state === 'speaking'
        ? `0 0 ${size * 0.5}px rgba(251,146,60,0.6), 0 0 ${size}px rgba(251,146,60,0.25)`
        : `0 0 ${size * 0.35}px rgba(245,158,11,0.45), 0 0 ${size * 0.7}px rgba(245,158,11,0.15)`

  // Amplitude drives an extra scale boost (1.0 → 1.35 at full volume)
  const ampScale = 1 + amplitude * 0.35
  // Amplitude also intensifies the glow
  const ampGlowSize = size * (0.35 + amplitude * 0.65)
  const ampGlowOpacity = 0.45 + amplitude * 0.55

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {/* Outer glow ring — reacts to amplitude */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: state === 'listening'
            ? `0 0 ${ampGlowSize}px rgba(34,197,94,${ampGlowOpacity}), 0 0 ${ampGlowSize * 2}px rgba(34,197,94,0.2)`
            : state === 'thinking'
              ? `0 0 ${ampGlowSize}px rgba(251,191,36,${ampGlowOpacity + 0.1}), 0 0 ${ampGlowSize * 2}px rgba(251,191,36,0.25)`
              : `0 0 ${ampGlowSize}px rgba(245,158,11,${ampGlowOpacity}), 0 0 ${ampGlowSize * 2}px rgba(245,158,11,0.2)`,
          transform: `scale(${ampScale})`,
          transition: 'transform 0.08s ease-out, box-shadow 0.08s ease-out',
        }}
      />

      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          position: 'relative',
          zIndex: 1,
          transform: `scale(${ampScale})`,
          transition: 'transform 0.08s ease-out',
          transformOrigin: 'center',
        }}
      >
        <defs>
          {/* Clip to circle */}
          <clipPath id={`clip-${size}`}>
            <circle cx={r} cy={r} r={r - 1} />
          </clipPath>

          {/* Background radial gradient — deep amber core */}
          <radialGradient id={`bg-grad-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#78350f" stopOpacity="0.9" />
            <stop offset="40%"  stopColor="#451a03" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0c0a00" stopOpacity="1" />
          </radialGradient>

          {/* Node glow gradient */}
          <radialGradient id={`node-grad-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Outer rim gradient */}
          <radialGradient id={`rim-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="75%"  stopColor="transparent" />
            <stop offset="100%" stopColor={state === 'listening' ? '#22c55e' : '#f59e0b'} stopOpacity="0.4" />
          </radialGradient>

          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation={1.5 * scale} result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background fill */}
        <circle cx={r} cy={r} r={r - 1} fill={`url(#bg-grad-${size})`} />

        {/* Neural network — edges (single CSS animation on the group) */}
        <g clipPath={`url(#clip-${size})`} filter={`url(#glow-${size})`} className="jarvis-edges">
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={nx(NODES[a])} y1={ny(NODES[a])}
              x2={nx(NODES[b])} y2={ny(NODES[b])}
              stroke={state === 'listening' ? '#4ade80' : '#f59e0b'}
              strokeWidth={0.6 * scale}
              strokeOpacity={0.5}
            />
          ))}
        </g>

        {/* Neural network — nodes (single CSS animation on the group) */}
        <g clipPath={`url(#clip-${size})`} filter={`url(#glow-${size})`} className="jarvis-nodes">
          {NODES.map((node, i) => {
            const nodeSize = i === 0 ? 3 * scale : i < 7 ? 1.8 * scale : 1.2 * scale
            return (
              <circle
                key={i}
                cx={nx(node)} cy={ny(node)}
                r={nodeSize}
                fill={state === 'listening' ? '#4ade80' : i === 0 ? '#fde68a' : '#fbbf24'}
              />
            )
          })}
        </g>

        {/* Rim glow overlay */}
        <circle cx={r} cy={r} r={r - 1} fill={`url(#rim-${size})`} />

        {/* Outer border ring */}
        <motion.circle
          cx={r} cy={r} r={r - 1.5}
          fill="none"
          stroke={state === 'listening' ? '#22c55e' : '#f59e0b'}
          strokeWidth={1 * scale}
          strokeOpacity={0.5}
          animate={{ strokeOpacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Thinking: spinning arc */}
        <AnimatePresence>
          {state === 'thinking' && (
            <motion.circle
              cx={r} cy={r} r={r - 2}
              fill="none"
              stroke="#fcd34d"
              strokeWidth={2 * scale}
              strokeDasharray={`${r * 1.2} ${r * 4}`}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 360, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 0.3 },
              }}
              style={{ transformOrigin: `${r}px ${r}px` }}
            />
          )}
        </AnimatePresence>

        {/* Speaking: radial pulse rings */}
        <AnimatePresence>
          {state === 'speaking' && [0, 0.3, 0.6].map((delay, i) => (
            <motion.circle
              key={i}
              cx={r} cy={r}
              r={r * 0.3}
              fill="none"
              stroke="#fb923c"
              strokeWidth={1 * scale}
              initial={{ r: r * 0.3, opacity: 0.8 }}
              animate={{ r: r * 0.9, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </svg>
    </div>
  )
}
