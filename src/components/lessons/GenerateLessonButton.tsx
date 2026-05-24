'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Zap, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function GenerateLessonButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const router = useRouter()

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/topics/${slug}/lesson/${data.id}`)
      } else if (res.status === 403 && data.error === 'pro_required') {
        setShowUpgrade(true)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function handleUpgrade() {
    setUpgradeLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly' }),
      })
      const data = await res.json()
      window.location.href = data.url ?? '/pricing'
    } catch {
      window.location.href = '/pricing'
    } finally {
      setUpgradeLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
          border: '1px solid rgba(139,92,246,0.3)',
          color: '#a78bfa',
        }}>
        <Sparkles size={14} />
        {loading ? 'Generating lesson...' : 'Generate lesson with SPOK'}
      </button>

      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(8,13,28,0.88)', backdropFilter: 'blur(10px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="relative w-full max-w-sm rounded-3xl p-8"
              style={{ background: 'rgba(12,17,30,0.98)', border: '1px solid rgba(245,158,11,0.25)', boxShadow: '0 0 60px rgba(245,158,11,0.08)' }}>
              <button
                onClick={() => setShowUpgrade(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg"
                style={{ color: '#4a6070' }}>
                <X size={14} />
              </button>

              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 mx-auto"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Zap size={22} style={{ color: '#f59e0b' }} />
              </div>

              <h2 className="text-lg font-bold text-white text-center mb-1"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Pro feature
              </h2>
              <p className="text-sm text-center mb-5" style={{ color: '#5a7aaa' }}>
                AI lesson generation uses Claude to build a personalised lesson just for you. Upgrade to unlock it.
              </p>

              <div className="rounded-2xl p-4 mb-5 text-center"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <p className="font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 32 }}>
                  £40<span className="text-sm font-normal" style={{ color: '#5a7aaa' }}>/month</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>or £400/year · cancel anytime</p>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  'AI-generated lessons on any topic',
                  'Unlimited SPOK chat messages',
                  'AI answer marking with feedback',
                  'Past paper AI with citations',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#fde9b8' }}>
                    <Check size={13} className="shrink-0" style={{ color: '#f59e0b' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 24px rgba(245,158,11,0.25)' }}>
                {upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro'}
              </button>
              <button
                onClick={() => setShowUpgrade(false)}
                className="w-full text-center text-xs mt-3 transition-colors hover:text-white"
                style={{ color: '#4a6070' }}>
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
