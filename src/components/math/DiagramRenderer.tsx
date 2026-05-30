'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { describeDiagram } from '@/lib/diagram-description'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiagramElement =
  | { kind: 'circle'; cx: number; cy: number; r: number; color?: string; label?: string; dashed?: boolean }
  | { kind: 'point'; x: number; y: number; label?: string; color?: string; draggable?: boolean }
  | { kind: 'vector'; x1: number; y1: number; x2: number; y2: number; label?: string; color?: string; dashed?: boolean }
  | { kind: 'segment'; x1: number; y1: number; x2: number; y2: number; label?: string; color?: string; dashed?: boolean }
  | { kind: 'north'; x: number; y: number; len?: number }
  | { kind: 'arc'; cx: number; cy: number; r: number; fromAngle: number; toAngle: number; label?: string; color?: string }
  | { kind: 'rightangle'; x: number; y: number; angle: number; size?: number }
  | { kind: 'label'; x: number; y: number; text: string; color?: string; anchor?: 'start' | 'middle' | 'end' }

export interface DiagramSpec {
  title?: string
  elements: DiagramElement[]
  xDomain?: [number, number]
  yDomain?: [number, number]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const W = 480
const H = 320
const MARGIN = { top: 32, right: 28, bottom: 28, left: 28 }
const INNER_W = W - MARGIN.left - MARGIN.right
const INNER_H = H - MARGIN.top - MARGIN.bottom
const FONT = "'Inter', system-ui, sans-serif"

// ─── Coordinate helpers ───────────────────────────────────────────────────────

function makeCoords(xDomain: [number, number], yDomain: [number, number]) {
  const [xMin, xMax] = xDomain
  const [yMin, yMax] = yDomain

  /** Math x → SVG x */
  const mx = (x: number) => MARGIN.left + ((x - xMin) / (xMax - xMin)) * INNER_W
  /** Math y → SVG y (y-axis flipped) */
  const my = (y: number) => MARGIN.top + ((yMax - y) / (yMax - yMin)) * INNER_H
  /** Math length → SVG length (x-axis scale) */
  const mLen = (len: number) => (Math.abs(len) / (xMax - xMin)) * INNER_W

  return { mx, my, mLen, xMin, xMax, yMin, yMax }
}

// ─── Arrowhead marker ID ──────────────────────────────────────────────────────

function markerId(color: string) {
  return `arr-${color.replace(/[^a-zA-Z0-9]/g, '')}`
}

// ─── Perpendicular offset for label midpoint ──────────────────────────────────

function perpOffset(x1: number, y1: number, x2: number, y2: number, dist: number): [number, number] {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return [(-dy / len) * dist, (dx / len) * dist]
}

// ─── Label pill helper ────────────────────────────────────────────────────────
// Returns rect + text props for a centered label pill at (cx, cy).
function LabelPill({
  cx, cy, text, color, fontSize = 12,
}: { cx: number; cy: number; text: string; color: string; fontSize?: number }) {
  const charW = fontSize * 0.62
  const pw = text.length * charW + 12
  const ph = fontSize + 6
  return (
    <>
      <rect
        x={cx - pw / 2}
        y={cy - ph / 2}
        width={pw}
        height={ph}
        rx={ph / 2}
        fill="rgba(8,13,28,0.88)"
        stroke={`${color}44`}
        strokeWidth={0.8}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontFamily={FONT}
        fill={color}
        fontWeight={700}
      >
        {text}
      </text>
    </>
  )
}

// ─── Coordinate helpers ───────────────────────────────────────────────────────

interface Coords {
  mx: (x: number) => number
  my: (y: number) => number
  mLen: (len: number) => number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

interface RenderOptions {
  hoveredKey: string | null
  onElementClick?: (label: string, description: string) => void
}

// ─── SVG element renderers ────────────────────────────────────────────────────

function renderCircle(
  el: Extract<DiagramElement, { kind: 'circle' }>,
  c: Coords,
  key: number,
  opts: RenderOptions,
) {
  const cx = c.mx(el.cx)
  const cy = c.my(el.cy)
  const r = c.mLen(el.r)
  const color = el.color ?? '#3b82f6'
  const labelCY = cy - r - 12
  const hitKey = `circle-${key}`
  const isHovered = opts.hoveredKey === hitKey
  const isClickable = Boolean(el.label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`${color}0f`}
        stroke={color}
        strokeWidth={2}
        strokeDasharray={el.dashed ? '7 4' : undefined}
      />
      {el.label && (
        <LabelPill cx={cx} cy={labelCY} text={el.label} color={color} />
      )}
    </g>
  )
}

function renderPoint(
  el: Extract<DiagramElement, { kind: 'point' }>,
  c: Coords,
  key: number,
  opts: RenderOptions,
  overridePos?: { x: number; y: number },
) {
  const px = c.mx(overridePos?.x ?? el.x)
  const py = c.my(overridePos?.y ?? el.y)
  const color = el.color ?? '#1e40af'
  const hitKey = `point-${key}`
  const isHovered = opts.hoveredKey === hitKey

  const svgCx = c.mx((c.xMin + c.xMax) / 2)
  const svgCy = c.my((c.yMin + c.yMax) / 2)
  const dx = px - svgCx
  const dy = py - svgCy
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = dx / dist
  const ny = dy / dist

  const OFFSET = 16
  let labelCX = px + nx * OFFSET
  let labelCY = py + ny * OFFSET
  if (dist < 5) { labelCX = px + 11; labelCY = py - 11 }

  const label = el.label ?? ''
  const isClickable = Boolean(label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      {/* outer ring */}
      <circle cx={px} cy={py} r={8} fill={`${color}18`} />
      <circle cx={px} cy={py} r={5} fill={color} />
      {el.draggable && (
        <g style={{ pointerEvents: 'none' }}>
          {([-3, 3] as number[]).flatMap(ox =>
            ([-3, 3] as number[]).map((oy, di) => (
              <circle key={`${ox}-${di}`} cx={px + 11 + ox} cy={py + oy} r={1.2} fill="rgba(245,158,11,0.7)" />
            ))
          )}
        </g>
      )}
      {label && (
        <LabelPill cx={labelCX} cy={labelCY} text={label} color={color} />
      )}
    </g>
  )
}

function renderVector(
  el: Extract<DiagramElement, { kind: 'vector' }>,
  c: Coords,
  key: number,
  opts: RenderOptions,
  overrideCoords?: { x1: number; y1: number; x2: number; y2: number },
) {
  const x1 = c.mx(overrideCoords?.x1 ?? el.x1)
  const y1 = c.my(overrideCoords?.y1 ?? el.y1)
  const x2 = c.mx(overrideCoords?.x2 ?? el.x2)
  const y2 = c.my(overrideCoords?.y2 ?? el.y2)
  const color = el.color ?? '#3b82f6'
  const mid = markerId(color)

  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ex = x2 - (dx / len) * 9
  const ey = y2 - (dy / len) * 9

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const [ox, oy] = perpOffset(x1, y1, x2, y2, 15)

  const hitKey = `vector-${key}`
  const isHovered = opts.hoveredKey === hitKey
  const isClickable = Boolean(el.label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      <line
        x1={x1} y1={y1} x2={ex} y2={ey}
        stroke={color}
        strokeWidth={2.4}
        strokeDasharray={el.dashed ? '7 4' : undefined}
        markerEnd={`url(#${mid})`}
        strokeLinecap="round"
      />
      {el.label && (
        <LabelPill cx={midX + ox} cy={midY + oy} text={el.label} color={color} />
      )}
    </g>
  )
}

function renderSegment(
  el: Extract<DiagramElement, { kind: 'segment' }>,
  c: Coords,
  key: number,
  opts: RenderOptions,
  overrideCoords?: { x1: number; y1: number; x2: number; y2: number },
) {
  const x1 = c.mx(overrideCoords?.x1 ?? el.x1)
  const y1 = c.my(overrideCoords?.y1 ?? el.y1)
  const x2 = c.mx(overrideCoords?.x2 ?? el.x2)
  const y2 = c.my(overrideCoords?.y2 ?? el.y2)
  const color = el.color ?? '#4ade80'

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const [ox, oy] = perpOffset(x1, y1, x2, y2, 15)

  const hitKey = `segment-${key}`
  const isHovered = opts.hoveredKey === hitKey
  const isClickable = Boolean(el.label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={2.2}
        strokeDasharray={el.dashed ? '7 4' : undefined}
        strokeLinecap="round"
      />
      {el.label && (
        <LabelPill cx={midX + ox} cy={midY + oy} text={el.label} color={color} />
      )}
    </g>
  )
}

function renderNorth(
  el: Extract<DiagramElement, { kind: 'north' }>,
  c: Coords,
  key: number,
) {
  const bx = c.mx(el.x)
  const by = c.my(el.y)
  const len = c.mLen(el.len ?? 2.5)
  const color = 'rgba(30,64,120,0.8)'
  const mid = markerId('north-white')

  const tipX = bx
  const tipY = by - len
  const shaftEndY = tipY + 9

  return (
    <g key={key}>
      <line
        x1={bx} y1={by} x2={tipX} y2={shaftEndY}
        stroke={color}
        strokeWidth={1.8}
        markerEnd={`url(#${mid})`}
      />
      <text
        x={tipX} y={tipY - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontFamily={FONT}
        fill={color}
        fontWeight={700}
      >
        N
      </text>
    </g>
  )
}

function renderArc(
  el: Extract<DiagramElement, { kind: 'arc' }>,
  c: Coords,
  key: number,
  opts: RenderOptions,
) {
  const svgCx = c.mx(el.cx)
  const svgCy = c.my(el.cy)
  const svgR = c.mLen(el.r)
  const color = el.color ?? '#fbbf24'

  const svgAngleRad = (mathDeg: number) => (-mathDeg * Math.PI) / 180

  const p1x = svgCx + svgR * Math.cos(svgAngleRad(el.fromAngle))
  const p1y = svgCy + svgR * Math.sin(svgAngleRad(el.fromAngle))
  const p2x = svgCx + svgR * Math.cos(svgAngleRad(el.toAngle))
  const p2y = svgCy + svgR * Math.sin(svgAngleRad(el.toAngle))

  const span = ((el.fromAngle - el.toAngle) % 360 + 360) % 360
  const largeArcFlag = span > 180 ? 1 : 0
  const d = `M ${p1x} ${p1y} A ${svgR} ${svgR} 0 ${largeArcFlag} 0 ${p2x} ${p2y}`

  const midMathAngle = el.fromAngle - span / 2
  const midSvgAngle = svgAngleRad(midMathAngle)
  const labelDist = svgR + 16
  const labelCX = svgCx + labelDist * Math.cos(midSvgAngle)
  const labelCY = svgCy + labelDist * Math.sin(midSvgAngle)

  const hitKey = `arc-${key}`
  const isHovered = opts.hoveredKey === hitKey
  const isClickable = Boolean(el.label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {el.label && (
        <LabelPill cx={labelCX} cy={labelCY} text={el.label} color={color} />
      )}
    </g>
  )
}

function renderRightAngle(
  el: Extract<DiagramElement, { kind: 'rightangle' }>,
  c: Coords,
  key: number,
) {
  const px = c.mx(el.x)
  const py = c.my(el.y)
  const size = c.mLen(el.size ?? 0.4)
  const color = 'rgba(40,80,120,0.65)'

  const a1 = (-el.angle * Math.PI) / 180
  const a2 = (-(el.angle + 90) * Math.PI) / 180

  const ax = px + size * Math.cos(a1)
  const ay = py + size * Math.sin(a1)
  const bx = px + size * Math.cos(a2)
  const by = py + size * Math.sin(a2)
  const cornerX = ax + size * Math.cos(a2)
  const cornerY = ay + size * Math.sin(a2)

  const d = `M ${ax} ${ay} L ${cornerX} ${cornerY} L ${bx} ${by}`

  return (
    <path key={key} d={d} fill="none" stroke={color} strokeWidth={1.5} />
  )
}

function renderLabel(
  el: Extract<DiagramElement, { kind: 'label' }>,
  c: Coords,
  key: number,
) {
  const lx = c.mx(el.x)
  const ly = c.my(el.y)
  const color = el.color ?? 'rgba(255,255,255,0.9)'
  const anchor = el.anchor ?? 'middle'

  return (
    <text
      key={key}
      x={lx}
      y={ly}
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={12}
      fontFamily={FONT}
      fill={color}
      fontWeight={500}
    >
      {el.text}
    </text>
  )
}

// ─── Grid & axes ──────────────────────────────────────────────────────────────

function renderGrid(c: Coords) {
  const lines: React.ReactElement[] = []
  const { xMin, xMax, yMin, yMax } = c

  // Minor grid lines at 0.5-unit intervals (only when zoomed in enough)
  const pixelPerUnit = INNER_W / (xMax - xMin)
  if (pixelPerUnit > 12) {
    for (let x2 = Math.ceil(xMin * 2) / 2; x2 <= Math.floor(xMax * 2) / 2; x2 += 0.5) {
      if (Number.isInteger(x2)) continue
      lines.push(
        <line key={`gxm${x2}`}
          x1={c.mx(x2)} y1={MARGIN.top}
          x2={c.mx(x2)} y2={MARGIN.top + INNER_H}
          stroke="rgba(173,210,230,0.4)" strokeWidth={0.4}
        />,
      )
    }
    for (let y2 = Math.ceil(yMin * 2) / 2; y2 <= Math.floor(yMax * 2) / 2; y2 += 0.5) {
      if (Number.isInteger(y2)) continue
      lines.push(
        <line key={`gym${y2}`}
          x1={MARGIN.left} y1={c.my(y2)}
          x2={MARGIN.left + INNER_W} y2={c.my(y2)}
          stroke="rgba(173,210,230,0.4)" strokeWidth={0.4}
        />,
      )
    }
  }

  // Major grid lines at 1-unit intervals
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    lines.push(
      <line key={`gx${x}`}
        x1={c.mx(x)} y1={MARGIN.top}
        x2={c.mx(x)} y2={MARGIN.top + INNER_H}
        stroke="rgba(150,195,220,0.55)" strokeWidth={0.7}
      />,
    )
  }
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    lines.push(
      <line key={`gy${y}`}
        x1={MARGIN.left} y1={c.my(y)}
        x2={MARGIN.left + INNER_W} y2={c.my(y)}
        stroke="rgba(150,195,220,0.55)" strokeWidth={0.7}
      />,
    )
  }

