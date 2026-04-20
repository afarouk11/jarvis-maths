'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { JarvisAvatar } from '@/components/jarvis/JarvisAvatar'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="notebook-bg min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="hud-border rounded-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <JarvisAvatar state="idle" size={64} />
            <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>JARVIS is ready to assist</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-blue-400 block mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#e8f0fe' }}
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-400 block mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#e8f0fe' }}
                placeholder="••••••••" />
            </div>

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: '#5a7aaa' }}>
            New here?{' '}
            <Link href="/sign-up" className="text-blue-400 hover:text-blue-300">Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
