'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isReasoningUIPart, isTextUIPart } from 'ai'
import { Send, Mic, MicOff, Volume2, VolumeX, RefreshCw, Zap, Check, X, Lock, Square, ChevronLeft, ChevronRight, Paperclip } from 'lucide-react'
import { ThinkingBlock } from '@/components/jarvis/ThinkingBlock'
import { JarvisAvatar } from '@/components/jarvis/JarvisAvatar'
import dynamic from 'next/dynamic'
const JarvisScene = dynamic(() => import('@/components/jarvis/JarvisScene').then(m => ({ default: m.JarvisScene })), { ssr: false })
import { CHAT_SKILL_MODES, type SkillModeId } from '@/lib/spok-skills'
import { useAccessibility } from '@/hooks/useAccessibility'
import { SpokMessage } from '@/components/math/SpokMessage'
import { AnimatedGraphRenderer, parseAnimateSpec, type AnimateSpec } from '@/components/math/GraphRenderer'
import { DiagramRenderer, parseDiagramSpec, type DiagramSpec } from '@/components/math/DiagramRenderer'
import { AnimatedDiagramRenderer, parseAnimDiagramSpec, type AnimDiagramSpec } from '@/components/math/AnimatedDiagramRenderer'
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
  const [diagramSpec, setDiagramSpec] = useState<DiagramSpec | null>(null)
  const [animDiagramSpec, setAnimDiagramSpec] = useState<AnimDiagramSpec | null>(null)
  const [animDiagramStep, setAnimDiagramStep] = useState(0)
  // Track last-set spec JSON to avoid re-rendering diagrams on every streaming chunk
  const lastAnimateSpecJsonRef  = useRef<string | null>(null)
  const lastDiagramSpecJsonRef  = useRef<string | null>(null)
  const lastAnimDiagramJsonRef  = useRef<string | null>(null)
  const prevSentenceRef = useRef('')
  const [limitReached, setLimitReached] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [messagesUsedToday, setMessagesUsedToday] = useState<number | null>(null)
  const [avgMastery, setAvgMastery] = useState<number>(0)
  const FREE_LIMIT = 5

  // Photo input for handwritten working
  const [pendingImage, setPendingImage]     = useState<string | null>(null)
  const pendingImageRef                     = useRef<string | null>(null)
  const fileInputRef                        = useRef<HTMLInputElement>(null)

  // Quick reply chips from SPOK's last response
  const [quickReplies, setQuickReplies]     = useState<string[]>([])
  // "Try it yourself" interactive problem
  const [tryItSpec, setTryItSpec]           = useState<{ question: string; hint: string; answer: string; topic: string } | null>(null)
  const [tryItAnswer, setTryItAnswer]       = useState('')
  const [tryItHintShown, setTryItHintShown] = useState(false)
  // Previous session history
  const [historyMessages, setHistoryMessages] = useState<Array<{ role: string; content: string }>>([])
  const historyRef        = useRef<string>('')
  const hasSeededHistory  = useRef(false)

  useEffect(() => {
    function tick() {
      setClock(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((p: { stripe_subscription_status?: string; chat_messages_today?: number; chat_messages_reset_at?: string }) => {
        const isPro = p.stripe_subscription_status === 'active' || p.stripe_subscription_status === 'trialing'
        if (!isPro) {
          const today = new Date().toISOString().slice(0, 10)
          const count = p.chat_messages_reset_at === today ? (p.chat_messages_today ?? 0) : 0
          setMessagesUsedToday(count)
        }
      })
      .catch(() => {})
    fetch('/api/progress')
      .then(r => r.json())
      .then((rows: Array<{ p_known: number }>) => {
        if (Array.isArray(rows) && rows.length > 0) {
          setAvgMastery(rows.reduce((s, r) => s + (r.p_known ?? 0), 0) / rows.length)
        }
      })
      .catch(() => {})
    // Load last session's messages to seed SPOK's memory
    fetch('/api/chat-history')
      .then(r => r.json())
      .then((d: { messages?: Array<{ role: string; content: string }> }) => {
        const msgs = d.messages ?? []
        if (msgs.length === 0) return
        setHistoryMessages(msgs)
        historyRef.current = msgs
          .map(m => `${m.role === 'user' ? 'Student' : 'SPOK'}: ${m.content.slice(0, 300)}`)
          .join('\n\n')
      })
      .catch(() => {})
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
      body: () => ({
        skillMode: activeModeRef.current,
        accessibilityPrefs: accessibilityPrefsRef.current,
        conversationHistory: !hasSeededHistory.current ? (historyRef.current || undefined) : undefined,
        imageData: pendingImageRef.current ?? undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []),
    onError: (err) => {
      if (err.message?.includes('daily_limit_reached') || err.message?.includes('429')) {
        setLimitReached(true)
      }
    },
    onFinish: ({ message }) => {
      setMessagesUsedToday(prev => prev !== null ? prev + 1 : null)
      const remaining = sentenceBufferRef.current.flush()
      remaining.forEach(s => queueSpeak(s))

      // Fallback: if streaming TTS never triggered AND flush produced nothing, speak the whole message at once.
      // Must check remaining.length — speak() calls stopSpeaking() which would kill any queueSpeak() chains.
      if (spokenLengthRef.current === 0 && remaining.length === 0) {
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

  // Parse visual/interactive blocks from the last assistant message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== 'assistant') return
    const fullText = lastMsg.parts
      ? (lastMsg.parts.filter(isTextUIPart).map((p: any) => p.text).join('')
        || (lastMsg.parts as any[]).filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join(''))
      : (lastMsg as any).content ?? ''

    // Visual panels — only one active at a time.
    // JSON-compare before setting state to avoid re-rendering the visual on every streaming chunk.
    const animMatch = fullText.match(/\[ANIMATE\]([\s\S]*?)\[\/ANIMATE\]/)
    if (animMatch) {
      const parsed = parseAnimateSpec(animMatch[1].trim())
      if (parsed) {
        const j = JSON.stringify(parsed)
        if (j !== lastAnimateSpecJsonRef.current) {
          lastAnimateSpecJsonRef.current = j
          lastDiagramSpecJsonRef.current = null
          lastAnimDiagramJsonRef.current = null
          setAnimateSpec(parsed)
          setAnimateStep(0)
          setDiagramSpec(null)
          setAnimDiagramSpec(null)
          prevSentenceRef.current = ''
        }
      }
    } else {
      const adiagramMatch = fullText.match(/\[ADIAGRAM\]([\s\S]*?)\[\/ADIAGRAM\]/)
      if (adiagramMatch) {
        const parsed = parseAnimDiagramSpec(adiagramMatch[1].trim())
        if (parsed) {
          const j = JSON.stringify(parsed)
          if (j !== lastAnimDiagramJsonRef.current) {
            lastAnimDiagramJsonRef.current = j
            lastAnimateSpecJsonRef.current = null
            lastDiagramSpecJsonRef.current = null
            setAnimDiagramSpec(parsed)
            setAnimDiagramStep(0)
            setAnimateSpec(null)
            setDiagramSpec(null)
          }
        }
      } else {
        const diagMatch = fullText.match(/\[DIAGRAM\]([\s\S]*?)\[\/DIAGRAM\]/)
        if (diagMatch) {
          const parsed = parseDiagramSpec(diagMatch[1].trim())
          if (parsed) {
            const j = JSON.stringify(parsed)
            if (j !== lastDiagramSpecJsonRef.current) {
              lastDiagramSpecJsonRef.current = j
              lastAnimateSpecJsonRef.current = null
              lastAnimDiagramJsonRef.current = null
              setDiagramSpec(parsed)
              setAnimateSpec(null)
              setAnimDiagramSpec(null)
            }
          }
        }
      }
    }

    // Quick reply chips
    const qrMatch = fullText.match(/\[QUICKREPLIES\]([\s\S]*?)\[\/QUICKREPLIES\]/)
    if (qrMatch) {
      try { setQuickReplies(JSON.parse(qrMatch[1].trim())) } catch { setQuickReplies([]) }
    } else {
      setQuickReplies(prev => prev.length === 0 ? prev : [])
    }

    // "Try it yourself" interactive problem
    const tryItMatch = fullText.match(/\[TRYIT\]([\s\S]*?)\[\/TRYIT\]/)
    if (tryItMatch) {
      try {
        const spec = JSON.parse(tryItMatch[1].trim())
        setTryItSpec(spec)
        setTryItAnswer('')
        setTryItHintShown(false)
      } catch {}
    }
  }, [messages])

  // Advance animate step each time a new sentence starts playing
  useEffect(() => {
    if (!currentSentence) return
    if (currentSentence === prevSentenceRef.current) return
    prevSentenceRef.current = currentSentence

    if (animateSpec) {
      setAnimateStep(prev => Math.min(prev + 1, animateSpec.steps.length - 1))
    }
    if (animDiagramSpec) {
      setAnimDiagramStep(prev => Math.min(prev + 1, animDiagramSpec.steps.length - 1))
    }
  }, [currentSentence, animateSpec, animDiagramSpec])

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
    setAnimateSpec(null)
    setAnimateStep(0)
    setDiagramSpec(null)
    setAnimDiagramSpec(null)
    setAnimDiagramStep(0)
    setQuickReplies([])
    hasSeededHistory.current = true
    sendMessage({ text: text.trim() })
  }, [sendMessage, stopSpeaking, unlockAudio, resetReveal, isLoading])

  const { startListening, stopListening, listening } = useSpeechToText(handleTranscript)

  useEffect(() => {
    if (isLoading) { setJarvisState('thinking'); stopSpeaking() }
  }, [isLoading, stopSpeaking])

  useEffect(() => {
    if (listening) setJarvisState('listening')
    else setJarvisState(prev => prev === 'listening' ? 'idle' : prev)
  }, [listening])

  useEffect(() => {
    if (speaking) setJarvisState('speaking')
    else setJarvisState(prev => (prev === 'speaking' && !isLoading) ? 'idle' : prev)
  }, [speaking, isLoading])

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
    setDiagramSpec(null)
    setAnimDiagramSpec(null)
    setAnimDiagramStep(0)
    setQuickReplies([])
    hasSeededHistory.current = true
    pendingImageRef.current = pendingImage
    sendMessage({ text: inputValue.trim() })
    setInputValue('')
    setPendingImage(null)
    pendingImageRef.current = null
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result
      if (typeof result === 'string') {
        setPendingImage(result)
        if (!inputValue.trim()) {
          setInputValue('Here is my working — please mark it step by step.')
        }
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
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
    setDiagramSpec(null)
    setAnimDiagramSpec(null)
    setAnimDiagramStep(0)
    setQuickReplies([])
    hasSeededHistory.current = true
    sendMessage({ text })
  }

  function handleTryItSubmit() {
    if (!tryItSpec || !tryItAnswer.trim()) return
    const q = tryItSpec.question
    const a = tryItAnswer.trim()
    setTryItSpec(null)
    setTryItAnswer('')
    setTryItHintShown(false)
    sendQuick(`[Try it] Question: "${q}" — My answer: "${a}". Please mark this step by step.`)
  }

  const statusLabel = {
    thinking:  'Processing...',
    speaking:  'Responding',
    listening: 'Listening',
    idle:      'Ready',
  }[jarvisState]

  const handleElementClick = useCallback((label: string, _description: string) => {
    setInputValue(`I think ${label} = `)
    inputRef.current?.focus()
  }, [])

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
                That’s your 5 free chats for today
              </h2>
              <p className="text-sm text-center mb-5" style={{ color: '#7c98c4' }}>
                Nice work today! Your free messages refresh tomorrow — or go Pro for unlimited chats, the voice tutor, and more whenever you like.
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
            Scientific Predictor of Knowledge
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

          {/* Previous session — shown only before the student sends a new message */}
          {historyMessages.length > 0 && messages.length === 0 && (
            <div className="pb-4 mb-2" style={{ borderBottom: '1px solid rgba(59,130,246,0.07)' }}>
              <p className="text-xs text-center mb-4 font-mono" style={{ color: '#1e2d3d' }}>
                last session
              </p>
              <div className="space-y-3">
                {historyMessages.slice(-6).map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="rounded-xl px-3 py-2 text-xs leading-relaxed"
                      style={{
                        maxWidth: '80%',
                        opacity: 0.35,
                        ...(msg.role === 'user'
                          ? { background: 'rgba(59,130,246,0.12)', color: '#e8f0fe' }
                          : { background: 'rgba(245,158,11,0.05)', color: '#fde9b8' }),
                      }}>
                      {msg.role === 'assistant' && (
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#f59e0b' }}>SPOK</p>
                      )}
                      <p>{msg.content.replace(/\[[\w]+\][\s\S]*?\[\/[\w]+\]/g, '').trim().slice(0, 180)}{msg.content.length > 180 ? '…' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.length === 0 && (
            <div className="mt-6">
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
                  {msg.role === 'assistant' && isLastMsg && !isLoading && textContent && quickReplies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-2 flex flex-wrap gap-2">
                      {quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => sendQuick(reply)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', color: '#5a7aaa' }}>
                          {reply}
                        </button>
                      ))}
                    </motion.div>
                  )}
                  {msg.role === 'assistant' && isLastMsg && !isLoading && textContent && quickReplies.length === 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      onClick={() => sendQuick('Can you explain that differently? Try a different angle or approach.')}
                      className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#5a7aaa' }}>
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

        {/* Free tier message counter */}
        {messagesUsedToday !== null && (
          <div className="px-6 pt-2 pb-0 shrink-0 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(59,130,246,0.08)' }}>
            <div className="flex items-center gap-2">
              {Array.from({ length: FREE_LIMIT }, (_, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i < messagesUsedToday ? 'rgba(245,158,11,0.8)' : 'rgba(255,255,255,0.1)' }} />
              ))}
              <span className="text-xs ml-1" style={{ color: messagesUsedToday >= FREE_LIMIT - 1 ? '#f59e0b' : '#4a6070' }}>
                {Math.max(0, FREE_LIMIT - messagesUsedToday)} free {Math.max(0, FREE_LIMIT - messagesUsedToday) === 1 ? 'message' : 'messages'} left today
              </span>
            </div>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
              style={{ color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)' }}>
              Upgrade
            </button>
          </div>
        )}

        {/* Pre-warning — gentle heads-up on the last free message, before the wall */}
        {messagesUsedToday !== null && FREE_LIMIT - messagesUsedToday === 1 && !limitReached && (
          <div className="px-6 pt-2 shrink-0">
            <div className="rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span aria-hidden>👋</span>
              <p className="text-xs" style={{ color: '#fcd34d' }}>
                Last free message for today — make it count! Pro gives you unlimited chats whenever you’re ready.
              </p>
            </div>
          </div>
        )}

        {/* Skill mode chips */}
        <div className="px-6 pt-3 pb-0 shrink-0 flex items-center gap-2 flex-wrap"
          style={{ borderTop: messagesUsedToday !== null ? 'none' : '1px solid rgba(59,130,246,0.08)' }}>
          {CHAT_SKILL_MODES.map(mode => {
            const isActive = activeMode === mode.id
            const isLocked = mode.minMastery > 0 && avgMastery < mode.minMastery
            const pct = Math.round(mode.minMastery * 100)
            return (
              <div key={mode.id} className="relative group">
                <button
                  type="button"
                  onClick={() => !isLocked && setActiveMode(isActive ? null : mode.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: isLocked ? 'rgba(255,255,255,0.02)' : isActive ? `${mode.color}22` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' : isActive ? mode.color + '55' : 'rgba(255,255,255,0.07)'}`,
                    color: isLocked ? '#2a3a4a' : isActive ? mode.color : '#4a6070',
                    boxShadow: isActive && !isLocked ? `0 0 12px ${mode.glowColor}` : 'none',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                  }}>
                  {isLocked ? <Lock size={10} /> : <span>{mode.emoji}</span>}
                  {mode.shortLabel}
                </button>
                {isLocked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    style={{ background: 'rgba(12,17,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    Unlocks at {pct}% avg mastery
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                      style={{ borderTopColor: 'rgba(12,17,30,0.95)' }} />
                  </div>
                )}
              </div>
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
          {/* Image thumbnail preview */}
          {pendingImage && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pendingImage} alt="Working" className="h-14 w-20 object-cover rounded-lg"
                  style={{ border: '1px solid rgba(59,130,246,0.35)' }} />
                <button type="button" onClick={() => setPendingImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#ef4444', color: 'white' }}>
                  <X size={8} />
                </button>
              </div>
              <span className="text-xs" style={{ color: '#5a7aaa' }}>Photo attached — SPOK will mark your working</span>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.15)' }}>
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
              className="hidden" onChange={handleImageSelect} />
            {/* Camera button */}
            <button type="button" onClick={() => fileInputRef.current?.click()}
              title="Attach photo of working"
              className="p-1.5 rounded-lg transition-all shrink-0"
              style={{
                background: pendingImage ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${pendingImage ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: pendingImage ? '#60a5fa' : '#5a7aaa',
              }}>
              <Paperclip size={13} />
            </button>
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
            {/* Voice on/off toggle */}
            <button
              type="button"
              onClick={() => setVoiceEnabled(v => !v)}
              title={voiceEnabled ? 'Mute voice' : 'Unmute voice'}
              className="p-2 rounded-xl transition-all"
              style={{
                background: voiceEnabled ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${voiceEnabled ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: voiceEnabled ? '#f59e0b' : '#5a7aaa',
              }}>
              {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            {/* Stop button — slides in only when SPOK is speaking */}
            <AnimatePresence>
              {speaking && (
                <motion.button
                  type="button"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 380 }}
                  onClick={stopSpeaking}
                  title="Stop SPOK"
                  className="p-2 rounded-xl transition-colors flex items-center gap-1.5 px-3"
                  style={{
                    background: 'rgba(239,68,68,0.18)',
                    border: '1px solid rgba(239,68,68,0.5)',
                    color: '#f87171',
                    boxShadow: '0 0 14px rgba(239,68,68,0.25)',
                  }}>
                  <Square size={11} fill="currentColor" />
                  <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Stop</span>
                </motion.button>
              )}
            </AnimatePresence>
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

      {/* ── RIGHT — Full-panel Three.js canvas with overlaid UI ─────── */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#080d19' }}>

        {/* Three.js canvas fills the entire panel — tap to speak or interrupt */}
        <div className="absolute inset-0" style={{ cursor: 'pointer' }}
          onClick={() => {
            if (speaking) { stopSpeaking(); startListening() }
            else if (listening) stopListening()
            else startListening()
          }}>
          <JarvisScene amplitude={amplitude} state={jarvisState} />
        </div>

        {/* ── Slide panel — shared layout for ANIMATE (graph) and ADIAGRAM (geometry) ── */}
        <AnimatePresence>
          {(animateSpec || (animDiagramSpec && !diagramSpec)) && (() => {
            const isGraph  = !!animateSpec
            const steps    = isGraph ? animateSpec!.steps : animDiagramSpec!.steps
            const step     = isGraph ? animateStep : animDiagramStep
            const setStep  = isGraph
              ? (n: number) => setAnimateStep(n)
              : (n: number) => setAnimDiagramStep(n)
            const dismiss  = isGraph
              ? () => { setAnimateSpec(null); setAnimateStep(0) }
              : () => { setAnimDiagramSpec(null); setAnimDiagramStep(0) }
            const label    = steps[step]?.label ?? ''
            const total    = steps.length

            return (
              <motion.div
                key={isGraph ? 'graph-slide' : 'adiagram-slide'}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 z-20 flex flex-col px-6 py-5"
                style={{ background: 'rgba(8,13,25,0.90)', backdropFilter: 'blur(10px)' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
                      {isGraph ? 'SPOK · Graph' : 'SPOK · Diagram'}
                    </p>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(245,158,11,0.1)', color: 'rgba(245,158,11,0.6)' }}>
                      {step + 1} / {total}
                    </span>
                  </div>
                  <button onClick={dismiss} className="text-xs px-2 py-1 rounded-lg"
                    style={{ color: 'rgba(245,158,11,0.4)', border: '1px solid rgba(245,158,11,0.12)' }}>
                    ✕ dismiss
                  </button>
                </div>

                {/* Visual — fills available space */}
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  {isGraph
                    ? <AnimatedGraphRenderer spec={animateSpec!} currentStep={step} className="w-full" />
                    : <AnimatedDiagramRenderer spec={animDiagramSpec!} currentStep={step} className="w-full" onElementClick={handleElementClick} />
                  }
                </div>

                {/* Step label */}
                <AnimatePresence mode="wait">
                  {label && (
                    <motion.p
                      key={label}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-center leading-snug mt-3 shrink-0"
                      style={{ color: 'rgba(253,233,184,0.85)', minHeight: '1.25rem' }}>
                      {label}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Navigation row */}
                <div className="flex items-center justify-between mt-4 shrink-0">
                  {/* Prev arrow */}
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-20 hover:scale-[1.04] active:scale-[0.97]"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                    <ChevronLeft size={14} />
                    Back
                  </button>

                  {/* Dot indicators — clickable */}
                  <div className="flex items-center gap-2">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setStep(i)}
                        className="rounded-full transition-all duration-200 hover:scale-125"
                        style={{
                          width:  i === step ? 8 : 5,
                          height: i === step ? 8 : 5,
                          background: i < step
                            ? 'rgba(245,158,11,0.4)'
                            : i === step
                              ? '#f59e0b'
                              : 'rgba(245,158,11,0.15)',
                        }} />
                    ))}
                  </div>

                  {/* Next arrow */}
                  <button
                    onClick={() => setStep(Math.min(total - 1, step + 1))}
                    disabled={step === total - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-20 hover:scale-[1.04] active:scale-[0.97]"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })()}
        </AnimatePresence>

        {/* Static diagram panel — no steps, just the full diagram */}
        <AnimatePresence>
          {diagramSpec && !animateSpec && !animDiagramSpec && (
            <motion.div
              key="diagram-panel"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 z-20 flex flex-col px-6 py-5"
              style={{ background: 'rgba(8,13,25,0.90)', backdropFilter: 'blur(10px)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 shrink-0">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
                  SPOK · Diagram
                </p>
                <button onClick={() => setDiagramSpec(null)} className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: 'rgba(245,158,11,0.4)', border: '1px solid rgba(245,158,11,0.12)' }}>
                  ✕ dismiss
                </button>
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <DiagramRenderer spec={diagramSpec} className="w-full" onElementClick={handleElementClick} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Try it yourself" interactive problem panel */}
        <AnimatePresence>
          {tryItSpec && !animateSpec && !diagramSpec && !animDiagramSpec && (
            <motion.div
              key="tryit-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 gap-4"
              style={{ background: 'rgba(8,13,25,0.92)', backdropFilter: 'blur(8px)' }}
              onClick={e => e.stopPropagation()}>
              <div className="w-full max-w-sm space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4ade80' }}>
                    Your turn · {tryItSpec.topic}
                  </p>
                  <button
                    onClick={() => { setTryItSpec(null); setTryItAnswer(''); setTryItHintShown(false) }}
                    className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
                    style={{ color: 'rgba(74,222,128,0.5)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    ✕ skip
                  </button>
                </div>
                {/* Question */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(74,222,128,0.18)' }}>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: '#e8f0fe' }}>{tryItSpec.question}</p>
                </div>
                {/* Hint */}
                <AnimatePresence>
                  {tryItHintShown && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-xs px-4 py-3 rounded-xl leading-relaxed"
                      style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      Hint: {tryItSpec.hint}
                    </motion.p>
                  )}
                </AnimatePresence>
                {/* Input */}
                <input
                  value={tryItAnswer}
                  onChange={e => setTryItAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && tryItAnswer.trim() && handleTryItSubmit()}
                  placeholder="Type your answer here…"
                  autoFocus
                  className="w-full bg-transparent text-sm outline-none px-4 py-3 rounded-xl"
                  style={{ color: '#e8f0fe', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.25)' }}
                />
                {/* Actions */}
                <div className="flex gap-2">
                  {!tryItHintShown && (
                    <button
                      onClick={() => setTryItHintShown(true)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{ color: '#5a7aaa', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      Show hint
                    </button>
                  )}
                  <button
                    onClick={handleTryItSubmit}
                    disabled={!tryItAnswer.trim()}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-30 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'rgba(74,222,128,0.18)', border: '1px solid rgba(74,222,128,0.35)' }}>
                    Check answer →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle panel — overall mastery when no visual is active */}
        <AnimatePresence>
          {jarvisState === 'idle' && !animateSpec && !diagramSpec && !animDiagramSpec && !tryItSpec && avgMastery > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute top-7 left-0 right-0 z-10 flex flex-col items-center gap-2 pointer-events-none">
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(245,158,11,0.25)' }}>
                Overall mastery
              </p>
              <div className="flex items-center gap-3">
                <div className="rounded-full overflow-hidden" style={{ width: 96, height: 4, background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(avgMastery * 100)}%`, background: 'rgba(245,158,11,0.45)' }} />
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(245,158,11,0.3)' }}>
                  {Math.round(avgMastery * 100)}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live word display — centre of panel */}
        <AnimatePresence mode="wait">
          {currentSentence && !animateSpec && !diagramSpec && !animDiagramSpec && !tryItSpec && (
            <motion.div
              key={currentSentence}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 right-0 bottom-40 z-10 px-8 text-center leading-relaxed pointer-events-none"
            >
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

        {/* Tap to speak hint */}
        <AnimatePresence>
          {jarvisState === 'idle' && !animateSpec && !diagramSpec && !animDiagramSpec && !tryItSpec && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-24 left-0 right-0 text-center text-xs font-mono z-10 pointer-events-none"
              style={{ color: 'rgba(245,158,11,0.35)' }}>
              tap to speak · or interrupt
            </motion.p>
          )}
        </AnimatePresence>

        {/* Status + waveform — bottom of panel */}
        <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-2 pointer-events-none">
          {/* Live waveform bars */}
          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: 20 }, (_, i) => {
              const phase = Math.sin((i / 20) * Math.PI)
              const barH  = speaking ? `${8 + phase * amplitude * 80}%` : '15%'
              return (
                <div
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

          <motion.p
            key={jarvisState}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: jarvisState === 'listening' ? '#4ade80' : '#f59e0b' }}>
            {statusLabel}
          </motion.p>

          <p className="text-xs font-mono" style={{ color: 'rgba(245,158,11,0.3)' }}>
            AMP {(amplitude * 100).toFixed(0).padStart(3, '0')} · {clock}
          </p>
        </div>
      </div>
    </div>
  )
}

