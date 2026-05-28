'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, X } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(Array.from(raw).map(c => c.charCodeAt(0)))
}

export function PushNotificationPrompt() {
  const [state,      setState]      = useState<'idle' | 'subscribed' | 'denied' | 'unsupported'>('idle')
  const [loading,    setLoading]    = useState(false)
  const [dismissed,  setDismissed]  = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setState('unsupported'); return
    }
    if (Notification.permission === 'denied') { setState('denied'); return }
    if (Notification.permission === 'granted') { setState('subscribed'); return }
    const d = localStorage.getItem('push-prompt-dismissed')
    if (d) setDismissed(true)
  }, [])

  async function subscribe() {
    if (!VAPID_PUBLIC_KEY) { setState('unsupported'); return }
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setState('denied'); setLoading(false); return }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const json = sub.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })

      setState('subscribed')
    } catch {
      setState('denied')
    }
    setLoading(false)
  }

  function dismiss() {
    localStorage.setItem('push-prompt-dismissed', '1')
    setDismissed(true)
  }

  if (state === 'unsupported' || state === 'subscribed' || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)' }}>

        <div className="p-2 rounded-lg shrink-0" style={{ background: 'rgba(59,130,246,0.15)' }}>
          <Bell size={14} style={{ color: '#60a5fa' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Get daily reminders</p>
          <p className="text-xs" style={{ color: '#5a7aaa' }}>
            {state === 'denied' ? 'Notifications blocked — enable in browser settings.' : 'Due topics, daily challenge, streak alerts.'}
          </p>
        </div>

        {state !== 'denied' && (
          <button onClick={subscribe} disabled={loading}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd' }}>
            {loading ? '…' : 'Enable'}
          </button>
        )}

        <button onClick={dismiss} className="shrink-0 p-1 transition-colors" style={{ color: '#3a4a5c' }}>
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
