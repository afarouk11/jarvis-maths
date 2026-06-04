'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { GraphRenderer, parseGraphSpec } from '@/components/math/GraphRenderer'

// Blocks rendered elsewhere (right panel, chips, interactive) — strip from chat display
const STRIP_BLOCKS = ['ANIMATE', 'ADIAGRAM', 'DIAGRAM', 'TRYIT', 'QUICKREPLIES']
// Blocks rendered inline by SpokMessage — hide if incomplete during streaming
const INLINE_BLOCKS = ['GRAPH', 'KEYPOINTS']

function stripAllNonInline(text: string): string {
  let result = text
  for (const name of STRIP_BLOCKS) {
    // Strip complete blocks
    result = result.replace(new RegExp(`\\[${name}\\][\\s\\S]*?\\[\\/${name}\\]`, 'g'), '')
    // Strip incomplete blocks that started but haven't closed yet (streaming)
    const openIdx = result.lastIndexOf(`[${name}]`)
    const closeIdx = result.lastIndexOf(`[/${name}]`)
    if (openIdx !== -1 && openIdx > closeIdx) {
      result = result.slice(0, openIdx)
    }
  }
  return result
}

function hideIncompleteInlineBlocks(text: string): string {
  let result = text
  for (const name of INLINE_BLOCKS) {
    // If an opening tag exists without a matching closing tag, hide from opening to end
    const openIdx = result.lastIndexOf(`[${name}]`)
    const closeIdx = result.lastIndexOf(`[/${name}]`)
    if (openIdx !== -1 && openIdx > closeIdx) {
      result = result.slice(0, openIdx)
    }
  }
  return result
}

function parseKeyPoints(text: string): string[] | null {
  const match = text.match(/\[KEYPOINTS\]([\s\S]*?)\[\/KEYPOINTS\]/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1].trim())
    if (!Array.isArray(parsed)) return null
    return parsed as string[]
  } catch {
    return null
  }
}

function stripKeyPointsBlocks(text: string): string {
  return text.replace(/\[KEYPOINTS\][\s\S]*?\[\/KEYPOINTS\]/g, '')
}

interface Props {
  content: string
  color?: string
}

export function SpokMessage({ content, color = '#d1deff' }: Props) {
  const keyPoints = parseKeyPoints(content)

  // Strip right-panel blocks and any that are still mid-stream (no closing tag yet)
  const withoutNonInline = stripAllNonInline(content)
  // Strip complete [KEYPOINTS] so we render it as the styled box below
  const withoutKeyPoints = stripKeyPointsBlocks(withoutNonInline)
  // Hide any [GRAPH]/[KEYPOINTS] block that started streaming but isn't complete yet
  const cleaned = hideIncompleteInlineBlocks(withoutKeyPoints)

  // Split on [GRAPH] blocks only — [DIAGRAM]/[ADIAGRAM] are right-panel only
  const BLOCK_RE = /\[GRAPH\]([\s\S]*?)\[\/GRAPH\]/g
  const segments: Array<{ type: 'text' | 'graph'; content: string }> = []
  let last = 0
  let match

  while ((match = BLOCK_RE.exec(cleaned)) !== null) {
    if (match.index > last) segments.push({ type: 'text', content: cleaned.slice(last, match.index) })
    if (match[1] !== undefined) segments.push({ type: 'graph', content: match[1].trim() })
    last = match.index + match[0].length
  }
  if (last < cleaned.length) segments.push({ type: 'text', content: cleaned.slice(last) })
  if (segments.length === 0) segments.push({ type: 'text', content: cleaned })

  return (
    <div className="space-y-3">
      {segments.map((seg, i) => {
        if (seg.type === 'graph') {
          const spec = parseGraphSpec(seg.content)
          return spec ? <GraphRenderer key={i} spec={spec} className="mt-2" /> : null
        }
        return seg.content.trim() ? (
          <MarkdownMath key={i} content={seg.content} color={color} />
        ) : null
      })}

      {keyPoints && keyPoints.length > 0 && (
        <div className="mt-3 rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
          <div className="px-3 py-2 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgba(245,158,11,0.12)' }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
              Key points
            </span>
          </div>
          <ul className="px-3 py-2 space-y-2">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed"
                style={{ color: '#fde9b8' }}>
                <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Convert [TOPIC:slug|Name] → a styled span we can find after markdown rendering.
// We use a data attribute trick: replace with a markdown link pointing to the topic,
// then override the <a> renderer to style it as a pill.
function resolveTopicLinks(text: string): string {
  return text.replace(/\[TOPIC:([^\]|]+)\|([^\]]+)\]/g, (_, slug, name) =>
    `[${name}](/topics/${slug})`
  )
}

// [NAV:/path|Label] → a markdown link to an in-app page, styled as a pill below.
function resolveNavLinks(text: string): string {
  return text.replace(/\[NAV:([^\]|]+)\|([^\]]+)\]/g, (_, path, name) =>
    `[${name}](${path})`
  )
}

function normaliseDelimiters(text: string): string {
  return text
    // \[...\] → block $$...$$ (must be on its own line for remark-math to parse as mathFlow)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n\n$$\n${m.trim()}\n$$\n\n`)
    // \(...\) → inline $...$
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`)
}

function MarkdownMath({ content, color }: { content: string; color: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed" style={{ color }}>{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold" style={{ color: '#ffffff' }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em style={{ color }}>{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="my-2 space-y-1 pl-4 list-disc" style={{ color }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-2 space-y-1 pl-4 list-decimal" style={{ color }}>{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed" style={{ color }}>{children}</li>
        ),
        h1: ({ children }) => (
          <h1 className="text-base font-bold mt-3 mb-1 text-white">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold mt-3 mb-1 text-white">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mt-2 mb-1" style={{ color: '#93c5fd' }}>{children}</h3>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-')
          return isBlock ? (
            <pre className="my-2 p-3 rounded-lg text-xs overflow-x-auto"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: '#86efac' }}>
              <code>{children}</code>
            </pre>
          ) : (
            <code className="px-1.5 py-0.5 rounded text-xs"
              style={{ background: 'rgba(0,0,0,0.3)', color: '#86efac' }}>
              {children}
            </code>
          )
        },
        blockquote: ({ children }) => (
          <blockquote className="pl-3 my-2 border-l-2"
            style={{ borderColor: 'rgba(245,158,11,0.4)', color: 'rgba(255,255,255,0.6)' }}>
            {children}
          </blockquote>
        ),
        hr: () => <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} className="my-3" />,
        a: ({ href, children }) => {
          const isTopicLink = href?.startsWith('/topics/')
          const isNavLink = !isTopicLink && href?.startsWith('/')
          if (isTopicLink) {
            return (
              <a
                href={href}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold no-underline transition-all hover:scale-[1.03]"
                style={{
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.35)',
                  color: '#93c5fd',
                }}>
                <span style={{ fontSize: 10 }}>→</span>
                {children}
              </a>
            )
          }
          if (isNavLink) {
            return (
              <a
                href={href}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold no-underline transition-all hover:scale-[1.03]"
                style={{
                  background: 'rgba(245,158,11,0.14)',
                  border: '1px solid rgba(245,158,11,0.35)',
                  color: '#fbbf24',
                }}>
                <span style={{ fontSize: 10 }}>↗</span>
                {children}
              </a>
            )
          }
          return <a href={href} className="underline" style={{ color: '#93c5fd' }}>{children}</a>
        },
      }}
    >
      {resolveTopicLinks(resolveNavLinks(normaliseDelimiters(content)))}
    </ReactMarkdown>
  )
}
