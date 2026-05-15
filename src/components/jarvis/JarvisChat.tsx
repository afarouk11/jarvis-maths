'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isReasoningUIPart, isTextUIPart } from 'ai'
import { Send, X, Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import { JarvisAvatar } from './JarvisAvatar'
import { JarvisVoice } from './JarvisVoice'
import { ThinkingBlock } from './ThinkingBlock'
import { SpokMessage } from '@/components/math/SpokMessage'
import { useJarvisVoice, useSpeechToText, createSentenceBuffer } from '@/hooks/useJarvisVoice'
import { useAccessibility } from '@/hooks/useAccessibility'
import { JarvisState } from '@/types'

interface Props {
  topicContext?: string
}

export function JarvisChat({ topicContext }: Props) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [jarvisState, setJarvisState] = useState<JarvisState>('idle')
  const [inputValue, setInputValue] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [greeting, setGreeting] = useState<string | null>(null)
  const [greetingLoading, setGreetingLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState('')
  const greetingFetchedRef = useRef(false)
  const historyLoadedRef   = useRef(false)
  const pendingUserMsgRef  = useRef('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const sentenceBufferRef = useRef(createSentenceBuffer())
  const spokenLengthRef   = useRef(0)
  const { speak, queueSpeak, stopSpeaking, unlockAudio, speaking, enabled: voiceEnabled, setEnabled: setVoiceEnabled } = useJarvisVoice()
  const { prefs: accessibilityPrefs } = useAccessibility()

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { topicContext, accessibilityPrefs, conversationHistory },
    }),
    onError: (err) => {
      if (err.message?.includes('429') || err.message?.includes('daily_limit_reached')) {
        setLimitReached(true)
      }
    },
    onFinish: ({ message }) => {
      const remaining = sentenceBufferRef.current.flush()
      remaining.forEach(s => queueSpeak(s))

      // Fallback: if streaming TTS never triggered, speak the whole message at once
      const assistantText = message.parts
        ? (message.parts.filter(isTextUIPart).map((p: any) => p.text).join('')
          || (message.parts as any[]).filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join(''))
        : (message as any).content ?? ''

      if (spokenLengthRef.current === 0 && assistantText) speak(assistantText)
      spokenLengthRef.current = 0

      // Persist this exchange to the database
      const userText = pendingUserMsgRef.current
      pendingUserMsgRef.current = ''
      const toSave: Array<{ role: string; content: string }> = []
      if (userText) toSave.push({ role: 'user', content: userText })
      if (assistantText) toSave.push({ role: 'assistant', content: assistantText })
      if (toSave.length) {
        fetch('/api/chat-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: toSave }),
        }).catch(() => {})
      }
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Feed streaming text into sentence buffer
  useEffect(() => {
    if (status !== 'streaming') return
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== 'assistant') return
    const fullText = lastMsg.parts
      ? (lastMsg.parts.filter(isTextUIPart).map((p: any) => p.text).join('')
        || (lastMsg.parts as any[]).filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join(''))
      : (lastMsg as any).content ?? ''
    const newChunk = fullText.slice(spokenLengthRef.current)
    if (!newChunk) return
    spokenLengthRef.current = fullText.length
    const sentences = sentenceBufferRef.current.feedText(newChunk)
    sentences.forEach(s => queueSpeak(s))
  }, [messages, status, queueSpeak])

  const handleTranscript = useCallback((text: string) => {
    if (!text.trim() || isLoading) return
    pendingUserMsgRef.current = text.trim()
    sendMessage({ text: text.trim() })
  }, [sendMessage, isLoading])

  const { startListening, stopListening, listening } = useSpeechToText(handleTranscript)

  useEffect(() => {
    if (isLoading) { setJarvisState('thinking'); stopSpeaking() }
  }, [isLoading, stopSpeaking])

  useEffect(() => {
    if (listening) setJarvisState('listening')
    else if (jarvisState === 'listening') setJarvisState('idle')
  }, [listening])

  useEffect(() => {
    if (speaking) setJarvisState('speaking')
    else if (jarvisState === 'speaking' && !isLoading) setJarvisState('idle')
  }, [speaking])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, greeting])

  // On open: load history from DB; if none, show proactive greeting
  useEffect(() => {
    if (!open || historyLoadedRef.current) return
    historyLoadedRef.current = true

    function fetchGreeting() {
      if (greetingFetchedRef.current) return
      greetingFetchedRef.current = true
      setGreetingLoading(true)
      fetch('/api/greeting')
        .then(r => r.json())
        .then(d => { if (d.greeting) { setGreeting(d.greeting); speak(d.greeting) } })
        .catch(() => {})
        .finally(() => setGreetingLoading(false))
    }

    fetch('/api/chat-history')
      .then(r => r.json())
      .then(d => {
        const rows: Array<{ role: string; content: string }> = d.messages ?? []
        if (rows.length === 0) {
          fetchGreeting()
        } else {
          const formatted = rows
            .map(m => `${m.role === 'user' ? 'Student' : 'SPOK'}: ${m.content}`)
            .join('\n')
          setConversationHistory(formatted)
          fetchGreeting()
        }
      })
      .catch(() => fetchGreeting())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function handleMicClick() {
    if (listening) stopListening()
    else startListening()
  }

  function handleExplainDifferently() {
    if (isLoading) return
    unlockAudio()
    stopSpeaking()
    sentenceBufferRef.current = createSentenceBuffer()
    spokenLengthRef.current = 0
    const msg = "Could you explain that differently? Try a different approach, use a simpler analogy, or break it down in a new way."
    pendingUserMsgRef.current = msg
    sendMessage({ text: msg })
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    unlockAudio()
    stopListening()
    stopSpeaking()
    sentenceBufferRef.current = createSentenceBuffer()
    spokenLengthRef.current = 0
    pendingUserMsgRef.current = inputValue.trim()
    sendMessage({ text: inputValue.trim() })
    setInputValue('')
  }

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
                <p className="text-sm font-semibold text-white">SPOK</p>
                <p className="text-xs" style={{ color: '#5a7aaa' }}>
                  {jarvisState === 'thinking' ? 'Reasoning...' : jarvisState === 'speaking' ? 'Responding...' : 'Ready'}
                </p>
              </div>
              <button onClick={() => setExpanded(e => !e)}
                className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors">
                {expanded ? <Minimize2 size={14} className="text-blue-400" /> : <Maximize2 size={14} className="text-blue-400" />}
              </button>
              <button onClick={() => { setOpen(false); setJarvisState('idle'); setGreeting(null); setConversationHistory(''); greetingFetchedRef.current = false; historyLoadedRef.current = false }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                <X size={14} style={{ color: '#5a7aaa' }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="mt-4">
                  {greetingLoading ? (
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: '#5a7aaa' }}>SPOK is checking in…</span>
                    </div>
                  ) : greeting ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl px-3 py-2.5 text-sm leading-relaxed"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#d1deff' }}>
                      <SpokMessage content={greeting} color="#d1deff" />
                    </motion.div>
                  ) : (
                    <div className="text-center mt-8">
                      <p className="text-sm" style={{ color: '#5a7aaa' }}>
                        Good day. I&apos;m SPOK, your A-level mathematics tutor.
                        <br />How may I assist you?
                      </p>
                    </div>
                  )}
                </div>
              )}

              {messages.map((msg) => {
                const parts = msg.parts ?? []
                const reasoningPart = parts.find(isReasoningUIPart)
                const textContent = parts.filter(isTextUIPart).map(p => p.text).join('')
                  || (parts as any[]).filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join('')
                const isLastMsg = msg === messages[messages.length - 1]

                if (!textContent && msg.role === 'user') return null

                return (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div style={{ maxWidth: '88%' }}>
                      {msg.role === 'assistant' && reasoningPart && (
                        <ThinkingBlock
                          thinking={(reasoningPart as any).text ?? ''}
                          isStreaming={isLoading && isLastMsg} />
                      )}
                      {(textContent || msg.role === 'assistant') && (
                        <div>
                          <div
                            className="rounded-xl px-3 py-2.5 text-sm leading-relaxed"
                            style={msg.role === 'user'
                              ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#e8f0fe' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#d1deff' }
                            }>
                            {textContent
                              ? <SpokMessage content={textContent} color="#d1deff" />
                              : <span style={{ color: '#374151' }}>...</span>
                            }
                          </div>
                          {msg.role === 'assistant' && textContent && !isLoading && (
                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              onClick={handleExplainDifferently}
                              className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                              style={{
                                background: 'rgba(99,102,241,0.08)',
                                border: '1px solid rgba(99,102,241,0.18)',
                                color: '#818cf8',
                              }}>
                              <RefreshCw size={10} />
                              Explain differently
                            </motion.button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input / upgrade prompt */}
            {limitReached ? (
              <div className="p-4 shrink-0 text-center space-y-2"
                style={{ borderTop: '1px solid rgba(59,130,246,0.12)' }}>
                <p className="text-xs" style={{ color: '#f59e0b' }}>
                  You've used all 10 free messages today.
                </p>
                <a href="/pricing"
                  className="block w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
                  Upgrade to Pro — from £40/mo
                </a>
                <p className="text-xs" style={{ color: '#374151' }}>Resets midnight · Cancel anytime</p>
              </div>
            ) : (
              <form onSubmit={handleSend}
                className="flex items-center gap-2 p-3 shrink-0"
                style={{ borderTop: '1px solid rgba(59,130,246,0.12)' }}>
                <input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={listening ? 'Listening...' : 'Ask Spok anything...'}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600"
                  style={{ color: '#e8f0fe' }}
                />
                <JarvisVoice
                  listening={listening}
                  speaking={speaking}
                  voiceEnabled={voiceEnabled}
                  onMicClick={handleMicClick}
                  onToggleVoice={() => setVoiceEnabled(v => !v)}
                />
                <button type="submit" disabled={isLoading || !inputValue.trim()}
                  className="p-2 rounded-lg transition-colors disabled:opacity-30"
                  style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <Send size={14} className="text-blue-400" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

