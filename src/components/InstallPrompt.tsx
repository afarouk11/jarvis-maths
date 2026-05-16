'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { triggerInstallPrompt } from '@/lib/pwa'

interface Props {
  open: boolean
  mode: 'ios' | 'android' | null
  onDone(): void
}

export function InstallPrompt({ open, mode, onDone }: Props) {
  async function handleAndroid() {
    await triggerInstallPrompt()
    onDone()
  }

  return (
    <AnimatePresence>
      {open && mode && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onDone}
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-sm px-6 pt-5 pb-8 rounded-t-3xl"
            style={{
              background: '#0d1526',
              borderTop: '1px solid rgba(59,111,232,0.25)',
              borderLeft: '1px solid rgba(59,111,232,0.15)',
              borderRight: '1px solid rgba(59,111,232,0.15)',
            }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-6" />

            <button
              onClick={onDone}
              className="absolute top-4 right-5 text-slate-600 hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>

            {/* iOS */}
            {mode === 'ios' && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
                  Add to Home Screen
                </p>
                <h3
                  className="text-white font-bold mb-1"
                  style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 20 }}
                >
                  Install StudiQ on your iPhone
                </h3>
                <p className="text-sm mb-6" style={{ color: '#5a7aaa' }}>
                  No App Store needed — works just like a native app.
                </p>

                <div className="space-y-5 mb-7">
                  {[
                    {
                      n: 1,
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      ),
                      main: 'Tap the Share button',
                      sub: 'The icon at the bottom of your Safari browser',
                    },
                    {
                      n: 2,
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><line x1="14" y1="17" x2="21" y2="17" /><line x1="17" y1="14" x2="17" y2="21" />
                        </svg>
                      ),
                      main: 'Tap "Add to Home Screen"',
                      sub: 'Scroll down in the share sheet to find it',
                    },
                    {
                      n: 3,
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ),
                      main: 'Tap "Add" in the top right',
                      sub: 'StudiQ will appear on your home screen instantly',
                    },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: 'rgba(59,111,232,0.15)',
                          border: '1px solid rgba(59,111,232,0.3)',
                          color: '#3B6FE8',
                        }}
                      >
                        {s.icon}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-semibold text-white">{s.main}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Arrow pointing to Safari share bar */}
                <div className="flex justify-center mb-5" style={{ color: '#3B6FE8' }}>
                  <div className="flex flex-col items-center gap-1.5">
                    <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                      <line x1="8" y1="0" x2="8" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <polyline points="3,13 8,20 13,13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-medium">Share button is down here</span>
                  </div>
                </div>

                <button
                  onClick={onDone}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
                >
                  Got it — go to dashboard
                </button>
              </>
            )}

            {/* Android */}
            {mode === 'android' && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
                  Quick tip
                </p>
                <h3
                  className="text-white font-bold mb-1"
                  style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 20 }}
                >
                  Add StudiQ to your home screen
                </h3>
                <p className="text-sm mb-7" style={{ color: '#5a7aaa' }}>
                  One tap to open — works offline, no App Store needed.
                </p>
                <button
                  onClick={handleAndroid}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white mb-3 transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
                >
                  Add to home screen
                </button>
                <button
                  onClick={onDone}
                  className="w-full py-2.5 text-sm transition-colors"
                  style={{ color: '#4a6a8a' }}
                >
                  Maybe later
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
