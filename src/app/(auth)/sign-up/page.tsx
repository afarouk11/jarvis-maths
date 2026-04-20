'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { JarvisAvatar } from '@/components/jarvis/JarvisAvatar'

const EXAM_BOARDS = ['AQA', 'Edexcel', 'OCR']
const GRADES = ['A*', 'A', 'B', 'C']

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    examBoard: 'AQA',
    targetGrade: 'A*',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
      },
    })

    if (error) { setError(error.message); setLoading(false); return }

    // Update profile with exam board + target grade
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        exam_board: form.examBoard,
        target_grade: form.targetGrade,
      }).eq('id', user.id)
    }

    router.push('/dashboard')
  }

  return (
    <div className="notebook-bg min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="hud-border rounded-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <JarvisAvatar state="idle" size={64} />
            <h1 className="mt-4 text-2xl font-bold text-white">Create Account</h1>
            <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>Start your A-level journey with JARVIS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-blue-400 block mb-1">Full Name</label>
              <input
                type="text" required value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#e8f0fe' }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-400 block mb-1">Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#e8f0fe' }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-400 block mb-1">Password</label>
              <input
                type="password" required minLength={8} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#e8f0fe' }}
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-blue-400 block mb-1">Exam Board</label>
                <select value={form.examBoard}
                  onChange={e => setForm(f => ({ ...f, examBoard: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#e8f0fe' }}>
                  {EXAM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-blue-400 block mb-1">Target Grade</label>
                <select value={form.targetGrade}
                  onChange={e => setForm(f => ({ ...f, targetGrade: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#e8f0fe' }}>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
              {loading ? 'Creating account...' : 'Get started'}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: '#5a7aaa' }}>
            Already have an account?{' '}
            <Link href="/sign-in" className="text-blue-400 hover:text-blue-300">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
