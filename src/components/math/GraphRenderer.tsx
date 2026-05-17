'use client'

import { useEffect, useRef, useState } from 'react'

export interface AnimateSpec {
  title?: string
  xDomain?: [number, number]
  yDomain?: [number, number]
  steps: Array<{
    label?: string
    data: GraphSpec['data']
    annotations?: GraphSpec['annotations']
  }>
}

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

export function parseAnimateSpec(raw: string): AnimateSpec | null {
  try {
    const parsed = JSON.parse(raw)
    if (!parsed.steps || !Array.isArray(parsed.steps)) return null
    return parsed as AnimateSpec
  } catch {
    return null
  }
}

// Renders an AnimateSpec progressively — shows steps 0..currentStep with draw-in animation
export function AnimatedGraphRenderer({ spec, currentStep, className }: { spec: AnimateSpec; currentStep: number; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(`agraph-${Math.random().toString(36).slice(2)}`)
  const prevStepRef = useRef(-1)

  // Accumulate data+annotations up to currentStep
  const visibleSteps = spec.steps.slice(0, Math.min(currentStep + 1, spec.steps.length))
  const combinedData = visibleSteps.flatMap(s => s.data)
  const combinedAnnotations = visibleSteps.flatMap(s => s.annotations ?? [])

  const builtSpec: GraphSpec = {
    title: spec.title,
    xDomain: spec.xDomain,
    yDomain: spec.yDomain,
    data: combinedData,
    annotations: combinedAnnotations.length ? combinedAnnotations : undefined,
  }

  const isNewStep = currentStep !== prevStepRef.current

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const id = idRef.current

    import('function-plot').then(({ default: functionPlot }) => {
      if (!container) return
      container.innerHTML = ''
      const el = document.createElement('div')
      el.id = id
      container.appendChild(el)

      try {
        const data = builtSpec.data.map((d, i) => ({
          ...d,
          color: d.color ?? COLORS[i % COLORS.length],
        }))

        functionPlot({
          target: `#${id}`,
          width: container.clientWidth || 460,
          height: 280,
          xAxis: { domain: builtSpec.xDomain ?? [-10, 10], label: 'x' },
          yAxis: { domain: builtSpec.yDomain ?? [-10, 10], label: 'y' },
          grid: true,
          data,
          annotations: builtSpec.annotations,
          tip: { xLine: true, yLine: true },
        })

        // Animate newly added paths with stroke-dashoffset draw-in
        if (isNewStep && prevStepRef.current >= 0) {
          setTimeout(() => {
            const paths = container.querySelectorAll<SVGPathElement>('path.line')
            const newPaths = Array.from(paths).slice(-builtSpec.data.length + (currentStep > 0 ? spec.steps.slice(0, currentStep).flatMap(s => s.data).length : 0))
            newPaths.forEach(path => {
              const len = path.getTotalLength?.() ?? 0
              if (!len) return
              path.style.transition = 'none'
              path.style.strokeDasharray = String(len)
              path.style.strokeDashoffset = String(len)
              requestAnimationFrame(() => {
                path.style.transition = 'stroke-dashoffset 0.8s ease-out'
                path.style.strokeDashoffset = '0'
              })
            })
          }, 80)
        }
      } catch (e) {
        console.error('[AnimatedGraphRenderer] error:', e)
      }

      prevStepRef.current = currentStep
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, JSON.stringify(builtSpec)])

  return (
    <div className={className}>
      {spec.title && (
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">{spec.title}</p>
      )}
      {visibleSteps[visibleSteps.length - 1]?.label && (
        <p className="text-xs mb-1" style={{ color: 'rgba(245,158,11,0.6)' }}>
          {visibleSteps[visibleSteps.length - 1].label}
        </p>
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
