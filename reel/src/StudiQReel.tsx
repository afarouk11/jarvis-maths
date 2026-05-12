import {
  AbsoluteFill,
  Audio,
  Img,
  Video,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Easing,
} from 'remotion'
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { wipe } from '@remotion/transitions/wipe'
import { LightLeak } from '@remotion/light-leaks'
import { loadFont, fontFamily as interFamily } from '@remotion/google-fonts/Inter'
import captionsData from '../public/captions.json'

// Load Inter font at module level
loadFont()

// ── Typography ────────────────────────────────────────────────────────────────
const FONT = `${interFamily}, system-ui, -apple-system, sans-serif`

// ── Timing aligned to Whisper voiceover timestamps (30fps) ────────────────────
const D = {
  INTRO:    264,   //  0s–8.8s
  PROBLEM:  330,   //  8.8s–19.8s
  BRAIN:    680,   //  19.8s–42.5s
  CHAT:     360,   //  42.5s–54.5s
  PRACTICE: 360,   //  54.5s–66.5s
  PAPERS:   210,   //  66.5s–73.5s
  STATS:    300,   //  73.5s–83.5s
  CTA:      240,   //  83.5s–91.5s
  OUTRO:    210,   //  91.5s–98.5s
}
// Transition duration in frames (each cross-fade)
const TR = 22

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  bg:       '#060b16',
  amber:    '#f59e0b',
  amberDim: '#fde68a',
  blue:     '#3b82f6',
  green:    '#22c55e',
  red:      '#ef4444',
  muted:    '#5a7aaa',
  white:    '#ffffff',
  dim:      '#94a3b8',
}

// ── Easing helpers ────────────────────────────────────────────────────────────
const ease = Easing.bezier(0.16, 1, 0.3, 1)

function fi(frame: number, start: number, dur = 15) {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease,
  })
}
function su(frame: number, start: number, dur = 18) {
  return interpolate(frame, [start, start + dur], [40, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease,
  })
}
function sl(frame: number, start: number, dur = 18) {
  return interpolate(frame, [start, start + dur], [-60, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease,
  })
}
function sc(frame: number, start: number, dur = 20) {
  return interpolate(frame, [start, start + dur], [0.88, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease,
  })
}

// ── Caption overlay ───────────────────────────────────────────────────────────
type CaptionEntry = { text: string; start: number; end: number }
const CAPTIONS: CaptionEntry[] = captionsData as CaptionEntry[]

function CaptionOverlay() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = frame / fps

  const active = CAPTIONS.find(c => t >= c.start - 0.05 && t < c.end + 0.1)
  if (!active) return null

  // Fade in on new caption, stay solid
  const segStart = active.start * fps
  const segOp    = interpolate(frame, [segStart, segStart + 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  return (
    <div style={{
      position: 'absolute', bottom: 100, left: 0, right: 0, zIndex: 500,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      opacity: segOp,
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(8px)',
        borderRadius: 20,
        padding: '16px 32px',
        maxWidth: 900,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          fontFamily: FONT,
          fontSize: 38,
          fontWeight: 700,
          color: C.white,
          textAlign: 'center',
          lineHeight: 1.3,
          letterSpacing: -0.3,
        }}>
          {active.text}
        </div>
      </div>
    </div>
  )
}

// ── Shared UI label helpers ───────────────────────────────────────────────────
type TagProps = { text: string; style?: React.CSSProperties }

function ProblemTag({ text, style }: TagProps) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)',
      borderRadius: 14, padding: '10px 20px', fontFamily: FONT, ...style,
    }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: '#ef4444', letterSpacing: 2, textTransform: 'uppercase' }}>Problem</span>
      <span style={{ fontSize: 22, color: '#fca5a5' }}>{text}</span>
    </div>
  )
}
function SolveTag({ text, style }: TagProps) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)',
      borderRadius: 14, padding: '10px 20px', fontFamily: FONT, ...style,
    }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: '#22c55e', letterSpacing: 2, textTransform: 'uppercase' }}>StudiQ</span>
      <span style={{ fontSize: 22, color: '#86efac' }}>{text}</span>
    </div>
  )
}
function TeacherTag({ text, style }: TagProps) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
      borderRadius: 14, padding: '10px 20px', fontFamily: FONT, ...style,
    }}>
      <span style={{ fontSize: 22 }}>👩‍🏫</span>
      <span style={{ fontSize: 20, fontWeight: 700, color: '#60a5fa' }}>For teachers</span>
      <span style={{ fontSize: 20, color: '#93c5fd' }}>{text}</span>
    </div>
  )
}

