'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const EXAM_BOARDS  = ['AQA', 'Edexcel', 'OCR']
const TARGET_GRADES = ['A*', 'A', 'B', 'C']

interface Props {
  initialFullName:    string
  initialExamBoard:   string
  initialTargetGrade: string
  initialExamDate:    string
}

export function ProfileSettings({ initialFullName, initialExamBoard, initialTargetGrade, initialExamDate }: Props) {
  const router = useRouter()
  const [fullName,    setFullName]    = useState(initialFullName)
  const [examBoard,   setExamBoard]   = useState(initialExamBoard)
  const [targetGrade, setTargetGrade] = useState(initialTargetGrade)
  const [examDate,    setExamDate]    = useState(initialExamDate)
  const [dyslexia,    setDyslexia]    = useState(false)
  const [adhd,        setAdhd]        = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)

  // Load accessibility prefs from profile
  useState(() => {
    fetch('/api/profile').then(r => r.json()).then((p: any) => {
      setDyslexia(p.dyslexia_mode ?? false)
      setAdhd(p.adhd_mode ?? false)
    }).catch(() => {})
  })

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/sign-in')
  }

  async function save() {
    setSaving(true)
    await fetch('/api/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, examBoard, targetGrade, examDate, dyslexiaMode: dyslexia, adhdMode: adhd }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const input = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none'
  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }

  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>

      <div>
        <label className="text-xs text-slate-500 mb-1 block">Full Name</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)}
          placeholder="Your name" className={input} style={inputStyle} />
      </div>

      <div>
        <label className="text-xs text-slate-500 mb-2 block">Exam Board</label>
        <div className="flex gap-2">
          {EXAM_BOARDS.map(b => (
            <button key={b} onClick={() => setExamBoard(b)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: examBoard === b ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${examBoard === b ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: examBoard === b ? '#f59e0b' : '#94a3b8',
              }}>
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 mb-2 block">Target Grade</label>
        <div className="flex gap-2">
          {TARGET_GRADES.map(g => (
            <button key={g} onClick={() => setTargetGrade(g)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: targetGrade === g ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${targetGrade === g ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: targetGrade === g ? '#f59e0b' : '#94a3b8',
              }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 mb-1 block">Exam Date</label>
        <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
          className={input} style={inputStyle} />
      </div>

      <div>
        <label className="text-xs text-slate-500 mb-2 block">Learning Needs</label>
        <div className="space-y-2">
          {[
            { key: 'dyslexia', label: 'Dyslexia-friendly', desc: 'OpenDyslexic font, shorter sentences, bullet points', active: dyslexia, set: setDyslexia },
            { key: 'adhd',     label: 'ADHD mode',         desc: 'Bite-sized steps, frequent check-ins',              active: adhd,     set: setAdhd },
          ].map(opt => (
            <button key={opt.key} onClick={() => opt.set(v => !v)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
              style={{
                background: opt.active ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${opt.active ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: opt.active ? '#f59e0b' : '#94a3b8' }}>{opt.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>{opt.desc}</p>
              </div>
              <div className="w-9 h-5 rounded-full transition-all relative shrink-0"
                style={{ background: opt.active ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: opt.active ? '18px' : '2px' }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={save} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        style={{
          background: saved ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
          border: `1px solid ${saved ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.35)'}`,
          color: saved ? '#22c55e' : '#f59e0b',
        }}>
        {saved ? <><Check size={14} /> Saved</> : saving ? 'Saving...' : 'Save changes'}
      </motion.button>
    </div>
  )
}
