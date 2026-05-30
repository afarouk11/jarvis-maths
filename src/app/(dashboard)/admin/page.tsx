'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { Database, Clapperboard, FileText } from 'lucide-react'

const TYPES = [
  { value: 'worked_example', label: 'Worked Example' },
  { value: 'concept',        label: 'Concept / Theory' },
  { value: 'formula',        label: 'Formula / Identity' },
  { value: 'tip',            label: 'Exam Tip' },
]

interface OfficialPaperRow {
  id: string
  title: string
  board: string
  year: number
  paper: number
  pdf_url: string | null
  mark_scheme_url: string | null
  created_at: string
}

interface CreatorVideoRow {
  id: string
  creator_name: string
  creator_handle: string | null
  title: string
  youtube_id: string
  topic_tag: string | null
  approved: boolean
  created_at: string
}

interface Entry {
  id: string
  topic_slug: string | null
  type: string
  title: string
  content: string
  created_at: string
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [entries, setEntries]       = useState<Entry[]>([])
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [toast, setToast]           = useState('')
  const [tab, setTab]               = useState<'knowledge' | 'creators' | 'papers'>('knowledge')

  // Official papers state
  const [officialPapers, setOfficialPapers]   = useState<OfficialPaperRow[]>([])
  const [paperSaving, setPaperSaving]         = useState(false)
  const [paperDeleting, setPaperDeleting]     = useState<string | null>(null)
  const [paperForm, setPaperForm]             = useState({
    title: '', board: 'Edexcel', year: new Date().getFullYear(), paper: 1, pdf_url: '', mark_scheme_url: '',
  })

  // Creators state
  const [videos, setVideos]         = useState<CreatorVideoRow[]>([])
  const [videoSaving, setVideoSaving] = useState(false)
  const [videoDeleting, setVideoDeleting] = useState<string | null>(null)
  const [videoForm, setVideoForm]   = useState({
    creator_name: '', creator_handle: '', title: '',
    youtube_url: '', topic_tag: '', description: '', approved: false,
  })

