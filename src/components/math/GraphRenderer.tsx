'use client'

import { useEffect, useRef } from 'react'

export interface GraphSpec {
  title?: string
  xDomain?: [number, number]
  yDomain?: [number, number]
  data: Array<{
    fn?: string           // e.g. "x^2", "sin(x)"
    fn2?: string          // for implicit plots f(x,y)=0
    parametric?: boolean
    x?: string            // parametric x(t)
    y?: string            // parametric y(t)
    range?: [number, number]
    color?: string
    label?: string
    graphType?: 'polyline' | 'scatter' | 'interval'
    closed?: boolean      // shade area under curve
    secants?: Array<{ x0: number; x1: number }>
    derivative?: { fn: string; updateOnMouseMove?: boolean }
  }>
  annotations?: Array<{
    x?: number
    y?: number
    text?: string
  }>
}

interface Props {
  spec: GraphSpec
  className?: string
}

const COLORS = ['#3b82f6', '#ef4444', '#4ade80', '#fbbf24', '#a78bfa', '#f97316']

export function GraphRenderer({ spec, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(`graph-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    if (!containerRef.current) return

    let cleanup = () => {}
    const container = containerRef.current
    const id = idRef.current

    import('function-plot').then(({ default: functionPlot }) => {
      if (!container) return
      container.innerHTML = ''
      const el = document.createElement('div')
      el.id = id
      container.appendChild(el)

      try {
        const data = spec.data.map((d, i) => ({
          ...d,
          color: d.color ?? COLORS[i % COLORS.length],
        }))

        functionPlot({
          target: `#${id}`,
          width: container.clientWidth || 460,
          height: 280,
          xAxis: {
            domain: spec.xDomain ?? [-10, 10],
            label: 'x',
          },
          yAxis: {
            domain: spec.yDomain ?? [-10, 10],
            label: 'y',
          },
          grid: true,
          data,
          annotations: spec.annotations,
          tip: { xLine: true, yLine: true },
        })
      } catch (e) {
        console.error('[GraphRenderer] function-plot error:', e)
        container.innerHTML = `<p style="color:#ef4444;font-size:12px;padding:8px">Graph error — could not render</p>`
      }
    })

    return cleanup
  }, [JSON.stringify(spec)])

  return (
    <div className={className}>
      {spec.title && (
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">{spec.title}</p>
      )}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden"
        style={{
          background: 'rgba(8,13,28,0.8)',
          border: '1px solid rgba(59,130,246,0.15)',
          minHeight: 280,
        }}
      />
    </div>
  )
}

export function parseGraphSpec(raw: string): GraphSpec | null {
  try {
    const parsed = JSON.parse(raw)
    if (!parsed.data || !Array.isArray(parsed.data)) return null
    return parsed as GraphSpec
  } catch {
    return null
  }
}
