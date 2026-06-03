/**
 * Build plain-English descriptions of rendered maths visuals so screen-reader
 * users get a meaningful alt text instead of "image". Kept dependency-free and
 * defensive — specs come from the AI and may be partial.
 */

interface GraphLikeData {
  fn?: string
  label?: string
}

interface GraphLikeSpec {
  title?: string
  xDomain?: [number, number]
  yDomain?: [number, number]
  data?: ReadonlyArray<GraphLikeData>
}

interface DiagramLikeElement {
  kind: string
  label?: string
  text?: string
}

interface DiagramLikeSpec {
  title?: string
  elements?: ReadonlyArray<DiagramLikeElement>
}

/** Describe a function-plot graph for screen readers. */
export function describeGraph(spec: GraphLikeSpec): string {
  const parts: string[] = []
  parts.push(spec.title ? `Graph: ${spec.title}.` : 'Graph.')

  const fns = (spec.data ?? [])
    .map(d => d.label ?? d.fn)
    .filter((s): s is string => Boolean(s))
  if (fns.length === 1) parts.push(`Plot of ${fns[0]}.`)
  else if (fns.length > 1) parts.push(`Plots of ${fns.join(', ')}.`)

  if (spec.xDomain && spec.yDomain) {
    parts.push(`x from ${spec.xDomain[0]} to ${spec.xDomain[1]}, y from ${spec.yDomain[0]} to ${spec.yDomain[1]}.`)
  }
  return parts.join(' ')
}

/** Describe a geometry diagram for screen readers by summarising its elements. */
export function describeDiagram(spec: DiagramLikeSpec): string {
  const parts: string[] = []
  parts.push(spec.title ? `Diagram: ${spec.title}.` : 'Geometry diagram.')

  const elements = spec.elements ?? []
  if (elements.length > 0) {
    const counts = new Map<string, number>()
    for (const el of elements) counts.set(el.kind, (counts.get(el.kind) ?? 0) + 1)
    const summary = [...counts.entries()]
      .map(([kind, n]) => `${n} ${kind}${n > 1 ? 's' : ''}`)
      .join(', ')
    parts.push(`Contains ${summary}.`)

    const labels = elements
      .map(el => el.label ?? el.text)
      .filter((s): s is string => Boolean(s))
    if (labels.length > 0) parts.push(`Labelled: ${labels.join(', ')}.`)
  }
  return parts.join(' ')
}
