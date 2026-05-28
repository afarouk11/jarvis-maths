'use client'

import { useRef, useState, useEffect, useCallback, type CSSProperties } from 'react'
import { Pen, Eraser, Trash2, Undo2, X } from 'lucide-react'

interface Props {
  onChange: (base64: string) => void
  marks?: number
  disabled?: boolean
}

export function DrawingCanvas({ onChange, marks = 3, disabled }: Props) {
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [canUndo, setCanUndo] = useState(false)
  const [showScribbleBanner, setShowScribbleBanner] = useState(() => {
    if (typeof window === 'undefined') return false
    const isIpad = /iPad/.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform))
    return isIpad && localStorage.getItem('scribble-dismissed') !== '1'
  })

  // All drawing state in refs — zero React renders involved in stroke handling
  const isDrawingRef       = useRef(false)
  const activePointerRef   = useRef<number | null>(null)
  const lastPos            = useRef<{ x: number; y: number } | null>(null)
  const lastMid            = useRef<{ x: number; y: number } | null>(null)
  const history            = useRef<ImageData[]>([])
  const toolRef            = useRef(tool)
  const onChangeRef        = useRef(onChange)
  const disabledRef        = useRef(disabled)
  const setCanUndoRef      = useRef(setCanUndo)

  useEffect(() => { toolRef.current = tool }, [tool])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  useEffect(() => { disabledRef.current = disabled }, [disabled])

  const height = Math.max(140, marks * 38)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 0.5
    for (let y = 32; y < canvas.height; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
    }
    history.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)]
    setCanUndo(false)
  }, [])

  useEffect(() => { initCanvas() }, [initCanvas])

  // Block text selection while canvas is mounted
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = '* { -webkit-user-select: none !important; user-select: none !important; }'
    document.head.appendChild(style)
    const prevent = (e: Event) => e.preventDefault()
    document.addEventListener('selectstart', prevent)
    return () => {
      document.head.removeChild(style)
      document.removeEventListener('selectstart', prevent)
    }
  }, [])

  // All pointer handling in one native-listener useEffect — bypasses React
  // synthetic event scheduling entirely so rapid strokes are never missed.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function getPos(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      return {
        x: (e.clientX - rect.left) * (canvas!.width  / rect.width),
        y: (e.clientY - rect.top)  * (canvas!.height / rect.height),
      }
    }

    function endStroke(e: PointerEvent) {
      if (e.pointerId !== activePointerRef.current) return
      if (!isDrawingRef.current) return

      // Reset immediately so the next stroke can start without waiting
      isDrawingRef.current     = false
      activePointerRef.current = null
      lastPos.current          = null
      lastMid.current          = null

      try { canvas!.releasePointerCapture(e.pointerId) } catch { /* already released */ }

      // Defer getImageData + toDataURL — GPU readback on iPad can block for
      // hundreds of ms and would delay the next pointerdown if done synchronously
      const c = canvas!
      setTimeout(() => {
        const ctx  = c.getContext('2d')!
        const snap = ctx.getImageData(0, 0, c.width, c.height)
        history.current = [...history.current, snap].slice(-20)
        setCanUndoRef.current(true)
        onChangeRef.current(c.toDataURL('image/png').split(',')[1])
      }, 0)
    }

    function onDown(e: PointerEvent) {
      if (disabledRef.current) return
      if (e.pointerType === 'touch') return
      e.preventDefault()

      // Hard reset — clears any stuck state from a missed pointerup
      isDrawingRef.current    = false
      activePointerRef.current = null
      lastPos.current         = null
      lastMid.current         = null

      canvas!.setPointerCapture(e.pointerId)
      activePointerRef.current = e.pointerId
      isDrawingRef.current     = true

      const pos  = getPos(e)
      lastPos.current = pos

      const ctx  = canvas!.getContext('2d')!
      const size = toolRef.current === 'eraser' ? 18 : Math.max(1.5, (e.pressure || 1) * 2.5)
      ctx.beginPath()
      ctx.fillStyle = toolRef.current === 'eraser' ? '#ffffff' : '#111827'
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2)
      ctx.fill()
    }

    function onMove(e: PointerEvent) {
      if (!isDrawingRef.current || disabledRef.current) return
      if (e.pointerType === 'touch') return
      if (e.pointerId !== activePointerRef.current) return
      e.preventDefault()

      const ctx  = canvas!.getContext('2d')!
      const pos  = getPos(e)
      const last = lastPos.current!

      ctx.strokeStyle = toolRef.current === 'eraser' ? '#ffffff' : '#111827'
      ctx.lineWidth   = toolRef.current === 'eraser' ? 18 : Math.max(1.5, (e.pressure || 1) * 2.5)
      ctx.lineCap     = 'round'
      ctx.lineJoin    = 'round'
      ctx.beginPath()

      if (toolRef.current === 'eraser') {
        ctx.moveTo(last.x, last.y)
        ctx.lineTo(pos.x, pos.y)
      } else {
        const mid = { x: (last.x + pos.x) / 2, y: (last.y + pos.y) / 2 }
        if (lastMid.current) {
          ctx.moveTo(lastMid.current.x, lastMid.current.y)
          ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y)
        } else {
          ctx.moveTo(last.x, last.y)
          ctx.lineTo(mid.x, mid.y)
        }
        lastMid.current = mid
      }

      ctx.stroke()
      lastPos.current = pos
    }

    canvas.addEventListener('pointerdown',  onDown, { passive: false })
    canvas.addEventListener('pointermove',  onMove, { passive: false })
    window.addEventListener('pointerup',     endStroke)
    window.addEventListener('pointercancel', endStroke)

    return () => {
      canvas.removeEventListener('pointerdown',  onDown)
      canvas.removeEventListener('pointermove',  onMove)
      window.removeEventListener('pointerup',     endStroke)
      window.removeEventListener('pointercancel', endStroke)
    }
  }, [])

  function undo() {
    if (history.current.length <= 1) return
    history.current = history.current.slice(0, -1)
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    ctx.putImageData(history.current[history.current.length - 1], 0, 0)
    setCanUndo(history.current.length > 1)
    onChangeRef.current(canvas.toDataURL('image/png').split(',')[1])
  }

  function clear() {
    initCanvas()
    onChange('')
  }

  const btnBase: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
  }

  return (
    <div
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      onMouseDown={e => e.preventDefault()}
    >
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {(['pen', 'eraser'] as const).map(t => (
          <button key={t} onClick={() => setTool(t)} disabled={disabled} style={{
            ...btnBase,
            background: tool === t ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${tool === t ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: tool === t ? '#60a5fa' : '#6b7280',
          }}>
            {t === 'pen' ? <Pen size={11} /> : <Eraser size={11} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button onClick={undo} disabled={disabled || !canUndo} style={{
          ...btnBase,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          color: canUndo ? '#94a3b8' : '#374151',
          cursor: canUndo ? 'pointer' : 'not-allowed',
          opacity: canUndo ? 1 : 0.4,
        }}>
          <Undo2 size={11} /> Undo
        </button>
        <button onClick={clear} disabled={disabled} style={{
          ...btnBase,
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171',
        }}>
          <Trash2 size={11} /> Clear
        </button>
      </div>

      {showScribbleBanner && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
          marginBottom: 8, padding: '8px 10px', borderRadius: 8,
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)',
        }}>
          <p style={{ fontSize: 11, color: '#fbbf24', margin: 0, lineHeight: 1.5 }}>
            <strong>iPad tip:</strong> For smooth drawing, go to{' '}
            <strong>Settings → Apple Pencil</strong> and turn off <strong>Scribble</strong>.
          </p>
          <button
            onClick={() => { localStorage.setItem('scribble-dismissed', '1'); setShowScribbleBanner(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fbbf24', padding: 0, flexShrink: 0 }}>
            <X size={13} />
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={640}
        height={height}
        style={{
          width: '100%', height: height, display: 'block',
          background: '#fff', borderRadius: 4,
          border: '1px solid #aaa',
          touchAction: 'none',
          cursor: disabled ? 'default' : tool === 'eraser' ? 'cell' : 'crosshair',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #d0d7de 31px, #d0d7de 32px)',
        }}
      />
    </div>
  )
}
