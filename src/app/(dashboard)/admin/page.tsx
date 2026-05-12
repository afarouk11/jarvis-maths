'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'

const TYPES = [
  { value: 'worked_example', label: 'Worked Example' },
  { value: 'concept',        label: 'Concept / Theory' },
  { value: 'formula',        label: 'Formula / Identity' },
  { value: 'tip',            label: 'Exam Tip' },
]

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

  const [form, setForm] = useState({
    topic_slug: '',
    type: 'worked_example',
    title: '',
    content: '',
  })

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setAuthorized(user?.email === 'adamfarouk7@hotmail.com')
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

  if (authorized === null) return null
  if (!authorized) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-400">Not authorised.</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
        <p className="text-sm text-slate-400 mt-1">Add worked examples, concepts, and formulas for SPOK to retrieve.</p>
      </div>

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
    </div>
  )
}
