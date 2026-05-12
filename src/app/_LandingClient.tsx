'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { JarvisAvatar } from '@/components/jarvis/JarvisAvatar'
import { useState, useEffect } from 'react'
import { JarvisState } from '@/types'
import { Check, X, Star } from 'lucide-react'

const FEATURES = [
  { icon: '🧠', title: 'Knows Your Gaps', desc: 'Bayesian Knowledge Tracing models exactly what you know — down to the subtopic. No wasted time on things you already get.', color: '#3b82f6' },
  { icon: '🎤', title: 'Voice Tutor', desc: 'Ask out loud. SPOK explains step-by-step, spoken back in real time. Like having a tutor at midnight before your exam.', color: '#6366f1' },
  { icon: '⚡', title: 'Spaced Repetition', desc: 'SM-2 algorithm schedules reviews at the perfect moment — right before you forget. Proven to double retention.', color: '#f59e0b' },
  { icon: '🎯', title: 'Past Paper Prediction', desc: "AI analyses 5 years of AQA papers and predicts what's likely this year. Know the questions before they're asked.", color: '#22c55e' },
  { icon: '✍️', title: 'Auto-marked Practice', desc: 'Type your answer, SPOK marks it and explains exactly where you went wrong. Instant feedback, infinite questions.', color: '#60a5fa' },
  { icon: '🔬', title: 'Knowledge Brain', desc: 'Visual map of your entire mind — which topics are firing, which are dark. See your progress like never before.', color: '#a78bfa' },
]

const STEPS = [
  { num: '01', title: 'SPOK diagnoses you', desc: "Answer a short set of questions. SPOK builds a precise map of your knowledge — down to the exact subtopic you're weak on.", color: '#3b82f6' },
  { num: '02', title: 'You learn what you actually need', desc: "Targeted lessons with step-by-step worked examples, KaTeX maths, and SPOK's voice. No fluff, no revision you've already done.", color: '#6366f1' },
  { num: '03', title: 'SPOK predicts your exam', desc: 'Past paper AI analyses 5 years of questions. SPOK generates a mock exam tailored to your weaknesses — and your exam board.', color: '#f59e0b' },
]

const TESTIMONIALS = [
  { quote: "I went from a predicted C to an A in 6 weeks. SPOK told me exactly which topics I was weak on and drilled them until I had them.", name: "Jamie R.", detail: "Year 13 · AQA · Achieved A", stars: 5 },
  { quote: "Honestly better than my private tutor. It never gets impatient, never repeats itself unless I ask, and it's available at midnight before my exam.", name: "Priya S.", detail: "Year 12 · Edexcel · Target A*", stars: 5 },
  { quote: "The voice feature is actually insane. I just talk through the problem and SPOK corrects me step by step. It's like thinking out loud with a maths genius.", name: "Marcus T.", detail: "Year 13 · OCR · Achieved A*", stars: 5 },
]

const COMPARISON = [
  { label: 'Price',              tutor: '£60/hr',  textbook: '£25 one-time', studiq: 'Free / £33/mo' },
  { label: 'Available 24/7',     tutor: false,     textbook: true,            studiq: true },
  { label: 'Knows your gaps',    tutor: 'Sometimes',textbook: false,          studiq: true },
  { label: 'Voice chat',         tutor: false,     textbook: false,           studiq: true },
  { label: 'Past paper AI',      tutor: false,     textbook: false,           studiq: true },
  { label: 'Spaced repetition',  tutor: false,     textbook: false,           studiq: true },
  { label: 'Grade prediction',   tutor: false,     textbook: false,           studiq: true },
]

function GradientCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.2) 50%, rgba(59,130,246,0.06) 100%)', padding: 1, borderRadius: 18, ...style }} className={className}>
      <div style={{ background: 'rgba(10,14,26,0.92)', borderRadius: 17, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}

export function LandingPage() {
  const [jarvisState, setJarvisState] = useState<JarvisState>('idle')
  const [examDays, setExamDays]       = useState<number>(0)

  useEffect(() => {
    const examDate = new Date('2026-05-12')
    const diff = examDate.getTime() - Date.now()
    setExamDays(Math.max(0, Math.ceil(diff / 86400000)))
  }, [])

  useEffect(() => {
    const cycle: { state: JarvisState; ms: number }[] = [
      { state: 'idle',      ms: 3000 },
      { state: 'thinking',  ms: 2000 },
      { state: 'speaking',  ms: 2000 },
      { state: 'listening', ms: 2000 },
    ]
    let i = 0
    function next() {
      setJarvisState(cycle[i].state)
      setTimeout(() => { i = (i + 1) % cycle.length; next() }, cycle[i].ms)
    }
    const t = setTimeout(next, 1000)
    return () => clearTimeout(t)
  }, [])

  function renderCell(val: boolean | string) {
    if (val === true)  return <Check size={15} className="mx-auto" style={{ color: '#4ade80' }} />
    if (val === false) return <X    size={15} className="mx-auto" style={{ color: '#374151' }} />
    return <span className="text-xs" style={{ color: '#94a3b8' }}>{val}</span>
  }

  return (
    <div className="min-h-screen notebook-bg" style={{ color: '#e8f0fe' }}>

      {/* Urgency banner */}
      {examDays > 0 && examDays < 60 && (
        <div className="text-center py-2 text-xs font-medium"
          style={{ background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}>
          ⏰ A-level exams in {examDays} days — start now, not later
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'rgba(8,12,24,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
        <div className="flex items-center gap-2.5">
          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.2) 100%)', padding: 1, borderRadius: 10 }}>
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0d1a3a, #1d4ed8)' }}>
              S
            </div>
          </div>
          <span className="font-semibold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>StudiQ</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pricing" className="px-4 py-2 rounded-lg text-sm transition-colors hover:text-white" style={{ color: '#6b8cba' }}>Pricing</Link>
          <Link href="/sign-in"  className="px-4 py-2 rounded-lg text-sm transition-colors hover:text-white" style={{ color: '#6b8cba' }}>Sign in</Link>
          <Link href="/sign-up">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
              Get started free
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-44 pb-24 overflow-hidden">
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, rgba(99,102,241,0.07) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* SPOK avatar with orbital rings */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="mb-10 relative inline-flex items-center justify-center"
          style={{ width: 160, height: 160 }}>
          {/* Outer orbital ring */}
          <div style={{
            position: 'absolute', inset: -28, borderRadius: '50%',
            border: '1px solid rgba(59,130,246,0.2)',
            animation: 'orbital-spin 14s linear infinite',
          }}>
            <div style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6, 0 0 20px rgba(59,130,246,0.4)' }} />
          </div>
          {/* Inner orbital ring */}
          <div style={{
            position: 'absolute', inset: -14, borderRadius: '50%',
            border: '1px solid rgba(99,102,241,0.15)',
            animation: 'orbital-spin 9s linear infinite reverse',
          }}>
            <div style={{ position: 'absolute', bottom: -4, right: '20%', width: 7, height: 7, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1' }} />
          </div>
          <JarvisAvatar state={jarvisState} size={120} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto" style={{ position: 'relative' }}>

          {/* Gold eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-7"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            AI-powered · AQA · Edexcel · OCR
          </div>

          <h1 className="text-white mb-6"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 76, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Your A* has a gap.<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 30px rgba(99,102,241,0.4))' }}>
              SPOK just found it.
            </span>
          </h1>

          <p className="mb-10 max-w-xl mx-auto leading-relaxed" style={{ fontSize: 18, color: '#6b8cba' }}>
            SPOK builds a precise map of what you know, finds the gaps costing you marks,
            and closes them — before your exam. Voice tutoring, spaced repetition, past paper AI. Free to start.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-14">
            <Link href="/sign-up">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="px-9 py-4 rounded-xl font-semibold text-white"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  background: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1)',
                  boxShadow: '0 0 50px rgba(59,130,246,0.45), 0 4px 20px rgba(0,0,0,0.35)',
                  fontSize: 15,
                }}>
                Start learning free →
              </motion.button>
            </Link>
            <Link href="/pricing">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="px-9 py-4 rounded-xl font-semibold"
                style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.22)', color: '#60a5fa', fontSize: 15 }}>
                See pricing
              </motion.button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { value: 'Free', label: 'No credit card needed' },
              { value: '28',   label: 'A-level topics' },
              { value: '24/7', label: 'Always available' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
                {i > 0 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />}
                <div className="text-center">
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#4a6070' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
          <h2 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }} className="mb-3">
            How SPOK works
          </h2>
          <p style={{ color: '#5a7aaa', fontSize: 15 }}>Three steps from signup to A*</p>
        </motion.div>
        <div className="grid grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GradientCard style={{ background: `linear-gradient(135deg, ${step.color}55 0%, ${step.color}18 50%, rgba(59,130,246,0.06) 100%)` }}>
                <div className="p-7">
                  <div style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 56, fontWeight: 800, color: step.color, opacity: 0.15, lineHeight: 1, marginBottom: 20 }}>
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a7aaa' }}>{step.desc}</p>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-white text-center mb-12"
          style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Everything you need to get an A*
        </motion.h2>
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02, y: -2 }}>
              <GradientCard style={{ height: '100%', background: `linear-gradient(135deg, ${f.color}40 0%, ${f.color}12 50%, rgba(59,130,246,0.05) 100%)` }}>
                <div className="p-6">
                  {/* Icon badge */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                    {f.icon}
                  </div>
                  <p className="font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#5a7aaa' }}>{f.desc}</p>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
          <h2 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }} className="mb-3">
            What students say
          </h2>
          <p style={{ color: '#5a7aaa', fontSize: 15 }}>Real results from real A-level students</p>
        </motion.div>
        <div className="grid grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GradientCard style={{ height: '100%' }}>
                <div className="p-7 flex flex-col">
                  {/* Quote mark */}
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 56, lineHeight: 1, color: '#1e3a5f', marginBottom: 8, marginTop: -8 }}>"</div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: '#94b4f0' }}>
                    {t.quote}
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4a6070' }}>{t.detail}</p>
                  </div>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="max-w-3xl mx-auto px-6 pb-28">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
          <h2 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }} className="mb-3">
            Why not just get a tutor?
          </h2>
          <p style={{ color: '#5a7aaa', fontSize: 15 }}>Private tutors charge £60/hour. SPOK is available at midnight and never runs out of patience.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}>
          <GradientCard>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.12)' }}>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6070' }}>Feature</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6070' }}>Private Tutor</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6070' }}>Textbook</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#3b82f6' }}>StudiQ</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.label} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-6 py-3 text-xs" style={{ color: '#94a3b8' }}>{row.label}</td>
                    <td className="px-4 py-3 text-center">{renderCell(row.tutor)}</td>
                    <td className="px-4 py-3 text-center">{renderCell(row.textbook)}</td>
                    <td className="px-4 py-3 text-center" style={{ background: 'rgba(59,130,246,0.05)' }}>{renderCell(row.studiq)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GradientCard>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center pb-28 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
          <GradientCard style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(59,130,246,0.2) 50%, rgba(59,130,246,0.05) 100%)' }}>
            <div className="p-12 text-center" style={{ position: 'relative' }}>
              {/* Glow behind card */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: 17, background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <JarvisAvatar state="idle" size={72} />
                <h2 className="text-white mt-7 mb-3"
                  style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Your exam won't wait.
                </h2>
                <p className="text-sm mb-2" style={{ color: '#5a7aaa' }}>
                  Free to start. No credit card. SPOK finds your gaps in minutes.
                </p>
                <p className="text-xs mb-10" style={{ color: '#374151' }}>Trusted by A-level students across the UK — AQA, Edexcel, and OCR.</p>
                <Link href="/sign-up">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    className="px-12 py-4 rounded-xl font-semibold text-white"
                    style={{
                      fontFamily: 'var(--font-space-grotesk)',
                      background: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1)',
                      boxShadow: '0 0 40px rgba(59,130,246,0.4), 0 0 80px rgba(99,102,241,0.15)',
                      fontSize: 15,
                    }}>
                    Get started free →
                  </motion.button>
                </Link>
                <p className="text-xs mt-5" style={{ color: '#374151' }}>No credit card · Cancel anytime</p>
              </div>
            </div>
          </GradientCard>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-10" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(99,102,241,0.2) 100%)', padding: 1, borderRadius: 8 }}>
                <div className="w-6 h-6 rounded-[7px] flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #0d1a3a, #1d4ed8)' }}>S</div>
              </div>
              <span className="font-semibold text-sm text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>StudiQ</span>
              <span className="text-xs ml-1" style={{ color: '#374151' }}>by Cerebral Options</span>
            </div>
            <div className="flex flex-wrap gap-6 text-xs" style={{ color: '#4a6070' }}>
              <Link href="/pricing"  className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/sign-up"  className="hover:text-white transition-colors">Sign up free</Link>
              <Link href="/sign-in"  className="hover:text-white transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: '#2d3a4a' }}>
            <p>© 2026 Cerebral Options Ltd · Built for A-Level students</p>
            <p>AQA · Edexcel · OCR · studiq.org</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
