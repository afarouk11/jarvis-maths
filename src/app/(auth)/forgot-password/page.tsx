'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { JarvisAvatar } from '@/components/jarvis/JarvisAvatar'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  const inputStyle = {
    background: 'rgba(59,130,246,0.07)',
    border: '1px solid rgba(59,130,246,0.18)',
    color: '#e8f0fe',
    padding: '11px 14px',
  }

  return (
    <div className="notebook-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-55%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm" style={{ position: 'relative' }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(99,102,241,0.45) 0%, rgba(59,130,246,0.25) 40%, rgba(59,130,246,0.06) 100%)',
          padding: 1, borderRadius: 22,
        }}>
          <div className="rounded-[21px] p-10"
            style={{
              background: 'rgba(9,13,25,0.88)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
            }}>

            <div className="flex flex-col items-center mb-9">
              <JarvisAvatar state="idle" size={72} />
              <h1 className="mt-5 text-white"
                style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Reset your password
              </h1>
              <p className="text-sm mt-1.5 text-center" style={{ color: '#5a7aaa' }}>
                {sent ? "Check your inbox — link sent." : "Enter your email and we'll send a reset link."}
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5"
                    style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Email
                  </label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)' }}
                    onBlur={e  => { e.target.style.borderColor = 'rgba(59,130,246,0.18)'; e.target.style.boxShadow = 'none' }}
                    placeholder="you@example.com"
                  />
                </div>

                {error && <p className="text-xs text-red-400 text-center">{error}</p>}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="w-full rounded-xl font-semibold text-sm disabled:opacity-50 mt-2"
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6, #6366f1)',
                    color: '#fff',
                    boxShadow: '0 0 24px rgba(59,130,246,0.35)',
                    padding: '13px 0',
                  }}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </motion.button>
              </form>
            ) : (
              <div className="rounded-xl px-4 py-4 text-center text-sm"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                Reset link sent to <strong>{email}</strong>. Check your spam folder if you don&apos;t see it.
              </div>
            )}

            <p className="text-center text-xs mt-7" style={{ color: '#4a6070' }}>
              <Link href="/sign-in" className="transition-colors hover:text-blue-300" style={{ color: '#60a5fa' }}>
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
