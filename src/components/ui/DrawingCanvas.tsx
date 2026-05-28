'use client'

import { useRef, useState, useEffect, useCallback, type CSSProperties } from 'react'
import { Pen, Eraser, Trash2, Undo2 } from 'lucide-react'

interface Props {
  onChange: (base64: string) => void
  marks?: number
  disabled?: boolean
}

export function DrawingCanvas({ onChange, marks = 3, disabled }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const isDrawingRef = useRef(false)
  const [canUndo, setCanUndo] = useState(false)
  const lastPos   = useRef<{ x: number; y: number } | null>(null)
  const lastMid   = useRef<{ x: number; y: number } | null>(null)
  const history   = useRef<ImageData[]>([])
  const height    = Math.max(140, marks * 38)

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

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = '* { -webkit-user-select: none !important; user-select: none !important; }'
    document.head.appendChild(style)

    const prevent = (e: Event) => e.preventDefault()
    document.addEventListener('selectstart', prevent)
    const canvas = canvasRef.current
    canvas?.addEventListener('contextmenu', prevent)

    return () => {
      document.head.removeChild(style)
      document.removeEventListener('selectstart', prevent)
      canvas?.removeEventListener('contextmenu', prevent)
    }
  }, [])

  function saveSnapshot() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
    history.current = [...history.current, snap].slice(-20)
    setCanUndo(true)
  }

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect   = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width  / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height),
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return
    if (e.pointerType === 'touch') return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const pos = getPos(e)
    lastPos.current = pos
    lastMid.current = null
    isDrawingRef.current = true
    const ctx  = canvasRef.current!.getContext('2d')!
    const size = tool === 'eraser' ? 18 : Math.max(1.5, (e.pressure || 1) * 2.5)
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : '#111827'
    ctx.beginPath(); ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2); ctx.fill()
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current || disabled || e.pointerType === 'touch') return
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    const pos    = getPos(e)
    const last   = lastPos.current!

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : '#111827'
    ctx.lineWidth   = tool === 'eraser' ? 18 : Math.max(1.5, (e.pressure || 1) * 2.5)
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.beginPath()

    if (tool === 'eraser') {
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

  function onPointerUp() {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    lastPos.current = null
    lastMid.current = null
    saveSnapshot()
    notify()
  }

  function undo() {
    if (history.current.length <= 1) return
    history.current = history.current.slice(0, -1)
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    ctx.putImageData(history.current[history.current.length - 1], 0, 0)
    setCanUndo(history.current.length > 1)
    notify()
  }

  function notify() {
    const canvas = canvasRef.current!
    onChange(canvas.toDataURL('image/png').split(',')[1])
  }

  function clear() { initCanvas(); onChange('') }

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

      <canvas
        ref={canvasRef}
        width={640}
        height={height}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onMouseDown={e => e.preventDefault()}
        onDoubleClick={e => e.preventDefault()}
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
