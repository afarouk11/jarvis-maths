'use client'

import { useRef, useState, useEffect, useLayoutEffect, useCallback, type CSSProperties } from 'react'
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

  const initialHeight     = Math.max(140, marks * 38)
  const [cssHeight, setCssHeight] = useState(initialHeight)
  const cssHeightRef      = useRef(initialHeight)
  const pendingScrollRef  = useRef<number | null>(null)

  const isDrawingRef      = useRef(false)
  const activePointerRef  = useRef<number | null>(null)
  const lastPos           = useRef<{ x: number; y: number } | null>(null)
  const lastMid           = useRef<{ x: number; y: number } | null>(null)
  const lastLineWidth     = useRef(1.5)
  const history           = useRef<ImageData[]>([])
  const toolRef           = useRef(tool)
  const onChangeRef       = useRef(onChange)
  const disabledRef       = useRef(disabled)
  const setCanUndoRef     = useRef(setCanUndo)

  useEffect(() => { toolRef.current    = tool    }, [tool])
  useEffect(() => { onChangeRef.current  = onChange  }, [onChange])
  useEffect(() => { disabledRef.current  = disabled  }, [disabled])

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr      = window.devicePixelRatio || 1
    const rect     = canvas.getBoundingClientRect()
    const logicalW = rect.width  || 640
    const logicalH = rect.height || cssHeightRef.current

    // Set physical pixel dimensions for full retina resolution
    canvas.width  = Math.round(logicalW * dpr)
    canvas.height = Math.round(logicalH * dpr)

    const ctx = canvas.getContext('2d')!
    // Scale once so all draw calls use CSS pixel coordinates
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.clearRect(0, 0, logicalW, logicalH)
    history.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)]
    setCanUndo(false)
  }, [])

  // useLayoutEffect so DPR dimensions are set before the first paint
  useLayoutEffect(() => { initCanvas() }, [initCanvas])

  // Restore scroll position after canvas height expands (runs before browser paints)
  useLayoutEffect(() => {
    if (pendingScrollRef.current === null) return
    window.scrollTo(0, pendingScrollRef.current)
    pendingScrollRef.current = null
  }, [cssHeight])

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

  // All pointer handling via native listeners — bypasses React scheduling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // getPos returns CSS pixel coordinates; ctx.setTransform handles DPR scaling
    function getPos(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function endStroke(e: PointerEvent) {
      if (e.pointerId !== activePointerRef.current) return
      if (!isDrawingRef.current) return

      isDrawingRef.current     = false
      activePointerRef.current = null
      lastPos.current          = null
      lastMid.current          = null

      try { canvas!.releasePointerCapture(e.pointerId) } catch { /* already released */ }

      // Defer GPU readback so it doesn't block the next pointerdown on iPad
      const c = canvas!
      setTimeout(() => {
        const ctx  = c.getContext('2d')!
        const snap = ctx.getImageData(0, 0, c.width, c.height)
        history.current = [...history.current, snap].slice(-20)
        setCanUndoRef.current(true)

        // Composite white background before export so AI receives dark ink on
        // white rather than dark ink on transparency
        const flat = document.createElement('canvas')
        flat.width  = c.width
        flat.height = c.height
        const fctx = flat.getContext('2d')!
        fctx.fillStyle = '#ffffff'
        fctx.fillRect(0, 0, flat.width, flat.height)
        fctx.drawImage(c, 0, 0)
        onChangeRef.current(flat.toDataURL('image/png').split(',')[1])
      }, 0)
    }

    function onDown(e: PointerEvent) {
      if (disabledRef.current) return
      if (e.pointerType === 'touch') return
      e.preventDefault()

      // Hard reset in case a previous pointerup was missed
      isDrawingRef.current     = false
      activePointerRef.current = null
      lastPos.current          = null
      lastMid.current          = null

      canvas!.setPointerCapture(e.pointerId)
      activePointerRef.current = e.pointerId
      isDrawingRef.current     = true

      const pos  = getPos(e)
      lastPos.current = pos

      const isEraser = toolRef.current === 'eraser'
      const size     = isEraser ? 18 : Math.max(1, (e.pressure || 0.5) * 4)
      lastLineWidth.current = size

      const ctx = canvas!.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over'
      ctx.beginPath()
      ctx.fillStyle = isEraser ? 'rgba(0,0,0,1)' : '#111827'
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }

    function expandCanvas() {
      const dpr        = window.devicePixelRatio || 1
      const ctx        = canvas!.getContext('2d')!
      const imageData  = ctx.getImageData(0, 0, canvas!.width, canvas!.height)
      const newLogicalH = cssHeightRef.current + 400

      // Update ref immediately so onMove won't re-trigger before React re-renders
      cssHeightRef.current = newLogicalH
      pendingScrollRef.current = window.scrollY

      canvas!.height = Math.round(newLogicalH * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.putImageData(imageData, 0, 0)

      setCssHeight(newLogicalH)
    }

    function onMove(e: PointerEvent) {
      if (!isDrawingRef.current || disabledRef.current) return
      if (e.pointerType === 'touch') return
      if (e.pointerId !== activePointerRef.current) return
      e.preventDefault()

      const ctx     = canvas!.getContext('2d')!
      const pos     = getPos(e)
      const last    = lastPos.current!
      const isEraser = toolRef.current === 'eraser'

      // Lerp line width to avoid sudden jumps from pressure changes
      const targetWidth = isEraser ? 18 : Math.max(1, (e.pressure || 0.5) * 4)
      const newWidth    = lastLineWidth.current + (targetWidth - lastLineWidth.current) * 0.4
      lastLineWidth.current = newWidth

      ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over'
      ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : '#111827'
      ctx.lineWidth   = newWidth
      ctx.lineCap     = 'round'
      ctx.lineJoin    = 'round'
      ctx.beginPath()

      if (isEraser) {
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
      ctx.globalCompositeOperation = 'source-over'
      lastPos.current = pos

      // Expand canvas when drawing within 100px of the bottom
      if (pos.y > cssHeightRef.current - 100) expandCanvas()
    }

    canvas.addEventListener('pointerdown',  onDown,     { passive: false })
    canvas.addEventListener('pointermove',  onMove,     { passive: false })
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
    cssHeightRef.current = initialHeight
    setCssHeight(initialHeight)
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

      <div style={{
        borderRadius: 4, border: '1px solid #aaa', overflow: 'hidden',
        background: '#ffffff',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #d0d7de 31px, #d0d7de 32px)',
      }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%', height: cssHeight, display: 'block',
            background: 'transparent',
            touchAction: 'none',
            cursor: disabled ? 'default' : tool === 'eraser' ? 'cell' : 'crosshair',
          }}
        />
      </div>
    </div>
  )
}
