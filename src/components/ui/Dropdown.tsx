'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  className?: string
  ariaLabel?: string
}

/**
 * Fully custom listbox dropdown. Native <select> option lists are painted by
 * the OS and ignore inline styles on several platforms (notably Windows),
 * which made them render white-on-white against the dark theme — so every
 * part of this control is rendered by React and styled explicitly.
 */
export function Dropdown({ value, onChange, options, placeholder = 'Select…', className = '', ariaLabel }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  const selected = options.find(o => o.value === value)

  const openMenu = useCallback(() => {
    const idx = options.findIndex(o => o.value === value)
    setHighlighted(idx >= 0 ? idx : 0)
    setOpen(true)
  }, [options, value])

  const select = useCallback((idx: number) => {
    const opt = options[idx]
    if (opt) onChange(opt.value)
    setOpen(false)
  }, [options, onChange])

  // Close on any click/tap outside the control.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector<HTMLElement>(`[data-index="${highlighted}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, highlighted])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        openMenu()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlighted(h => Math.min(h + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlighted(h => Math.max(h - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setHighlighted(0)
        break
      case 'End':
        e.preventDefault()
        setHighlighted(options.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        select(highlighted)
        break
      case 'Escape':
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none flex items-center justify-between gap-2 text-left focus-visible:ring-2 focus-visible:ring-blue-500/50"
        style={{ background: '#13233f', border: '1px solid rgba(59,130,246,0.35)', color: selected ? '#e8f0fe' : '#5a7aaa' }}>
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={14}
          className="shrink-0 transition-transform"
          style={{ color: '#5a7aaa', transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg py-1 shadow-xl"
          style={{ background: '#13233f', border: '1px solid rgba(59,130,246,0.35)' }}>
          {options.map((opt, idx) => {
            const isSelected = opt.value === value
            const isHighlighted = idx === highlighted
            return (
              <li
                key={opt.value}
                data-index={idx}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setHighlighted(idx)}
                onClick={() => select(idx)}
                className="px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-2"
                style={{
                  background: isHighlighted ? 'rgba(59,130,246,0.2)' : 'transparent',
                  color: isSelected ? '#93c5fd' : '#e8f0fe',
                }}>
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={14} className="shrink-0" style={{ color: '#93c5fd' }} />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
