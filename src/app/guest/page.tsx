'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StudiQLogo } from '@/components/ui/StudiQLogo'

const DEMO_EMAIL    = process.env.NEXT_PUBLIC_DEMO_EMAIL    ?? ''
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? ''

export default function GuestPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function enterAsGuest() {
      if (!DEMO_EMAIL || !DEMO_PASSWORD) {
        setError('Demo account not configured.')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (signInError) {
        setError('Could not start demo session. Please try again.')
        return
      }

      router.push('/dashboard')
    }

    enterAsGuest()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050912' }}>
        <div className="text-center space-y-4">
          <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          <a href="/schools" className="text-sm underline" style={{ color: '#60a5fa' }}>Go back</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#050912' }}>
      <StudiQLogo size={44} />
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: '#3b82f6' }} />
        <p className="text-sm" style={{ color: '#5a7aaa' }}>Setting up your demo…</p>
      </div>
    </div>
  )
}
