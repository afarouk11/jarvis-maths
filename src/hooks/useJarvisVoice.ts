'use client'

import { useRef, useState, useCallback } from 'react'

function cleanForTTS(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/\$\$[\s\S]*?\$\$/g, ' math expression ')
    .replace(/\$[^$\n]*?\$/g, ' math expression ')
    .replace(/\\\([\s\S]*?\\\)/g, ' math expression ')
    .replace(/\\\[[\s\S]*?\\\]/g, ' math expression ')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
    .replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}^_]/g, '')
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
  const queueRef      = useRef<Array<{ blob: Blob; text: string; onReveal?: () => void }>>([])
  const playingRef    = useRef(false)
  // Serialise TTS fetches — chain promises so only one ElevenLabs request runs at a time
  const fetchChainRef = useRef<Promise<void>>(Promise.resolve())

  const [speaking,       setSpeaking]       = useState(false)
  const [enabled,        setEnabled]        = useState(true)
  const [amplitude,      setAmplitude]      = useState(0)
  const [currentSentence, setCurrentSentence] = useState('')
  const [spokenWordCount, setSpokenWordCount] = useState(0)
  const [totalWordCount,  setTotalWordCount]  = useState(0)

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

    const { blob, text, onReveal } = queueRef.current.shift()!
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
      URL.revokeObjectURL(url)
      stopAmplitudeTracking()
      playingRef.current = false
      audioRef.current = null
      playNext()
    }
    audio.onerror = () => {
      onReveal?.()
      URL.revokeObjectURL(url)
      stopAmplitudeTracking()
      playingRef.current = false
      audioRef.current = null
      playNext()
    }

    audio.play()
      .then(() => { onReveal?.() })
      .catch(() => {
        // Autoplay was blocked — try one more time after a short yield
        setTimeout(() => {
          audio.play()
            .then(() => { onReveal?.() })
            .catch(() => {
              onReveal?.()
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
  // so we never fire more than one concurrent request (prevents 429s).
  // onReveal fires when the audio for this sentence actually starts playing.
  const queueSpeak = useCallback((text: string, onReveal?: () => void) => {
    if (!enabled) {
      onReveal?.()
      return
    }
    const clean = cleanForTTS(text)
    if (!clean) {
      onReveal?.()
      return
    }

    fetchChainRef.current = fetchChainRef.current.then(async () => {
      const blob = await fetchTTSBlob(clean)
      if (!blob) {
        onReveal?.()
        return
      }
      queueRef.current.push({ blob, text: clean, onReveal })
      playNext()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  const stopSpeaking = useCallback(() => {
    // Flush any pending reveals so text isn't left hidden
    queueRef.current.forEach(item => item.onReveal?.())
    queueRef.current = []
    playingRef.current = false
    fetchChainRef.current = Promise.resolve() // discard queued fetches
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

  return { speak, queueSpeak, stopSpeaking, unlockAudio, speaking, amplitude, enabled, setEnabled, currentSentence, spokenWordCount, totalWordCount }
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
