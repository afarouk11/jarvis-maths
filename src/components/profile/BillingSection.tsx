'use client'

import { useState } from 'react'
import { Sparkles, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function BillingSection({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) { alert(error); return }
      window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  if (isPro) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.15)' }}>
            <Sparkles size={14} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">SPOK Pro</p>
            <p className="text-xs" style={{ color: '#5a7aaa' }}>Unlimited everything · £40/mo or £400/yr</p>
          </div>
        </div>
        <button
          onClick={openPortal}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
          <ExternalLink size={11} />
          {loading ? 'Loading...' : 'Manage billing'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div>
        <p className="text-sm font-semibold text-white">Free plan</p>
        <p className="text-xs" style={{ color: '#5a7aaa' }}>10 SPOK messages/day</p>
      </div>
      <Link href="/pricing">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 0 20px rgba(59,130,246,0.25)' }}>
          <Sparkles size={11} />
          Upgrade to Pro
        </button>
      </Link>
    </div>
  )
}