  const [form, setForm] = useState({
    topic_slug: '',
    type: 'worked_example',
    title: '',
    content: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setAuthorized(false); return }
      const { data: prof } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      setAuthorized(prof?.is_admin ?? false)
    })
  }, [])

  useEffect(() => {
    if (!authorized) return
    createClient()
      .from('knowledge_base')
      .select('id, topic_slug, type, title, content, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => setEntries(data ?? []))
  }, [authorized])

  useEffect(() => {
    if (!authorized) return
    fetch('/api/papers/official')
      .then(r => r.json())
      .then(d => setOfficialPapers(d.papers ?? []))
  }, [authorized])

  useEffect(() => {
    if (!authorized) return
    createClient()
      .from('creator_videos')
      .select('id, creator_name, creator_handle, title, youtube_id, topic_tag, approved, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => setVideos(data ?? []))
  }, [authorized])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const { id } = await res.json()
      const newEntry: Entry = {
        id,
        ...form,
        topic_slug: form.topic_slug || null,
        created_at: new Date().toISOString(),
      }
      setEntries(prev => [newEntry, ...prev])
      setForm({ topic_slug: '', type: 'worked_example', title: '', content: '' })
      showToast('Saved and embedded.')
    } catch (err: any) {
      showToast('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await fetch('/api/knowledge', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setEntries(prev => prev.filter(e => e.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  async function handleVideoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!videoForm.creator_name.trim() || !videoForm.title.trim() || !videoForm.youtube_url.trim()) return
    setVideoSaving(true)
    try {
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoForm),
      })
      if (!res.ok) throw new Error(await res.text())
      showToast('Creator video added.')
      setVideoForm({ creator_name: '', creator_handle: '', title: '', youtube_url: '', topic_tag: '', description: '', approved: false })
      // reload
      const { data } = await createClient().from('creator_videos').select('id, creator_name, creator_handle, title, youtube_id, topic_tag, approved, created_at').order('created_at', { ascending: false })
      setVideos(data ?? [])
    } catch (err: any) {
      showToast('Error: ' + err.message)
    } finally {
      setVideoSaving(false)
    }
  }

  async function handleVideoApprove(id: string, approved: boolean) {
    await fetch('/api/creators', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    })
    setVideos(prev => prev.map(v => v.id === id ? { ...v, approved } : v))
  }

  async function handleVideoDelete(id: string) {
    setVideoDeleting(id)
    try {
      await fetch('/api/creators', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setVideos(prev => prev.filter(v => v.id !== id))
    } finally {
      setVideoDeleting(null)
    }
  }

  if (authorized === null) return null
  if (!authorized) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-400">Not authorised.</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        <p className="text-sm text-slate-400 mt-1">Manage knowledge base entries and creator videos.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'knowledge', label: 'Knowledge Base', icon: <Database size={13} /> },
          { key: 'creators',  label: 'Creators',       icon: <Clapperboard size={13} /> },
          { key: 'papers',    label: 'Past Papers',    icon: <FileText size={13} /> },
        ] as const).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab === key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tab === key ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: tab === key ? '#a5b4fc' : '#5a7aaa',
            }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {tab === 'knowledge' && <>
      {/* Add form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl p-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Topic (optional)</label>
            <select
              value={form.topic_slug}
              onChange={e => setForm(f => ({ ...f, topic_slug: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="">— Any topic —</option>
              {AQA_TOPICS.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Title</label>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Integration by substitution — chain rule in reverse"
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Content</label>
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Paste worked example, concept explanation, or formula. LaTeX supported."
            rows={8}
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 resize-y"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving || !form.title.trim() || !form.content.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd' }}>
          {saving ? 'Embedding...' : 'Save to Knowledge Base'}
        </button>
      </form>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2 text-sm text-white"
          style={{ background: 'rgba(59,130,246,0.9)' }}>
          {toast}
        </div>
      )}

      {/* Entry list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">{entries.length} entries</h2>
        {entries.map(entry => (
          <div key={entry.id} className="rounded-xl px-4 py-3 flex items-start gap-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}>
                  {TYPES.find(t => t.value === entry.type)?.label ?? entry.type}
                </span>
                {entry.topic_slug && (
                  <span className="text-xs text-slate-500">
                    {AQA_TOPICS.find(t => t.slug === entry.topic_slug)?.name ?? entry.topic_slug}
                  </span>
                )}
              </div>
              <p className="text-sm text-white font-medium truncate">{entry.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{entry.content}</p>
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
              disabled={deleting === entry.id}
              className="text-xs text-red-400 hover:text-red-300 shrink-0 disabled:opacity-40">
              {deleting === entry.id ? '...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
      </>}

      {tab === 'creators' && <>
        {/* Add creator video */}
        <form onSubmit={handleVideoSubmit} className="space-y-4 rounded-xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm font-semibold text-white">Add Creator Video</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Creator name *</label>
              <input value={videoForm.creator_name} onChange={e => setVideoForm(f => ({ ...f, creator_name: e.target.value }))}
                placeholder="e.g. Tibees" className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Handle (no @)</label>
              <input value={videoForm.creator_handle} onChange={e => setVideoForm(f => ({ ...f, creator_handle: e.target.value }))}
                placeholder="tibees" className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Video title *</label>
            <input value={videoForm.title} onChange={e => setVideoForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Integration by Parts Explained" className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">YouTube URL *</label>
            <input value={videoForm.youtube_url} onChange={e => setVideoForm(f => ({ ...f, youtube_url: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=…" className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Topic tag</label>
              <input value={videoForm.topic_tag} onChange={e => setVideoForm(f => ({ ...f, topic_tag: e.target.value }))}
                placeholder="e.g. Integration" className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={videoForm.approved} onChange={e => setVideoForm(f => ({ ...f, approved: e.target.checked }))}
                  className="rounded accent-indigo-500" />
                <span className="text-xs text-slate-400">Approve immediately</span>
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Short description (optional)</label>
            <textarea value={videoForm.description} onChange={e => setVideoForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="One-liner shown under the video title"
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <button type="submit"
            disabled={videoSaving || !videoForm.creator_name.trim() || !videoForm.title.trim() || !videoForm.youtube_url.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}>
            {videoSaving ? 'Saving...' : 'Add Video'}
          </button>
        </form>

        {/* Video list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300">{videos.length} videos</h2>
          {videos.map(v => (
            <div key={v.id} className="rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Thumbnail */}
              <img src={`https://img.youtube.com/vi/${v.youtube_id}/default.jpg`} alt=""
                className="w-16 h-11 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{v.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {v.creator_handle ? `@${v.creator_handle}` : v.creator_name}
                  {v.topic_tag && ` · ${v.topic_tag}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleVideoApprove(v.id, !v.approved)}
                  className="text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{
                    background: v.approved ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                    color: v.approved ? '#4ade80' : '#5a7aaa',
                    border: `1px solid ${v.approved ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {v.approved ? '✓ Live' : 'Approve'}
                </button>
                <button
                  onClick={() => handleVideoDelete(v.id)}
                  disabled={videoDeleting === v.id}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40">
                  {videoDeleting === v.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
          {videos.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: '#3a4a5c' }}>No creator videos yet.</p>
          )}
        </div>
      </>}

      {tab === 'papers' && <>
        {/* Add paper form */}
        <form
          onSubmit={async e => {
            e.preventDefault()
            if (!paperForm.title.trim()) return
            setPaperSaving(true)
            try {
              const res = await fetch('/api/papers/official', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paperForm),
              })
              if (!res.ok) throw new Error(await res.text())
              const row: OfficialPaperRow = await res.json()
              setOfficialPapers(prev => [row, ...prev])
              setPaperForm({ title: '', board: 'Edexcel', year: new Date().getFullYear(), paper: 1, pdf_url: '', mark_scheme_url: '' })
              showToast('Paper added.')
            } catch (err: any) {
              showToast('Error: ' + err.message)
            } finally {
              setPaperSaving(false)
            }
          }}
          className="space-y-4 rounded-xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-sm font-semibold text-white">Add Official Paper</p>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Title *</label>
            <input
              value={paperForm.title}
              onChange={e => setPaperForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. A-Level Mathematics Paper 1 (Pure)"
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Board *</label>
              <select
                value={paperForm.board}
                onChange={e => setPaperForm(f => ({ ...f, board: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="Edexcel">Edexcel</option>
                <option value="AQA">AQA</option>
                <option value="OCR">OCR</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Year *</label>
              <input
                type="number"
                min={2000}
                max={2100}
                value={paperForm.year}
                onChange={e => setPaperForm(f => ({ ...f, year: Number(e.target.value) }))}
                className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Paper *</label>
              <select
                value={paperForm.paper}
                onChange={e => setPaperForm(f => ({ ...f, paper: Number(e.target.value) as 1 | 2 | 3 }))}
                className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value={1}>Paper 1</option>
                <option value={2}>Paper 2</option>
                <option value={3}>Paper 3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Paper PDF URL</label>
            <input
              value={paperForm.pdf_url}
              onChange={e => setPaperForm(f => ({ ...f, pdf_url: e.target.value }))}
              placeholder="https://…"
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Mark Scheme URL</label>
            <input
              value={paperForm.mark_scheme_url}
              onChange={e => setPaperForm(f => ({ ...f, mark_scheme_url: e.target.value }))}
              placeholder="https://…"
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <button
            type="submit"
            disabled={paperSaving || !paperForm.title.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }}
          >
            {paperSaving ? 'Saving…' : 'Add Paper'}
          </button>
        </form>

        {/* Paper list */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-300">{officialPapers.length} papers</p>
          {officialPapers.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: '#3a4a5c' }}>No official papers added yet.</p>
          )}
          {officialPapers.map(p => (
            <div key={p.id} className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{p.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {p.board} · {p.year} · Paper {p.paper}
                  {p.pdf_url && <span className="ml-2 text-indigo-400">PDF ✓</span>}
                  {p.mark_scheme_url && <span className="ml-2 text-green-400">MS ✓</span>}
                </p>
              </div>
              <button
                onClick={async () => {
                  setPaperDeleting(p.id)
                  try {
                    await fetch('/api/papers/official', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: p.id }),
                    })
                    setOfficialPapers(prev => prev.filter(x => x.id !== p.id))
                  } finally {
                    setPaperDeleting(null)
                  }
                }}
                disabled={paperDeleting === p.id}
                className="text-xs text-red-400 hover:text-red-300 shrink-0 disabled:opacity-40"
              >
                {paperDeleting === p.id ? '…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      </>}
    </div>
  )
}
