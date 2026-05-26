'use client'

// ─── Types ────────────────────────────────────────────────────────────────────

type DiagramElement =
  | { kind: 'circle'; cx: number; cy: number; r: number; color?: string; label?: string; dashed?: boolean }
  | { kind: 'point'; x: number; y: number; label?: string; color?: string }
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

function renderCircle(el: Extract<DiagramElement, { kind: 'circle' }>, c: Coords, key: number) {
  const cx = c.mx(el.cx)
  const cy = c.my(el.cy)
  const r = c.mLen(el.r)
  const color = el.color ?? '#3b82f6'
  const labelY = cy - r - 8

  return (
    <g key={key}>
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
) {
  const px = c.mx(el.x)
  const py = c.my(el.y)
  const color = el.color ?? '#ffffff'

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

  return (
    <g key={key}>
      <circle cx={px} cy={py} r={4.5} fill={color} />
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
) {
  const x1 = c.mx(el.x1)
  const y1 = c.my(el.y1)
  const x2 = c.mx(el.x2)
  const y2 = c.my(el.y2)
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

  return (
    <g key={key}>
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
) {
  const x1 = c.mx(el.x1)
  const y1 = c.my(el.y1)
  const x2 = c.mx(el.x2)
  const y2 = c.my(el.y2)
  const color = el.color ?? '#4ade80'

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const [ox, oy] = perpOffset(x1, y1, x2, y2, 12)

  return (
    <g key={key}>
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

  return (
    <g key={key}>
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

// ─── Defs (arrowhead markers) ─────────────────────────────────────────────────

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

  return <defs>{markers}</defs>
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DiagramRenderer({ spec, className }: { spec: DiagramSpec; className?: string }): React.JSX.Element {
  const xDomain: [number, number] = spec.xDomain ?? [-8, 8]
  const yDomain: [number, number] = spec.yDomain ?? [-8, 8]
  const c = makeCoords(xDomain, yDomain)

  return (
    <div className={className}>
      {spec.title && (
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
          {spec.title}
        </p>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        style={{
          background: 'rgba(8,13,28,0.85)',
          borderRadius: 12,
          border: '1px solid rgba(59,130,246,0.12)',
          display: 'block',
        }}
        aria-label={spec.title ?? 'Geometry diagram'}
        role="img"
      >
        {renderDefs(spec.elements)}

        {/* Grid and axes */}
        {renderGrid(c)}

        {/* Elements */}
        {spec.elements.map((el, i) => {
          switch (el.kind) {
            case 'circle':
              return renderCircle(el, c, i)
            case 'point':
              return renderPoint(el, c, i)
            case 'vector':
              return renderVector(el, c, i)
            case 'segment':
              return renderSegment(el, c, i)
            case 'north':
              return renderNorth(el, c, i)
            case 'arc':
              return renderArc(el, c, i)
            case 'rightangle':
              return renderRightAngle(el, c, i)
            case 'label':
              return renderLabel(el, c, i)
            default:
              return null
          }
        })}
      </svg>
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
