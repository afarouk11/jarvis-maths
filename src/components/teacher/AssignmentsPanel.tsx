'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS } from '@/lib/curriculum/gcse-topics'

interface Assignment {
  id: string
  title: string
  type: 'topic' | 'paper'
  topic_slug: string | null
  due_date: string | null
  total: number
  completed: number
}

const UNIQUE_TOPICS = Array.from(
  new Map([...AQA_TOPICS, ...GCSE_TOPICS].map(t => [t.slug, { slug: t.slug, name: t.name }])).values(),
)

const selectStyle: React.CSSProperties = {
  background: '#13233f', border: '1px solid rgba(59,130,246,0.3)', color: '#e8f0fe',
  borderRadius: 8, fontSize: 13, padding: '8px 10px', outline: 'none', width: '100%',
}

export function AssignmentsPanel({ classCodes }: { classCodes: string[] }) {
  const [items, setItems] = useState<Assignment[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'topic' | 'paper'>('topic')
  const [topicSlug, setTopicSlug] = useState(UNIQUE_TOPICS[0]?.slug ?? '')
  const [classCode, setClassCode] = useState(classCodes[0] ?? '')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/teacher/assignments')
    if (res.ok) setItems((await res.json()).assignments ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function create() {
    if (!title.trim() || !classCode) return
    setSaving(true)
    await fetch('/api/teacher/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, topicSlug: type === 'topic' ? topicSlug : undefined, classCode, dueDate: dueDate || undefined }),
    }).catch(() => {})
    setSaving(false)
    setOpen(false)
    setTitle('')
    setDueDate('')
    load()
  }

  async function remove(id: string) {
    await fetch('/api/teacher/assignments', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).catch(() => {})
    load()
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.18)' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-white">Assignments</p>
          <p className="text-xs" style={{ color: '#5a7aaa' }}>Set work for a class — completion tracks automatically.</p>
        </div>
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#c4b5fd' }}>
          <Plus size={13} /> Set work
        </button>
      </div>

      {open && (
        <div className="space-y-2 mb-4 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title, e.g. Revise integration"
            style={selectStyle} />
          <div className="grid grid-cols-2 gap-2">
            <select value={type} onChange={e => setType(e.target.value as 'topic' | 'paper')} style={selectStyle}>
              <option value="topic" style={{ background: '#13233f' }}>Topic practice</option>
              <option value="paper" style={{ background: '#13233f' }}>Mock paper</option>
            </select>
            <select value={classCode} onChange={e => setClassCode(e.target.value)} style={selectStyle}>
              {classCodes.map(c => <option key={c} value={c} style={{ background: '#13233f' }}>{c}</option>)}
            </select>
          </div>
          {type === 'topic' && (
            <select value={topicSlug} onChange={e => setTopicSlug(e.target.value)} style={selectStyle}>
              {UNIQUE_TOPICS.map(t => <option key={t.slug} value={t.slug} style={{ background: '#13233f' }}>{t.name}</option>)}
            </select>
          )}
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={selectStyle} />
          <button onClick={create} disabled={saving || !title.trim() || !classCode}
            className="w-full py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#c4b5fd' }}>
            {saving ? 'Setting…' : 'Set assignment'}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-xs text-center py-3" style={{ color: '#5a7aaa' }}>No assignments yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map(a => {
            const pct = a.total > 0 ? Math.round((a.completed / a.total) * 100) : 0
            const overdue = a.due_date && new Date(a.due_date) < new Date()
            return (
              <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{a.title}</p>
                  <p className="text-xs" style={{ color: overdue ? '#f87171' : '#5a7aaa' }}>
                    {a.type === 'paper' ? 'Mock paper' : 'Topic practice'}
                    {a.due_date ? ` · due ${new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                  </p>
                </div>
                <span className="text-xs font-mono shrink-0" style={{ color: pct === 100 ? '#4ade80' : '#94a3b8' }}>
                  {a.completed}/{a.total}
                </span>
                <button onClick={() => remove(a.id)} className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: '#5a7aaa' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
