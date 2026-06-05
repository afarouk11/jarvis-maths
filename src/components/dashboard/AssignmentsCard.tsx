'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Check } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  type: 'topic' | 'paper'
  topic_slug: string | null
  due_date: string | null
  completed: boolean
}

export function AssignmentsCard() {
  const [items, setItems] = useState<Assignment[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/assignments')
      .then(r => (r.ok ? r.json() : { assignments: [] }))
      .then(d => { setItems(d.assignments ?? []); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  // Nothing to show for students with no teacher / no assignments.
  if (!loaded || items.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">From your teacher</h2>
      </div>
      <div className="space-y-2">
        {items.map(a => {
          const href = a.type === 'paper' ? '/papers' : `/practice?topic=${a.topic_slug ?? ''}`
          const overdue = !a.completed && a.due_date && new Date(a.due_date) < new Date()
          return (
            <Link key={a.id} href={href}
              className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
              style={{
                background: a.completed ? 'rgba(34,197,94,0.06)' : 'rgba(99,102,241,0.06)',
                border: `1px solid ${a.completed ? 'rgba(34,197,94,0.18)' : 'rgba(99,102,241,0.18)'}`,
              }}>
              <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: a.completed ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)', color: a.completed ? '#4ade80' : '#818cf8' }}>
                {a.completed ? <Check size={14} /> : <FileText size={13} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate" style={{ textDecoration: a.completed ? 'line-through' : 'none', opacity: a.completed ? 0.7 : 1 }}>
                  {a.title}
                </p>
                <p className="text-xs" style={{ color: overdue ? '#f87171' : '#5a7aaa' }}>
                  {a.completed ? 'Done' : a.due_date ? `Due ${new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Set by your teacher'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
