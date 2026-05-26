'use client'

import { DiagramRenderer, type DiagramElement, type DiagramSpec } from './DiagramRenderer'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnimDiagramSpec {
  title?: string
  xDomain?: [number, number]
  yDomain?: [number, number]
  steps: Array<{
    label?: string
    elements: DiagramElement[]
  }>
}

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseAnimDiagramSpec(raw: string): AnimDiagramSpec | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('steps' in parsed) ||
      !Array.isArray((parsed as { steps: unknown }).steps)
    ) {
      return null
    }
    return parsed as AnimDiagramSpec
  } catch {
    return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AnimatedDiagramRendererProps {
  spec: AnimDiagramSpec
  currentStep: number
  onElementClick?: (label: string, description: string) => void
  className?: string
}

export function AnimatedDiagramRenderer({
  spec,
  currentStep,
  onElementClick,
  className,
}: AnimatedDiagramRendererProps): React.JSX.Element | null {
  if (spec.steps.length === 0) return null

  const clampedStep = Math.max(0, Math.min(currentStep, spec.steps.length - 1))
  const step = spec.steps[clampedStep]

  if (!step) return null

  const diagramSpec: DiagramSpec = {
    title: spec.title,
    elements: step.elements,
    xDomain: spec.xDomain,
    yDomain: spec.yDomain,
  }

  return (
    <div className={className}>
      <DiagramRenderer
        spec={diagramSpec}
        onElementClick={onElementClick}
      />
      {step.label && (
        <p
          style={{
            fontSize: 11,
            color: 'rgba(245,158,11,0.7)',
            textAlign: 'center',
            marginTop: 6,
            fontFamily: 'system-ui,sans-serif',
          }}
        >
          {step.label}
        </p>
      )}
    </div>
  )
}