  // Axes — darker so they read as the zero lines
  if (yMin <= 0 && yMax >= 0) {
    lines.push(
      <line key="xaxis"
        x1={MARGIN.left} y1={c.my(0)}
        x2={MARGIN.left + INNER_W} y2={c.my(0)}
        stroke="rgba(40,80,120,0.6)" strokeWidth={1.5}
      />,
    )
  }
  if (xMin <= 0 && xMax >= 0) {
    lines.push(
      <line key="yaxis"
        x1={c.mx(0)} y1={MARGIN.top}
        x2={c.mx(0)} y2={MARGIN.top + INNER_H}
        stroke="rgba(40,80,120,0.6)" strokeWidth={1.5}
      />,
    )
  }

  return lines
}

// ─── Defs ─────────────────────────────────────────────────────────────────────

function renderDefs(elements: DiagramElement[]) {
  const arrowColors = new Set<string>()

  for (const el of elements) {
    if (el.kind === 'vector') arrowColors.add(el.color ?? '#3b82f6')
    if (el.kind === 'north') arrowColors.add('rgba(255,255,255,0.75)')
  }

  if (elements.some(el => el.kind === 'north')) {
    arrowColors.add('rgba(255,255,255,0.75)')
  }

  const markers = Array.from(arrowColors).map(color => {
    const id = markerId(color === 'rgba(255,255,255,0.75)' ? 'north-white' : color)
    return (
      <marker
        key={id}
        id={id}
        markerWidth={10}
        markerHeight={10}
        refX={8}
        refY={4}
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path d="M0,0 L0,8 L10,4 z" fill={color} />
      </marker>
    )
  })

  return (
    <defs>
      {markers}
      <filter id="amber-glow" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f59e0b" floodOpacity="0.95" />
      </filter>
      <filter id="line-glow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#60a5fa" floodOpacity="0.4" />
      </filter>
    </defs>
  )
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipState {
  svgX: number
  svgY: number
  lines: string[]
}

// ─── Whiteboard Canvas ────────────────────────────────────────────────────────

type WhiteboardTool = 'pen' | 'eraser'

function WhiteboardCanvas({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const [tool, setTool] = useState<WhiteboardTool>('pen')

  const getCtxPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * width,
      y: ((e.clientY - rect.top) / rect.height) * height,
    }
  }, [width, height])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d')
    const pt = getCtxPoint(e)
    if (!ctx || !pt) return
    isDrawing.current = true
    ctx.beginPath()
    ctx.moveTo(pt.x, pt.y)
    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2.5
    } else {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 18
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [tool, getCtxPoint])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    const pt = getCtxPoint(e)
    if (!ctx || !pt) return
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
  }, [getCtxPoint])

  const onPointerUp = useCallback(() => {
    isDrawing.current = false
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) ctx.globalCompositeOperation = 'source-over'
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const btnBase: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 6, fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair', background: 'transparent' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
      <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 5, zIndex: 11 }}>
        {([
          { t: 'pen' as WhiteboardTool, icon: '✏' },
          { t: 'eraser' as WhiteboardTool, icon: '◻' },
        ] as const).map(({ t, icon }) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            title={t}
            style={{
              ...btnBase,
              background: tool === t ? 'rgba(245,158,11,0.15)' : 'rgba(40,80,120,0.07)',
              border: `1px solid ${tool === t ? 'rgba(245,158,11,0.45)' : 'rgba(40,80,120,0.2)'}`,
              color: tool === t ? '#b45309' : 'rgba(40,80,120,0.6)',
            }}>
            {icon}
          </button>
        ))}
        <button
          onClick={clearCanvas}
          title="Clear"
          style={{
            ...btnBase,
            background: 'rgba(40,80,120,0.07)',
            border: '1px solid rgba(40,80,120,0.2)',
            color: 'rgba(40,80,120,0.6)',
          }}>
          ✕
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DiagramRendererProps {
  spec: DiagramSpec
  className?: string
  onElementClick?: (label: string, description: string) => void
}

