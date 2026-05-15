'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, ArrowLeft, ExternalLink } from 'lucide-react'

function GradientCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(99,102,241,0.15) 50%, rgba(59,130,246,0.05) 100%)', padding: 1, borderRadius: 18, ...style }}>
      <div style={{ background: 'rgba(10,14,26,0.95)', borderRadius: 17, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}

export default function PolicyEngagementPage() {
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

      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
            Policy Engagement
          </div>
          <h1 className="text-white mb-5"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Shaping inclusive<br />education policy
          </h1>
          <p className="leading-relaxed" style={{ fontSize: 17, color: '#6b8cba' }}>
            StudiQ believes that AI-powered education must be shaped by those who understand the needs of real students — including the most underserved.
          </p>
        </motion.div>

        {/* SEND Reform */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <GradientCard style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25) 0%, rgba(99,102,241,0.12) 50%, rgba(59,130,246,0.04) 100%)' }}>
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-white font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 20 }}>
                    UK SEND Reform Consultation
                  </h2>
                  <p className="text-sm" style={{ color: '#5a7aaa' }}>Special Educational Needs and Disabilities</p>
                </div>
              </div>
              <p className="leading-relaxed mb-4" style={{ color: '#6b8cba', fontSize: 15 }}>
                StudiQ contributed proposals to the UK SEND Reform consultation. Our submission focused on how adaptive AI technology can support students with special educational needs and disabilities — reducing reliance on overstretched human resources while improving learning outcomes and confidence.
              </p>
              <p className="leading-relaxed" style={{ color: '#6b8cba', fontSize: 15 }}>
                We argued that accessibility in EdTech should be a baseline requirement, not a premium feature, and that AI tutoring tools have a specific role in reducing the educational inequality faced by neurodiverse students.
              </p>
            </div>
          </GradientCard>
        </motion.div>

        {/* Our position */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
          <h2 className="text-white font-semibold mb-5" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22 }}>
            Our position on inclusive education
          </h2>
          <div className="space-y-3">
            {[
              'Accessibility features should be free and available on every account — not locked behind premium tiers.',
              'AI tutoring must be safe for minors, with clear data policies, no advertising, and responsible AI design.',
              'SEND learners deserve the same quality of personalised education as any other student.',
              'Schools and parents should have visibility into how AI tools work and what data they hold.',
            ].map((point, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.06 }}
                className="flex items-start gap-3 px-4 py-4 rounded-xl"
                style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{point}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GradientCard>
            <div className="p-7">
              <h3 className="text-white font-semibold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 18 }}>
                Want to work with us on policy?
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#6b8cba' }}>
                If you work in education policy, SEND advocacy, or EdTech regulation and want to collaborate or discuss our approach, we would like to hear from you.
              </p>
              <a href="mailto:admin@studiq.org"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
                style={{ color: '#60a5fa' }}>
                admin@studiq.org <ExternalLink size={13} />
              </a>
            </div>
          </GradientCard>
        </motion.div>

      </div>
    </div>
  )
}