// ── Laptop / MacBook frame ────────────────────────────────────────────────────
function LaptopFrame({ src, videoSrc, width = 920, style }: {
  src?: string; videoSrc?: string; width?: number; style?: React.CSSProperties
}) {
  const screenH = Math.round(width * 10 / 16)   // 16:10 MacBook ratio
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
      {/* Lid — screen */}
      <div style={{
        width,
        background: '#1c1c1e',
        borderRadius: '18px 18px 0 0',
        border: '2px solid #3a3a3c',
        borderBottom: 'none',
        padding: '12px 12px 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.55)',
        position: 'relative',
      }}>
        {/* Camera dot */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#3a3a3c', boxShadow: 'inset 0 0 3px rgba(0,0,0,0.8)' }} />
        </div>
        {/* Screen bezel with live video or screenshot */}
        <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden', background: '#000', position: 'relative' }}>
          {videoSrc ? (
            <Video
              src={staticFile(videoSrc)}
              style={{ width: '100%', height: screenH, objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
              loop
            />
          ) : (
            <Img
              src={staticFile(src ?? '')}
              style={{ width: '100%', height: screenH, objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
            />
          )}
          {/* Screen glare overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
          }} />
        </div>
      </div>
      {/* Hinge bar */}
      <div style={{
        width: width + 48,
        height: 14,
        background: 'linear-gradient(180deg, #2a2a2c 0%, #1a1a1c 100%)',
        borderRadius: '0 0 6px 6px',
        border: '1px solid #3a3a3c',
        borderTop: '1px solid #4a4a4c',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      }} />
      {/* Keyboard shadow base */}
      <div style={{
        width: width + 96,
        height: 6,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)',
        borderRadius: '0 0 10px 10px',
      }} />
    </div>
  )
}

// ── SPOK mini avatar ──────────────────────────────────────────────────────────
const AV_NODES = [
  {x:.5,y:.5},{x:.5,y:.18},{x:.82,y:.32},{x:.82,y:.68},{x:.5,y:.82},
  {x:.18,y:.68},{x:.18,y:.32},{x:.68,y:.24},{x:.76,y:.5},{x:.68,y:.76},
  {x:.32,y:.76},{x:.24,y:.5},{x:.32,y:.24},{x:.62,y:.38},{x:.62,y:.62},
  {x:.38,y:.62},{x:.38,y:.38},
]
const AV_EDGES = [
  [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,7],[1,12],[2,7],[2,8],[3,8],[3,9],
  [4,9],[4,10],[5,10],[5,11],[6,11],[6,12],[7,13],[8,14],[9,15],[10,16],[11,16],
  [12,13],[13,14],[14,15],[15,16],[16,13],[1,2],[3,4],[5,6],
]

function SpokAvatar({ size, pulse = false }: { size: number; pulse?: boolean }) {
  const frame = useCurrentFrame()
  const s  = size
  const ps = pulse ? 1 + 0.04 * Math.sin(frame * 0.14) : 1
  return (
    <div style={{ width: s, height: s, position: 'relative', flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', transform: `scale(${ps})`,
        boxShadow: `0 0 ${s*.4}px rgba(245,158,11,.5), 0 0 ${s*.9}px rgba(245,158,11,.18)`,
      }} />
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ position: 'relative', zIndex: 1 }}>
        <defs>
          <clipPath id={`c${s}`}><circle cx={s/2} cy={s/2} r={s/2-1} /></clipPath>
          <radialGradient id={`g${s}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#78350f" stopOpacity=".9" />
            <stop offset="40%" stopColor="#451a03" stopOpacity=".95" />
            <stop offset="100%" stopColor="#0c0a00" stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle cx={s/2} cy={s/2} r={s/2-1} fill={`url(#g${s})`} />
        <g clipPath={`url(#c${s})`} opacity={.55}>
          {AV_EDGES.map(([a,b],i) => (
            <line key={i} x1={AV_NODES[a].x*s} y1={AV_NODES[a].y*s}
              x2={AV_NODES[b].x*s} y2={AV_NODES[b].y*s}
              stroke="#f59e0b" strokeWidth={.55*s/100} strokeOpacity={.5} />
          ))}
        </g>
        <g clipPath={`url(#c${s})`}>
          {AV_NODES.map((n,i) => (
            <circle key={i} cx={n.x*s} cy={n.y*s}
              r={(i===0?3:i<7?1.8:1.2)*s/100}
              fill={i===0?'#fde68a':'#fbbf24'} />
          ))}
        </g>
        <circle cx={s/2} cy={s/2} r={s/2-1.5} fill="none" stroke="#f59e0b" strokeWidth={s/100} strokeOpacity={.45} />
      </svg>
    </div>
  )
}

// ── Brain map node/edge data ──────────────────────────────────────────────────
const BN = [
  { id:0,  name:'SPOK',           x:.50, y:.50, p:1.00, r:30, core:true },
  { id:1,  name:'Proof',          x:.50, y:.09, p:.94,  r:18 },
  { id:2,  name:'Algebra',        x:.31, y:.16, p:.91,  r:20 },
  { id:3,  name:'Sequences',      x:.69, y:.16, p:.72,  r:18 },
  { id:4,  name:'Exponentials',   x:.87, y:.28, p:.88,  r:16 },
  { id:5,  name:'Differentiation',x:.90, y:.46, p:.79,  r:20 },
  { id:6,  name:'Integration',    x:.86, y:.64, p:.18,  r:22, gap:true },
  { id:7,  name:'Further Calc.',  x:.76, y:.80, p:.21,  r:17, gap:true },
  { id:8,  name:'Kinematics',     x:.62, y:.89, p:.85,  r:16 },
  { id:9,  name:'Mechanics',      x:.50, y:.93, p:.76,  r:15 },
  { id:10, name:'Vectors',        x:.38, y:.89, p:.66,  r:16 },
  { id:11, name:'Probability',    x:.14, y:.64, p:.88,  r:18 },
  { id:12, name:'Distributions',  x:.10, y:.46, p:.71,  r:17 },
  { id:13, name:'Hypothesis',     x:.18, y:.28, p:.43,  r:15 },
  { id:14, name:'Coord. Geom.',   x:.28, y:.32, p:.83,  r:16 },
  { id:15, name:'Trigonometry',   x:.25, y:.56, p:.55,  r:18 },
  { id:16, name:'Parametric',     x:.66, y:.34, p:.34,  r:15, gap:true },
]
const BE = [
  [0,1],[0,2],[0,3],[0,5],[0,11],[0,15],
  [1,2],[1,3],[2,3],[2,14],[3,4],[3,16],
  [4,5],[5,6],[5,16],[6,7],
  [7,8],[8,9],[9,10],[10,15],
  [11,12],[12,13],[13,14],[14,2],
  [15,11],[15,10],[16,6],[1,16],
]
function nColor(p: number) {
  if (p >= 0.8) return '#22c55e'
  if (p >= 0.5) return '#f59e0b'
  return '#ef4444'
}

// ── Background ────────────────────────────────────────────────────────────────
function Background() {
  const frame = useCurrentFrame()
  const gx = 50 + 9 * Math.sin(frame * 0.007)
  const gy = -8 + 5 * Math.cos(frame * 0.010)
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 75% 45% at ${gx}% ${gy}%, rgba(245,158,11,.08), transparent)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 120% at 50% 50%, transparent 52%, rgba(0,0,0,.7) 100%)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════════
// SCENE 1 — Cinematic intro
// ════════════════════════════════════════════════════════════════════
function SceneIntro() {
  const frame = useCurrentFrame()
  const l1in  = fi(frame, 4, 14)
  const l1out = interpolate(frame, [34, 48], [1, 0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' })
  const l2in  = fi(frame, 52, 14)
  const l2out = interpolate(frame, [88, 104], [1, 0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' })
  const logoOp = fi(frame, 110, 18)
  const logoSc = sc(frame, 110, 18)
  const subOp  = fi(frame, 136, 16)
  const subTy  = su(frame, 136, 16)

  return (
    <AbsoluteFill style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily: FONT }}>
      <div style={{ position:'absolute', opacity: l1in * l1out, fontSize:78, fontWeight:900, color:C.dim, letterSpacing:-1 }}>
        Working hard.
      </div>
      <div style={{ position:'absolute', opacity: l2in * l2out, fontSize:78, fontWeight:900, color:'#ef4444', letterSpacing:-1 }}>
        Still falling short.
      </div>
      <div style={{
        position:'absolute', opacity: logoOp, transform:`scale(${logoSc})`,
        display:'flex', flexDirection:'column', alignItems:'center', gap:28,
      }}>
        <SpokAvatar size={170} pulse />
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{
            width:54, height:54, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', fontSize:22, fontWeight:700, color:'#fff',
          }}>S</div>
          <span style={{ fontSize:64, fontWeight:800, color:C.white, letterSpacing:2 }}>StudiQ</span>
        </div>
        <div style={{ fontSize:30, color:C.muted, opacity:subOp, transform:`translateY(${subTy}px)` }}>
          The AI that fixes what&apos;s broken in education
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════════
// SCENE 2 — The Problem
// ════════════════════════════════════════════════════════════════════
function SceneProblem() {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 72px', gap:28, fontFamily:FONT }}>

      <div style={{ opacity:fi(frame,6,16), transform:`translateY(${su(frame,6,16)}px)` }}>
        <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.22)', borderRadius:24, padding:'26px 36px' }}>
          <div style={{ fontSize:24, color:C.muted, marginBottom:8 }}>For students</div>
          <div style={{ fontSize:92, fontWeight:900, color:'#ef4444', lineHeight:1 }}>64%</div>
          <div style={{ fontSize:32, color:C.white, marginTop:10, lineHeight:1.4 }}>
            of A-level students miss their predicted grade
          </div>
          <div style={{ fontSize:22, color:C.muted, marginTop:8 }}>
            Not because they don&apos;t work hard —<br/>because they&apos;re revising blind.
          </div>
        </div>
      </div>

      <div style={{ opacity:fi(frame,58,16), transform:`translateY(${su(frame,58,16)}px)` }}>
        <div style={{ background:'rgba(59,130,246,.07)', border:'1px solid rgba(59,130,246,.2)', borderRadius:24, padding:'26px 36px' }}>
          <div style={{ fontSize:24, color:C.muted, marginBottom:8 }}>For teachers</div>
          <div style={{ fontSize:44, fontWeight:800, color:'#60a5fa', lineHeight:1.3 }}>
            1 teacher. 30 students.<br/>No way to track every gap.
          </div>
        </div>
      </div>

      <div style={{ opacity:fi(frame,110,16), transform:`translateY(${su(frame,110,16)}px)` }}>
        <div style={{ background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.18)', borderRadius:24, padding:'22px 36px' }}>
          <div style={{ fontSize:28, color:C.amberDim, lineHeight:1.5 }}>
            Students spend <span style={{ color:C.amber, fontWeight:700 }}>73% of revision time</span> on topics they already know.
          </div>
        </div>
      </div>

      <div style={{ textAlign:'center', opacity:fi(frame,158,20), transform:`scale(${sc(frame,158,20)})` }}>
        <div style={{ fontSize:76, fontWeight:900, color:C.amber }}>Until now.</div>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════════
// SCENE 3 — Brain / Knowledge Map
// ════════════════════════════════════════════════════════════════════
function SceneBrainMap() {
  const frame = useCurrentFrame()
  const W = 940, H = 640
  const scanH = interpolate(frame, [18, 100], [0, H], { extrapolateLeft:'clamp', extrapolateRight:'clamp', easing: ease })

  return (
    <AbsoluteFill style={{ display:'flex', flexDirection:'column', padding:'56px 52px 48px', fontFamily:FONT }}>

      <div style={{ opacity:fi(frame,3,12), marginBottom:12 }}>
        <ProblemTag text="Students revise at random — not the topics costing them marks" />
      </div>

      <div style={{ opacity:fi(frame,14,16), transform:`translateY(${su(frame,14,16)}px)`, marginBottom:16 }}>
        <div style={{ fontSize:46, fontWeight:800, color:C.white }}>Your Knowledge Brain Map</div>
        <div style={{ fontSize:25, color:C.muted, marginTop:6 }}>
          SPOK found <span style={{ color:C.red, fontWeight:700 }}>4 critical gaps</span> costing you marks
        </div>
      </div>

      {/* SVG Brain Map */}
      <div style={{ position:'relative', flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible' }}>
          <defs>
            <clipPath id="scanClip"><rect x={0} y={0} width={W} height={scanH} /></clipPath>
            <filter id="gG" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="gR" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="gA" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="12" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <ellipse cx={W/2} cy={H/2} rx={W/2-18} ry={H/2-18}
            fill="none" stroke="rgba(245,158,11,0.07)" strokeWidth={1.5} opacity={fi(frame,10,20)} />

          <g clipPath="url(#scanClip)">
            {BE.map(([ai,bi],i) => {
              const a = BN[ai], b = BN[bi]
              const ax = a.x*W, ay = a.y*H, bx = b.x*W, by = b.y*H
              const aGap = (a as any).gap||(a as any).core, bGap = (b as any).gap||(b as any).core
              const color = aGap&&bGap ? 'rgba(239,68,68,.3)' : aGap||bGap ? 'rgba(245,158,11,.22)' : 'rgba(255,255,255,.07)'
              const len = Math.sqrt((bx-ax)**2+(by-ay)**2)
              const dDelay = 22 + i*3
              const dOff = interpolate(frame, [dDelay, dDelay+28], [len, 0], { extrapolateLeft:'clamp', extrapolateRight:'clamp', easing:ease })
              return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={color} strokeWidth={1.2} strokeDasharray={len} strokeDashoffset={dOff} />
            })}
          </g>

          {BN.map((n,i) => {
            const nx = n.x*W, ny = n.y*H
            const col = n.core ? C.amber : nColor(n.p)
            const isGap = (n as any).gap
            const delay = 18 + i*5
            const nodeOp = interpolate(frame, [delay, delay+14], [0,1], { extrapolateLeft:'clamp', extrapolateRight:'clamp', easing:ease })
            const pulse  = isGap ? n.r+3.5*Math.sin(frame*.22+i) : n.core ? n.r+2.5*Math.sin(frame*.12) : n.r+1.2*Math.sin(frame*.08+i)
            const onLeft = n.x<.35, onRight = n.x>.65, onTop = n.y<.3, onBot = n.y>.75
            const lx = onLeft ? nx-n.r-8 : onRight ? nx+n.r+8 : nx
            const ly = n.core ? ny-n.r-14 : onTop ? ny-n.r-10 : onBot ? ny+n.r+20 : ny
            const anchor = onLeft?'end':onRight?'start':'middle'
            const dy = (onTop||n.core)?'0':onBot?'1em':'.35em'
            return (
              <g key={i} opacity={nodeOp} clipPath="url(#scanClip)">
                {isGap && (
                  <circle cx={nx} cy={ny}
                    r={n.r + interpolate(frame%42,[0,42],[0,24],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}
                    fill="none" stroke="#ef4444" strokeWidth={1.5}
                    opacity={interpolate(frame%42,[0,42],[0.5,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})} />
                )}
                <circle cx={nx} cy={ny} r={pulse*1.9} fill={col} opacity={n.core?.15:isGap?.13:.07}
                  filter={isGap?'url(#gR)':n.core?'url(#gA)':'url(#gG)'} />
                <circle cx={nx} cy={ny} r={pulse}
                  fill={n.core?'rgba(245,158,11,.22)':`${col}20`}
                  stroke={col} strokeWidth={n.core?2.5:isGap?2:1.5} />
                {!n.core && (
                  <text x={lx} y={ly} dy={dy} textAnchor={anchor}
                    fontSize={isGap?15:14} fontWeight={isGap?700:500}
                    fill={isGap?'#f87171':col} fontFamily="Inter, system-ui, sans-serif">
                    {n.name}{isGap?' ⚠':''}
                  </text>
                )}
                {n.core && (
                  <>
                    <text x={nx} y={ny} dy=".35em" textAnchor="middle" fontSize={16} fontWeight={800} fill="#fde68a" fontFamily="Inter, system-ui">SPOK</text>
                    <text x={nx} y={ny+42} textAnchor="middle" fontSize={13} fill="rgba(253,230,138,.6)" fontFamily="Inter, system-ui">AI Core</text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', justifyContent:'center', gap:36, marginTop:6, opacity:fi(frame,110,16) }}>
        {[{c:'#22c55e',l:'Mastered'},{c:'#f59e0b',l:'Learning'},{c:'#ef4444',l:'Gap — costing marks'}].map(s => (
          <div key={s.l} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:12, height:12, borderRadius:'50%', background:s.c }} />
            <span style={{ fontSize:22, color:C.muted }}>{s.l}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop:12, opacity:fi(frame,380,18) }}>
        <SolveTag text="Pins your exact gaps so every revision minute counts" />
      </div>
      <div style={{ marginTop:10, opacity:fi(frame,420,18), transform:`translateY(${su(frame,420,18)}px)` }}>
        <TeacherTag text="— every student's live map, in your dashboard" />
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════════
// SCENE 4 — AI Chat Tutor (with real UI screenshot)
// ════════════════════════════════════════════════════════════════════
const CHAT_MSGS = [
  { role:'spok', text:"I've tracked your last 3 papers. Integration by Parts is costing you 8 marks every time — you keep choosing the wrong u.", frame:8 },
  { role:'user', text:'Show me where I went wrong.', frame:82 },
  { role:'spok', text:'You wrote u = eˣ. Rule: u = algebraic. So ∫xeˣ dx → u = x, dv = eˣ dx → xeˣ − eˣ + C.', frame:126 },
  { role:'user', text:'u = x, dv = sin(x) dx?', frame:210 },
  { role:'spok', text:"Exactly right. That's 5 marks you won't drop again.", frame:248 },
]

function SceneChat() {
  const frame = useCurrentFrame()
  const laptopOp = fi(frame, 4, 22)
  const laptopTy = su(frame, 4, 22)

  return (
    <AbsoluteFill style={{ display:'flex', flexDirection:'column', fontFamily:FONT }}>
      {/* Laptop frame — top half */}
      <div style={{
        display:'flex', justifyContent:'center', padding:'44px 36px 0',
        opacity: laptopOp, transform: `translateY(${laptopTy}px)`,
      }}>
        <LaptopFrame videoSrc="videos/spok-chat.mp4" width={960} />
      </div>

      {/* Content — bottom half */}
      <div style={{ display:'flex', flexDirection:'column', padding:'18px 52px 40px', gap:12 }}>
        <div style={{ opacity:fi(frame,3,12) }}>
          <ProblemTag text="Generic tutors can't see YOUR specific error" />
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:14, opacity:fi(frame,20,14) }}>
          <SpokAvatar size={52} pulse />
          <div>
            <div style={{ fontSize:28, fontWeight:700, color:C.white }}>SPOK</div>
            <div style={{ fontSize:20, color:C.muted }}>Knows your mistakes before you do</div>
          </div>
        </div>

        {CHAT_MSGS.slice(0, 3).map((msg, i) => {
          const spok = msg.role === 'spok'
          return (
            <div key={i} style={{
              display:'flex', gap:10, alignItems:'flex-start',
              flexDirection: spok ? 'row' : 'row-reverse',
              opacity:fi(frame, msg.frame, 12),
              transform:`translateY(${su(frame, msg.frame, 12)}px)`,
            }}>
              {spok && <SpokAvatar size={36} />}
              <div style={{
                maxWidth:'85%',
                background: spok ? 'rgba(245,158,11,.1)' : 'rgba(59,130,246,.15)',
                border:`1px solid ${spok ? 'rgba(245,158,11,.22)' : 'rgba(59,130,246,.28)'}`,
                borderRadius:16, borderTopLeftRadius:spok?4:16, borderTopRightRadius:spok?16:4,
                padding:'12px 16px', fontSize:21, lineHeight:1.5,
                color: spok ? C.amberDim : '#bfdbfe',
              }}>{msg.text}</div>
            </div>
          )
        })}

        <div style={{ opacity:fi(frame,260,16) }}>
          <SolveTag text="Teaches to YOUR exact mistake — not a generic explanation" />
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════════
// SCENE 5 — Targeted Practice
// ════════════════════════════════════════════════════════════════════
function ScenePractice() {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ display:'flex', flexDirection:'column', padding:'58px 54px 54px', fontFamily:FONT }}>

      <div style={{ opacity:fi(frame,3,12), marginBottom:12 }}>
        <ProblemTag text="Most students revise what they know — skipping actual gaps" />
      </div>
      <div style={{ opacity:fi(frame,14,14), marginBottom:20 }}>
        <div style={{ fontSize:26, fontWeight:700, color:C.amber, letterSpacing:3, textTransform:'uppercase', marginBottom:4 }}>Targeted Practice</div>
        <div style={{ fontSize:25, color:C.muted }}>Integration · in <span style={{ color:C.amberDim, fontWeight:600 }}>8 of 10</span> recent papers</div>
      </div>

      <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:22, padding:'22px 26px', marginBottom:14,
        opacity:fi(frame,24,14), transform:`translateY(${su(frame,24,14)}px)` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ fontSize:34, fontWeight:700, color:C.white }}>Find &nbsp;<span style={{ color:C.amberDim }}>∫ x · sin(x) dx</span></div>
          <div style={{ background:'rgba(245,158,11,.12)', color:C.amber, fontSize:22, fontWeight:600, padding:'6px 14px', borderRadius:10 }}>5 marks</div>
        </div>
        <div style={{ fontSize:23, color:C.muted }}>Use integration by parts. Show every step.</div>
      </div>

      <div style={{ background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.15)', borderRadius:18, padding:'16px 20px', display:'flex', gap:14, marginBottom:14,
        opacity:fi(frame,55,14) }}>
        <SpokAvatar size={42} />
        <div style={{ fontSize:23, color:C.amberDim, lineHeight:1.55 }}>Start: u = x, dv = sin(x) dx → du = dx, v = −cos(x)</div>
      </div>

      <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:18, padding:'18px 24px', flex:1,
        opacity:fi(frame,88,14), fontFamily:'monospace' }}>
        {[
          ['u = x          dv = sin(x) dx', C.muted],
          ['du = dx        v = −cos(x)',     C.muted],
          ['∫ x·sin(x) dx = −x·cos(x) + ∫ cos(x) dx', C.amberDim],
          ['              = −x·cos(x) + sin(x) + C',   C.amberDim],
        ].map(([t,c],j) => (
          <div key={j} style={{ fontSize:23, color:c as string, lineHeight:1.8 }}>{t}</div>
        ))}
      </div>

      <div style={{ background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:18, padding:'15px 20px',
        display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12, opacity:fi(frame,145,14) }}>
        <span style={{ fontSize:23, color:'#86efac' }}>SPOK marks your answer instantly</span>
        <span style={{ fontSize:42, fontWeight:800, color:C.green }}>5 / 5</span>
      </div>

      <div style={{ marginTop:12, opacity:fi(frame,160,14) }}>
        <SolveTag text="Only sends questions on YOUR weak spots — zero wasted revision" />
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════════
// SCENE 6 — Predicted Papers (with real UI screenshot)
// ════════════════════════════════════════════════════════════════════
const PAPER_QS = [
  { n:1, topic:'Integration by Parts',  marks:8 },
  { n:2, topic:'Parametric Equations',  marks:6 },
  { n:3, topic:'Further Calculus',       marks:7 },
  { n:4, topic:'Hypothesis Testing',    marks:5 },
]

function ScenePapers() {
  const frame = useCurrentFrame()
  const laptopOp = fi(frame, 4, 22)
  const laptopTy = su(frame, 4, 22)

  return (
    <AbsoluteFill style={{ display:'flex', flexDirection:'column', fontFamily:FONT }}>
      {/* Laptop frame — top portion */}
      <div style={{
        display:'flex', justifyContent:'center', padding:'44px 36px 0',
        opacity: laptopOp, transform: `translateY(${laptopTy}px)`,
      }}>
        <LaptopFrame videoSrc="videos/dashboard.mp4" width={960} />
      </div>

      {/* Content — below laptop */}
      <div style={{ display:'flex', flexDirection:'column', padding:'16px 52px 36px', gap:10 }}>
        <div style={{ opacity:fi(frame,3,12) }}>
          <ProblemTag text="Generic revision guides don't know YOUR exam or gaps" />
        </div>

        <div style={{ opacity:fi(frame,14,14) }}>
          <div style={{ fontSize:24, fontWeight:700, color:C.amber, letterSpacing:3, textTransform:'uppercase', marginBottom:2 }}>Predicted Mock Paper</div>
          <div style={{ fontSize:21, color:C.muted }}>
            Built from <span style={{ color:C.amberDim, fontWeight:600 }}>10 years</span> of real AQA past papers · tailored to your gaps
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {PAPER_QS.map((q, i) => {
            const delay = 30 + i * 18
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)',
                borderRadius:16, padding:'12px 20px',
                opacity:fi(frame, delay, 14), transform:`translateX(${sl(frame, delay, 14)}px)`,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(139,92,246,.15)', border:'1px solid rgba(139,92,246,.3)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#a78bfa' }}>{q.n}</div>
                  <div>
                    <div style={{ fontSize:21, color:C.white, fontWeight:600 }}>{q.topic}</div>
                    <div style={{ fontSize:15, color:'#ef4444', marginTop:1 }}>⚠ Gap identified</div>
                  </div>
                </div>
                <div style={{ background:'rgba(245,158,11,.12)', color:C.amber, fontSize:18, fontWeight:600, padding:'4px 12px', borderRadius:8 }}>{q.marks} marks</div>
              </div>
            )
          })}
        </div>

        <div style={{ opacity:fi(frame,148,14) }}>
          <TeacherTag text="— assign predicted papers to your whole class in one click" />
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════════
// SCENE 7 — Progress & Stats (with dashboard screenshot as bg)
// ════════════════════════════════════════════════════════════════════
const STATS = [
  { label:'Predicted Grade',  before:'C',      after:'A*',    color:'#fbbf24' },
  { label:'Study Streak',     value:'12 days',               color:'#f97316' },
  { label:'Topics Mastered',  value:'24 / 28',               color:'#22c55e' },
  { label:'Marks Recovered',  value:'+34 pts',               color:'#60a5fa' },
]

function SceneStats() {
  const frame = useCurrentFrame()
  const bgOp  = fi(frame, 0, 30)

  return (
    <AbsoluteFill style={{ fontFamily:FONT }}>
      {/* Live dashboard video as darkened background */}
      <div style={{ position:'absolute', inset:0, opacity: bgOp * 0.18, overflow:'hidden' }}>
        <Video src={staticFile('videos/dashboard.mp4')} style={{ width:'100%', filter:'blur(3px)' }} loop />
      </div>
      {/* Dark overlay */}
      <div style={{ position:'absolute', inset:0, background:'rgba(6,11,22,0.88)' }} />

      <div style={{ position:'relative', display:'flex', flexDirection:'column', padding:'58px 52px 54px' }}>

        <div style={{ opacity:fi(frame,3,12), marginBottom:14 }}>
          <ProblemTag text="Without data, students can't tell if they're actually improving" />
        </div>

        <div style={{ fontSize:24, fontWeight:700, color:C.amber, letterSpacing:3, textTransform:'uppercase', textAlign:'center', marginBottom:22, opacity:fi(frame,18,14) }}>
          Real Progress. Real Data.
        </div>

        {STATS.map((s,i) => {
          const delay = 20+i*18
          return (
            <div key={s.label} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
              backdropFilter:'blur(8px)',
              borderRadius:24, padding:'24px 36px', marginBottom:14,
              opacity:fi(frame,delay,14), transform:`translateX(${sl(frame,delay,14)}px)`,
            }}>
              <span style={{ fontSize:28, color:C.muted }}>{s.label}</span>
              {'before' in s ? (
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <span style={{ fontSize:34, color:'#374151', textDecoration:'line-through' }}>{s.before}</span>
                  <span style={{ fontSize:58, fontWeight:800, color:s.color }}>{s.after}</span>
                </div>
              ) : (
                <span style={{ fontSize:58, fontWeight:800, color:s.color }}>{s.value}</span>
              )}
            </div>
          )
        })}

        <div style={{ marginTop:14, opacity:fi(frame,145,14), transform:`translateY(${su(frame,145,14)}px)` }}>
          <TeacherTag text="— class-wide analytics live after every session" />
        </div>
        <div style={{ marginTop:10, opacity:fi(frame,165,14) }}>
          <SolveTag text="Every mark gained is tracked — you know exactly what's working" />
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════════
// SCENE 8 — Dual CTA
// ════════════════════════════════════════════════════════════════════
function SceneCTA() {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:38, padding:'0 66px', fontFamily:FONT }}>
      <div style={{ opacity:fi(frame,5,18), transform:`scale(${sc(frame,5,18)})` }}>
        <SpokAvatar size={165} pulse />
      </div>
      <div style={{ textAlign:'center', opacity:fi(frame,25,18), transform:`translateY(${su(frame,25,18)}px)` }}>
        <div style={{ fontSize:78, fontWeight:900, color:C.white, lineHeight:1.1, marginBottom:18 }}>
          Know exactly<br/>what to revise.
        </div>
        <div style={{ fontSize:31, color:C.muted, lineHeight:1.65, opacity:fi(frame,48,16) }}>
          SPOK maps your knowledge, finds the gaps,<br/>
          teaches to your exact mistake, and closes it<br/>
          — before your exam.
        </div>
      </div>
      <div style={{ width:'100%', opacity:fi(frame,70,18), transform:`scale(${sc(frame,70,18)})` }}>
        <div style={{ background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow:'0 0 70px rgba(59,130,246,.45)',
          borderRadius:24, padding:'30px 0', textAlign:'center', fontSize:38, fontWeight:800, color:C.white }}>
          🎓 Start free as a student → studiq.org
        </div>
      </div>
      <div style={{ width:'100%', opacity:fi(frame,95,18), transform:`scale(${sc(frame,95,18)})` }}>
        <div style={{ background:'rgba(59,130,246,.07)', border:'2px solid rgba(59,130,246,.36)',
          borderRadius:24, padding:'26px 0', textAlign:'center', fontSize:34, fontWeight:700, color:'#93c5fd' }}>
          👩‍🏫 Set up your class → studiq.org/teachers
        </div>
      </div>
      <div style={{ fontSize:24, color:'#374151', textAlign:'center', opacity:fi(frame,118,16) }}>
        AQA · Edexcel · OCR · No credit card needed
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════════
// SCENE 9 — Outro / Brand close
// ════════════════════════════════════════════════════════════════════
function SceneOutro() {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:30, fontFamily:FONT }}>
      <div style={{ opacity:fi(frame,3,20), transform:`scale(${sc(frame,3,20)})` }}>
        <SpokAvatar size={140} pulse />
      </div>
      <div style={{ opacity:fi(frame,28,18), transform:`translateY(${su(frame,28,18)}px)`, textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, justifyContent:'center', marginBottom:14 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', fontSize:20, fontWeight:700, color:'#fff' }}>S</div>
          <span style={{ fontSize:58, fontWeight:800, color:C.white, letterSpacing:2 }}>StudiQ</span>
        </div>
        <div style={{ fontSize:32, color:C.muted, opacity:fi(frame,52,16) }}>Know exactly what to revise.</div>
      </div>
      <div style={{ opacity:fi(frame,72,18), transform:`scale(${sc(frame,72,18)})` }}>
        <div style={{
          background:'rgba(245,158,11,.12)', border:'1px solid rgba(245,158,11,.35)',
          borderRadius:20, padding:'18px 52px',
          fontSize:42, fontWeight:800, color:C.amber, letterSpacing:1,
          boxShadow:'0 0 60px rgba(245,158,11,.22)',
        }}>studiq.org</div>
      </div>
    </AbsoluteFill>
  )
}

// ── Main composition ───────────────────────────────────────────────────────────
export const StudiQReel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT }}>
    <Background />

    {/* Background music — cinematic ambient, low volume */}
    <Audio src={staticFile('music.mp3')} volume={0.13} />
    {/* Voiceover */}
    <Audio src={staticFile('voiceover.mp3')} />

    {/* Synced captions — appear at bottom throughout */}
    <CaptionOverlay />

    {/* Light leak cinematic flashes at key scene transitions */}
    {/* PROBLEM→BRAIN (wipe, ~f550) — warm amber reveal */}
    <Sequence from={550}><LightLeak durationInFrames={36} seed={1} hueShift={30} /></Sequence>
    {/* BRAIN→CHAT (slide, ~f1208) — cool blue energy */}
    <Sequence from={1208}><LightLeak durationInFrames={36} seed={4} hueShift={200} /></Sequence>
    {/* STATS→CTA (wipe, ~f2350) — golden pump before CTA */}
    <Sequence from={2350}><LightLeak durationInFrames={40} seed={7} hueShift={45} /></Sequence>
    {/* CTA→OUTRO (fade, ~f2568) — soft outro glow */}
    <Sequence from={2568}><LightLeak durationInFrames={32} seed={2} hueShift={30} /></Sequence>

    {/* Scene transitions via TransitionSeries */}
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={D.INTRO}>
        <SceneIntro />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={fade()} />

      <TransitionSeries.Sequence durationInFrames={D.PROBLEM}>
        <SceneProblem />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition timing={springTiming({ durationInFrames: TR, config: { damping: 200 } })} presentation={wipe({ direction: 'from-left' })} />

      <TransitionSeries.Sequence durationInFrames={D.BRAIN}>
        <SceneBrainMap />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={slide({ direction: 'from-left' })} />

      <TransitionSeries.Sequence durationInFrames={D.CHAT}>
        <SceneChat />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={wipe({ direction: 'from-right' })} />

      <TransitionSeries.Sequence durationInFrames={D.PRACTICE}>
        <ScenePractice />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={slide({ direction: 'from-right' })} />

      <TransitionSeries.Sequence durationInFrames={D.PAPERS}>
        <ScenePapers />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={fade()} />

      <TransitionSeries.Sequence durationInFrames={D.STATS}>
        <SceneStats />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition timing={springTiming({ durationInFrames: TR, config: { damping: 200 } })} presentation={wipe({ direction: 'from-bottom' })} />

      <TransitionSeries.Sequence durationInFrames={D.CTA}>
        <SceneCTA />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TR })} presentation={fade()} />

      <TransitionSeries.Sequence durationInFrames={D.OUTRO}>
        <SceneOutro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
)
