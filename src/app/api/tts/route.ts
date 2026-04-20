export const maxDuration = 30

function stripLatex(text: string): string {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, ' mathematical expression ')
    .replace(/\$[^$]*?\$/g, ' expression ')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 over $2')
    .replace(/\\sqrt\{([^}]*)\}/g, 'square root of $1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}^_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function POST(req: Request) {
  const { text } = await req.json()

  const cleanText = stripLatex(text)

  const voiceId = process.env.ELEVENLABS_VOICE_ID
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey || !voiceId) {
    return new Response('TTS not configured', { status: 503 })
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3 },
      }),
    }
  )

  if (!response.ok) {
    return new Response('TTS error', { status: response.status })
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  })
}
