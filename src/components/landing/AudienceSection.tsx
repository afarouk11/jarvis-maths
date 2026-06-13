'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

/**
 * Audience-targeted cards. Messaging is research-led:
 * - Students (Gen Z): instant feedback, personalisation, independence.
 * - Parents (the payer): trust, visible progress, cost vs £20–50/hr private tutors.
 * - Schools: curriculum alignment, demonstrable outcomes, teacher workload.
 */
const AUDIENCES = [
  {
    key: 'students',
    label: 'For students',
    color: '#3b82f6',
    title: 'Built for how you actually revise',
    points: [
      'Instant marking — see where you went wrong the second you answer',
      'SPOK adapts every session to your gaps, not a fixed syllabus order',
      'Revise out loud at midnight — voice tutoring never sleeps',
      'Free to start, no card needed',
    ],
    cta: { href: '/sign-up', label: 'Start free' },
  },
  {
    key: 'parents',
    label: 'For parents',
    color: '#f59e0b',
    title: 'Proof of progress, not promises',
    points: [
      'A live mastery map shows exactly what they know — topic by topic',
      'Grade prediction tracks how they’re trending before results day',
      'Less than the cost of a single private tutoring hour per month',
      'Cancel anytime — no term-time contracts',
    ],
    cta: { href: '/pricing', label: 'See pricing' },
  },
  {
    key: 'schools',
    label: 'For schools',
    color: '#6366f1',
    title: 'Data your department can act on',
    points: [
      'Aligned to AQA, Edexcel and OCR specifications',
      'Auto-marked practice cuts marking workload, not corners',
      'Spot students who need intervention weeks earlier',
      'SEND accessibility built in — dyslexia font, ADHD mode, adaptive pacing',
    ],
    cta: { href: '/for-schools', label: 'StudiQ for Schools' },
  },
] as const

function AudienceCard({ audience, index }: { audience: (typeof AUDIENCES)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="gcard h-full"
      style={{
        background: `linear-gradient(135deg, ${audience.color}50 0%, ${audience.color}15 50%, rgba(59,130,246,0.05) 100%)`,
        padding: 1,
        borderRadius: 18,
      }}>
      <div className="flex flex-col h-full p-7" style={{ background: 'rgba(10,14,26,0.92)', borderRadius: 17 }}>
        <p className="text-[11px] font-semibold uppercase mb-3" style={{ color: audience.color, letterSpacing: '0.16em' }}>
          {audience.label}
        </p>
        <h3 className="font-semibold text-white mb-5" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 19 }}>
          {audience.title}
        </h3>
        <ul className="space-y-3 flex-1 mb-7">
          {audience.points.map(point => (
            <li key={point} className="flex items-start gap-2.5 text-[13px] leading-relaxed" style={{ color: '#94a3b8' }}>
              <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: audience.color }} />
              {point}
            </li>
          ))}
        </ul>
        <Link href={audience.cta.href}
          className="group inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: audience.color }}>
          {audience.cta.label}
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  )
}

export function AudienceSection() {
  return (
    <section id="audiences" className="max-w-5xl mx-auto px-6 pb-28">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
        <div className="inline-flex items-baseline gap-2 mb-4 px-3 py-1 rounded-md"
          style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.16)' }}>
          <span style={{ fontFamily: 'var(--font-space-grotesk)', fontStyle: 'italic', fontWeight: 600, color: '#60a5fa', fontSize: 13 }}>∀</span>
          <span className="text-[11px] font-semibold uppercase" style={{ color: '#7c98c4', letterSpacing: '0.16em' }}>
            Students · Parents · Schools
          </span>
        </div>
        <h2 className="mb-3" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
          Whoever you are in the journey
        </h2>
        <p style={{ color: '#5a7aaa', fontSize: 15 }}>
          Students do the learning. Parents see the progress. Schools get the evidence.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {AUDIENCES.map((audience, i) => (
          <AudienceCard key={audience.key} audience={audience} index={i} />
        ))}
      </div>
    </section>
  )
}
