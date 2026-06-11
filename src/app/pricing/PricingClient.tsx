'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap, Lock, Building2 } from 'lucide-react'

const FREE_FEATURES = [
  '5 SPOK chat messages per day',
  'All 28 A-level topics & lessons',
  'Unlimited practice questions',
  'Spaced repetition scheduling',
  'Grade prediction',
  'Knowledge Brain map',
]

const PRO_FEATURES = [
  'Unlimited SPOK chat',
  'Voice tutor — ask out loud',
  'Extended AI thinking mode',
  'Past paper AI — cite real papers',
  'Mock exam generator',
  'Priority support',
  'All free features included',
]

const SCHOOLS_FEATURES = [
  'Everything in Pro, per student',
  'Bulk student management',
  'Teacher progress dashboard',
  'Class & cohort analytics',
  'Custom exam board config',
  'Dedicated account manager',
  'Invoiced billing',
]

// 2 lessons/week × £20 × 52 weeks ÷ 12 months
const TUTOR_MONTHLY = Math.round((2 * 20 * 52) / 12)   // £173
const PRO_PRICE     = 24.99
const SAVING        = Math.round(TUTOR_MONTHLY - PRO_PRICE) // £154

export default function PricingPage() {
  const [loading, setLoading] = useState(false)

  async function checkout() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly' }),
      })
      if (res.status === 401) {
        window.location.href = '/sign-in?next=/pricing'
        return
      }
      const { url, error } = await res.json()
      if (error) { alert(error); return }
      window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen notebook-bg flex flex-col items-center justify-center px-6 py-24 relative"
      style={{ color: '#e8f0fe', overflow: 'hidden' }}>

      {/* Mesh glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 700, height: 700,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.09) 0%, rgba(59,130,246,0.05) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Link href="/dashboard"
        className="absolute top-6 left-6 text-sm transition-colors hover:text-blue-400"
        style={{ color: '#4a6070' }}>
        ← Dashboard
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14" style={{ position: 'relative' }}>
        <h1 className="text-white mb-4"
          style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Less than one tutoring session.
        </h1>
        <p className="text-base" style={{ color: '#5a7aaa' }}>
          Two private lessons a week cost £{TUTOR_MONTHLY}/month. SPOK costs £{PRO_PRICE}/month.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl" style={{ position: 'relative' }}>

        {/* ── Free ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)', padding: 1, borderRadius: 20, height: '100%' }}>
            <div className="p-8 rounded-[19px] h-full flex flex-col" style={{ background: 'rgba(10,14,26,0.9)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#4a6070' }}>Free</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 56, lineHeight: 1 }}>£0</span>
                <span className="text-sm mb-3" style={{ color: '#4a6070' }}>/month</span>
              </div>
              <p className="text-xs mb-7" style={{ color: '#374151' }}>No credit card needed</p>
              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm" style={{ color: '#6b8cba' }}>
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: '#3b82f6' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <button className="w-full py-3.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b8cba' }}>
                  Get started free
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Pro Individual ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.65) 0%, rgba(99,102,241,0.45) 50%, rgba(59,130,246,0.18) 100%)',
            padding: 1, borderRadius: 20, height: '100%',
            boxShadow: '0 0 70px rgba(59,130,246,0.15), 0 0 130px rgba(99,102,241,0.07)',
          }}>
            <div className="p-8 rounded-[19px] relative overflow-hidden h-full flex flex-col" style={{ background: 'rgba(10,14,26,0.88)' }}>

              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Most popular badge */}
              <div className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.28)', color: '#f59e0b' }}>
                Most popular
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#60a5fa', position: 'relative' }}>Pro Individual</p>

              <div style={{ position: 'relative' }}>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 56, lineHeight: 1 }}>
                    £{PRO_PRICE}
                  </span>
                  <span className="text-sm mb-3" style={{ color: '#4a6070' }}>/month</span>
                </div>

                {/* Savings callout */}
                <div className="flex items-center gap-2 mb-7 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>
                    Save £{SAVING}/month vs private tutoring
                  </span>
                  <span className="text-xs" style={{ color: '#374151' }}>
                    · 2 sessions/wk at £20 = £{TUTOR_MONTHLY}/mo
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1" style={{ position: 'relative' }}>
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: '#60a5fa' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={checkout} disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  background: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1)',
                  boxShadow: '0 0 30px rgba(59,130,246,0.35)',
                  position: 'relative',
                }}>
                <Zap size={15} />
                {loading ? 'Redirecting...' : `Get Pro — £${PRO_PRICE}/month`}
              </motion.button>
              <p className="text-center text-xs mt-3" style={{ color: '#4a6070', position: 'relative' }}>Cancel anytime · Billed monthly</p>
            </div>
          </div>
        </motion.div>

        {/* ── Schools / Annual — Coming Soon ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)', padding: 1, borderRadius: 20, height: '100%' }}>
            <div className="p-8 rounded-[19px] relative overflow-hidden h-full flex flex-col" style={{ background: 'rgba(10,14,26,0.85)' }}>

              {/* Lock overlay */}
              <div className="absolute inset-0 rounded-[19px] z-10 flex flex-col items-center justify-center gap-3"
                style={{ background: 'rgba(8,12,24,0.72)', backdropFilter: 'blur(2px)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <Lock size={22} style={{ color: '#818cf8' }} />
                </div>
                <p className="font-bold text-white text-lg" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Coming Soon</p>
                <p className="text-xs text-center px-4" style={{ color: '#5a7aaa' }}>
                  Annual plans for schools and tuition centres are on the way.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 size={13} style={{ color: '#6366f1' }} />
                  <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>Schools & Tuition Centres</span>
                </div>
                <a href="mailto:admin@studiq.org"
                  className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03]"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                  Get notified
                </a>
              </div>

              {/* Background card content (blurred behind overlay) */}
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#4a6070' }}>Annual / Schools</p>
              <div className="flex items-end gap-1 mb-7">
                <span className="font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 56, lineHeight: 1 }}>£—</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {SCHOOLS_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm" style={{ color: '#3a4a5c' }}>
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: '#3a4a5c' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="w-full py-3.5 rounded-xl text-sm font-medium text-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#2d3a4a' }}>
                Contact us
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Footer note */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-xs mt-10 text-center" style={{ color: '#2d3a4a', position: 'relative' }}>
        Private tutors charge £60/hr · SPOK is available 24/7 · studiq.org
      </motion.p>
    </div>
  )
}
