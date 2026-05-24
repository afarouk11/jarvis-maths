'use client'

interface MathKeypadProps {
  getTextarea: () => HTMLTextAreaElement | null
  setValue: (v: string) => void
  variant?: 'dark' | 'light'
}

const KEYS = [
  { label: 'x²', insert: '^2',    title: 'squared' },
  { label: 'x³', insert: '^3',    title: 'cubed' },
  { label: 'xⁿ', insert: '^',     title: 'power of n' },
  { label: '√',  insert: 'sqrt(', title: 'square root' },
  { label: 'π',  insert: 'π',     title: 'pi' },
  { label: '±',  insert: '±',     title: 'plus or minus' },
  { label: '÷',  insert: '÷',     title: 'divide' },
]

export function MathKeypad({ getTextarea, setValue, variant = 'dark' }: MathKeypadProps) {
  function insert(text: string) {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      <span style={{
        fontSize: 10,
        marginRight: 2,
        userSelect: 'none',
        color: isDark ? '#3d5060' : '#6b7280',
        fontFamily: 'Arial, sans-serif',
        whiteSpace: 'nowrap',
      }}>
        insert:
      </span>
      {KEYS.map(k => (
        <button
          key={k.label}
          type="button"
          title={k.title}
          onMouseDown={e => {
            e.preventDefault()
            insert(k.insert)
          }}
          style={isDark ? {
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.22)',
            color: '#a5b4fc',
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: '1.6',
            padding: '1px 7px',
            borderRadius: 4,
            cursor: 'pointer',
            userSelect: 'none',
          } : {
            background: '#e8f0fe',
            border: '1px solid #93c5fd',
            color: '#1d4ed8',
            fontFamily: 'Arial, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            lineHeight: '1.5',
            padding: '2px 6px',
            borderRadius: 3,
            cursor: 'pointer',
            userSelect: 'none',
          }}>
          {k.label}
        </button>
      ))}
    </div>
  )
}
