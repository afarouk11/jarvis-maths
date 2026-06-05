'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, LogOut, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { validateName } from '@/lib/validate-name'
import { LANGUAGES, type Lang } from '@/lib/i18n'

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
  const [language,    setLanguage]    = useState<Lang>('en')
  const [dyslexia,    setDyslexia]    = useState(false)
  const [adhd,        setAdhd]        = useState(false)
  const [emailReminders, setEmailReminders] = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [nameError,   setNameError]   = useState('')
  const [showDelete,  setShowDelete]  = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting,    setDeleting]    = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Load accessibility prefs and language from profile
  useState(() => {
    fetch('/api/profile').then(r => r.json()).then((p: { dyslexia_mode?: boolean; adhd_mode?: boolean; language?: Lang; email_reminders?: boolean }) => {
      setDyslexia(p.dyslexia_mode ?? false)
      setAdhd(p.adhd_mode ?? false)
      setEmailReminders(p.email_reminders ?? true)
      if (p.language) setLanguage(p.language)
    }).catch(() => {})
  })

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/')
  }

  async function deleteAccount() {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    setDeleteError('')
    const res = await fetch('/api/profile/delete', { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setDeleteError(json.error ?? 'Something went wrong.')
      setDeleting(false)
      return
    }
    await createClient().auth.signOut()
    router.push('/')
  }

  async function save() {
    const err = validateName(fullName)
    if (err) { setNameError(err); return }
    setNameError('')
    setSaving(true)
    await fetch('/api/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, examBoard, targetGrade, examDate, dyslexiaMode: dyslexia, adhdMode: adhd, language, emailReminders }),
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
        <input value={fullName} onChange={e => { setFullName(e.target.value); setNameError('') }}
          placeholder="Your name" className={input} style={inputStyle} />
        {nameError && <p className="text-xs mt-1 text-red-400">{nameError}</p>}
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
        <label className="text-xs text-slate-500 mb-2 block">Preferred Language</label>
        <p className="text-xs mb-3" style={{ color: '#5a7aaa' }}>SPOK and the UI will respond in your chosen language</p>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map(l => (
            <button key={l.value} onClick={() => setLanguage(l.value)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-sm transition-all"
              style={{
                background: language === l.value ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${language === l.value ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <span className="text-lg">{l.flag}</span>
              <span className="text-xs font-semibold" style={{ color: language === l.value ? '#f59e0b' : '#94a3b8' }}>{l.native}</span>
            </button>
          ))}
        </div>
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

      <div>
        <label className="text-xs text-slate-500 mb-2 block">Notifications</label>
        <button onClick={() => setEmailReminders(v => !v)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
          style={{
            background: emailReminders ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${emailReminders ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
          }}>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: emailReminders ? '#f59e0b' : '#94a3b8' }}>Email reminders</p>
            <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>Review nudges and streak reminders by email</p>
          </div>
          <div className="w-9 h-5 rounded-full transition-all relative shrink-0"
            style={{ background: emailReminders ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: emailReminders ? '18px' : '2px' }} />
          </div>
        </button>
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

      {/* Danger zone */}
      <div className="rounded-xl p-4 mt-2 space-y-3" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f87171' }}>Delete account</p>
            <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>Permanently removes your account and all data. Cannot be undone.</p>
          </div>
          {!showDelete && (
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>

        {showDelete && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              Type <span className="font-mono font-bold text-white">DELETE</span> to confirm.
            </p>
            <input
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.3)', color: '#e2e8f0' }}
            />
            {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDelete(false); setDeleteInput(''); setDeleteError('') }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
                {deleting ? 'Deleting...' : 'Confirm delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
