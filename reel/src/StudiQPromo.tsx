// StudiQPromo.tsx
// 32-second Apple keynote-style cinematic promo · 1920×1080 · 30fps
// After Effects-quality: spring physics, motion-blur entries, LightLeak transitions,
// animated SVG neural map, SPOK orb, feature cascade, film grain + vignette.

import { useMemo } from 'react'
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  Easing,
} from 'remotion'
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { wipe } from '@remotion/transitions/wipe'
import { slide } from '@remotion/transitions/slide'
import { LightLeak } from '@remotion/light-leaks'
import { loadFont, fontFamily as interFamily } from '@remotion/google-fonts/Inter'

loadFont()

// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT  = `${interFamily}, system-ui, -apple-system, sans-serif`
const MONO  = `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace`
const AMBER    = '#f59e0b'
const AMBER_HI = '#fbbf24'
const BLUE     = '#60a5fa'
const FPS      = 30
const TR       = 12   // transition overlap in frames

// Scene durations — must sum to 1044 so total = 1044 − 7×12 = 960 (32 s)
const D1 = 120   // cold open     4.0 s
const D2 = 108   // introducing   3.6 s
const D3 = 132   // hero tagline  4.4 s
const D4 = 162   // neural map    5.4 s
const D5 = 150   // papers        5.0 s
const D6 = 132   // SPOK          4.4 s
const D7 = 120   // cascade       4.0 s
const D8 = 120   // finale        4.0 s

// ── Animation helpers ─────────────────────────────────────────────────────────

/** Tunable spring — use low damping (≤10) for AE-style overshoot */
function spr(
  frame: number,
  delay = 0,
  damping = 14,
  stiffness = 160,
): number {
  return spring({
    frame: Math.max(0, frame - delay),
    fps: FPS,
    config: { damping, stiffness },
  })
}

/** Smooth cubic fade-in starting at `start` over `dur` frames */
function fi(frame: number, start = 0, dur = 15): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
}

/** Fade-out at end of a scene of length `total` */
function fo(frame: number, total: number, dur = 15): number {
  return interpolate(frame, [total - dur, total], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

/** Slide-up helper — returns a translateY value */
function ty(frame: number, start = 0, dur = 15, dist = 40): number {
  return (1 - fi(frame, start, dur)) * dist
}

/** Seeded pseudo-random, frame-safe (no Math.random in render) */
function rand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// ── Shared atoms ──────────────────────────────────────────────────────────────

function Vignette() {
  return (
    <AbsoluteFill style={{
      background:
        'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.9) 100%)',
      pointerEvents: 'none',
    }} />
  )
}

function FilmGrain() {
  const frame = useCurrentFrame()
  const seed  = frame % 12
  return (
    <AbsoluteFill style={{
      opacity: 0.042,
      mixBlendMode: 'overlay' as const,
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' seed='${seed}'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")`,
      pointerEvents: 'none',
    }} />
  )
}

function HudCorners({ opacity }: { opacity: number }) {
  const arm = 60, inset = 60
  const color = `rgba(251,191,36,${opacity * 0.6})`
  const s = (style: React.CSSProperties) => ({ position: 'absolute' as const, background: color, ...style })
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      <div style={s({ left: inset, top: inset, width: arm, height: 1 })} />
      <div style={s({ left: inset, top: inset, width: 1, height: arm })} />
      <div style={s({ right: inset, top: inset, width: arm, height: 1 })} />
      <div style={s({ right: inset, top: inset, width: 1, height: arm })} />
      <div style={s({ left: inset, bottom: inset, width: arm, height: 1 })} />
      <div style={s({ left: inset, bottom: inset, width: 1, height: arm })} />
      <div style={s({ right: inset, bottom: inset, width: arm, height: 1 })} />
      <div style={s({ right: inset, bottom: inset, width: 1, height: arm })} />
    </AbsoluteFill>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 1 · Cold Open — starfield + expanding rings + pulse dot
// ══════════════════════════════════════════════════════════════════════════════
function SceneColdOpen() {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  const stars = useMemo(() =>
    Array.from({ length: 150 }, (_, i) => ({
      x:     rand(i * 7 + 1) * width,
      y:     rand(i * 7 + 2) * height,
      size:  0.4 + rand(i * 7 + 3) * 2.4,
      delay: rand(i * 7 + 4) * 55,
      phase: rand(i * 7 + 5) * Math.PI * 2,
    }))
  , [width, height])

  // AE-style spring entry for the dot — underdamped (slight overshoot)
  const dotSpr  = spr(frame, 0, 9, 140)
  const dotSize = 4 + dotSpr * 20
  const dotGlow = 55 + dotSpr * 380

  const r1T = fi(frame, 22, 45); const r1S = r1T * 1920; const r1O = (1 - r1T) * 0.8
  const r2T = fi(frame, 48, 45); const r2S = r2T * 1650; const r2O = (1 - r2T) * 0.65
  const r3T = fi(frame, 70, 40); const r3S = r3T * 1300; const r3O = (1 - r3T) * 0.45

  const hudOp    = fi(frame, 12, 22)
  const chyronOp = fi(frame, 18, 22)
  const outOp    = fo(frame, D1, 14)

  return (
    <AbsoluteFill style={{ background: '#000', opacity: outOp }}>
      {/* Starfield */}
      {stars.map((star, i) => {
        const op =
          fi(frame, star.delay, 16) *
          (0.32 + 0.68 * Math.abs(Math.sin(frame * 0.052 + star.phase)))
        return (
          <div key={i} style={{
            position: 'absolute',
            left: star.x, top: star.y,
            width: star.size, height: star.size,
            borderRadius: '50%', background: '#fff', opacity: op,
            boxShadow: `0 0 ${star.size * 5}px rgba(255,255,255,0.55)`,
          }} />
        )
      })}

      {/* Expanding rings */}
      {r1O > 0.01 && <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: r1S, height: r1S, marginLeft: -r1S / 2, marginTop: -r1S / 2,
        borderRadius: '50%',
        border: `1px solid rgba(96,165,250,${r1O})`,
        boxShadow: `0 0 90px rgba(96,165,250,${r1O * 0.45})`,
      }} />}
      {r2O > 0.01 && <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: r2S, height: r2S, marginLeft: -r2S / 2, marginTop: -r2S / 2,
        borderRadius: '50%', border: `1px solid rgba(251,191,36,${r2O})`,
      }} />}
      {r3O > 0.01 && <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: r3S, height: r3S, marginLeft: -r3S / 2, marginTop: -r3S / 2,
        borderRadius: '50%', border: `1px solid rgba(255,255,255,${r3O * 0.35})`,
      }} />}

      {/* Central pulse dot */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: dotSize, height: dotSize,
        marginLeft: -dotSize / 2, marginTop: -dotSize / 2,
        borderRadius: '50%', background: '#fff',
        boxShadow: [
          `0 0 ${dotGlow}px ${dotGlow * 0.4}px rgba(96,165,250,0.92)`,
          `0 0 ${dotGlow * 0.55}px ${dotGlow * 0.15}px rgba(251,191,36,0.55)`,
        ].join(', '),
      }} />

      <HudCorners opacity={hudOp} />

      {/* Chyrons — AE-style: blur in */}
      {(['left', 'right'] as const).map((side) => (
        <div key={side} style={{
          position: 'absolute',
          [side]: 80, bottom: 80,
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.22em',
          color: `rgba(96,165,250,${chyronOp})`,
          filter: `blur(${(1 - chyronOp) * 6}px)`,
        }}>
          {side === 'left' ? 'STUDIQ · 2026 · A-LEVEL' : '◆ TRANSMISSION OPEN'}
        </div>
      ))}
    </AbsoluteFill>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 2 · Introducing — wordmark assembly
