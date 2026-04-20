'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { Send, X, Maximize2, Minimize2 } from 'lucide-react'
import { JarvisAvatar } from './JarvisAvatar'
import { ThinkingBlock } from './ThinkingBlock'
import { MixedMath } from '@/components/math/MathRenderer'
import { JarvisState } from '@/types'

interface Props {
  topicContext?: string
}

export function JarvisChat({ topicContext }: Props) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [jarvisState, setJarvisState] = useState<JarvisState>('idle')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { topicContext },
    onResponse: () => setJarvisState('thinking'),
    onFinish: () => setJarvisState('speaking'),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isLoading && jarvisState === 'speaking') {
      const t = setTimeout(() => setJarvisState('idle'), 2000)
      return () => clearTimeout(t)
    }
  }, [isLoading, jarvisState])

  const panelWidth = expanded ? 520 : 380
  const panelHeight = expanded ? 600 : 480

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setOpen(true); setJarvisState('idle') }}
            className="fixed bottom-6 right-6 z-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            <JarvisAvatar state={jarvisState} size={56} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: panelWidth,
              height: panelHeight,
              background: 'rgba(8,13,25,0.97)',
              border: '1px solid rgba(59,130,246,0.2)',
              boxShadow: '0 0 40px rgba(59,130,246,0.15), 0 20px 60px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0"
              style={{ borderBottom: '1px solid rgba(59,130,246,0.12)' }}>
              <JarvisAvatar state={jarvisState} size={36} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">JARVIS</p>
                <p className="text-xs" style={{ color: '#5a7aaa' }}>
                  {jarvisState === 'thinking' ? 'Reasoning...' : jarvisState === 'speaking' ? 'Responding...' : 'Ready'}
                </p>
              </div>
              <button onClick={() => setExpanded(e => !e)}
                className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors">
                {expanded ? <Minimize2 size={14} className="text-blue-400" /> : <Maximize2 size={14} className="text-blue-400" />}
              </button>
              <button onClick={() => { setOpen(false); setJarvisState('idle') }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                <X size={14} style={{ color: '#5a7aaa' }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center mt-8">
                  <p className="text-sm" style={{ color: '#5a7aaa' }}>
                    Good day. I'm JARVIS, your A-level mathematics tutor.
                    <br />How may I assist you?
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const thinking = msg.parts?.find(p => p.type === 'reasoning')?.reasoning
                const textParts = msg.parts?.filter(p => p.type === 'text') ?? []
                const textContent = textParts.length > 0
                  ? textParts.map(p => p.type === 'text' ? p.text : '').join('')
                  : msg.content

                return (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div style={{ maxWidth: '88%' }}>
                      {msg.role === 'assistant' && thinking && (
                        <ThinkingBlock thinking={thinking} isStreaming={isLoading && msg === messages[messages.length - 1]} />
                      )}
                      <div
                        className="rounded-xl px-3 py-2.5 text-sm leading-relaxed"
                        style={msg.role === 'user'
                          ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#e8f0fe' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#d1deff' }
                        }>
                        <MixedMath content={textContent} />
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit}
              className="flex gap-2 p-3 shrink-0"
              style={{ borderTop: '1px solid rgba(59,130,246,0.12)' }}>
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask Jarvis anything..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600"
                style={{ color: '#e8f0fe' }}
              />
              <button type="submit" disabled={isLoading || !input.trim()}
                className="p-2 rounded-lg transition-colors disabled:opacity-30"
                style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <Send size={14} className="text-blue-400" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
