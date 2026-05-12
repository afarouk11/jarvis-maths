'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap } from 'lucide-react'

const FREE_FEATURES = [
  '10 SPOK chat messages per day',
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
  'All free features included',
]

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
  const [loading, setLoading] = useState(false)

  async function checkout() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: billing }),
      })
      const { url, error } = await res.json()
      if (error) { alert(error); return }
      window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  const isAnnual = billing === 'annual'

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
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12" style={{ position: 'relative' }}>
        <h1 className="text-white mb-4"
          style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Less than one tutoring session.
        </h1>
        <p className="text-base mb-8" style={{ color: '#5a7aaa' }}>
          Start free. Upgrade when you want everything SPOK can do.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center rounded-xl p-1 gap-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => setBilling('monthly')}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: !isAnnual ? 'rgba(59,130,246,0.18)' : 'transparent',
              color: !isAnnual ? '#60a5fa' : '#4a6070',
              border: !isAnnual ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
            }}>
            Monthly
          </button>
          <button onClick={() => setBilling('annual')}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: isAnnual ? 'rgba(59,130,246,0.18)' : 'transparent',
              color: isAnnual ? '#60a5fa' : '#4a6070',
              border: isAnnual ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
            }}>
            Annual
            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
              Save £80
            </span>
          </button>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl" style={{ position: 'relative' }}>

        {/* Free */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', padding: 1, borderRadius: 20 }}>
            <div className="p-8 rounded-[19px]" style={{ background: 'rgba(10,14,26,0.9)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#4a6070' }}>Free</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 60, lineHeight: 1 }}>£0</span>
                <span className="text-sm mb-3" style={{ color: '#4a6070' }}>/month</span>
              </div>
              <p className="text-xs mb-7" style={{ color: '#374151' }}>No credit card needed</p>
              <ul className="space-y-3 mb-8">
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

        {/* Pro */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.6) 0%, rgba(99,102,241,0.4) 50%, rgba(59,130,246,0.15) 100%)',
            padding: 1, borderRadius: 20,
            boxShadow: '0 0 60px rgba(59,130,246,0.12), 0 0 120px rgba(99,102,241,0.06)',
          }}>
            <div className="p-8 rounded-[19px] relative overflow-hidden" style={{ background: 'rgba(10,14,26,0.88)' }}>

              {/* Inner top glow */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Badge */}
              <div className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.28)', color: '#f59e0b' }}>
                Most popular
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#60a5fa', position: 'relative' }}>Pro</p>

              <motion.div key={billing} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative' }}>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 60, lineHeight: 1 }}>
                    {isAnnual ? '£400' : '£40'}
                  </span>
                  <span className="text-sm mb-3" style={{ color: '#4a6070' }}>
                    {isAnnual ? '/year' : '/month'}
                  </span>
                </div>
                <p className="text-xs mb-7" style={{ color: isAnnual ? '#4ade80' : '#374151' }}>
                  {isAnnual ? 'Equivalent to £33.33/month — save £80' : 'Billed monthly · cancel anytime'}
                </p>
              </motion.div>

              <ul className="space-y-3 mb-8" style={{ position: 'relative' }}>
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
                  boxShadow: '0 0 30px rgba(59,130,246,0.35), 0 0 60px rgba(99,102,241,0.1)',
                  position: 'relative',
                }}>
                <Zap size={15} />
                {loading ? 'Redirecting...' : `Get Pro — ${isAnnual ? '£400/year' : '£40/month'}`}
              </motion.button>
              <p className="text-center text-xs mt-3" style={{ color: '#4a6070', position: 'relative' }}>Cancel anytime</p>
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
