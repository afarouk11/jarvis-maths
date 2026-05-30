'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { GLOSSARY, type GlossaryTerm } from '@/lib/glossary'
import { cn } from '@/lib/utils'

interface HelpTipProps {
  /** A known glossary term — its title + body are shown automatically. */
  term?: GlossaryTerm
  /** Or pass custom content directly (overrides `term`). */
  title?: string
  body?: string
  className?: string
}

/**
 * A small "(?)" affordance that explains a piece of jargon in plain English.
 * Works on hover, keyboard focus, and tap (mobile) — click toggles, Escape closes.
 */
export function HelpTip({ term, title, body, className }: HelpTipProps): React.ReactElement | null {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const popoverId = useId()

  const entry = term ? GLOSSARY[term] : undefined
  const heading = title ?? entry?.title
  const text = body ?? entry?.body

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!heading && !text) return null

  return (
    <span ref={ref} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label={heading ? `What is ${heading}?` : 'More information'}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center text-text-soft transition-colors hover:text-primary"
        style={{ lineHeight: 0 }}
      >
        <HelpCircle size={14} />
      </button>

      {open && (
        <span
          id={popoverId}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-60 -translate-x-1/2 rounded-xl p-3 text-left"
          style={{
            background: 'rgba(8,13,25,0.98)',
            border: '1px solid rgba(59,130,246,0.25)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {heading && <span className="block text-sm font-semibold text-text-strong">{heading}</span>}
          {text && <span className="mt-1 block text-xs leading-relaxed text-text-soft">{text}</span>}
        </span>
      )}
    </span>
  )
}
