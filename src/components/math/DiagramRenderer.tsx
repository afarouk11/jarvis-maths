'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

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

const W = 460
const H = 300
const MARGIN = { top: 28, right: 24, bottom: 24, left: 24 }
const INNER_W = W - MARGIN.left - MARGIN.right
const INNER_H = H - MARGIN.top - MARGIN.bottom

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
  // Strip # and non-alphanumeric so the ID is valid XML
  return `arr-${color.replace(/[^a-zA-Z0-9]/g, '')}`
}

// ─── Perpendicular offset for label midpoint ──────────────────────────────────

function perpOffset(x1: number, y1: number, x2: number, y2: number, dist: number): [number, number] {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  // Perpendicular is (-dy, dx) normalized
  return [(-dy / len) * dist, (dx / len) * dist]
}

// ─── SVG element renderers ────────────────────────────────────────────────────

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
  const labelY = cy - r - 8
  const hitKey = `circle-${key}`
  const isHovered = opts.hoveredKey === hitKey
  const isClickable = Boolean(el.label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`${color}0d`}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray={el.dashed ? '6 3' : undefined}
      />
      {el.label && (
        <>
          <rect
            x={cx - el.label.length * 3.5 - 3}
            y={labelY - 11}
            width={el.label.length * 7 + 6}
            height={14}
            rx={3}
            fill="rgba(8,13,28,0.8)"
          />
          <text
            x={cx}
            y={labelY}
            textAnchor="middle"
            fontSize={10}
            fontFamily="system-ui,sans-serif"
            fill={color}
            fontWeight={600}
          >
            {el.label}
          </text>
        </>
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
  const color = el.color ?? '#ffffff'
  const hitKey = `point-${key}`
  const isHovered = opts.hoveredKey === hitKey

  // Centre of diagram in SVG coords
  const svgCx = c.mx((c.xMin + c.xMax) / 2)
  const svgCy = c.my((c.yMin + c.yMax) / 2)

  // Direction away from diagram centre
  const dx = px - svgCx
  const dy = py - svgCy
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = dx / dist
  const ny = dy / dist

  const labelOffsetDist = 14
  let labelX = px + nx * labelOffsetDist
  let labelY = py + ny * labelOffsetDist

  // If point is near the diagram centre, place label above-right
  if (dist < 5) {
    labelX = px + 10
    labelY = py - 10
  }

  const label = el.label ?? ''
  const labelW = label.length * 6.5 + 8
  const isClickable = Boolean(label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      <circle cx={px} cy={py} r={4.5} fill={color} />
      {el.draggable && (
        /* 4-dot drag handle icon */
        <g style={{ pointerEvents: 'none' }}>
          {[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([ox, oy], di) => (
            <circle key={di} cx={px + 10 + (ox ?? 0)} cy={py + (oy ?? 0)} r={1} fill="rgba(245,158,11,0.6)" />
          ))}
        </g>
      )}
      {label && (
        <>
          <rect
            x={labelX - labelW / 2 - 2}
            y={labelY - 10}
            width={labelW}
            height={13}
            rx={3}
            fill="rgba(8,13,28,0.82)"
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            fontSize={10}
            fontFamily="system-ui,sans-serif"
            fill={color}
            fontWeight={700}
          >
            {label}
          </text>
        </>
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

  // Shorten end by 8px so arrowhead tip lands at (x2,y2)
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ex = x2 - (dx / len) * 8
  const ey = y2 - (dy / len) * 8

  // Label at midpoint, offset 10px perpendicular
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const [ox, oy] = perpOffset(x1, y1, x2, y2, 12)

  const hitKey = `vector-${key}`
  const isHovered = opts.hoveredKey === hitKey
  const isClickable = Boolean(el.label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      <line
        x1={x1}
        y1={y1}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray={el.dashed ? '6 3' : undefined}
        markerEnd={`url(#${mid})`}
      />
      {el.label && (
        <>
          <rect
            x={midX + ox - el.label.length * 3.5 - 3}
            y={midY + oy - 10}
            width={el.label.length * 7 + 6}
            height={13}
            rx={3}
            fill="rgba(8,13,28,0.82)"
          />
          <text
            x={midX + ox}
            y={midY + oy}
            textAnchor="middle"
            fontSize={10}
            fontFamily="system-ui,sans-serif"
            fill={color}
            fontWeight={600}
          >
            {el.label}
          </text>
        </>
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
  const [ox, oy] = perpOffset(x1, y1, x2, y2, 12)

  const hitKey = `segment-${key}`
  const isHovered = opts.hoveredKey === hitKey
  const isClickable = Boolean(el.label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray={el.dashed ? '6 3' : undefined}
      />
      {el.label && (
        <>
          <rect
            x={midX + ox - el.label.length * 3.5 - 3}
            y={midY + oy - 10}
            width={el.label.length * 7 + 6}
            height={13}
            rx={3}
            fill="rgba(8,13,28,0.82)"
          />
          <text
            x={midX + ox}
            y={midY + oy}
            textAnchor="middle"
            fontSize={10}
            fontFamily="system-ui,sans-serif"
            fill={color}
            fontWeight={600}
          >
            {el.label}
          </text>
        </>
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
  const color = 'rgba(255,255,255,0.7)'
  const mid = markerId('north-white')

  // Arrow goes straight up in SVG (negative y)
  const tipX = bx
  const tipY = by - len
  const shaftEndY = tipY + 8 // shorten for arrowhead

  return (
    <g key={key}>
      <line
        x1={bx}
        y1={by}
        x2={tipX}
        y2={shaftEndY}
        stroke={color}
        strokeWidth={1.5}
        markerEnd={`url(#${mid})`}
      />
      {/* "N" label above arrowhead */}
      <text
        x={tipX}
        y={tipY - 4}
        textAnchor="middle"
        fontSize={10}
        fontFamily="system-ui,sans-serif"
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

  // Math degrees → SVG angle (negate because y is flipped in SVG)
  const svgAngleRad = (mathDeg: number) => (-mathDeg * Math.PI) / 180

  const p1x = svgCx + svgR * Math.cos(svgAngleRad(el.fromAngle))
  const p1y = svgCy + svgR * Math.sin(svgAngleRad(el.fromAngle))
  const p2x = svgCx + svgR * Math.cos(svgAngleRad(el.toAngle))
  const p2y = svgCy + svgR * Math.sin(svgAngleRad(el.toAngle))

  // Clockwise span in math space = fromAngle - toAngle (mod 360)
  const span = ((el.fromAngle - el.toAngle) % 360 + 360) % 360
  const largeArcFlag = span > 180 ? 1 : 0
  // sweepFlag=0 because SVG y-axis is flipped → clockwise in math = anticlockwise in SVG
  const d = `M ${p1x} ${p1y} A ${svgR} ${svgR} 0 ${largeArcFlag} 0 ${p2x} ${p2y}`

  // Label at midpoint angle, offset outward
  const midMathAngle = el.fromAngle - span / 2
  const midSvgAngle = svgAngleRad(midMathAngle)
  const labelDist = svgR + 14
  const labelX = svgCx + labelDist * Math.cos(midSvgAngle)
  const labelY = svgCy + labelDist * Math.sin(midSvgAngle)

  const hitKey = `arc-${key}`
  const isHovered = opts.hoveredKey === hitKey
  const isClickable = Boolean(el.label && opts.onElementClick)

  return (
    <g key={key} filter={isHovered && isClickable ? 'url(#amber-glow)' : undefined}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      {el.label && (
        <>
          <rect
            x={labelX - el.label.length * 3.5 - 3}
            y={labelY - 10}
            width={el.label.length * 7 + 6}
            height={13}
            rx={3}
            fill="rgba(8,13,28,0.82)"
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            fontSize={10}
            fontFamily="system-ui,sans-serif"
            fill={color}
            fontWeight={600}
          >
            {el.label}
          </text>
        </>
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
  const size = c.mLen(el.size ?? 0.35)
  const color = 'rgba(255,255,255,0.7)'

  // angle is math degrees — convert to SVG radians (negate for y-flip)
  const a1 = (-el.angle * Math.PI) / 180
  const a2 = (-(el.angle + 90) * Math.PI) / 180

  // Two points along the two sides
  const ax = px + size * Math.cos(a1)
  const ay = py + size * Math.sin(a1)
  const bx = px + size * Math.cos(a2)
  const by = py + size * Math.sin(a2)

  // Corner of the square
  const cornerX = ax + size * Math.cos(a2)
  const cornerY = ay + size * Math.sin(a2)

  const d = `M ${ax} ${ay} L ${cornerX} ${cornerY} L ${bx} ${by}`

  return (
    <path
      key={key}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1.2}
    />
  )
}

function renderLabel(
  el: Extract<DiagramElement, { kind: 'label' }>,
  c: Coords,
  key: number,
) {
  const lx = c.mx(el.x)
  const ly = c.my(el.y)
  const color = el.color ?? 'rgba(255,255,255,0.85)'
  const anchor = el.anchor ?? 'middle'

  return (
    <text
      key={key}
      x={lx}
      y={ly}
      textAnchor={anchor}
      fontSize={10}
      fontFamily="system-ui,sans-serif"
      fill={color}
    >
      {el.text}
    </text>
  )
}

// ─── Grid & axes ──────────────────────────────────────────────────────────────

function renderGrid(c: Coords) {
  const lines: React.ReactElement[] = []
  const { xMin, xMax, yMin, yMax } = c

  // Vertical grid lines at each integer x
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    lines.push(
      <line
        key={`gx${x}`}
        x1={c.mx(x)}
        y1={MARGIN.top}
        x2={c.mx(x)}
        y2={MARGIN.top + INNER_H}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
      />,
    )
  }

  // Horizontal grid lines at each integer y
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    lines.push(
      <line
        key={`gy${y}`}
        x1={MARGIN.left}
        y1={c.my(y)}
        x2={MARGIN.left + INNER_W}
        y2={c.my(y)}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
      />,
    )
  }

  // x-axis (y=0) if in domain
  if (yMin <= 0 && yMax >= 0) {
    lines.push(
      <line
        key="xaxis"
        x1={MARGIN.left}
        y1={c.my(0)}
        x2={MARGIN.left + INNER_W}
        y2={c.my(0)}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
      />,
    )
  }

  // y-axis (x=0) if in domain
  if (xMin <= 0 && xMax >= 0) {
    lines.push(
      <line
        key="yaxis"
        x1={c.mx(0)}
        y1={MARGIN.top}
        x2={c.mx(0)}
        y2={MARGIN.top + INNER_H}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
      />,
    )
  }

  return lines
}

// ─── Defs (arrowhead markers + glow filter) ───────────────────────────────────

function renderDefs(elements: DiagramElement[]) {
  // Collect unique colors needed for arrowhead markers
  const arrowColors = new Set<string>()

  for (const el of elements) {
    if (el.kind === 'vector') {
      arrowColors.add(el.color ?? '#3b82f6')
    }
    if (el.kind === 'north') {
      arrowColors.add('rgba(255,255,255,0.7)')
    }
  }

  // Also ensure north white marker is always available if north elements exist
  const hasNorth = elements.some(el => el.kind === 'north')
  if (hasNorth) {
    arrowColors.add('rgba(255,255,255,0.7)')
  }

  const markers = Array.from(arrowColors).map(color => {
    const id = markerId(color === 'rgba(255,255,255,0.7)' ? 'north-white' : color)
    return (
      <marker
        key={id}
        id={id}
        markerWidth={8}
        markerHeight={8}
        refX={6}
        refY={3}
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path d="M0,0 L0,6 L8,3 z" fill={color} />
      </marker>
    )
  })

  return (
    <defs>
      {markers}
      <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.9" />
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

// ─── Whiteboard Canvas Component ──────────────────────────────────────────────

type WhiteboardTool = 'pen' | 'eraser'

interface WhiteboardCanvasProps {
  width: number
  height: number
}

function WhiteboardCanvas({ width, height }: WhiteboardCanvasProps) {
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
      ctx.lineWidth = 2
    } else {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 16
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
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

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
      {/* Whiteboard toolbar */}
      <div style={{
        position: 'absolute', bottom: 8, left: 10,
        display: 'flex', gap: 4, zIndex: 11,
      }}>
        {([
          { t: 'pen' as WhiteboardTool, icon: '✏' },
          { t: 'eraser' as WhiteboardTool, icon: '◻' },
        ] as const).map(({ t, icon }) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            title={t}
            style={{
              width: 24, height: 24, borderRadius: 5, fontSize: 12,
              background: tool === t ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${tool === t ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.12)'}`,
              color: tool === t ? '#f59e0b' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {icon}
          </button>
        ))}
        <button
          onClick={clearCanvas}
          title="Clear"
          style={{
            width: 24, height: 24, borderRadius: 5, fontSize: 12,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
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

  // ── Zoom / pan state ──
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // ── Tooltip state ──
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // ── Hover state for clickable elements ──
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  // ── Whiteboard state ──
  const [whiteboardActive, setWhiteboardActive] = useState(false)

  // ── Draggable points state ──
  const [draggedPositions, setDraggedPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null)
  const [dragTooltip, setDragTooltip] = useState<{ label: string; x: number; y: number } | null>(null)
  const activeDragRef = useRef<{ label: string; origX: number; origY: number } | null>(null)

  // Convert SVG pixel coords (in viewBox space) to math coords
  const svgToMath = useCallback((svgX: number, svgY: number) => {
    const [xMin, xMax] = xDomain
    const [yMin, yMax] = yDomain
    const mathX = xMin + ((svgX - MARGIN.left) / INNER_W) * (xMax - xMin)
    const mathY = yMax - ((svgY - MARGIN.top) / INNER_H) * (yMax - yMin)
    return { mathX, mathY }
  }, [xDomain, yDomain])

  // Convert client coords to viewBox coords
  const clientToViewBox = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const svgX = ((clientX - rect.left) / rect.width) * W
    const svgY = ((clientY - rect.top) / rect.height) * H
    // Undo pan/zoom
    const centreX = W / 2
    const centreY = H / 2
    const unzoomedX = (svgX - pan.x - centreX) / zoom + centreX
    const unzoomedY = (svgY - pan.y - centreY) / zoom + centreY
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

  // ── Draggable point handlers ──
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

  // Build hover targets from point elements
  const hoverTargets = spec.elements
    .filter((el): el is Extract<DiagramElement, { kind: 'point' }> => el.kind === 'point')
    .map(el => {
      const overridePos = el.label ? draggedPositions[el.label] : undefined
      return {
        svgX: c.mx(overridePos?.x ?? el.x),
        svgY: c.my(overridePos?.y ?? el.y),
        lines: [
          el.label ? `${el.label}` : '',
          `(${el.x}, ${el.y})`,
        ].filter(Boolean),
        mathX: el.x,
        mathY: el.y,
        label: el.label,
      }
    })

  // Build render options
  const opts: RenderOptions = { hoveredKey, onElementClick }

  // Compute overridden segment/vector endpoints
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
  const transformOrigin = `${W / 2} ${H / 2}`

  const isDraggingAPoint = draggingLabel !== null

  return (
    <div className={className}>
      {spec.title && (
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
          {spec.title}
        </p>
      )}

      <div style={{ position: 'relative' }}>
        {/* Whiteboard button (when inactive) */}
        {!whiteboardActive && (
          <button
            onClick={() => setWhiteboardActive(true)}
            title="Open whiteboard"
            style={{
              position: 'absolute', bottom: 8, left: 10, zIndex: 5,
              width: 22, height: 22, borderRadius: 5, fontSize: 13,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
            📝
          </button>
        )}

        {/* Done button (when whiteboard active) */}
        {whiteboardActive && (
          <button
            onClick={() => setWhiteboardActive(false)}
            title="Close whiteboard"
            style={{
              position: 'absolute', top: 8, right: 10, zIndex: 15,
              padding: '2px 8px', borderRadius: 5, fontSize: 11,
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b', cursor: 'pointer',
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
            background: 'rgba(8,13,28,0.85)',
            borderRadius: 12,
            border: '1px solid rgba(59,130,246,0.12)',
            display: 'block',
            cursor: isDraggingAPoint ? 'none' : dragRef.current ? 'grabbing' : whiteboardActive ? 'none' : 'grab',
            userSelect: 'none',
            pointerEvents: whiteboardActive ? 'none' : 'auto',
          }}
          aria-label={spec.title ?? 'Geometry diagram'}
          role="img"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { onMouseUp(); setTooltip(null) }}
        >
          {renderDefs(spec.elements)}

          <g transform={transform} style={{ transformOrigin }}>
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

            {/* Invisible hit areas for all labelled elements */}
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
                    cx={px}
                    cy={py}
                    r={isDraggable ? 16 : 14}
                    fill="transparent"
                    style={{ cursor: isDraggable ? 'grab' : isClickable ? 'pointer' : 'crosshair' }}
                    onMouseEnter={() => {
                      setTooltip({ svgX: px, svgY: py, lines: [el.label ?? '', `(${el.x}, ${el.y})`].filter(Boolean) })
                      if (isClickable || isDraggable) setHoveredKey(hitKey)
                    }}
                    onMouseLeave={() => {
                      setTooltip(null)
                      setHoveredKey(null)
                    }}
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
                    cx={svgCx}
                    cy={svgCy}
                    r={svgR + 6}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredKey(hitKey)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => onElementClick(
                      el.label ?? 'circle',
                      `circle with centre (${el.cx}, ${el.cy}) and radius ${el.r}`
                    )}
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
                    x={midX - 16}
                    y={midY - 10}
                    width={32}
                    height={20}
                    rx={4}
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
                const labelDist = c.mLen(el.r) + 14
                const labelX = svgCx + labelDist * Math.cos(midSvgAngle)
                const labelY = svgCy + labelDist * Math.sin(midSvgAngle)
                const description = `angle of ${el.label} marked here`
                return (
                  <circle
                    key={`hit-${i}`}
                    cx={labelX}
                    cy={labelY}
                    r={12}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredKey(hitKey)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => onElementClick(el.label ?? 'angle', description)}
                  />
                )
              }

              return null
            })}

            {/* Tooltip rendered inside the zoom group so it moves with the diagram */}
            {tooltip && (() => {
              const ttW = Math.max(...tooltip.lines.map(l => l.length)) * 7 + 16
              const ttH = tooltip.lines.length * 14 + 8
              const ttX = tooltip.svgX + 10
              const ttY = tooltip.svgY - ttH - 6
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={5}
                    fill="rgba(8,13,28,0.95)" stroke="rgba(245,158,11,0.5)" strokeWidth={0.8} />
                  {tooltip.lines.map((line, j) => (
                    <text key={j} x={ttX + 8} y={ttY + 12 + j * 14}
                      fontSize={10} fontFamily="system-ui,sans-serif"
                      fill={j === 0 ? '#fbbf24' : '#e2e8f0'} fontWeight={j === 0 ? 700 : 400}>
                      {line}
                    </text>
                  ))}
                </g>
              )
            })()}

            {/* Drag position tooltip */}
            {dragTooltip && (() => {
              const pos = draggedPositions[dragTooltip.label]
              if (!pos) return null
              const px = c.mx(pos.x)
              const py = c.my(pos.y)
              const text = `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`
              const ttW = text.length * 6.5 + 12
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={px + 8} y={py - 20} width={ttW} height={14} rx={3}
                    fill="rgba(245,158,11,0.9)" />
                  <text x={px + 8 + ttW / 2} y={py - 10}
                    textAnchor="middle" fontSize={9} fontFamily="system-ui,sans-serif"
                    fill="#080d1c" fontWeight={700}>
                    {text}
                  </text>
                </g>
              )
            })()}
          </g>
        </svg>

        {/* Whiteboard canvas overlay */}
        {whiteboardActive && (
          <WhiteboardCanvas width={W} height={H} />
        )}

        {/* Zoom Controls */}
        <div style={{ position: 'absolute', bottom: 8, right: 10, display: 'flex', gap: 4 }}>
          {[
            { label: '+', action: () => setZoom(z => Math.min(6, z * 1.3)) },
            { label: '−', action: () => setZoom(z => Math.max(0.4, z / 1.3)) },
            { label: '⊙', action: resetView },
          ].map(({ label, action }) => (
            <button key={label} onClick={action}
              style={{
                width: 22, height: 22, borderRadius: 5, fontSize: 13, lineHeight: 1,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Hint */}
        <p style={{ position: 'absolute', bottom: 10, left: whiteboardActive ? 120 : 38, fontSize: 9,
          color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }}>
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
