'use client'

import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  reset: () => void
  message?: string
}

export function RouteError({ reset, message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertTriangle size={20} style={{ color: '#f87171' }} />
      </div>

      <h2 className="text-lg font-semibold text-white mb-2"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        Something went wrong
      </h2>
      <p className="text-sm mb-6 max-w-xs"
        style={{ color: '#5a7aaa' }}>
        {message ?? 'Failed to load this page. Try again or head back to the dashboard.'}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            color: '#60a5fa',
          }}>
          <RefreshCw size={13} />
          Try again
        </button>

        <Link href="/dashboard"
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#5a7aaa',
          }}>
          Dashboard
        </Link>
      </div>
    </div>
  )
}
