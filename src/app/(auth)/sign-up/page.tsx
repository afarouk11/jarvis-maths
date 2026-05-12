'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { JarvisAvatar } from '@/components/jarvis/JarvisAvatar'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding')
  }

  const inputStyle = {
    background: 'rgba(59,130,246,0.07)',
    border: '1px solid rgba(59,130,246,0.18)',
    color: '#e8f0fe',
    padding: '11px 14px',
  }
  const labelStyle = { fontSize: 11, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }

  function focusInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = 'rgba(99,102,241,0.45)'
    e.target.style.boxShadow   = '0 0 0 3px rgba(99,102,241,0.08)'
  }
  function blurInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = 'rgba(59,130,246,0.18)'
    e.target.style.boxShadow   = 'none'
  }

  return (
    <div className="notebook-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-55%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md" style={{ position: 'relative' }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(99,102,241,0.45) 0%, rgba(59,130,246,0.25) 40%, rgba(59,130,246,0.06) 100%)',
          padding: 1, borderRadius: 22,
        }}>
          <div className="rounded-[21px] p-10"
            style={{
              background: 'rgba(9,13,25,0.88)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(59,130,246,0.04)',
            }}>

            <div className="flex flex-col items-center mb-9">
              <JarvisAvatar state="idle" size={72} />
              <h1 className="mt-5 text-white"
                style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Your A* starts here.
              </h1>
              <p className="text-sm mt-1.5" style={{ color: '#5a7aaa' }}>SPOK will take care of the rest.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1.5" style={labelStyle}>Full Name</label>
                <input type="text" required value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full rounded-xl text-sm outline-none transition-all"
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                  placeholder="Your name" />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl text-sm outline-none transition-all"
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Password</label>
                <input type="password" required minLength={8} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl text-sm outline-none transition-all"
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                  placeholder="Min. 8 characters" />
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
                {loading ? 'Creating account...' : 'Get started'}
              </motion.button>
            </form>

            <p className="text-center text-xs mt-7" style={{ color: '#4a6070' }}>
              Already have an account?{' '}
              <Link href="/sign-in" className="transition-colors hover:text-blue-300" style={{ color: '#60a5fa' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
