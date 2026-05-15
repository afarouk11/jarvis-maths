'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Type, Brain, Timer, BookOpen, Layers, MessageSquare, ArrowLeft } from 'lucide-react'

function GradientCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(99,102,241,0.15) 50%, rgba(59,130,246,0.05) 100%)', padding: 1, borderRadius: 18, ...style }} className={className}>
      <div style={{ background: 'rgba(10,14,26,0.95)', borderRadius: 17, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}

const LIVE_FEATURES = [
  {
    icon: <Type size={20} />,
    title: 'Dyslexia-friendly font',
    desc: 'Switch to OpenDyslexic with wider letter spacing at any time — available on every page inside the platform.',
    color: '#3b82f6',
    badge: 'Live now',
  },
  {
    icon: <Brain size={20} />,
    title: 'ADHD mode',
    desc: 'Breaks content into shorter steps with more frequent check-ins. SPOK adapts how it explains things based on your mode.',
    color: '#f59e0b',
    badge: 'Live now',
  },
  {
    icon: <Timer size={20} />,
    title: 'Focus timer',
    desc: 'Built-in Pomodoro timer — 15, 25, or 45 minute sessions. Helps structure revision without relying on willpower alone.',
    color: '#a78bfa',
    badge: 'Live now',
  },
]

const PLANNED_FEATURES = [
  {
    icon: <MessageSquare size={20} />,
    title: '"Explain differently"',
    desc: 'One tap to get the same concept explained a completely different way — simpler, more visual, or step-by-step.',
    color: '#22c55e',
  },
  {
    icon: <Layers size={20} />,
    title: 'Step-by-step mode',
    desc: 'SPOK walks through every problem one line at a time, waiting for you before moving on.',
    color: '#60a5fa',
  },
  {
    icon: <BookOpen size={20} />,
    title: 'Visual learning mode',
    desc: 'Diagrams, colour-coded steps, and spatial representations alongside written explanations.',
    color: '#f472b6',
  },
]

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080c18', color: '#e8f0fe' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'rgba(59,130,246,0.1)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.2) 100%)', padding: 1, borderRadius: 10 }}>
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0d1a3a, #1d4ed8)' }}>S</div>
          </div>
          <span className="font-semibold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>StudiQ</span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm transition-colors hover:text-white" style={{ color: '#6b8cba' }}>
          <ArrowLeft size={14} /> Back to home
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
            Accessibility & SEND
          </div>
          <h1 className="text-white mb-5"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Learning that adapts<br />to how you think
          </h1>
          <p className="max-w-xl leading-relaxed" style={{ fontSize: 17, color: '#6b8cba' }}>
            StudiQ is built for the full range of how students learn — including dyslexia, ADHD, and other neurodiverse profiles. Accessibility is not an afterthought here.
          </p>
        </motion.div>

        {/* Live features */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-14">
          <h2 className="text-white font-semibold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22 }}>
            Available right now
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {LIVE_FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
                <GradientCard style={{ background: `linear-gradient(135deg, ${f.color}30 0%, ${f.color}0a 50%, rgba(59,130,246,0.04) 100%)` }}>
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${f.color}18`, border: `1px solid ${f.color}30`, color: f.color }}>
                      {f.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <p className="font-semibold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{f.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
                          {f.badge}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#6b8cba' }}>{f.desc}</p>
                    </div>
                  </div>
                </GradientCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Planned features */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-14">
          <h2 className="text-white font-semibold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22 }}>
            Coming next
          </h2>
          <p className="text-sm mb-6" style={{ color: '#4a6070' }}>Features in active development</p>
          <div className="grid grid-cols-3 gap-4">
            {PLANNED_FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.07 }}>
                <GradientCard style={{ height: '100%', background: `linear-gradient(135deg, ${f.color}20 0%, ${f.color}06 50%, rgba(59,130,246,0.03) 100%)` }}>
                  <div className="p-5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                      style={{ background: `${f.color}12`, border: `1px solid ${f.color}20`, color: f.color }}>
                      {f.icon}
                    </div>
                    <p className="font-semibold text-white mb-2 text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{f.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#5a7aaa' }}>{f.desc}</p>
                  </div>
                </GradientCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* SEND statement */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <GradientCard style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(59,130,246,0.15) 50%, rgba(59,130,246,0.04) 100%)' }}>
            <div className="p-8">
              <h3 className="text-white font-semibold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 20 }}>
                Our commitment to SEND learners
              </h3>
              <p className="leading-relaxed mb-4" style={{ color: '#6b8cba', fontSize: 15 }}>
                Too many students with dyslexia, ADHD, autism, and other learning differences are failed by education systems that weren't designed for them. StudiQ is being built from the ground up to close that gap — with adaptive explanations, flexible pacing, and a tutor that never loses patience.
              </p>
              <p className="text-sm" style={{ color: '#4a6070' }}>
                StudiQ contributed proposals to the UK SEND Reform consultation. We believe accessibility belongs at the centre of education technology, not as an optional add-on.
              </p>
            </div>
          </GradientCard>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/sign-up">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="px-9 py-4 rounded-xl font-semibold text-white"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1)',
                boxShadow: '0 0 40px rgba(59,130,246,0.35)',
                fontSize: 15,
              }}>
              Start learning free →
            </motion.button>
          </Link>
          <p className="text-xs mt-4" style={{ color: '#374151' }}>No credit card · Accessibility features available on free plan</p>
        </div>

      </div>
    </div>
  )
}
