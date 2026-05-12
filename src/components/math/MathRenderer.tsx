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

// Renders a string that may contain mixed text and LaTeX.
// Handles: $$...$$, $...$, \[...\], \(...\)
export function MixedMath({ content }: { content: string }) {
  if (!content) return null

  const MATH_RE = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g
  const parts = content.split(MATH_RE)

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={i} math={part.slice(2, -2).trim()} />
        }
        if (part.startsWith('\\[') && part.endsWith('\\]')) {
          return <BlockMath key={i} math={part.slice(2, -2).trim()} />
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={i} math={part.slice(1, -1).trim()} />
        }
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          return <InlineMath key={i} math={part.slice(2, -2).trim()} />
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
