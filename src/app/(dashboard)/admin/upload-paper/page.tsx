'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle, FileText, Image } from 'lucide-react'

const EXAM_BOARDS = ['AQA', 'Edexcel', 'OCR']
const LEVELS      = ['A-Level', 'GCSE']

export default function UploadPaperPage() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [file,        setFile]        = useState<File | null>(null)
  const [title,       setTitle]       = useState('')
  const [examBoard,   setExamBoard]   = useState('AQA')
  const [level,       setLevel]       = useState('A-Level')
  const [year,        setYear]        = useState('')
  const [paperNumber, setPaperNumber] = useState('')
  const [uploading,   setUploading]   = useState(false)
  const [result,      setResult]      = useState<{ ok: boolean; message: string } | null>(null)

  const isPDF   = file?.name.endsWith('.pdf')
  const isImage = file && /\.(jpe?g|png|webp)$/i.test(file.name)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title) return
    setUploading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file',         file)
      form.append('title',        title)
      form.append('exam_board',   examBoard)
      form.append('level',        level)
      if (year)        form.append('year',         year)
      if (paperNumber) form.append('paper_number', paperNumber)

      const res  = await fetch('/api/papers/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (res.ok) {
        setResult({ ok: true, message: `Uploaded successfully — ${data.chunks} chunks indexed.` })
        setFile(null); setTitle(''); setYear(''); setPaperNumber('')
        if (fileRef.current) fileRef.current.value = ''
      } else {
        setResult({ ok: false, message: data.error ?? 'Upload failed' })
      }
    } catch (err: unknown) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Network error' })
    }
    setUploading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Past Paper</h1>
        <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>
          Add a PDF or photo of a past paper to the question bank. It will be chunked, embedded, and used to improve paper generation and topic frequency data.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* File picker */}
        <div className="p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer"
          style={{ borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.04)' }}
          onClick={() => fileRef.current?.click()}>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              {isPDF   ? <FileText size={20} style={{ color: '#60a5fa' }} />
                       : <Image    size={20} style={{ color: '#34d399' }} />}
              <span className="text-sm font-medium text-white">{file.name}</span>
              <span className="text-xs" style={{ color: '#5a7aaa' }}>({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
          ) : (
            <div>
              <Upload size={24} className="mx-auto mb-2" style={{ color: '#5a7aaa' }} />
              <p className="text-sm" style={{ color: '#5a7aaa' }}>Click to select a PDF or photo (JPEG / PNG)</p>
            </div>
          )}
        </div>

        {isImage && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
            Image detected — text will be extracted using AI vision. Make sure the photo is clear and well-lit.
          </p>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#5a7aaa' }}>Title *</label>
          <input
            value={title} onChange={e => setTitle(e.target.value)} required
            placeholder="e.g. AQA A-Level Maths Paper 1 2023"
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Exam board + Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#5a7aaa' }}>Exam Board</label>
            <select value={examBoard} onChange={e => setExamBoard(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}>
              {EXAM_BOARDS.map(b => <option key={b} value={b} style={{ background: '#1e3a5f' }}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#5a7aaa' }}>Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}>
              {LEVELS.map(l => <option key={l} value={l} style={{ background: '#1e3a5f' }}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Year + Paper number */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#5a7aaa' }}>Year</label>
            <input
              type="number" value={year} onChange={e => setYear(e.target.value)}
              placeholder="e.g. 2023" min="2000" max="2030"
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#5a7aaa' }}>Paper Number</label>
            <input
              type="number" value={paperNumber} onChange={e => setPaperNumber(e.target.value)}
              placeholder="e.g. 1, 2, or 3" min="1" max="3"
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={!file || !title || uploading}
          className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
          style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', color: '#60a5fa' }}>
          {uploading ? 'Uploading & processing...' : 'Upload Paper'}
        </button>

        {/* Result */}
        {result && (
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              background: result.ok ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
              border: `1px solid ${result.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
            {result.ok
              ? <CheckCircle size={16} style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }} />
              : <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />}
            <p className="text-sm" style={{ color: result.ok ? '#86efac' : '#fca5a5' }}>{result.message}</p>
          </div>
        )}
      </form>
    </div>
  )
}
