'use client'

import { motion } from 'framer-motion'

const GRADE_ORDER = ['A*', 'A', 'B', 'C', 'D', 'E']
const GRADE_Y: Record<string, number> = { 'A*': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 }
const GRADE_COLOR: Record<string, string> = {
  'A*': '#22c55e', 'A': '#3b82f6', 'B': '#8b5cf6',
  'C': '#f59e0b', 'D': '#ef4444', 'E': '#6b7280',
}

interface Snapshot { grade: string; avg_p_known: number; created_at: string }

interface Props { snapshots: Snapshot[] }

export function GradeTrendChart({ snapshots }: Props) {
  if (snapshots.length === 0) {
    return (
      <div className="p-5 rounded-2xl text-center"
        style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
        <p className="text-sm" style={{ color: '#5a7aaa' }}>
          No trend data yet — complete some practice sessions to track your grade over time.
        </p>
      </div>
    )
  }

  const W = 500
  const H = 140
  const PAD = { top: 16, right: 20, bottom: 28, left: 36 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const sorted = [...snapshots].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const xScale = (i: number) =>
    sorted.length === 1 ? PAD.left + innerW / 2 : PAD.left + (i / (sorted.length - 1)) * innerW

  const yScale = (grade: string) =>
    PAD.top + (GRADE_Y[grade] ?? 5) / 5 * innerH

  const points = sorted.map((s, i) => ({ x: xScale(i), y: yScale(s.grade), s }))
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const area = [
    `M ${points[0].x},${PAD.top + innerH}`,
    ...points.map(p => `L ${p.x},${p.y}`),
    `L ${points[points.length - 1].x},${PAD.top + innerH}`,
    'Z',
  ].join(' ')

  const latestGrade = sorted[sorted.length - 1].grade
  const latestColor = GRADE_COLOR[latestGrade] ?? '#3b82f6'
  const improved = sorted.length > 1 && GRADE_Y[latestGrade] < GRADE_Y[sorted[0].grade]

  return (
    <div className="p-5 rounded-2xl"
      style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a7aaa' }}>
          Grade Trend
        </p>
        {improved && (
          <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>
            ↑ Improving
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Y-axis grade labels */}
        {GRADE_ORDER.map(g => (
          <text
            key={g}
            x={PAD.left - 6}
            y={yScale(g) + 4}
            textAnchor="end"
            fontSize={9}
            fill={g === latestGrade ? latestColor : '#374151'}
            fontWeight={g === latestGrade ? 700 : 400}>
            {g}
          </text>
        ))}

        {/* Horizontal grid lines */}
        {GRADE_ORDER.map(g => (
          <line
            key={g}
            x1={PAD.left}
            x2={PAD.left + innerW}
            y1={yScale(g)}
            y2={yScale(g)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}

        {/* Area fill */}
        <path d={area} fill={`${latestColor}10`} />

        {/* Line */}
        <motion.polyline
          points={polyline}
          fill="none"
          stroke={latestColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Data points + date labels */}
        {points.map((p, i) => {
          const date = new Date(p.s.created_at)
          const label = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
          const color = GRADE_COLOR[p.s.grade] ?? '#3b82f6'
          const isLast = i === points.length - 1
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={isLast ? 4 : 3} fill={color}
                stroke={isLast ? '#080d19' : 'none'} strokeWidth={2} />
              {(i === 0 || isLast || points.length <= 6) && (
                <text x={p.x} y={H - 4} textAnchor="middle" fontSize={8} fill="#374151">
                  {label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
