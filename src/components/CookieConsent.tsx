'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'studiq_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // localStorage blocked (private browsing etc.) — don't show banner
    }
  }, [])

  function accept(choice: 'all' | 'necessary') {
    try {
      localStorage.setItem(STORAGE_KEY, choice)
    } catch { /* ignore */ }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 620,
            zIndex: 9999,
          }}
        >
          <div style={{
            background: 'rgba(7,11,22,0.95)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 20,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
            padding: '18px 20px',
          }}>
            <div className="flex items-start gap-3">

              {/* Icon */}
              <div className="shrink-0 mt-0.5 p-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <Cookie size={15} style={{ color: '#60a5fa' }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  We use cookies
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#5a7aaa' }}>
                  We use essential cookies to keep you signed in, and optional analytics cookies to understand how students use StudiQ so we can improve it.{' '}
                  <a href="/cookies" className="underline transition-colors hover:text-blue-400" style={{ color: '#4a7aaa' }}>
                    Learn more
                  </a>
                </p>
              </div>

              {/* Dismiss (necessary only shortcut) */}
              <button
                onClick={() => accept('necessary')}
                className="shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: '#3a4a5a' }}
                aria-label="Accept necessary only"
              >
                <X size={14} />
              </button>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 mt-4 justify-end">
              <button
                onClick={() => accept('necessary')}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#5a7aaa',
                }}
              >
                Necessary only
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => accept('all')}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                  boxShadow: '0 0 16px rgba(59,130,246,0.25)',
                }}
              >
                Accept all
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
