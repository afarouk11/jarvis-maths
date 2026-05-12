'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import dynamic from 'next/dynamic'

const JarvisScene = dynamic(
  () => import('@/components/jarvis/JarvisScene').then(m => m.JarvisScene),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
)

const EXAM_BOARDS   = ['AQA', 'Edexcel', 'OCR']

const ALEVEL_GRADES = ['A*', 'A', 'B', 'C']
const GCSE_GRADES   = ['9', '8', '7', '6', '5', '4']

const ALEVEL_YEARS = [
  { value: 'AS',   label: 'Year 12', sub: 'AS Level' },
  { value: 'A2',   label: 'Year 13', sub: 'A2 Level' },
  { value: 'both', label: 'Both',    sub: 'Full A-Level' },
]
const GCSE_YEARS = [
  { value: 'Y10', label: 'Year 10', sub: 'First year' },
  { value: 'Y11', label: 'Year 11', sub: 'Exam year' },
]

const SPOK_LINES = [
  { heading: "Let's do this.", body: "I'm SPOK — your personal maths tutor. I don't just explain things. I build a precise map of what you know, find what you don't, and close the gaps before your exam. Takes 30 seconds to set up." },
  { heading: 'This shapes everything.', body: "GCSE and A-level are completely different — different topics, different depth, different exam style. I need to know which world we're working in so everything I give you is right for your course." },
  { heading: 'This matters more than you think.', body: "AQA, Edexcel, and OCR each have their own style and syllabus. I'll make sure every question I give you is built for your exact exam board — nothing generic, nothing wasted." },
  { heading: 'Aim high.', body: "I'll calibrate every practice session to push you toward that grade. If you're not there yet, we'll close the gap together — starting with the topics costing you the most marks right now." },
  { heading: 'Good to know.', body: "This tells me how much time we have and which topics to hit first. The earlier we build your foundations, the stronger you'll be when it counts." },
  { heading: 'Every day counts.', body: "I'll weight your sessions so that as your exam gets closer, we drill your weakest areas hardest. No last-minute panic — just focused, targeted preparation." },
  { heading: 'This changes how I teach you.', body: "I'll adapt everything — sentence length, structure, pacing — so my explanations work the way your mind works. This isn't a limitation. It's how I make sure I'm genuinely useful to you." },
  { heading: "You're ready.", body: "I know your level, your target, and your timeline. From here, every session is built around getting you to that grade. Let's not waste a minute." },
]

const STEPS = ['Welcome', 'Level', 'Exam Board', 'Target', 'Year Group', 'Exam Date', 'Learning Needs', "Let's go"]