export function DiagramRenderer({ spec, className, onElementClick }: DiagramRendererProps): React.JSX.Element {
  const xDomain: [number, number] = spec.xDomain ?? [-8, 8]
  const yDomain: [number, number] = spec.yDomain ?? [-8, 8]
  const c = makeCoords(xDomain, yDomain)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [whiteboardActive, setWhiteboardActive] = useState(false)
  const [draggedPositions, setDraggedPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null)
  const [dragTooltip, setDragTooltip] = useState<{ label: string; x: number; y: number } | null>(null)
  const activeDragRef = useRef<{ label: string; origX: number; origY: number } | null>(null)

  const svgToMath = useCallback((svgX: number, svgY: number) => {
    const [xMin, xMax] = xDomain
    const [yMin, yMax] = yDomain
    const mathX = xMin + ((svgX - MARGIN.left) / INNER_W) * (xMax - xMin)
    const mathY = yMax - ((svgY - MARGIN.top) / INNER_H) * (yMax - yMin)
    return { mathX, mathY }
  }, [xDomain, yDomain])

  const clientToViewBox = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const svgX = ((clientX - rect.left) / rect.width) * W
    const svgY = ((clientY - rect.top) / rect.height) * H
    const unzoomedX = (svgX - pan.x) / zoom
    const unzoomedY = (svgY - pan.y) / zoom
    return { svgX: unzoomedX, svgY: unzoomedY }
  }, [zoom, pan])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.85 : 1.18
    setZoom(z => Math.max(0.4, Math.min(6, z * delta)))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
  }, [pan])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy })
  }, [])

  const onMouseUp = useCallback(() => { dragRef.current = null }, [])
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const handleDragPointMove = useCallback((e: MouseEvent) => {
    const active = activeDragRef.current
    if (!active) return
    const vb = clientToViewBox(e.clientX, e.clientY)
    if (!vb) return
    const { mathX, mathY } = svgToMath(vb.svgX, vb.svgY)
    setDraggedPositions(prev => ({ ...prev, [active.label]: { x: mathX, y: mathY } }))
    setDragTooltip({ label: active.label, x: mathX, y: mathY })
  }, [clientToViewBox, svgToMath])

  const handleDragPointUp = useCallback(() => {
    activeDragRef.current = null
    setDraggingLabel(null)
    setDragTooltip(null)
    window.removeEventListener('mousemove', handleDragPointMove)
    window.removeEventListener('mouseup', handleDragPointUp)
  }, [handleDragPointMove])

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleDragPointMove)
      window.removeEventListener('mouseup', handleDragPointUp)
    }
  }, [handleDragPointMove, handleDragPointUp])

  const opts: RenderOptions = { hoveredKey, onElementClick }

  const getEndpointOverride = useCallback((el: Extract<DiagramElement, { kind: 'segment' | 'vector' }>) => {
    let x1 = el.x1, y1 = el.y1, x2 = el.x2, y2 = el.y2
    let changed = false
    for (const [label, pos] of Object.entries(draggedPositions)) {
      const origEl = spec.elements.find(
        e => e.kind === 'point' && e.label === label
      ) as Extract<DiagramElement, { kind: 'point' }> | undefined
      if (!origEl) continue
      if (origEl.x === el.x1 && origEl.y === el.y1) { x1 = pos.x; y1 = pos.y; changed = true }
      if (origEl.x === el.x2 && origEl.y === el.y2) { x2 = pos.x; y2 = pos.y; changed = true }
    }
    return changed ? { x1, y1, x2, y2 } : undefined
  }, [draggedPositions, spec.elements])

  const transform = `translate(${pan.x}, ${pan.y}) scale(${zoom})`
  const isDraggingAPoint = draggingLabel !== null

  const btnCtrl: React.CSSProperties = {
    width: 26, height: 26, borderRadius: 6, fontSize: 13, lineHeight: 1,
    background: 'rgba(40,80,120,0.07)',
    border: '1px solid rgba(40,80,120,0.2)',
    color: 'rgba(40,80,120,0.65)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div className={className}>
      {spec.title && (
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          color: '#b45309', textTransform: 'uppercase',
          marginBottom: 8, fontFamily: FONT,
        }}>
          {spec.title}
        </p>
      )}

      <div style={{ position: 'relative' }}>
        {!whiteboardActive && (
          <button
            onClick={() => setWhiteboardActive(true)}
            title="Open whiteboard"
            style={{
              ...btnCtrl,
              position: 'absolute', bottom: 10, left: 12, zIndex: 5, fontSize: 14,
            }}>
            📝
          </button>
        )}

        {whiteboardActive && (
          <button
            onClick={() => setWhiteboardActive(false)}
            title="Close whiteboard"
            style={{
              position: 'absolute', top: 10, right: 12, zIndex: 15,
              padding: '3px 10px', borderRadius: 6, fontSize: 11,
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.4)',
              color: '#b45309', cursor: 'pointer', fontFamily: FONT,
            }}>
            Done
          </button>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          style={{
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 14,
            border: '1px solid rgba(173,210,230,0.65)',
            boxShadow: '0 2px 16px rgba(40,80,120,0.1)',
            display: 'block',
            cursor: isDraggingAPoint ? 'none' : dragRef.current ? 'grabbing' : whiteboardActive ? 'none' : 'grab',
            userSelect: 'none',
            pointerEvents: whiteboardActive ? 'none' : 'auto',
          }}
          aria-label={describeDiagram(spec)}
          role="img"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { onMouseUp(); setTooltip(null) }}
        >
          {renderDefs(spec.elements)}

          <g transform={transform}>
            {renderGrid(c)}

            {spec.elements.map((el, i) => {
              switch (el.kind) {
                case 'circle':
                  return renderCircle(el, c, i, opts)
                case 'point': {
                  const overridePos = el.label ? draggedPositions[el.label] : undefined
                  return renderPoint(el, c, i, opts, overridePos)
                }
                case 'vector': {
                  const ov = getEndpointOverride(el)
                  return renderVector(el, c, i, opts, ov)
                }
                case 'segment': {
                  const ov = getEndpointOverride(el)
                  return renderSegment(el, c, i, opts, ov)
                }
                case 'north':      return renderNorth(el, c, i)
                case 'arc':        return renderArc(el, c, i, opts)
                case 'rightangle': return renderRightAngle(el, c, i)
                case 'label':      return renderLabel(el, c, i)
                default:           return null
              }
            })}

            {/* Hit areas */}
            {spec.elements.map((el, i) => {
              if (el.kind === 'point') {
                const hitKey = `point-${i}`
                const overridePos = el.label ? draggedPositions[el.label] : undefined
                const px = c.mx(overridePos?.x ?? el.x)
                const py = c.my(overridePos?.y ?? el.y)
                const isDraggable = el.draggable === true
                const isClickable = Boolean(el.label && onElementClick)
                if (!el.label && !isDraggable) return null
                return (
                  <circle
                    key={`hit-${i}`}
                    cx={px} cy={py}
                    r={isDraggable ? 18 : 16}
                    fill="transparent"
                    style={{ cursor: isDraggable ? 'grab' : isClickable ? 'pointer' : 'crosshair' }}
                    onMouseEnter={() => {
                      setTooltip({ svgX: px, svgY: py, lines: [el.label ?? '', `(${el.x}, ${el.y})`].filter(Boolean) })
                      if (isClickable || isDraggable) setHoveredKey(hitKey)
                    }}
                    onMouseLeave={() => { setTooltip(null); setHoveredKey(null) }}
                    onMouseDown={isDraggable && el.label ? (e) => {
                      e.stopPropagation()
                      activeDragRef.current = { label: el.label!, origX: el.x, origY: el.y }
                      setDraggingLabel(el.label!)
                      window.addEventListener('mousemove', handleDragPointMove)
                      window.addEventListener('mouseup', handleDragPointUp)
                    } : undefined}
                    onClick={isClickable && !isDraggingAPoint && el.label ? () => {
                      const pos = draggedPositions[el.label!]
                      const descX = pos ? pos.x.toFixed(2) : String(el.x)
                      const descY = pos ? pos.y.toFixed(2) : String(el.y)
                      onElementClick!(el.label!, `point ${el.label} at (${descX}, ${descY})`)
                    } : undefined}
                  />
                )
              }

              if (el.kind === 'circle' && el.label && onElementClick) {
                const hitKey = `circle-${i}`
                const svgCx = c.mx(el.cx)
                const svgCy = c.my(el.cy)
                const svgR = c.mLen(el.r)
                return (
                  <circle
                    key={`hit-${i}`}
                    cx={svgCx} cy={svgCy}
                    r={svgR + 8}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredKey(hitKey)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => onElementClick(el.label ?? 'circle', `circle with centre (${el.cx}, ${el.cy}) and radius ${el.r}`)}
                  />
                )
              }

              if ((el.kind === 'segment' || el.kind === 'vector') && el.label && onElementClick) {
                const hitKey = `${el.kind}-${i}`
                const ov = getEndpointOverride(el)
                const x1s = c.mx(ov?.x1 ?? el.x1)
                const y1s = c.my(ov?.y1 ?? el.y1)
                const x2s = c.mx(ov?.x2 ?? el.x2)
                const y2s = c.my(ov?.y2 ?? el.y2)
                const midX = (x1s + x2s) / 2
                const midY = (y1s + y2s) / 2
                const description = el.kind === 'segment'
                  ? `line segment labelled '${el.label}'`
                  : `vector labelled '${el.label}'`
                return (
                  <rect
                    key={`hit-${i}`}
                    x={midX - 18} y={midY - 12}
                    width={36} height={24}
                    rx={5}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredKey(hitKey)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => onElementClick(el.label ?? el.kind, description)}
                  />
                )
              }

              if (el.kind === 'arc' && el.label && onElementClick) {
                const hitKey = `arc-${i}`
                const svgCx = c.mx(el.cx)
                const svgCy = c.my(el.cy)
                const span = ((el.fromAngle - el.toAngle) % 360 + 360) % 360
                const midMathAngle = el.fromAngle - span / 2
                const midSvgAngle = (-midMathAngle * Math.PI) / 180
                const labelDist = c.mLen(el.r) + 16
                const labelX = svgCx + labelDist * Math.cos(midSvgAngle)
                const labelY = svgCy + labelDist * Math.sin(midSvgAngle)
                return (
                  <circle
                    key={`hit-${i}`}
                    cx={labelX} cy={labelY}
                    r={14}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredKey(hitKey)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => onElementClick(el.label ?? 'angle', `angle of ${el.label} marked here`)}
                  />
                )
              }

              return null
            })}

            {/* Hover tooltip */}
            {tooltip && (() => {
              const lineH = 16
              const ttW = Math.max(...tooltip.lines.map(l => l.length)) * 7.5 + 20
              const ttH = tooltip.lines.length * lineH + 10
              const ttX = tooltip.svgX + 12
              const ttY = tooltip.svgY - ttH - 8
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={6}
                    fill="rgba(6,10,22,0.96)"
                    stroke="rgba(245,158,11,0.45)"
                    strokeWidth={1} />
                  {tooltip.lines.map((line, j) => (
                    <text key={j}
                      x={ttX + 10}
                      y={ttY + 9 + j * lineH}
                      dominantBaseline="central"
                      fontSize={j === 0 ? 12 : 11}
                      fontFamily={FONT}
                      fill={j === 0 ? '#fbbf24' : '#cbd5e1'}
                      fontWeight={j === 0 ? 700 : 400}>
                      {line}
                    </text>
                  ))}
                </g>
              )
            })()}

            {/* Drag tooltip */}
            {dragTooltip && (() => {
              const pos = draggedPositions[dragTooltip.label]
              if (!pos) return null
              const px = c.mx(pos.x)
              const py = c.my(pos.y)
              const text = `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`
              const ttW = text.length * 7 + 14
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={px + 10} y={py - 22} width={ttW} height={16} rx={4}
                    fill="rgba(245,158,11,0.92)" />
                  <text x={px + 10 + ttW / 2} y={py - 14}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={10}
                    fontFamily={FONT}
                    fill="#080d1c"
                    fontWeight={700}>
                    {text}
                  </text>
                </g>
              )
            })()}
          </g>
        </svg>

        {whiteboardActive && <WhiteboardCanvas width={W} height={H} />}

        {/* Zoom controls */}
        <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', gap: 5 }}>
          {[
            { label: '+', action: () => setZoom(z => Math.min(6, z * 1.3)) },
            { label: '−', action: () => setZoom(z => Math.max(0.4, z / 1.3)) },
            { label: '⊙', action: resetView },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} style={btnCtrl}>
              {label}
            </button>
          ))}
        </div>

        {/* Hint */}
        <p style={{
          position: 'absolute', bottom: 12,
          left: whiteboardActive ? 130 : 44,
          fontSize: 10, color: 'rgba(40,80,120,0.3)',
          pointerEvents: 'none', fontFamily: FONT,
        }}>
          {whiteboardActive ? 'draw mode' : 'scroll to zoom · drag to pan'}
        </p>
      </div>
    </div>
  )
}

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseDiagramSpec(raw: string): DiagramSpec | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('elements' in parsed) ||
      !Array.isArray((parsed as { elements: unknown }).elements)
    ) {
      return null
    }
    return parsed as DiagramSpec
  } catch {
    return null
  }
}
