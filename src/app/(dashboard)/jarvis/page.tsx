'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isReasoningUIPart, isTextUIPart } from 'ai'
import { Send, Mic, MicOff, Volume2, VolumeX, RefreshCw, Zap, Check, X } from 'lucide-react'
import { ThinkingBlock } from '@/components/jarvis/ThinkingBlock'
import { CHAT_SKILL_MODES, type SkillModeId } from '@/lib/spok-skills'
import { useAccessibility } from '@/hooks/useAccessibility'

const JarvisScene = dynamic(
  () => import('@/components/jarvis/JarvisScene').then(m => m.JarvisScene),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
)
import { SpokMessage } from '@/components/math/SpokMessage'
import { AnimatedGraphRenderer, parseAnimateSpec, type AnimateSpec } from '@/components/math/GraphRenderer'
import { useJarvisVoice, useSpeechToText, createSentenceBuffer } from '@/hooks/useJarvisVoice'
import type { JarvisState } from '@/types'

export default function SpokPage() {
  const [jarvisState, setJarvisState]   = useState<JarvisState>('idle')
  const [inputValue,  setInputValue]    = useState('')
  const [activeMode,  setActiveMode]    = useState<SkillModeId | null>(null)
  const { prefs: accessibilityPrefs, loaded: accessibilityLoaded }  = useAccessibility()
  const activeModeRef                  = useRef(activeMode)
  const accessibilityPrefsRef          = useRef(accessibilityPrefs)
  useEffect(() => { activeModeRef.current = activeMode }, [activeMode])
  useEffect(() => { accessibilityPrefsRef.current = accessibilityPrefs }, [accessibilityPrefs])
  const [clock, setClock] = useState('')
  const [greeting, setGreeting] = useState<string | null>(null)
  const [greetingLoading, setGreetingLoading] = useState(false)
  const greetingFetchedRef = useRef(false)
  const [animateSpec, setAnimateSpec] = useState<AnimateSpec | null>(null)
  const [animateStep, setAnimateStep] = useState(0)
  const prevSentenceRef = useRef('')
  const [limitReached, setLimitReached] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  useEffect(() => {
    function tick() {
      setClock(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  const {
    speak, queueSpeak, stopSpeaking, unlockAudio, resetReveal, speaking, amplitude, enabled: voiceEnabled, setEnabled: setVoiceEnabled,
    currentSentence, spokenWordCount, totalWordCount, revealedText,
  } = useJarvisVoice()

  const sentenceBufferRef = useRef(createSentenceBuffer())
  const spokenLengthRef   = useRef(0)

  async function handleUpgrade() {
    setUpgradeLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        window.location.href = '/pricing'
      }
    } catch {
      window.location.href = '/pricing'
    } finally {
      setUpgradeLoading(false)
    }
  }

  const { messages, sendMessage, status } = useChat({
    transport: useMemo(() => new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({ skillMode: activeModeRef.current, accessibilityPrefs: accessibilityPrefsRef.current }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []),
    onError: (err) => {
      if (err.message?.includes('daily_limit_reached') || err.message?.includes('429')) {
        setLimitReached(true)
      }
    },
    onFinish: ({ message }) => {
      const remaining = sentenceBufferRef.current.flush()
      remaining.forEach(s => queueSpeak(s))

      // Fallback: if streaming TTS never triggered, speak the whole message at once
      if (spokenLengthRef.current === 0) {
        const text = message.parts
          ? (message.parts.filter(isTextUIPart).map((p: any) => p.text).join('')
            || (message.parts as any[]).filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join(''))
          : (message as any).content ?? ''
        if (text) speak(text)
      }

      spokenLengthRef.current = 0
      setJarvisState('speaking')
      setTimeout(() => setJarvisState('idle'), 500)
    },
  })

  // Parse [ANIMATE] blocks from the last assistant message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== 'assistant') return
    const fullText = lastMsg.parts
      ? (lastMsg.parts.filter(isTextUIPart).map((p: any) => p.text).join('')
        || (lastMsg.parts as any[]).filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join(''))
      : (lastMsg as any).content ?? ''

    const match = fullText.match(/\[ANIMATE\]([\s\S]*?)\[\/ANIMATE\]/)
    if (match) {
      const parsed = parseAnimateSpec(match[1].trim())
      if (parsed) {
        setAnimateSpec(parsed)
        setAnimateStep(0)
        prevSentenceRef.current = ''
      }
    }
  }, [messages])

  // Advance animate step each time a new sentence starts playing
  useEffect(() => {
    if (!animateSpec || !currentSentence) return
    if (currentSentence === prevSentenceRef.current) return
    prevSentenceRef.current = currentSentence
    setAnimateStep(prev => Math.min(prev + 1, animateSpec.steps.length - 1))
  }, [currentSentence, animateSpec])

  // Feed streaming text into sentence buffer as it arrives
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
    sentences.forEach(s => {
      queueSpeak(s)
      setJarvisState('speaking')
    })
  }, [messages, status, queueSpeak])

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleTranscript = useCallback((text: string) => {
    if (!text.trim() || isLoading) return
    unlockAudio()
    stopSpeaking()
    resetReveal()
    sentenceBufferRef.current = createSentenceBuffer()
    spokenLengthRef.current = 0
    sendMessage({ text: text.trim() })
  }, [sendMessage, stopSpeaking, unlockAudio, resetReveal, isLoading])

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

  // Proactive greeting — wait for accessibility prefs to load so encouragement mode is respected
  useEffect(() => {
    if (!accessibilityLoaded) return
    if (greetingFetchedRef.current) return
    greetingFetchedRef.current = true
    setGreetingLoading(true)
    const greetingUrl = accessibilityPrefsRef.current.encouragement ? '/api/greeting?encouragement=1' : '/api/greeting'
    fetch(greetingUrl)
      .then(r => r.json())
      .then(d => {
        if (d.greeting) {
          setGreeting(d.greeting)
          speak(d.greeting)
        }
      })
      .catch(() => {})
      .finally(() => setGreetingLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessibilityLoaded])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    unlockAudio()
    stopListening()
    stopSpeaking()
    resetReveal()
    sentenceBufferRef.current = createSentenceBuffer()
    spokenLengthRef.current = 0
    setAnimateSpec(null)
    setAnimateStep(0)
    sendMessage({ text: inputValue.trim() })
    setInputValue('')
  }

  function sendQuick(text: string) {
    if (isLoading) return
    unlockAudio()
    stopSpeaking()
    resetReveal()
    sentenceBufferRef.current = createSentenceBuffer()
    spokenLengthRef.current = 0
    setAnimateSpec(null)
    setAnimateStep(0)
    sendMessage({ text })
  }

  const statusLabel = {
    thinking:  'Processing...',
    speaking:  'Responding',
    listening: 'Listening',
    idle:      'Ready',
  }[jarvisState]

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden relative" style={{ background: '#080d19' }}>

      {/* ── Daily limit upgrade modal ─────────────────────────────────── */}
      <AnimatePresence>
        {limitReached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(8,13,28,0.88)', backdropFilter: 'blur(10px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="relative w-full max-w-sm rounded-3xl p-8"
              style={{ background: 'rgba(12,17,30,0.98)', border: '1px solid rgba(245,158,11,0.25)', boxShadow: '0 0 60px rgba(245,158,11,0.08)' }}>
              <button
                onClick={() => setLimitReached(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
                style={{ color: '#4a6070' }}>
                <X size={14} />
              </button>

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 mx-auto"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Zap size={22} style={{ color: '#f59e0b' }} />
              </div>

              <h2 className="text-lg font-bold text-white text-center mb-1"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Daily limit reached
              </h2>
              <p className="text-sm text-center mb-5" style={{ color: '#5a7aaa' }}>
                You&apos;ve used your 10 free SPOK messages today. Upgrade for unlimited access, voice tutor, and more.
              </p>

              {/* Price */}
              <div className="rounded-2xl p-4 mb-5 text-center"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <p className="font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 32 }}>
                  £40<span className="text-sm font-normal" style={{ color: '#5a7aaa' }}>/month</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>or £400/year · cancel anytime</p>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {[
                  'Unlimited SPOK conversations',
                  'Voice tutor — speak your questions',
                  'Extended AI thinking mode',
                  'Past paper AI with citations',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#fde9b8' }}>
                    <Check size={13} className="shrink-0" style={{ color: '#f59e0b' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 24px rgba(245,158,11,0.25)' }}>
                {upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro'}
              </button>
              <button
                onClick={() => setLimitReached(false)}
                className="w-full text-center text-xs mt-3 transition-colors hover:text-white"
                style={{ color: '#4a6070' }}>
                Maybe tomorrow
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT — Chat ─────────────────────────────────────────────────── */}
      <div className="flex flex-col w-[52%] border-r" style={{ borderColor: 'rgba(59,130,246,0.1)' }}>

        {/* Header */}
        <div className="px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3b82f6' }}>
            SPOK Interface
          </p>
          <p className="text-sm mt-0.5" style={{ color: '#5a7aaa' }}>
            Just A Rather Very Intelligent System
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {messages.length === 0 && (
            <div className="mt-12">
              {greetingLoading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#f59e0b' }}
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
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#fde9b8' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>SPOK</p>
                  <SpokMessage content={greeting} color="#fde9b8" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-2">
                  <p className="text-sm font-medium text-white">Good day.</p>
                  <p className="text-sm" style={{ color: '#5a7aaa' }}>
                    I&apos;m SPOK, your A-level mathematics tutor.<br />
                    How may I assist you today?
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {messages.map((msg) => {
            const parts        = msg.parts ?? []
            const reasoningPart = parts.find(isReasoningUIPart)
            const textContent  = parts.filter(isTextUIPart).map(p => p.text).join('')
              || (parts as any[]).filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join('')
            const isLastMsg    = msg === messages[messages.length - 1]

            if (!textContent && msg.role === 'user') return null

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div style={{ maxWidth: '85%' }}>
                  {msg.role === 'assistant' && reasoningPart && (
                    <ThinkingBlock
                      thinking={(reasoningPart as any).text ?? ''}
                      isStreaming={isLoading && isLastMsg} />
                  )}
                  {(textContent || msg.role === 'assistant') && (
                    <div
                      className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                      style={msg.role === 'user'
                        ? { background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.3)', color: '#e8f0fe' }
                        : { background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#fde9b8' }
                      }>
                      {msg.role === 'assistant' && (
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>
                          SPOK
                        </p>
                      )}
                      {textContent
                        ? <SpokMessage content={textContent} color="#fde9b8" />
                        : <span className="animate-pulse" style={{ color: '#374151' }}>...</span>
                      }
                    </div>
                  )}
                  {msg.role === 'assistant' && isLastMsg && !isLoading && textContent && (
                    <motion.button
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      onClick={() => sendQuick('Can you explain that differently? Try a different angle or approach.')}
                      className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#5a7aaa',
                      }}>
                      <RefreshCw size={11} />
                      Explain differently
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Skill mode chips */}
        <div className="px-6 pt-3 pb-0 shrink-0 flex items-center gap-2 flex-wrap"
          style={{ borderTop: '1px solid rgba(59,130,246,0.08)' }}>
          {CHAT_SKILL_MODES.map(mode => {
            const isActive = activeMode === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(isActive ? null : mode.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: isActive ? `${mode.color}22` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? mode.color + '55' : 'rgba(255,255,255,0.07)'}`,
                  color: isActive ? mode.color : '#4a6070',
                  boxShadow: isActive ? `0 0 12px ${mode.glowColor}` : 'none',
                }}>
                <span>{mode.emoji}</span>
                {mode.shortLabel}
              </button>
            )
          })}
          {activeMode && (
            <span className="text-xs ml-1" style={{ color: '#4a6070' }}>
              {CHAT_SKILL_MODES.find(m => m.id === activeMode)?.description}
            </span>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend}
          className="px-6 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(59,130,246,0.1)' }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={listening ? 'Listening...' : 'Ask SPOK anything...'}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600"
              style={{ color: '#e8f0fe' }}
            />
            {/* Mic */}
            <button
              type="button"
              onClick={() => listening ? stopListening() : startListening()}
              className="p-2 rounded-xl transition-all"
              style={{
                background: listening ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${listening ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: listening ? '#4ade80' : '#5a7aaa',
              }}>
              {listening ? <Mic size={14} /> : <MicOff size={14} />}
            </button>
            {/* Stop speaking / voice toggle */}
            <button
              type="button"
              onClick={() => {
                if (speaking) {
                  stopSpeaking()
                } else {
                  setVoiceEnabled(v => !v)
                }
              }}
              title={speaking ? 'Stop speaking' : voiceEnabled ? 'Mute voice' : 'Unmute voice'}
              className="p-2 rounded-xl transition-all"
              style={{
                background: speaking
                  ? 'rgba(239,68,68,0.15)'
                  : voiceEnabled
                    ? 'rgba(245,158,11,0.1)'
                    : 'rgba(255,255,255,0.04)',
                border: `1px solid ${speaking ? 'rgba(239,68,68,0.4)' : voiceEnabled ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: speaking ? '#f87171' : voiceEnabled ? '#f59e0b' : '#5a7aaa',
              }}>
              {speaking ? <VolumeX size={14} /> : voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            {/* Send */}
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2 rounded-xl transition-all disabled:opacity-30"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.35)' }}>
              <Send size={14} className="text-blue-400" />
            </button>
          </div>
        </form>
      </div>

      {/* ── RIGHT — Spok visual ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">

        {/* Background HUD grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Corner HUD brackets */}
        {[
          'top-4 left-4 border-t border-l',
          'top-4 right-4 border-t border-r',
          'bottom-4 left-4 border-b border-l',
          'bottom-4 right-4 border-b border-r',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-8 h-8 ${cls}`}
            style={{ borderColor: 'rgba(245,158,11,0.3)' }} />
        ))}

        {/* Scan line animation */}
        <motion.div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)' }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        <AnimatePresence mode="wait">
          {animateSpec ? (
            /* ── Animated graph teaching panel ── */
            <motion.div
              key="graph-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 w-full px-8 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
                  SPOK · Drawing
                </p>
                <button
                  onClick={() => { setAnimateSpec(null); setAnimateStep(0) }}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: 'rgba(245,158,11,0.4)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  ✕ dismiss
                </button>
              </div>
              <AnimatedGraphRenderer
                spec={animateSpec}
                currentStep={animateStep}
                className="w-full"
              />
              {/* Step progress dots */}
              <div className="flex items-center gap-1.5 justify-center mt-1">
                {animateSpec.steps.map((_, i) => (
                  <div key={i} className="rounded-full transition-all duration-300"
                    style={{
                      width: i <= animateStep ? 6 : 4,
                      height: i <= animateStep ? 6 : 4,
                      background: i <= animateStep ? '#f59e0b' : 'rgba(245,158,11,0.2)',
                    }} />
                ))}
              </div>
            </motion.div>
          ) : (
            /* ── Default sphere + word display ── */
            <motion.div
              key="sphere-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Outer orbit ring */}
              <motion.div
                className="absolute rounded-full border"
                style={{ width: 420, height: 420, borderColor: 'rgba(245,158,11,0.08)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#f59e0b' }} />
              </motion.div>

              {/* Inner orbit ring */}
              <motion.div
                className="absolute rounded-full border"
                style={{ width: 340, height: 340, borderColor: 'rgba(245,158,11,0.06)' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.6)' }} />
              </motion.div>

              {/* Three.js neural sphere — click to talk */}
              <div className="relative z-10 w-80 h-80">
                <JarvisScene
                  state={jarvisState}
                  amplitude={amplitude}
                  className="w-full h-full"
                  onClick={() => listening ? stopListening() : startListening()}
                />
              </div>

              {/* Click hint */}
              <AnimatePresence>
                {jarvisState === 'idle' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-28 text-xs font-mono"
                    style={{ color: 'rgba(245,158,11,0.35)' }}>
                    tap to speak
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Live word display */}
              <AnimatePresence mode="wait">
                {currentSentence && (
                  <motion.div
                    key={currentSentence}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 mt-6 px-6 max-w-sm text-center leading-relaxed"
                    style={{ minHeight: 48 }}>
                    {currentSentence.trim().split(/\s+/).map((word, i) => (
                      <span
                        key={i}
                        className="inline-block mr-1 transition-all duration-100"
                        style={{
                          color: i < spokenWordCount ? '#f59e0b' : 'rgba(245,158,11,0.18)',
                          fontWeight: i < spokenWordCount ? 600 : 400,
                          fontSize: 15,
                        }}>
                        {word}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status + waveform bars below */}
        <div className="relative z-10 mt-4 flex flex-col items-center gap-3">
          {/* Live waveform bars — amplitude driven */}
          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: 20 }, (_, i) => {
              const phase = Math.sin((i / 20) * Math.PI)
              const barH  = speaking ? `${8 + phase * amplitude * 80}%` : '15%'
              return (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    background: `rgba(245,158,11,${0.3 + amplitude * 0.7})`,
                    height: barH,
                    transition: 'height 0.08s ease-out',
                    minHeight: '4px',
                  }}
                />
              )
            })}
          </div>

          {/* Status label */}
          <motion.p
            key={jarvisState}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: jarvisState === 'listening' ? '#4ade80' : '#f59e0b' }}>
            {statusLabel}
          </motion.p>

          {/* HUD readout line */}
          <p className="text-xs font-mono" style={{ color: 'rgba(245,158,11,0.3)' }}>
            AMP {(amplitude * 100).toFixed(0).padStart(3, '0')} · {clock}
          </p>
        </div>
      </div>
    </div>
  )
}

