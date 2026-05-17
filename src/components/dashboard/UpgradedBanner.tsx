'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Zap } from 'lucide-react'

export function UpgradedBanner({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setVisible(false), 7000)
    return () => clearTimeout(t)
  }, [show])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="flex items-center justify-between px-4 py-3 rounded-2xl mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.06))',
            border: '1px solid rgba(245,158,11,0.3)',
            boxShadow: '0 0 40px rgba(245,158,11,0.06)',
          }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Zap size={16} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Welcome to Pro — you&apos;re all set.
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
                Unlimited SPOK, voice tutor, and extended AI thinking are now unlocked.
              </p>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="ml-4 p-1.5 rounded-lg shrink-0 transition-colors hover:text-white"
            style={{ color: '#4a6070' }}>
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
