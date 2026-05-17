'use client'

import { useRef, useState, useCallback } from 'react'

// Convert bullet/numbered lists to natural spoken prose before TTS
function convertListsToSpeech(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let bullets: string[] = []
  let numbered: string[] = []

  const flushBullets = () => {
    if (!bullets.length) return
    if (bullets.length === 1) {
      result.push(bullets[0] + '.')
    } else {
      const last = bullets[bullets.length - 1]
      result.push(bullets.slice(0, -1).join(', ') + ', and ' + last + '.')
    }
    bullets = []
  }

  const flushNumbered = () => {
    if (!numbered.length) return
    result.push(numbered.join('. ') + '.')
    numbered = []
  }

  for (const line of lines) {
    const bm = line.match(/^\s*[-*+]\s+(.+)/)
    const nm = line.match(/^\s*(\d+)\.\s+(.+)/)
    if (bm) {
      flushNumbered()
      bullets.push(bm[1].trim())
    } else if (nm) {
      flushBullets()
      numbered.push(nm[2].trim())
    } else {
      flushBullets()
      flushNumbered()
      result.push(line)
    }
  }
  flushBullets()
  flushNumbered()
  return result.filter(l => l !== '').join('\n')
}

function cleanForTTS(text: string): string {
  return convertListsToSpeech(text)
    // Strip [GRAPH], [ANIMATE], [KEYPOINTS] blocks entirely — never speak JSON
    .replace(/\[GRAPH\][\s\S]*?\[\/GRAPH\]/g, '')
    .replace(/\[ANIMATE\][\s\S]*?\[\/ANIMATE\]/g, '')
    .replace(/\[KEYPOINTS\][\s\S]*?\[\/KEYPOINTS\]/g, '')
    // [TOPIC:slug|Name] → just say the topic name
    .replace(/\[TOPIC:[^\]|]+\|([^\]]+)\]/g, '$1')
    // Markdown cleanup — leave LaTeX intact for the API route's stripLatex
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchTTSBlob(text: string): Promise<Blob | null> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return null
    return await res.blob()
  } catch {
    return null
  }
}

// One sample of silence at 44100 Hz — used to unlock browser autoplay on user gesture
const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

