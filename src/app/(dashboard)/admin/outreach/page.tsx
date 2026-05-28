'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Send, BarChart2, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'

interface Stats {
  pending?: number
  sent?: number
  bounced?: number
  replied?: number
  opted_out?: number
}

interface PreviewRow {
  id: string
  school_name: string
  contact_email: string
  borough: string
  status: string
  sent_at: string | null
}

const STATUS_COLOR: Record<string, string> = {
  pending:   '#60a5fa',
  sent:      '#4ade80',
  bounced:   '#f87171',
  replied:   '#a78bfa',
  opted_out: '#6b7280',
}

export default function OutreachPage() {
  const [authorized,  setAuthorized]  = useState<boolean | null>(null)
  const [stats,       setStats]       = useState<Stats>({})
  const [preview,     setPreview]     = useState<PreviewRow[]>([])
  const [sending,     setSending]     = useState(false)
  const [log,         setLog]         = useState<string[]>([])
  const [batchSize,   setBatchSize]   = useState(20)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthorized(false); return }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      setAuthorized(data?.is_admin ?? false)
      if (data?.is_admin) loadStats()
    }
    init()
  }, [])

  async function loadStats() {
    const res = await fetch('/api/admin/outreach')
    const d = await res.json()
    setStats(d.stats ?? {})
    setPreview(d.preview ?? [])
  }

  async function send(dryRun: boolean) {
    setSending(true)
    setLog(l => [...l, `${dryRun ? '[DRY RUN] ' : ''}Sending batch of ${batchSize}...`])
    const res = await fetch('/api/admin/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun, limit: batchSize }),
    })
    const d = await res.json()
    const msg = dryRun
      ? `Dry run complete — would send to ${d.sent} schools.`
      : `Sent ${d.sent} emails. Failed: ${d.failed}.`
    setLog(l => [...l, msg, ...d.errors])
    setSending(false)
    if (!dryRun) loadStats()
  }

  if (authorized === null) {
    return <div className="p-8 text-sm" style={{ color: '#5a7aaa' }}>Loading…</div>
  }
  if (authorized === false) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm" style={{ color: '#f87171' }}>
        <AlertTriangle size={16} /> Admin access required.
      </div>
    )
  }

  const total = Object.values(stats).reduce((s, n) => s + (n ?? 0), 0)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)' }}>
          <Mail size={20} style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">School Outreach</h1>
          <p className="text-xs" style={{ color: '#5a7aaa' }}>Automated free-term proposal emails to London secondary schools</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { key: 'pending',   label: 'Pending',   icon: <Clock size={14} /> },
          { key: 'sent',      label: 'Sent',      icon: <CheckCircle2 size={14} /> },
          { key: 'replied',   label: 'Replied',   icon: <Mail size={14} /> },
          { key: 'bounced',   label: 'Bounced',   icon: <XCircle size={14} /> },
          { key: 'opted_out', label: 'Opted out', icon: <XCircle size={14} /> },
        ].map(({ key, label, icon }) => {
          const color = STATUS_COLOR[key] ?? '#60a5fa'
          const count = stats[key as keyof Stats] ?? 0
          return (
            <div key={key} className="p-3 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex justify-center mb-1.5" style={{ color }}>{icon}</div>
              <p className="text-xl font-bold" style={{ color, fontFamily: 'var(--font-space-grotesk)' }}>{count}</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#5a7aaa' }}>{label}</p>
            </div>
          )
        })}
      </div>

      {total > 0 && (
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#5a7aaa' }}>
            <span>Send progress</span>
            <span>{stats.sent ?? 0} / {total}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{
              background: 'linear-gradient(90deg, #4ade80, #3b82f6)',
              width: `${total > 0 ? Math.round(((stats.sent ?? 0) / total) * 100) : 0}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-sm font-semibold text-white">Send next batch</h2>
        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: '#5a7aaa' }}>Batch size (max 50)</label>
            <input
              type="number"
              value={batchSize}
              onChange={e => setBatchSize(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-24 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => send(true)}
              disabled={sending}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
              Dry run
            </button>
            <button
              onClick={() => send(false)}
              disabled={sending || (stats.pending ?? 0) === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', color: '#93c5fd' }}>
              <Send size={14} />
              {sending ? 'Sending…' : `Send ${batchSize} emails`}
            </button>
          </div>
        </div>

        {log.length > 0 && (
          <div className="rounded-xl p-3 space-y-1 font-mono text-xs overflow-y-auto max-h-40"
            style={{ background: 'rgba(0,0,0,0.3)', color: '#94a3b8' }}>
            {log.map((line, i) => <p key={i} className="leading-relaxed">{line}</p>)}
          </div>
        )}
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Next up — pending schools (first 20)</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {preview.map((row, i) => (
              <div key={row.id}
                className="flex items-center gap-4 px-4 py-3 text-sm"
                style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                  borderBottom: i < preview.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined,
                }}>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{row.school_name}</p>
                  <p className="text-xs truncate" style={{ color: '#5a7aaa' }}>{row.contact_email}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: '#3a4a5c' }}>{row.borough}</span>
                <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: `${STATUS_COLOR[row.status] ?? '#60a5fa'}18`, color: STATUS_COLOR[row.status] ?? '#60a5fa' }}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs" style={{ color: '#3a4a5c' }}>
        Tip: Run "Dry run" first to confirm batch size without sending. Max 50 emails per click to protect sender reputation.
        Seed the table by running <code>npx ts-node scripts/seed-london-schools.ts</code> locally.
      </p>
    </div>
  )
}
