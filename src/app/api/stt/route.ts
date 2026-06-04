import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

// Speech-to-text fallback for browsers without the Web Speech API (Safari,
// Firefox, most mobile browsers). The client records audio with MediaRecorder
// and posts it here. We transcribe with ElevenLabs Scribe (the same provider
// used for the SPOK voice), falling back to OpenAI Whisper if needed.
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const elevenKey = process.env.ELEVENLABS_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  if (!elevenKey && !openaiKey) {
    return Response.json({ error: 'stt_unavailable' }, { status: 503 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400 })
  }

  const audio = form.get('audio')
  if (!(audio instanceof Blob)) return Response.json({ error: 'no_audio' }, { status: 400 })
  if (audio.size === 0) return Response.json({ error: 'empty_audio' }, { status: 400 })
  if (audio.size > 10 * 1024 * 1024) return Response.json({ error: 'audio_too_large' }, { status: 413 })

  // ── Primary: ElevenLabs Scribe ──────────────────────────────────────────────
  if (elevenKey) {
    try {
      const fd = new FormData()
      fd.append('file', audio, 'speech.webm')
      fd.append('model_id', 'scribe_v1')

      const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: { 'xi-api-key': elevenKey },
        body: fd,
      })

      if (res.ok) {
        const data = await res.json()
        return Response.json({ text: (data?.text ?? '').trim() })
      }
      // Non-OK from ElevenLabs: fall through to Whisper if we have a key, else error
      if (!openaiKey) {
        const body = await res.text()
        console.error('[STT] ElevenLabs', res.status, body)
        return Response.json({ error: 'transcription_failed' }, { status: 502 })
      }
    } catch (err) {
      if (!openaiKey) {
        console.error('[STT] ElevenLabs request failed', err)
        return Response.json({ error: 'transcription_failed' }, { status: 502 })
      }
      // else fall through to Whisper
    }
  }

  // ── Fallback: OpenAI Whisper ────────────────────────────────────────────────
  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: openaiKey })
    const file = await OpenAI.toFile(audio, 'speech.webm')
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
    })
    return Response.json({ text: (transcription.text ?? '').trim() })
  } catch (err: unknown) {
    return Response.json(
      { error: 'transcription_failed', details: String(err instanceof Error ? err.message : err) },
      { status: 500 },
    )
  }
}
