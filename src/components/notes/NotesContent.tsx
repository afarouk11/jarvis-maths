'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// Normalise the LaTeX delimiters our notes are authored with so remark-math
// parses them. Notes use $...$ (inline) and $$...$$ (display) already, but we
// also tolerate \[...\] / \(...\) just in case.
function normaliseDelimiters(text: string): string {
  return text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n\n$$\n${m.trim()}\n$$\n\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`)
}

interface Props {
  content: string
}

// Renders a knowledge-base note (GitHub-flavoured markdown + KaTeX) using the
// StudiQ dark theme. Read-only, so safe to render server-authored content.
export function NotesContent({ content }: Props) {
  return (
    <div className="notes-prose">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-[15px]" style={{ color: '#c7d6f0' }}>{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold" style={{ color: '#ffffff' }}>{children}</strong>
          ),
          em: ({ children }) => <em style={{ color: '#c7d6f0' }}>{children}</em>,
          ul: ({ children }) => (
            <ul className="my-3 space-y-1.5 pl-5 list-disc text-[15px]" style={{ color: '#c7d6f0' }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 space-y-1.5 pl-5 list-decimal text-[15px]" style={{ color: '#c7d6f0' }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed marker:text-blue-400/60" style={{ color: '#c7d6f0' }}>{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mt-5 mb-2 text-white"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold mt-5 mb-2 text-white"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-4 mb-1.5" style={{ color: '#93c5fd' }}>{children}</h3>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            return isBlock ? (
              <pre className="my-3 p-3 rounded-lg text-xs overflow-x-auto"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: '#86efac' }}>
                <code>{children}</code>
              </pre>
            ) : (
              <code className="px-1.5 py-0.5 rounded text-[13px]"
                style={{ background: 'rgba(0,0,0,0.3)', color: '#86efac' }}>{children}</code>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="pl-3 my-3 border-l-2"
              style={{ borderColor: 'rgba(245,158,11,0.4)', color: 'rgba(255,255,255,0.7)' }}>{children}</blockquote>
          ),
          hr: () => <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} className="my-4" />,
          a: ({ href, children }) => (
            <a href={href} className="underline" style={{ color: '#93c5fd' }}>{children}</a>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="text-left px-3 py-2 font-semibold text-white"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2" style={{ color: '#c7d6f0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{children}</td>
          ),
        }}
      >
        {normaliseDelimiters(content)}
      </ReactMarkdown>
    </div>
  )
}