// ══════════════════════════════════════════════════════════════════════════════
function SideRule({ x, y, progress, flip = false }: {
  x: number; y: number; progress: number; flip?: boolean
}) {
  const w = progress * 240
  return (
    <div style={{
      position: 'absolute',
      left: flip ? x : x - w, top: y,
      width: w, height: 1,
      background: flip
        ? 'linear-gradient(90deg, rgba(251,191,36,0.65), rgba(251,191,36,0))'
        : 'linear-gradient(90deg, rgba(251,191,36,0), rgba(251,191,36,0.65))',
    }} />
  )
}

function SceneIntroducing() {
  const frame   = useCurrentFrame()
  const letters = ['s', 't', 'u', 'd', 'i', 'q']

  const labelOp  = fi(frame, 0, 22)
  const labelTy  = ty(frame, 0, 22, 28)
  const metaOp   = fi(frame, 68, 22)
  const metaTy   = ty(frame, 68, 22, 18)
  const outOp    = fo(frame, D2, 14)

  return (
    <AbsoluteFill style={{ background: '#000', opacity: outOp }}>
      {/* "Introducing" label — blur-slide entry */}
      <div style={{
        position: 'absolute', left: '50%', top: 405,
        transform: `translate(-50%, ${labelTy}px)`,
        opacity: labelOp,
        filter: `blur(${(1 - labelOp) * 8}px)`,
        fontSize: 22, letterSpacing: '0.55em', fontWeight: 500,
        color: AMBER, textTransform: 'uppercase', fontFamily: MONO,
        whiteSpace: 'nowrap',
      }}>Introducing</div>

      <SideRule x={490} y={535} progress={labelOp} />
      <SideRule x={1430} y={535} progress={labelOp} flip />

      {/* Wordmark — each letter spring-enters with underdamped bounce */}
      <div style={{
        position: 'absolute', left: '50%', top: 500,
        transform: 'translate(-50%, -50%)',
        display: 'flex', gap: 0,
        fontSize: 275, fontWeight: 800,
        letterSpacing: '-0.06em',
        fontFamily: FONT, lineHeight: 1,
        userSelect: 'none',
      }}>
        {letters.map((ch, i) => {
          const s   = spr(frame, i * 3 + 2, 9, 155)  // slight overshoot
          const isQ = ch === 'q'
          const op  = Math.min(s * 1.3, 1)
          return (
            <span key={i} style={{
              display: 'inline-block',
              opacity: op,
              transform: `translateY(${(1 - s) * 80}px) scale(${0.78 + 0.22 * s})`,
              color: isQ ? AMBER_HI : '#fff',
              filter: isQ
                ? `drop-shadow(0 0 ${22 + 10 * Math.sin(frame * 0.16)}px rgba(251,191,36,0.65))`
                : `blur(${Math.max(0, (1 - op) * 12)}px)`,
              willChange: 'transform, opacity',
            }}>{ch}</span>
          )
        })}
      </div>

      {/* Meta line */}
      <div style={{
        position: 'absolute', left: '50%', top: 718,
        transform: `translate(-50%, ${metaTy}px)`,
        opacity: metaOp,
        fontSize: 17, letterSpacing: '0.44em',
        color: 'rgba(255,255,255,0.48)', fontFamily: MONO,
        textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>studiq.org · the operating system for learning</div>
    </AbsoluteFill>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 3 · Hero tagline — AE kinetic type (blur-swap phases)
// ══════════════════════════════════════════════════════════════════════════════
const HERO_PHASES = [
  { words: ['Built', 'for'],        start: 0,   end: 48,  size: 215, accent: null },
  { words: ['A-Levels.'],           start: 42,  end: 90,  size: 235, accent: 'A-Levels.' },
  { words: ['Built', 'different.'], start: 84,  end: 132, size: 215, accent: 'different.' },
]

function SceneHero() {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Subtle radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 1100px 520px at 50% 50%, rgba(96,165,250,${0.065 * fi(frame, 0, 30)}) 0%, transparent 70%)`,
      }} />

      {HERO_PHASES.map((phase, i) => {
        const lt       = frame - phase.start
        const phaseDur = phase.end - phase.start
        // AE-style: blur+translate in, blur+translate out
        const inT  = interpolate(lt, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
        const outT = interpolate(lt, [phaseDur - 14, phaseDur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) })
        const op   = inT * (1 - outT)
        const tY   = (1 - inT) * 65 - outT * 42
        const blur = (1 - inT) * 22 + outT * 22

        if (op <= 0.01) return null
        return (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: `translate(-50%, calc(-50% + ${tY}px))`,
            opacity: op,
            fontSize: phase.size, fontWeight: 800,
            letterSpacing: '-0.04em', fontFamily: FONT,
            lineHeight: 1, whiteSpace: 'nowrap',
            filter: `blur(${blur}px)`,
            willChange: 'transform, opacity, filter',
          }}>
            {phase.words.map((w, wi) => (
              <span key={wi} style={{
                color: phase.accent === w ? AMBER_HI : '#fff',
                marginRight: wi < phase.words.length - 1 ? 30 : 0,
                textShadow: phase.accent === w
                  ? `0 0 65px rgba(251,191,36,0.55), 0 0 130px rgba(251,191,36,0.28)`
                  : 'none',
              }}>{w}</span>
            ))}
          </div>
        )
      })}

      {/* Exam board meta — persistent */}
      <div style={{
        position: 'absolute', left: '50%', top: 748,
        transform: 'translateX(-50%)',
        fontSize: 21, letterSpacing: '0.44em',
        color: `rgba(255,255,255,${0.3 * fi(frame, 8, 22)})`,
        fontFamily: MONO, textTransform: 'uppercase',
        filter: `blur(${(1 - fi(frame, 8, 22)) * 6}px)`,
      }}>AQA · OCR · Edexcel</div>
    </AbsoluteFill>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 4 · Neural Knowledge Map
// ══════════════════════════════════════════════════════════════════════════════
const BN: { id: number; name: string; x: number; y: number; p: number; r: number; core?: boolean; gap?: boolean }[] = [
  { id:0,  name:'SPOK',            x:.50, y:.50, p:1.00, r:26, core:true },
  { id:1,  name:'Proof',           x:.50, y:.09, p:.94,  r:16 },
  { id:2,  name:'Algebra',         x:.31, y:.16, p:.91,  r:18 },
  { id:3,  name:'Sequences',       x:.69, y:.16, p:.72,  r:16 },
  { id:4,  name:'Exponentials',    x:.87, y:.28, p:.88,  r:14 },
  { id:5,  name:'Differentiation', x:.90, y:.46, p:.79,  r:18 },
  { id:6,  name:'Integration',     x:.86, y:.64, p:.18,  r:20, gap:true },
  { id:7,  name:'Further Calc.',   x:.76, y:.80, p:.21,  r:15, gap:true },
  { id:8,  name:'Kinematics',      x:.62, y:.89, p:.85,  r:14 },
  { id:9,  name:'Mechanics',       x:.50, y:.93, p:.76,  r:13 },
  { id:10, name:'Vectors',         x:.38, y:.89, p:.66,  r:14 },
  { id:11, name:'Probability',     x:.14, y:.64, p:.88,  r:16 },
  { id:12, name:'Distributions',   x:.10, y:.46, p:.71,  r:15 },
  { id:13, name:'Hypothesis',      x:.18, y:.28, p:.43,  r:13, gap:true },
  { id:14, name:'Coord. Geom.',    x:.28, y:.32, p:.83,  r:14 },
  { id:15, name:'Trigonometry',    x:.25, y:.56, p:.55,  r:16 },
  { id:16, name:'Parametric',      x:.66, y:.34, p:.34,  r:13, gap:true },
]
const BE: [number, number][] = [
  [0,1],[0,2],[0,3],[0,5],[0,11],[0,15],
  [1,2],[1,3],[2,3],[2,14],[3,4],[3,16],
  [4,5],[5,6],[5,16],[6,7],
  [7,8],[8,9],[9,10],[10,15],
  [11,12],[12,13],[13,14],[14,2],
  [15,11],[15,10],[16,6],[1,16],
]
function nColor(p: number) {
  if (p >= 0.8) return '#22c55e'
  if (p >= 0.5) return AMBER
  return '#ef4444'
}

function MapCallout({ x, y, dotX, dotY, showAt, label, value, color }: {
  x: number; y: number; dotX: number; dotY: number
  showAt: number; label: string; value: string; color: string
}) {
  const frame = useCurrentFrame()
  if (frame < showAt) return null
  const t       = Math.min(spr(frame, showAt, 14, 155), 1)
  const cardOp  = fi(frame, showAt + 10, 14)
  const cardTx  = (1 - cardOp) * 22
  const lineLen = Math.hypot(x - dotX, y - dotY)
  const angle   = Math.atan2(y - dotY, x - dotX) * 180 / Math.PI
  return (
    <>
      <div style={{ position: 'absolute', left: dotX - 7, top: dotY - 7, width: 14, height: 14, borderRadius: '50%', background: color, opacity: t, boxShadow: `0 0 22px ${color}` }} />
      <div style={{ position: 'absolute', left: dotX - 24, top: dotY - 24, width: 48, height: 48, borderRadius: '50%', border: `1px solid ${color}`, opacity: t * 0.52 }} />
      <div style={{
        position: 'absolute', left: dotX, top: dotY,
        width: lineLen * t, height: 1,
        background: `linear-gradient(90deg, ${color}88, ${color}44)`,
        transformOrigin: 'left center',
        transform: `rotate(${angle}deg)`,
      }} />
      <div style={{
        position: 'absolute', left: x, top: y - 32,
        opacity: cardOp, transform: `translateX(${cardTx}px)`,
        padding: '14px 22px',
        background: 'rgba(10,14,26,0.9)',
        border: `1px solid ${color}55`, borderLeft: `2.5px solid ${color}`,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 5,
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.34em', color, fontFamily: MONO, marginBottom: 5 }}>{label}</div>
        <div style={{ fontSize: 22, color: '#fff', fontWeight: 600 }}>{value}</div>
      </div>
    </>
  )
}

function SceneNeuralMap() {
  const frame = useCurrentFrame()
  const W = 820, H = 600

  const textOp  = fi(frame, 15, 26)
  const textTy  = ty(frame, 15, 26, 32)
  const subOp   = fi(frame, 58, 22)
  const hudOp   = fi(frame, 8, 22)
  const statOp  = fi(frame, 105, 22)
  const statTy  = ty(frame, 105, 22, 20)
  const outOp   = fo(frame, D4, 18)

  // Slow parallax camera drift
  const camT   = frame / D4
  const mapSc  = 1.04 + camT * 0.065
  const mapTx  = (camT - 0.5) * -32

  return (
    <AbsoluteFill style={{ background: '#000', opacity: outOp }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 66% 50%, rgba(251,146,60,0.08) 0%, transparent 55%)' }} />

      {/* Neural map SVG — right side */}
      <div style={{
        position: 'absolute',
        left: 1920 / 2 + 40, top: 540 - H / 2,
        width: W, height: H,
        transform: `translate(${mapTx}px, 0) scale(${mapSc})`,
        transformOrigin: '58% 50%',
        opacity: fi(frame, 3, 28),
      }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          <defs>
            <filter id="gG4"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="gR4"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="gA4"><feGaussianBlur stdDeviation="11" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {/* Animated edges — strokeDashoffset reveal */}
          {BE.map(([ai, bi], i) => {
            const a = BN[ai], b = BN[bi]
            const ax = a.x * W, ay = a.y * H, bx = b.x * W, by = b.y * H
            const aGap = a.gap || a.core, bGap = b.gap || b.core
            const color = aGap && bGap ? 'rgba(239,68,68,.35)' : aGap || bGap ? 'rgba(245,158,11,.24)' : 'rgba(255,255,255,.09)'
            const len   = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2)
            const delay = 18 + i * 3
            const dOff  = interpolate(frame, [delay, delay + 32], [len, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
              easing: Easing.out(Easing.cubic),
            })
            return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={color} strokeWidth={1.3} strokeDasharray={len} strokeDashoffset={dOff} />
          })}

          {/* Nodes */}
          {BN.map((n, i) => {
            const nx  = n.x * W, ny = n.y * H
            const col = n.core ? AMBER : nColor(n.p)
            const isGap = n.gap
            const delay = 16 + i * 5
            const nodeOp = fi(frame, delay, 16)
            // Pulsing radius
            const pulse = isGap
              ? n.r + 3.5 * Math.sin(frame * 0.22 + i)
              : n.core
                ? n.r + 2.5 * Math.sin(frame * 0.12)
                : n.r + 1.2 * Math.sin(frame * 0.08 + i)
            const onLeft = n.x < .35, onRight = n.x > .65, onTop = n.y < .3, onBot = n.y > .75
            const lx = onLeft ? nx - n.r - 8 : onRight ? nx + n.r + 8 : nx
            const ly = n.core ? ny - n.r - 14 : onTop ? ny - n.r - 10 : onBot ? ny + n.r + 20 : ny
            const anchor = onLeft ? 'end' : onRight ? 'start' : 'middle'
            const dy = (onTop || n.core) ? '0' : onBot ? '1em' : '.35em'
            return (
              <g key={i} opacity={nodeOp}>
                {isGap && (
                  <circle cx={nx} cy={ny}
                    r={n.r + interpolate(frame % 40, [0, 40], [0, 22], { extrapolateLeft:'clamp', extrapolateRight:'clamp' })}
                    fill="none" stroke="#ef4444" strokeWidth={1.5}
                    opacity={interpolate(frame % 40, [0, 40], [0.55, 0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' })} />
                )}
                <circle cx={nx} cy={ny} r={pulse * 2} fill={col}
                  opacity={n.core ? 0.16 : isGap ? 0.13 : 0.07}
                  filter={isGap ? 'url(#gR4)' : n.core ? 'url(#gA4)' : 'url(#gG4)'} />
                <circle cx={nx} cy={ny} r={pulse}
                  fill={n.core ? 'rgba(245,158,11,.22)' : `${col}22`}
                  stroke={col} strokeWidth={n.core ? 2.5 : isGap ? 2 : 1.5} />
                {!n.core && (
                  <text x={lx} y={ly} dy={dy} textAnchor={anchor}
                    fontSize={isGap ? 14 : 13} fontWeight={isGap ? 700 : 500}
                    fill={isGap ? '#f87171' : col} fontFamily={FONT}>
                    {n.name}{isGap ? ' ⚠' : ''}
                  </text>
                )}
                {n.core && (
                  <>
                    <text x={nx} y={ny} dy=".35em" textAnchor="middle" fontSize={15} fontWeight={800} fill="#fde68a" fontFamily={FONT}>SPOK</text>
                    <text x={nx} y={ny + 36} textAnchor="middle" fontSize={11} fill="rgba(253,230,138,.55)" fontFamily={FONT}>AI Core</text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Callouts */}
      <MapCallout x={1620} y={230} dotX={1512} dotY={295} showAt={42} label="DIFFERENTIATION" value="92% mastery" color={BLUE} />
      <MapCallout x={1670} y={460} dotX={1570} dotY={488} showAt={58} label="VECTORS" value="needs work" color={AMBER} />
      <MapCallout x={1598} y={698} dotX={1528} dotY={665} showAt={74} label="INTEGRATION" value="critical gap ⚠" color="#ef4444" />

      {/* Left headline */}
      <div style={{ position: 'absolute', left: 120, top: 330, maxWidth: 700, opacity: textOp, transform: `translateY(${textTy}px)` }}>
        <div style={{ fontSize: 19, letterSpacing: '0.54em', color: AMBER_HI, fontFamily: MONO, fontWeight: 500, marginBottom: 28, textTransform: 'uppercase' }}>
          Neural Knowledge Map
        </div>
        <div style={{ fontSize: 90, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.0 }}>
          See every gap.<br/><span style={{ color: AMBER_HI }}>In real time.</span>
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', marginTop: 32, lineHeight: 1.5, opacity: subOp, filter: `blur(${(1 - subOp) * 5}px)` }}>
          Every concept you&apos;ve touched — mapped,<br/>weighted, and waiting to be mastered.
        </div>
      </div>

      {/* Readout strip */}
      <div style={{ position: 'absolute', left: 120, bottom: 85, display: 'flex', gap: 58, opacity: statOp, transform: `translateY(${statTy}px)` }}>
        {[
          { label: 'TOPICS', value: '28' },
          { label: 'MASTERED', value: '01' },
          { label: 'DUE', value: '04', accent: true },
          { label: 'LAST SYNC', value: 'LIVE' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 12, letterSpacing: '0.36em', color: 'rgba(255,255,255,0.4)', fontFamily: MONO, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 38, fontWeight: 600, color: s.accent ? AMBER_HI : '#fff', fontFamily: MONO, letterSpacing: '0.04em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <HudCorners opacity={hudOp} />
    </AbsoluteFill>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 5 · Mock Papers
// ══════════════════════════════════════════════════════════════════════════════
function TypewriterLabel({ x, y, text, color, opacity }: { x: number; y: number; text: string; color: string; opacity: number }) {
  const chars = Math.floor(text.length * opacity)
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(opacity * 4, 1) }}>
      <div style={{ width: 44, height: 1, background: color }} />
      <div style={{ padding: '9px 16px', background: 'rgba(10,14,26,0.95)', border: `1px solid ${color}66`, borderRadius: 5, fontSize: 16, color: '#fff', fontFamily: MONO, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
        {text.slice(0, chars)}<span style={{ opacity: chars < text.length ? 1 : 0, color }}>▍</span>
      </div>
    </div>
  )
}

function ScenePapers() {
  const frame   = useCurrentFrame()
  const slideSpr = spr(frame, 0, 13, 140)  // spring with slight overshoot
  const textOp  = fi(frame, 16, 24)
  const textTy  = ty(frame, 16, 24, 30)
  const subOp   = fi(frame, 48, 22)
  const statOp  = fi(frame, 82, 22)
  const statTy  = ty(frame, 82, 22, 22)
  const outOp   = fo(frame, D5, 18)

  return (
    <AbsoluteFill style={{ background: '#000', opacity: outOp }}>
      {/* Blue grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(96,165,250,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.052) 1px, transparent 1px)',
        backgroundSize: '82px 82px',
        maskImage: 'radial-gradient(ellipse at center, #000 22%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, #000 22%, transparent 70%)',
        opacity: fi(frame, 0, 28),
      }} />

      {/* Paper screenshot — spring slide-in with rotation */}
      <div style={{
        position: 'absolute', left: 900, top: 55,
        width: 960, height: 975,
        transform: `translateX(${(1 - slideSpr) * 230}px) rotate(${(1 - slideSpr) * 5.5}deg)`,
        opacity: Math.min(slideSpr * 1.2, 1),
        borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 40px 140px rgba(96,165,250,0.3), 0 0 0 1px rgba(255,255,255,0.07)',
      }}>
        <Img src={staticFile('ui/ui-papers.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 240, background: 'linear-gradient(180deg, transparent, #000)' }} />
      </div>

      {/* Left content */}
      <div style={{ position: 'absolute', left: 120, top: 245, maxWidth: 720, opacity: textOp, transform: `translateY(${textTy}px)` }}>
        <div style={{ fontSize: 19, letterSpacing: '0.54em', color: BLUE, fontFamily: MONO, fontWeight: 500, marginBottom: 28, textTransform: 'uppercase' }}>
          Mock Papers
        </div>
        <div style={{ fontSize: 94, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.0 }}>
          Generated.<br/><span style={{ color: BLUE }}>On demand.</span>
        </div>
        <div style={{ fontSize: 25, color: 'rgba(255,255,255,0.6)', marginTop: 30, lineHeight: 1.5, opacity: subOp, filter: `blur(${(1 - subOp) * 5}px)` }}>
          Press a button. Get an exam that targets<br/>exactly what your model says to revise.
        </div>

        {/* Stats */}
        <div style={{ marginTop: 56, display: 'flex', gap: 50, opacity: statOp, transform: `translateY(${statTy}px)` }}>
          {[
            { val: '75', suf: 'min', label: 'TIMED' },
            { val: '60', suf: 'marks', label: 'MOCK PAPER' },
            { val: '28', suf: 'topics', label: 'CALIBRATED' },
          ].map(({ val, suf, label }) => (
            <div key={label}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 88, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{val}</span>
                <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.48)', fontWeight: 500 }}>{suf}</span>
              </div>
              <div style={{ fontSize: 12, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.38)', fontFamily: MONO, marginTop: 8, textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Typewriter annotations */}
      <TypewriterLabel x={1265} y={305} text="targets weak topics" color={AMBER_HI} opacity={fi(frame, 62, 22)} />
      <TypewriterLabel x={1265} y={545} text="real exam format"    color={BLUE}     opacity={fi(frame, 80, 22)} />
    </AbsoluteFill>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 6 · Meet SPOK
// ══════════════════════════════════════════════════════════════════════════════
const ACRONYM = [
  { letter: 'S', word: 'cientific',  delay: 0  },
  { letter: 'P', word: 'redictor',   delay: 4  },
  { letter: 'O', word: 'f',          delay: 8  },
  { letter: 'K', word: 'nowledge',   delay: 12 },
]

function SpokOrb({ frame }: { frame: number }) {
  const size    = 840
  const inner   = 630
  const core    = 270
  const corePin = 34
  const pulse   = 0.95 + 0.05 * Math.sin(frame * 0.15)
  const half    = size / 2

  return (
    <div style={{ position: 'relative', width: size, height: size, perspective: 900 }}>
      {/* Three orbital rings at different tilt/rotation planes */}
      {[
        { inset: 0,                     rx: 74, ry: 0,  rz: frame * 0.4,  color: 'rgba(251,191,36,0.18)' },
        { inset: (size - inner) / 2,    rx: 58, ry: 22, rz: -frame * 0.6, color: 'rgba(251,191,36,0.25)' },
        { inset: (size - inner * .75) / 2, rx: 32, ry: 0, rz: frame * 0.28, color: 'rgba(96,165,250,0.16)' },
      ].map((ring, i) => (
        <div key={i} style={{
          position: 'absolute', inset: ring.inset,
          border: `1px solid ${ring.color}`, borderRadius: '50%',
          transform: `rotateX(${ring.rx}deg) rotateY(${ring.ry}deg) rotateZ(${ring.rz}deg)`,
        }} />
      ))}

      {/* Glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: core, height: core,
        transform: `translate(-50%, -50%) scale(${pulse})`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.75) 0%, rgba(251,191,36,0.22) 40%, transparent 70%)',
        filter: `blur(${12 + Math.sin(frame * 0.13) * 5}px)`,
      }} />

      {/* Core dot */}
      <div style={{
        position: 'absolute', left: half - corePin / 2, top: half - corePin / 2,
        width: corePin, height: corePin,
        transform: `scale(${pulse})`,
        borderRadius: '50%', background: '#fbbf24',
        boxShadow: '0 0 100px 26px rgba(251,191,36,0.78)',
      }} />
    </div>
  )
}

function SceneSpok() {
  const frame  = useCurrentFrame()
  const orbSpr = spr(frame, 0, 13, 125)
  const textOp = fi(frame, 16, 24)
  const textTy = ty(frame, 16, 24, 30)
  const acrOp  = fi(frame, 50, 22)
  const waveOp = fi(frame, 38, 22)
  const outOp  = fo(frame, D6, 18)

  return (
    <AbsoluteFill style={{ background: '#000', opacity: outOp }}>
      {/* Amber glow behind orb */}
      <div style={{
        position: 'absolute', left: '62%', top: '50%',
        width: 950, height: 950, marginLeft: -475, marginTop: -475,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.20) 0%, rgba(251,191,36,0.06) 38%, transparent 65%)',
        filter: 'blur(50px)', opacity: orbSpr,
      }} />

      {/* Orb — spring scale-in */}
      <div style={{
        position: 'absolute', left: '62%', top: '50%',
        transform: `translate(-50%, -50%) scale(${0.55 + orbSpr * 0.45})`,
        opacity: Math.min(orbSpr * 1.3, 1), pointerEvents: 'none',
      }}>
        <SpokOrb frame={frame} />
      </div>

      {/* Left text */}
      <div style={{ position: 'absolute', left: 120, top: 252, maxWidth: 780, opacity: textOp, transform: `translateY(${textTy}px)` }}>
        <div style={{ fontSize: 19, letterSpacing: '0.54em', color: AMBER_HI, fontFamily: MONO, fontWeight: 500, marginBottom: 28, textTransform: 'uppercase', filter: `blur(${(1 - textOp) * 6}px)` }}>
          Meet SPOK
        </div>
        <div style={{ fontSize: 100, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.0 }}>
          A tutor that<br/><span style={{ color: AMBER_HI }}>actually knows you.</span>
        </div>

        {/* Acronym — letter by letter spring in */}
        <div style={{ marginTop: 52, opacity: acrOp }}>
          {ACRONYM.map(({ letter, word, delay }) => {
            const t = Math.min(spr(frame, 50 + delay, 13, 160), 1)
            return (
              <div key={letter} style={{
                fontSize: 22, color: 'rgba(255,255,255,0.52)',
                fontFamily: MONO, letterSpacing: '0.16em', lineHeight: 2.0,
                opacity: Math.min(t * 1.5, 1),
                transform: `translateX(${(1 - t) * 22}px)`,
                filter: `blur(${Math.max(0, (1 - t) * 5)}px)`,
              }}>
                <span style={{ color: AMBER_HI, fontWeight: 700, fontSize: 26 }}>{letter}</span>
                <span>{word}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Voice waveform — animated sine bars */}
      <div style={{ position: 'absolute', right: 185, bottom: 175, display: 'flex', alignItems: 'center', gap: 4, opacity: waveOp }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const v = 0.22 + 0.78 * Math.abs(
            Math.sin(frame * 0.19 + i * 0.55) * Math.cos(frame * 0.09 + i * 0.3)
          )
          return (
            <div key={i} style={{
              width: 3, height: 18 + v * 72,
              background: `linear-gradient(180deg, ${AMBER_HI}, ${AMBER})`,
              borderRadius: 2, opacity: 0.78,
            }} />
          )
        })}
      </div>
      <div style={{ position: 'absolute', right: 185, bottom: 120, fontSize: 12, color: AMBER_HI, fontFamily: MONO, letterSpacing: '0.44em', textTransform: 'uppercase', opacity: fi(frame, 52, 22) }}>
        ◆ Ready · Tap to speak
      </div>
    </AbsoluteFill>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 7 · Feature Cascade — rapid fire stats
// ══════════════════════════════════════════════════════════════════════════════
const CASCADE = [
  { t: 0,   label: 'Predicted Grade',  value: 'A*',     color: '#10b981' },
  { t: 15,  label: 'Topic Mastery',    value: '47%',    color: AMBER },
  { t: 30,  label: 'XP Streak',        value: '12d',    color: '#a78bfa' },
  { t: 45,  label: 'Past Papers',      value: '28',     color: BLUE },
  { t: 60,  label: 'Voice Tutor',      value: 'LIVE',   color: AMBER_HI },
  { t: 75,  label: 'Marks Earned',     value: '60/60',  color: '#10b981' },
  { t: 90,  label: 'Exam Boards',      value: '3',      color: BLUE },
  { t: 105, label: 'Always-on',        value: '24/7',   color: AMBER_HI },
]

function SceneCascade() {
  const frame   = useCurrentFrame()
  const headerOp = fi(frame, 0, 16)
  const outOp    = fo(frame, D7, 12)

  const active = CASCADE.findIndex(f => frame >= f.t && frame < f.t + 15)

  return (
    <AbsoluteFill style={{ background: '#000', opacity: outOp }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(96,165,250,0.065) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.065) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at center, #000 26%, transparent 76%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, #000 26%, transparent 76%)',
      }} />

      <div style={{
        position: 'absolute', left: '50%', top: 88, transform: 'translateX(-50%)',
        fontSize: 16, letterSpacing: '0.65em', color: `rgba(255,255,255,${0.36 * headerOp})`,
        fontFamily: MONO, textTransform: 'uppercase', whiteSpace: 'nowrap',
        filter: `blur(${(1 - headerOp) * 4}px)`,
      }}>The whole system</div>

      {/* Active feature card */}
      {active >= 0 && (() => {
        const f  = CASCADE[active]
        const lt = frame - f.t
        // AE-style: fast spring in, fast spring out
        const inT  = interpolate(lt, [0, 7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
        const outT = interpolate(lt, [9, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) })
        const op   = inT * (1 - outT)
        const tx   = (1 - inT) * 110 - outT * 90
        const blur = (1 - inT) * 16 + outT * 16

        return (
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: `translate(-50%, -50%) translateX(${tx}px)`,
            opacity: op, textAlign: 'center',
            filter: `blur(${blur}px)`,
          }}>
            <div style={{ fontSize: 22, letterSpacing: '0.44em', color: f.color, textTransform: 'uppercase', fontFamily: MONO, fontWeight: 500, marginBottom: 24 }}>
              {f.label}
            </div>
            <div style={{
              fontSize: 310, fontWeight: 800, color: '#fff',
              letterSpacing: '-0.06em', lineHeight: 1,
              textShadow: `0 0 90px ${f.color}48, 0 0 220px ${f.color}24`,
            }}>
              {f.value}
            </div>
            <div style={{
              marginTop: 26, height: 3, background: f.color,
              boxShadow: `0 0 28px ${f.color}`,
              transform: `scaleX(${inT})`, transformOrigin: 'center',
            }} />
          </div>
        )
      })()}

      {/* Progress dots */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 84, display: 'flex', justifyContent: 'center', gap: 12, opacity: fi(frame, 5, 14) }}>
        {CASCADE.map((f, i) => {
          const isActive = frame >= f.t && frame < f.t + 15
          return (
            <div key={i} style={{
              width: 50, height: 4, borderRadius: 2,
              background: isActive ? f.color : 'rgba(255,255,255,0.13)',
              boxShadow: isActive ? `0 0 14px ${f.color}` : 'none',
            }} />
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 8 · Finale — wordmark bloom
// ══════════════════════════════════════════════════════════════════════════════
function FinaleStars({ frame, opacity }: { frame: number; opacity: number }) {
  const stars = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      x:     rand(i * 11 + 50) * 1920,
      y:     rand(i * 11 + 60) * 1080,
      size:  0.35 + rand(i * 11 + 70) * 1.9,
      phase: rand(i * 11 + 80) * Math.PI * 2,
    }))
  , [])

  return (
    <>
      {stars.map((star, i) => (
        <div key={i} style={{
          position: 'absolute', left: star.x, top: star.y,
          width: star.size, height: star.size, borderRadius: '50%',
          background: '#fff',
          opacity: opacity * (0.28 + 0.72 * Math.abs(Math.sin(frame * 0.05 + star.phase))),
          boxShadow: `0 0 ${star.size * 4}px rgba(255,255,255,0.5)`,
        }} />
      ))}
    </>
  )
}

function SceneFinale() {
  const frame  = useCurrentFrame()
  const inSpr  = spr(frame, 0, 15, 140)
  const pulse  = 0.58 + 0.42 * Math.sin(frame * 0.15)
  const urlOp  = fi(frame, 30, 24)
  const availOp = fi(frame, 48, 20)
  const creditOp = fi(frame, 55, 20)
  const outOp  = fo(frame, D8, 12)

  return (
    <AbsoluteFill style={{ background: '#000', opacity: outOp }}>
      {/* Central bloom — golden + blue */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 1600, height: 1600,
        transform: `translate(-50%, -50%) scale(${0.52 + inSpr * 0.48})`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(251,191,36,${0.20 * inSpr}) 0%, rgba(96,165,250,${0.09 * inSpr}) 28%, transparent 58%)`,
        filter: 'blur(55px)', opacity: inSpr,
      }} />

      <FinaleStars frame={frame} opacity={fi(frame, 0, 35) * 0.65} />

      {/* Wordmark — spring scale-up from slightly below */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%, -50%) translateY(${(1 - inSpr) * 32}px) scale(${0.93 + inSpr * 0.07})`,
        opacity: inSpr,
        fontSize: 380, fontWeight: 800,
        letterSpacing: '-0.06em', fontFamily: FONT,
        lineHeight: 1, whiteSpace: 'nowrap', color: '#fff',
        willChange: 'transform, opacity',
      }}>
        studi<span style={{
          color: AMBER_HI,
          textShadow: [
            `0 0 ${65 * pulse}px rgba(251,191,36,${0.78 * pulse})`,
            `0 0 ${140 * pulse}px rgba(251,191,36,${0.40 * pulse})`,
            `0 0 ${260 * pulse}px rgba(251,191,36,${0.18 * pulse})`,
          ].join(', '),
        }}>q</span>
      </div>

      {/* URL */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, calc(-50% + 228px))',
        fontSize: 30, fontWeight: 400, color: 'rgba(255,255,255,0.5)',
        fontFamily: MONO, letterSpacing: '0.54em', textTransform: 'lowercase',
        opacity: urlOp, filter: `blur(${(1 - urlOp) * 6}px)`,
      }}>studiq.org</div>

      {/* Available now */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, calc(-50% + 306px))',
        fontSize: 14, fontWeight: 500, color: AMBER_HI,
        fontFamily: MONO, letterSpacing: '0.64em', textTransform: 'uppercase',
        opacity: availOp,
      }}>Available now</div>

      {/* Corner credits */}
      <div style={{ position: 'absolute', left: 80, bottom: 80, fontSize: 11, letterSpacing: '0.3em', color: `rgba(255,255,255,${0.2 * creditOp})`, fontFamily: MONO, textTransform: 'uppercase' }}>
        ◆ STUDIQ · A-LEVEL · 2026
      </div>
      <div style={{ position: 'absolute', right: 80, bottom: 80, fontSize: 11, letterSpacing: '0.3em', color: `rgba(255,255,255,${0.2 * creditOp})`, fontFamily: MONO, textTransform: 'uppercase' }}>
        END · TRANSMISSION CLOSE
      </div>
    </AbsoluteFill>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ══════════════════════════════════════════════════════════════════════════════

// Cumulative start frames for LightLeak placement (TransitionSeries overlaps by TR)
const LS2 = D1 - TR            // scene 2 starts
const LS3 = LS2 + D2 - TR      // scene 3 starts
const LS4 = LS3 + D3 - TR      // scene 4 starts
const LS5 = LS4 + D4 - TR      // scene 5 starts
const LS6 = LS5 + D5 - TR      // scene 6 starts
const LS7 = LS6 + D6 - TR      // scene 7 starts
const LS8 = LS7 + D7 - TR      // scene 8 starts

export const StudiQPromo: React.FC = () => (
  <AbsoluteFill style={{ background: '#000', fontFamily: FONT }}>
    {/* Score — low volume under visuals */}
    <Audio src={staticFile('music.mp3')} volume={0.17} />

    {/* Scene transitions */}
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={D1}><SceneColdOpen /></TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={fade()} />

      <TransitionSeries.Sequence durationInFrames={D2}><SceneIntroducing /></TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={springTiming({ durationInFrames: TR + 4, config: { damping: 200 } })} presentation={wipe({ direction: 'from-left' })} />

      <TransitionSeries.Sequence durationInFrames={D3}><SceneHero /></TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={fade()} />

      <TransitionSeries.Sequence durationInFrames={D4}><SceneNeuralMap /></TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={springTiming({ durationInFrames: TR + 4, config: { damping: 200 } })} presentation={slide({ direction: 'from-right' })} />

      <TransitionSeries.Sequence durationInFrames={D5}><ScenePapers /></TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={wipe({ direction: 'from-bottom' })} />

      <TransitionSeries.Sequence durationInFrames={D6}><SceneSpok /></TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={springTiming({ durationInFrames: TR + 4, config: { damping: 200 } })} presentation={slide({ direction: 'from-left' })} />

      <TransitionSeries.Sequence durationInFrames={D7}><SceneCascade /></TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={fade()} />

      <TransitionSeries.Sequence durationInFrames={D8}><SceneFinale /></TransitionSeries.Sequence>
    </TransitionSeries>

    {/* LightLeak cinematic flares at scene boundaries */}
    <Sequence from={LS2 - 2}><LightLeak durationInFrames={26} seed={3}  hueShift={210} /></Sequence>
    <Sequence from={LS3 - 2}><LightLeak durationInFrames={26} seed={7}  hueShift={38}  /></Sequence>
    <Sequence from={LS4 - 2}><LightLeak durationInFrames={30} seed={11} hueShift={30}  /></Sequence>
    <Sequence from={LS6 - 2}><LightLeak durationInFrames={28} seed={5}  hueShift={42}  /></Sequence>
    <Sequence from={LS8 - 2}><LightLeak durationInFrames={30} seed={2}  hueShift={30}  /></Sequence>

    {/* Always-on polish */}
    <Vignette />
    <FilmGrain />
  </AbsoluteFill>
)
