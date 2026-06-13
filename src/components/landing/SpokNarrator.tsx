'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { JarvisAvatar } from '@/components/jarvis/JarvisAvatar'
import { JarvisState } from '@/types'

/** Section ids (in page order) mapped to what SPOK says when they scroll into view. */
const NARRATIONS: ReadonlyArray<{ id: string; line: string }> = [
  { id: 'how-it-works', line: 'First I work out what you actually know. Then we fix the gaps — in order of marks lost.' },
  { id: 'features',     line: "I'm not a chatbot bolted onto a textbook. Every tool here feeds my model of you." },
  { id: 'testimonials', line: 'These students let me find their weak spots early. The grades followed.' },
  { id: 'audiences',    line: 'Students learn with me. Parents see real progress. Schools get the data.' },
  { id: 'comparison',   line: 'A tutor sees you one hour a week. I never log off.' },
  { id: 'final-cta',    line: 'Your first diagnostic takes minutes. I handle everything after that.' },
]

export function SpokNarrator() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [avatarState, setAvatarState] = useState<JarvisState>('idle')
  const visibleIds = useRef<Set<string>>(new Set())
  const lastId = useRef<string | null>(null)
  const speakTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const elements = NARRATIONS
      .map(n => document.getElementById(n.id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleIds.current.add(entry.target.id)
          else visibleIds.current.delete(entry.target.id)
        }
        const current = NARRATIONS.find(n => visibleIds.current.has(n.id))
        const nextId = current ? current.id : null
        setActiveId(nextId)
        // SPOK "speaks" briefly whenever the narration changes
        if (nextId && nextId !== lastId.current) {
          setAvatarState('speaking')
          if (speakTimer.current) clearTimeout(speakTimer.current)
          speakTimer.current = setTimeout(() => setAvatarState('idle'), 1800)
        }
        lastId.current = nextId
      },
      { threshold: 0.3 },
    )
    elements.forEach(el => observer.observe(el))
    return () => {
      observer.disconnect()
      if (speakTimer.current) clearTimeout(speakTimer.current)
    }
  }, [])

  const narration = NARRATIONS.find(n => n.id === activeId)

  return (
    <div className="hidden lg:flex fixed bottom-6 left-6 z-40 items-end gap-3 pointer-events-none" aria-hidden="true">
      <AnimatePresence>
        {narration && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex items-end gap-3">
            <div style={{ width: 64, height: 64, flexShrink: 0 }}>
              <JarvisAvatar state={avatarState} size={64} transparent />
            </div>
            <div className="rounded-2xl rounded-bl-md px-4 py-3 max-w-[280px]"
              style={{
                background: 'rgba(10,16,30,0.82)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(59,130,246,0.25)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.4), 0 0 24px rgba(59,130,246,0.1)',
              }}>
              <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#3b82f6', letterSpacing: '0.14em' }}>SPOK</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={narration.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[13px] leading-relaxed"
                  style={{ color: '#cbd5e1' }}>
                  {narration.line}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
