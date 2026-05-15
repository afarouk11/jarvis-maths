'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, ArrowLeft, Mail, MessageSquare } from 'lucide-react'

function GradientCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(99,102,241,0.15) 50%, rgba(59,130,246,0.05) 100%)', padding: 1, borderRadius: 18, ...style }}>
      <div style={{ background: 'rgba(10,14,26,0.95)', borderRadius: 17, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}

function PlaceholderTestimonial({ index }: { index: number }) {
  return (
    <GradientCard style={{ height: '100%' }}>
      <div className="p-7 flex flex-col h-full">
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, j) => (
            <Star key={j} size={12} style={{ color: 'rgba(245,158,11,0.2)' }} />
          ))}
        </div>
        <div className="flex-1 space-y-2 mb-6">
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '90%' }} />
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '75%' }} />
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '85%' }} />
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '60%' }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }} />
          <div>
            <div className="h-2.5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-2 w-28 rounded-full mt-1.5" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-xs" style={{ color: '#2d3a4a' }}>Your story here — #{index}</span>
        </div>
      </div>
    </GradientCard>
  )
}

export default function StudentSuccessPage() {
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
            Student Success
          </div>
          <h1 className="text-white mb-5"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Real students.<br />Real results.
          </h1>
          <p className="max-w-xl mx-auto leading-relaxed" style={{ fontSize: 17, color: '#6b8cba' }}>
            We are collecting stories from students using StudiQ. If SPOK has helped you understand a topic, improve your confidence, or change how you revise — we want to hear from you.
          </p>
        </motion.div>

        {/* Placeholder testimonials */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-16">
          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <PlaceholderTestimonial key={i} index={i} />
            ))}
          </div>
          <p className="text-center text-xs mt-5" style={{ color: '#2d3a4a' }}>
            Testimonials coming soon — be one of the first
          </p>
        </motion.div>

        {/* Share your story */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
          <GradientCard style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(99,102,241,0.1) 50%, rgba(59,130,246,0.04) 100%)' }}>
            <div className="p-8">
              <h3 className="text-white font-semibold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22 }}>
                Share your story
              </h3>
              <p className="leading-relaxed mb-6" style={{ color: '#6b8cba', fontSize: 15 }}>
                Used StudiQ before your exams? Noticed a difference in how you revise, or how confident you feel about a topic? We would love to feature your experience — with your permission.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <a href="mailto:admin@studiq.org?subject=My StudiQ story"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff' }}>
                  <Mail size={15} />
                  Email us your story
                </a>
                <a href="https://instagram.com/cerebraloptions" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                  <MessageSquare size={15} />
                  DM us on Instagram
                </a>
              </div>
            </div>
          </GradientCard>
        </motion.div>

        {/* What we're looking for */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-white font-semibold mb-5" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 20 }}>
            What makes a good story
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              'A specific topic or concept SPOK helped you understand',
              'A change in your confidence or exam approach',
              'How StudiQ fits into your revision routine',
              'Your experience as a SEND or neurodiverse learner',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                <p className="text-sm" style={{ color: '#94a3b8' }}>{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