export default function OnboardingPage() {
  const router = useRouter()
  const [step,        setStep]        = useState(0)
  const [level,       setLevel]       = useState<'A-Level' | 'GCSE'>('A-Level')
  const [examBoard,   setExamBoard]   = useState('AQA')
  const [targetGrade, setTargetGrade] = useState('A*')
  const [yearGroup,   setYearGroup]   = useState('AS')
  const [examDate,    setExamDate]    = useState('')
  const [fullName,    setFullName]    = useState('')
  const [dyslexia,    setDyslexia]    = useState(false)
  const [adhd,        setAdhd]        = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const isLast = step === STEPS.length - 1
  const targetGrades = level === 'GCSE' ? GCSE_GRADES : ALEVEL_GRADES
  const yearGroups   = level === 'GCSE' ? GCSE_YEARS  : ALEVEL_YEARS

  async function finish() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, level, examBoard, targetGrade, yearGroup, examDate, dyslexiaMode: dyslexia, adhdMode: adhd }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Something went wrong. Please try again.')
        setSaving(false)
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  function next() {
    if (step === 0 && !fullName.trim()) return
    if (step < STEPS.length - 1) setStep(s => s + 1)
  }

  function back() { if (step > 0) setStep(s => s - 1) }

  const line = SPOK_LINES[step]

  return (
    <div className="min-h-screen flex" style={{ background: '#080d19' }}>

      {/* Left — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 max-w-2xl mx-auto lg:mx-0 lg:max-w-none">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-12">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300"
                style={{
                  background: i < step ? 'rgba(245,158,11,0.9)' : i === step ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${i <= step ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  color: i < step ? '#080d19' : i === step ? '#f59e0b' : '#475569',
                }}>
                {i < step ? <Check size={11} strokeWidth={3} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-6 h-px transition-all duration-300"
                  style={{ background: i < step ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          ))}
        </div>

        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="space-y-7">

              {/* Step 0 — Name */}
              {step === 0 && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Welcome</p>
                    <h1 className="text-3xl font-bold text-white">I'm SPOK.</h1>
                    <p className="text-slate-400 mt-3 leading-relaxed">
                      Your personal Maths tutor for GCSE and A-level. I track exactly what you know, find the gaps
                      costing you marks, and build sessions that get you to your target grade. Takes 30 seconds to set up.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">What should I call you?</label>
                    <input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && next()}
                      placeholder="Your first name"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${fullName.trim() ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0' }}
                    />
                    {!fullName.trim() && <p className="text-xs mt-1.5" style={{ color: '#475569' }}>Required to continue</p>}
                  </div>
                </>
              )}

              {/* Step 1 — Level */}
              {step === 1 && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Your Level</p>
                    <h2 className="text-2xl font-bold text-white">Are you studying GCSE or A-Level?</h2>
                    <p className="text-slate-500 text-sm mt-1">I'll load the right curriculum and questions for your course.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(['A-Level', 'GCSE'] as const).map(l => (
                      <button key={l} onClick={() => {
                        setLevel(l)
                        setTargetGrade(l === 'GCSE' ? '7' : 'A*')
                        setYearGroup(l === 'GCSE' ? 'Y10' : 'AS')
                      }}
                        className="py-6 rounded-xl font-bold transition-all hover:scale-[1.03] flex flex-col items-center gap-1"
                        style={{
                          background: level === l ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${level === l ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: level === l ? '#f59e0b' : '#64748b',
                        }}>
                        <span className="text-lg">{l}</span>
                        <span className="text-xs font-normal opacity-70">
                          {l === 'GCSE' ? 'Years 10–11' : 'Years 12–13'}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 2 — Exam board */}
              {step === 2 && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Exam Board</p>
                    <h2 className="text-2xl font-bold text-white">Which exam board are you sitting?</h2>
                    <p className="text-slate-500 text-sm mt-1">I'll tailor every question to your exact syllabus.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {EXAM_BOARDS.map(b => (
                      <button key={b} onClick={() => setExamBoard(b)}
                        className="py-5 rounded-xl text-sm font-bold transition-all hover:scale-[1.03]"
                        style={{
                          background: examBoard === b ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${examBoard === b ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: examBoard === b ? '#f59e0b' : '#64748b',
                        }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 3 — Target grade */}
              {step === 3 && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Target Grade</p>
                    <h2 className="text-2xl font-bold text-white">What grade are you aiming for?</h2>
                    <p className="text-slate-500 text-sm mt-1">I'll calibrate your practice difficulty accordingly.</p>
                  </div>
                  <div className={`grid gap-3 ${targetGrades.length > 4 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                    {targetGrades.map(g => (
                      <button key={g} onClick={() => setTargetGrade(g)}
                        className="py-5 rounded-xl text-xl font-bold transition-all hover:scale-[1.03]"
                        style={{
                          background: targetGrade === g ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${targetGrade === g ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: targetGrade === g ? '#f59e0b' : '#64748b',
                        }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 4 — Year group */}
              {step === 4 && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Year Group</p>
                    <h2 className="text-2xl font-bold text-white">Which year are you in?</h2>
                    <p className="text-slate-500 text-sm mt-1">Helps me prioritise the right topics for your stage.</p>
                  </div>
                  <div className={`grid gap-3 grid-cols-${yearGroups.length}`}>
                    {yearGroups.map(y => (
                      <button key={y.value} onClick={() => setYearGroup(y.value)}
                        className="py-5 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] flex flex-col items-center gap-1"
                        style={{
                          background: yearGroup === y.value ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${yearGroup === y.value ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: yearGroup === y.value ? '#f59e0b' : '#64748b',
                        }}>
                        <span>{y.label}</span>
                        <span className="text-xs font-normal opacity-70">{y.sub}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 5 — Exam date */}
              {step === 5 && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Exam Date</p>
                    <h2 className="text-2xl font-bold text-white">When is your exam?</h2>
                    <p className="text-slate-500 text-sm mt-1">I'll count down and intensify your sessions as it approaches.</p>
                  </div>
                  <input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
                  />
                  <p className="text-xs" style={{ color: '#475569' }}>Optional — you can set this later in your profile.</p>
                </>
              )}

              {/* Step 6 — Learning needs */}
              {step === 6 && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Learning Needs</p>
                    <h2 className="text-2xl font-bold text-white">How do you learn best?</h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Optional — select any that apply. I'll adapt my explanations accordingly.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        key: 'dyslexia',
                        active: dyslexia,
                        toggle: () => setDyslexia(d => !d),
                        label: 'Dyslexia',
                        desc: 'Clearer font, shorter sentences, bullet points over paragraphs',
                        emoji: '📖',
                      },
                      {
                        key: 'adhd',
                        active: adhd,
                        toggle: () => setAdhd(a => !a),
                        label: 'ADHD',
                        desc: 'Bite-sized steps, frequent check-ins, focused and energetic explanations',
                        emoji: '⚡',
                      },
                    ].map(opt => (
                      <button key={opt.key} onClick={opt.toggle}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                        style={{
                          background: opt.active ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${opt.active ? 'rgba(245,158,11,0.45)' : 'rgba(255,255,255,0.08)'}`,
                        }}>
                        <span className="text-2xl">{opt.emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: opt.active ? '#f59e0b' : '#e2e8f0' }}>
                            {opt.label}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>{opt.desc}</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{
                            borderColor: opt.active ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                            background: opt.active ? '#f59e0b' : 'transparent',
                          }}>
                          {opt.active && <Check size={10} strokeWidth={3} className="text-black" />}
                        </div>
                      </button>
                    ))}
                    <p className="text-xs text-center pt-1" style={{ color: '#374151' }}>
                      You can change this anytime in your profile settings
                    </p>
                  </div>
                </>
              )}

              {/* Step 7 — Confirmation */}
              {step === 7 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Ready</p>
                    <h2 className="text-2xl font-bold text-white">
                      {fullName ? `Ready when you are, ${fullName}.` : "You're all set."}
                    </h2>
                  </div>
                  <div className="space-y-2 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {[
                      { label: 'Level', value: level },
                      { label: 'Exam board', value: examBoard },
                      { label: 'Target grade', value: targetGrade },
                      { label: 'Year group', value: yearGroups.find(y => y.value === yearGroup)?.label },
                      examDate ? { label: 'Exam date', value: new Date(examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) } : null,
                      (dyslexia || adhd) ? { label: 'Learning needs', value: [dyslexia && 'Dyslexia', adhd && 'ADHD'].filter(Boolean).join(', ') } : null,
                    ].filter(Boolean).map((item: any) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span style={{ color: '#5a7aaa' }}>{item.label}</span>
                        <span className="font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-between mt-10">
            <button onClick={back} disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-0"
              style={{ color: '#5a7aaa' }}>
              <ChevronLeft size={14} /> Back
            </button>

            {!isLast ? (
              <button onClick={next} disabled={step === 0 && !fullName.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-30"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b' }}>
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={finish} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)', color: '#f59e0b' }}>
                {saving ? 'Setting up...' : "Let's get started"} <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right — SPOK panel */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col items-center justify-center gap-8 relative"
        style={{ background: 'rgba(4,7,14,0.8)', borderLeft: '1px solid rgba(245,158,11,0.08)' }}>

        <div className="w-72 h-72">
          <JarvisScene state="idle" amplitude={0} className="w-full h-full" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="px-8 text-center max-w-xs">
            <p className="text-sm font-semibold text-amber-400 mb-2">{line.heading}</p>
            <p className="text-xs leading-relaxed" style={{ color: '#5a7aaa' }}>{line.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
