'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Type, Brain, Timer } from 'lucide-react'
import { useAccessibility } from '@/hooks/useAccessibility'
import { ADHDTimer } from './ADHDTimer'

export function AccessibilityPanel() {
  const { prefs, toggle } = useAccessibility()
  const [open,      setOpen]      = useState(false)
  const [showTimer, setShowTimer] = useState(false)

  const anyActive = prefs.dyslexia || prefs.adhd

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Accessibility options"
        className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
        style={{
          background: anyActive ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${anyActive ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.12)'}`,
          backdropFilter: 'blur(12px)',
        }}>
        <span style={{ fontSize: 16 }}>♿</span>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-20 left-6 z-50 rounded-2xl p-4 w-72"
            style={{
              background: 'rgba(8,13,25,0.97)',
              border: '1px solid rgba(59,130,246,0.2)',
              boxShadow: '0 0 30px rgba(59,130,246,0.1), 0 20px 40px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
            }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Accessibility</p>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                <X size={13} style={{ color: '#5a7aaa' }} />
              </button>
            </div>

            <div className="space-y-2">

              {/* Dyslexia toggle */}
              <button
                onClick={() => toggle('dyslexia')}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left"
                style={{
                  background: prefs.dyslexia ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${prefs.dyslexia ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: prefs.dyslexia ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)' }}>
                  <Type size={15} style={{ color: prefs.dyslexia ? '#60a5fa' : '#5a7aaa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: prefs.dyslexia ? '#e8f0fe' : '#94a3b8' }}>
                    Dyslexia-friendly
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
                    OpenDyslexic font · wider spacing
                  </p>
                </div>
                <div className="w-9 h-5 rounded-full transition-all relative shrink-0"
                  style={{ background: prefs.dyslexia ? '#3b82f6' : 'rgba(255,255,255,0.1)' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: prefs.dyslexia ? '18px' : '2px' }} />
                </div>
              </button>

              {/* ADHD toggle */}
              <button
                onClick={() => toggle('adhd')}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left"
                style={{
                  background: prefs.adhd ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${prefs.adhd ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: prefs.adhd ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)' }}>
                  <Brain size={15} style={{ color: prefs.adhd ? '#f59e0b' : '#5a7aaa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: prefs.adhd ? '#e8f0fe' : '#94a3b8' }}>
                    ADHD mode
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
                    Shorter steps · frequent check-ins
                  </p>
                </div>
                <div className="w-9 h-5 rounded-full transition-all relative shrink-0"
                  style={{ background: prefs.adhd ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: prefs.adhd ? '18px' : '2px' }} />
                </div>
              </button>

              {/* Focus timer */}
              <button
                onClick={() => { setShowTimer(t => !t); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left"
                style={{
                  background: showTimer ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${showTimer ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Timer size={15} style={{ color: '#f59e0b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Focus timer</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>Pomodoro · 15, 25 or 45 min</p>
                </div>
              </button>

            </div>

            {(prefs.dyslexia || prefs.adhd) && (
              <p className="text-xs mt-3 text-center" style={{ color: '#5a7aaa' }}>
                SPOK will adapt its responses to your needs
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADHD Timer */}
      <AnimatePresence>
        {showTimer && <ADHDTimer onClose={() => setShowTimer(false)} />}
      </AnimatePresence>
    </>
  )
}
