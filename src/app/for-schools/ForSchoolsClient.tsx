'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Users, BarChart2, BookOpen, ArrowLeft, Mail } from 'lucide-react'

function GradientCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(99,102,241,0.15) 50%, rgba(59,130,246,0.05) 100%)', padding: 1, borderRadius: 18, ...style }}>
      <div style={{ background: 'rgba(10,14,26,0.95)', borderRadius: 17, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}

const PILLARS = [
  {
    icon: <Shield size={22} />,
    title: 'Student safeguarding',
    desc: 'StudiQ does not store sensitive personal data beyond what is needed for the learning experience. No advertising. No data sold. Student conversations are private.',
    color: '#3b82f6',
  },
  {
    icon: <Users size={22} />,
    title: 'SEND support built in',
    desc: 'Dyslexia-friendly font, ADHD mode, and adaptive pacing are available on every account — no extra setup required.',
    color: '#a78bfa',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Student progress visibility',
    desc: 'Teachers and coordinators can see which topics students are struggling with, enabling targeted support — not guesswork.',
    color: '#22c55e',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Curriculum-aligned',
    desc: 'Content maps to AQA, Edexcel, and OCR A-level specifications. Students practise what\'s actually in their exam, not generic content.',
    color: '#f59e0b',
  },
]

export default function ForSchoolsPage() {
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
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
            For Schools & Educators
          </div>
          <h1 className="text-white mb-5"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            AI revision support<br />your school can trust
          </h1>
          <p className="max-w-xl leading-relaxed" style={{ fontSize: 17, color: '#6b8cba' }}>
            StudiQ is designed for real educational environments — with safeguarding, SEND support, and curriculum alignment built in from day one.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="grid grid-cols-2 gap-4 mb-14">
          {PILLARS.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <GradientCard style={{ height: '100%', background: `linear-gradient(135deg, ${p.color}28 0%, ${p.color}0a 50%, rgba(59,130,246,0.04) 100%)` }}>
                <div className="p-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${p.color}18`, border: `1px solid ${p.color}28`, color: p.color }}>
                    {p.icon}
                  </div>
                  <p className="font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{p.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#6b8cba' }}>{p.desc}</p>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>

        {/* Pilot offer */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-14">
          <GradientCard style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(99,102,241,0.15) 100%)' }}>
            <div className="p-8">
              <h3 className="text-white font-semibold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22 }}>
                Free pilot programme
              </h3>
              <p className="leading-relaxed mb-6" style={{ color: '#6b8cba', fontSize: 15 }}>
                We are currently offering free access to schools, sixth forms, and tutors who want to test StudiQ with their students. Pilot schools get full Pro access, direct feedback with the team, and input into the features we build next.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Full Pro access', detail: 'No cost during pilot' },
                  { label: 'Direct support', detail: 'From the StudiQ team' },
                  { label: 'Shape the product', detail: 'Your feedback drives features' },
                ].map(item => (
                  <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.12)' }}>
                    <p className="text-sm font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: '#4a6070' }}>{item.detail}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm" style={{ color: '#5a7aaa' }}>
                Interested? Email us at{' '}
                <a href="mailto:admin@studiq.org" className="text-blue-400 hover:text-blue-300 transition-colors">admin@studiq.org</a>
                {' '}or use the contact button below.
              </p>
            </div>
          </GradientCard>
        </motion.div>

        {/* Who we work with */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-14">
          <h2 className="text-white font-semibold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22 }}>
            Who we work with
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {['Secondary schools & sixth forms', 'SEND coordinators (SENCOs)', 'Independent tutors', 'Academy trusts & local authorities'].map(item => (
              <div key={item} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <p className="text-sm" style={{ color: '#94a3b8' }}>{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <a href="mailto:admin@studiq.org">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-semibold text-white"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1)',
                boxShadow: '0 0 40px rgba(59,130,246,0.35)',
                fontSize: 15,
              }}>
              <Mail size={16} />
              Get in touch about a pilot
            </motion.button>
          </a>
          <p className="text-xs mt-4" style={{ color: '#374151' }}>We respond within 48 hours</p>
        </div>

      </div>
    </div>
  )
}
