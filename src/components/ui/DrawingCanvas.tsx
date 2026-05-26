'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Pen, Eraser, Trash2 } from 'lucide-react'

interface Props {
  onChange: (base64: string) => void
  marks?: number
  disabled?: boolean
}

export function DrawingCanvas({ onChange, marks = 3, disabled }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const [tool, setTool]         = useState<'pen' | 'eraser'>('pen')
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
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
  }, [])

  useEffect(() => { initCanvas() }, [initCanvas])

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
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const pos = getPos(e)
    lastPos.current = pos
    setIsDrawing(true)
    const ctx  = canvasRef.current!.getContext('2d')!
    const size = tool === 'eraser' ? 18 : Math.max(1.5, (e.pressure || 1) * 2.5)
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : '#111827'
    ctx.beginPath(); ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2); ctx.fill()
    notify()
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing || disabled) return
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    const pos    = getPos(e)
    const last   = lastPos.current!
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(pos.x,  pos.y)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : '#111827'
    ctx.lineWidth   = tool === 'eraser' ? 18 : Math.max(1.5, (e.pressure || 1) * 2.5)
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    lastPos.current = pos
    notify()
  }

  function onPointerUp() { setIsDrawing(false); lastPos.current = null }

  function notify() {
    const canvas = canvasRef.current!
    onChange(canvas.toDataURL('image/png').split(',')[1])
  }

  function clear() { initCanvas(); onChange('') }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {(['pen', 'eraser'] as const).map(t => (
          <button key={t} onClick={() => setTool(t)} disabled={disabled}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
              background: tool === t ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tool === t ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: tool === t ? '#60a5fa' : '#6b7280',
            }}>
            {t === 'pen' ? <Pen size={11} /> : <Eraser size={11} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button onClick={clear} disabled={disabled}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
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
        style={{
          width: '100%', height: height, display: 'block',
          background: '#fff', borderRadius: 4,
          border: '1px solid #aaa',
          touchAction: 'none',
          cursor: disabled ? 'default' : tool === 'eraser' ? 'cell' : 'crosshair',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #d0d7de 31px, #d0d7de 32px)',
        }}
      />
      <p style={{ fontSize: 11, color: '#4a6070', marginTop: 5 }}>
        Apple Pencil, stylus, or finger — write your working in the space above
      </p>
    </div>
  )
}
