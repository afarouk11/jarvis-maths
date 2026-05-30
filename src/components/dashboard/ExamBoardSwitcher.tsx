'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Check } from 'lucide-react'

const BOARDS = ['AQA', 'Edexcel', 'OCR'] as const
type Board = typeof BOARDS[number]

/**
 * Persistent exam-board switcher. UK students sit different boards (AQA/Edexcel/
 * OCR) with different notation and command words — keeping this front-and-centre
 * (not buried in settings) is a key differentiator. Re-fetches server data on
 * change so the whole dashboard recalibrates to the chosen board.
 */
export function ExamBoardSwitcher({ current }: { current: string }): React.ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState<Board | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  async function choose(board: Board): Promise<void> {
    setOpen(false)
    if (board === current) return
    setSaving(board)
    try {
      const res = await fetch('/api/profile/exam-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examBoard: board }),
      })
      if (res.ok) router.refresh()
    } finally {
      setSaving(null)
    }
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Exam board: ${current}. Change it.`}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#7ab3ff' }}>
        {saving ?? current}
        <ChevronDown size={13} />
      </button>

      {open && (
        <div role="listbox" className="absolute left-0 top-full z-50 mt-1 w-36 rounded-xl p-1"
          style={{ background: 'rgba(8,13,25,0.98)', border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}>
          {BOARDS.map(b => (
            <button
              key={b}
              role="option"
              aria-selected={b === current}
              onClick={() => choose(b)}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: b === current ? '#7ab3ff' : '#cbd5e1' }}>
              {b}
              {b === current && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
