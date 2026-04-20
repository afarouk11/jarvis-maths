'use client'

import { InlineMath, BlockMath } from 'react-katex'

interface Props {
  content: string
  block?: boolean
}

export function MathRenderer({ content, block = false }: Props) {
  if (block) return <BlockMath math={content} />
  return <InlineMath math={content} />
}

// Renders a string that may contain mixed text and LaTeX ($...$ and $$...$$)
export function MixedMath({ content }: { content: string }) {
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g)

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={i} math={part.slice(2, -2)} />
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={i} math={part.slice(1, -1)} />
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