export function useJarvisVoice() {
  const audioRef         = useRef<HTMLAudioElement | null>(null)
  const animFrameRef     = useRef<number>(0)
  const audioUnlockedRef = useRef(false)

  // TTS queue: pre-fetched blobs ready to play
  const queueRef      = useRef<Array<{ blob: Blob; text: string }>>([])
  const playingRef    = useRef(false)
  // Serialise TTS fetches — chain promises so only one ElevenLabs request runs at a time
  const fetchChainRef = useRef<Promise<void>>(Promise.resolve())

  const [speaking,        setSpeaking]        = useState(false)
  const [enabled,         setEnabled]         = useState(true)
  const [amplitude,       setAmplitude]       = useState(0)
  const [currentSentence, setCurrentSentence] = useState('')
  const [spokenWordCount, setSpokenWordCount] = useState(0)
  const [totalWordCount,  setTotalWordCount]  = useState(0)
  const [completedText,   setCompletedText]   = useState('')

  function stopAmplitudeTracking() {
    cancelAnimationFrame(animFrameRef.current)
    setAmplitude(0)
  }

  // Play the next blob in the queue
  function playNext() {
    if (playingRef.current || queueRef.current.length === 0) {
      if (queueRef.current.length === 0) {
        setSpeaking(false)
        setCurrentSentence('')
        setSpokenWordCount(0)
        setTotalWordCount(0)
        stopAmplitudeTracking()
      }
      return
    }

    const { blob, text } = queueRef.current.shift()!
    const words = text.trim().split(/\s+/)
    const url   = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audioRef.current  = audio
    playingRef.current = true
    setSpeaking(true)
    setCurrentSentence(text)
    setTotalWordCount(words.length)
    setSpokenWordCount(0)

    audio.ontimeupdate = () => {
      if (!audio.duration) return
      const progress = audio.currentTime / audio.duration
      setSpokenWordCount(Math.max(1, Math.ceil(progress * words.length)))
      // Pulse amplitude for avatar animation
      setAmplitude(0.4 + Math.random() * 0.4)
    }
    audio.onended = () => {
      setSpokenWordCount(words.length)
      setCompletedText(prev => (prev ? prev + ' ' : '') + text)
      URL.revokeObjectURL(url)
      stopAmplitudeTracking()
      playingRef.current = false
      audioRef.current = null
      playNext()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      stopAmplitudeTracking()
      playingRef.current = false
      audioRef.current = null
      playNext()
    }

    audio.play().catch((err) => {
      // Autoplay was blocked — try one more time after a short yield
      setTimeout(() => {
        audio.play().catch(() => {
          playingRef.current = false
          audioRef.current = null
          playNext()
        })
      }, 100)
    })
  }

  // Call this immediately on any user gesture (Send button, Enter key, mic tap)
  // to convert the transient activation into a sticky one so audio.play()
  // succeeds even after the 5-second autoplay window has expired.
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return
    const sil = new Audio(SILENT_WAV)
    sil.play()
      .then(() => { audioUnlockedRef.current = true })
      .catch(() => {})
  }, [])

  // Queue a sentence: serialise all ElevenLabs fetches through a promise chain
  // so we never fire more than one concurrent request (prevents 429s)
  const queueSpeak = useCallback((text: string) => {
    if (!enabled) return
    const clean = cleanForTTS(text)
    if (!clean) return

    fetchChainRef.current = fetchChainRef.current.then(async () => {
      const blob = await fetchTTSBlob(clean)
      if (!blob) return
      queueRef.current.push({ blob, text: clean })
      playNext()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  const resetReveal = useCallback(() => {
    setCompletedText('')
    setCurrentSentence('')
    setSpokenWordCount(0)
  }, [])

  const stopSpeaking = useCallback(() => {
    queueRef.current = []
    playingRef.current = false
    fetchChainRef.current = Promise.resolve()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    stopAmplitudeTracking()
    setSpeaking(false)
  }, [])

  // Legacy single-shot speak (used outside streaming contexts)
  const speak = useCallback(async (text: string) => {
    if (!enabled || !text.trim()) return
    stopSpeaking()
    const clean = cleanForTTS(text)
    if (!clean) return
    setSpeaking(true)
    const blob = await fetchTTSBlob(clean)
    if (!blob) { setSpeaking(false); return }
    queueRef.current = [{ blob, text: clean }]
    playNext()
  }, [enabled, stopSpeaking])

  const partialWords = spokenWordCount > 0 && currentSentence
    ? currentSentence.trim().split(/\s+/).slice(0, spokenWordCount).join(' ')
    : ''
  const revealedText = completedText + (partialWords ? (completedText ? ' ' : '') + partialWords : '')

  return { speak, queueSpeak, stopSpeaking, unlockAudio, resetReveal, speaking, amplitude, enabled, setEnabled, currentSentence, spokenWordCount, totalWordCount, revealedText }
}

// ── Sentence buffer for streaming TTS ─────────────────────────────────────────
// Call feedText() as new chunks arrive; returns complete sentences ready to speak.
// Call flush() at end of stream for any remaining text.
export function createSentenceBuffer() {
  let buffer = ''

  const BOUNDARY = /([.!?]+\s+|[.!?]+$|\n\n)/

  function feedText(chunk: string): string[] {
    buffer += chunk
    const sentences: string[] = []

    let match: RegExpExecArray | null
    while ((match = BOUNDARY.exec(buffer)) !== null) {
      const end = match.index + match[0].length
      const sentence = buffer.slice(0, end).trim()
      if (sentence) sentences.push(sentence)
      buffer = buffer.slice(end)
    }

    return sentences
  }

  function flush(): string[] {
    const remaining = buffer.trim()
    buffer = ''
    return remaining ? [remaining] : []
  }

  return { feedText, flush }
}

export function useSpeechToText(onResult: (text: string) => void) {
  const recognitionRef = useRef<any>(null)
  const [listening, setListening] = useState(false)

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) return

    const rec = new SR() as any
    rec.continuous     = false
    rec.interimResults = false
    rec.lang           = 'en-GB'

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript as string
      onResult(transcript)
    }
    rec.onend   = () => setListening(false)
    rec.onerror = () => setListening(false)

    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }, [onResult])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { startListening, stopListening, listening }
}
