'use client'

interface MathKeypadProps {
  getTextarea: () => HTMLTextAreaElement | null
  setValue: (v: string) => void
  variant?: 'dark' | 'light'
}

interface MathKey {
  /** What the student sees on the key. */
  label: string
  /** What gets inserted into the answer. */
  insert: string
  /** Plain-language name, shown as a tooltip + screen-reader label. */
  title: string
}

// Grouped so related symbols sit together and the row scans left-to-right.
const KEY_GROUPS: ReadonlyArray<ReadonlyArray<MathKey>> = [
  [
    { label: 'x²', insert: '^2',    title: 'squared' },
    { label: 'x³', insert: '^3',    title: 'cubed' },
    { label: 'xⁿ', insert: '^',     title: 'to the power of' },
    { label: '√',  insert: 'sqrt(', title: 'square root' },
  ],
  [
    { label: '×',  insert: '×',     title: 'multiply' },
    { label: '÷',  insert: '÷',     title: 'divide' },
    { label: '±',  insert: '±',     title: 'plus or minus' },
    { label: 'π',  insert: 'π',     title: 'pi' },
  ],
  [
    { label: '≤',  insert: '≤',     title: 'less than or equal to' },
    { label: '≥',  insert: '≥',     title: 'greater than or equal to' },
    { label: '°',  insert: '°',     title: 'degrees' },
    { label: 'θ',  insert: 'θ',     title: 'theta (angle)' },
  ],
]

export function MathKeypad({ getTextarea, setValue, variant = 'dark' }: MathKeypadProps): React.ReactElement {
  function insert(text: string): void {
    const el = getTextarea()
    if (!el) return
    const start = el.selectionStart ?? el.value.length
    const end   = el.selectionEnd   ?? el.value.length
    const next  = el.value.slice(0, start) + text + el.value.slice(end)
    setValue(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + text.length, start + text.length)
    })
  }

  const isDark = variant === 'dark'

  return (
    <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Insert maths symbol">
      {KEY_GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1">
          {group.map(k => (
            <button
              key={k.label}
              type="button"
              title={k.title}
              aria-label={`Insert ${k.title}`}
              onMouseDown={e => { e.preventDefault(); insert(k.insert) }}
              className="transition-transform active:scale-95"
              style={isDark ? {
                minWidth: 34,
                height: 34,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#a5b4fc',
                fontFamily: 'monospace',
                fontSize: 15,
                borderRadius: 8,
                cursor: 'pointer',
                userSelect: 'none',
              } : {
                minWidth: 34,
                height: 34,
                background: '#e8f0fe',
                border: '1px solid #93c5fd',
                color: '#1d4ed8',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 8,
                cursor: 'pointer',
                userSelect: 'none',
              }}>
              {k.label}
            </button>
          ))}
          {gi < KEY_GROUPS.length - 1 && (
            <span className="mx-0.5 h-5 w-px shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1' }} aria-hidden />
          )}
        </div>
      ))}
    </div>
  )
}
