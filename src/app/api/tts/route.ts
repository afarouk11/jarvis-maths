export const maxDuration = 30

function stripLatex(text: string): string {
  return text
    // Brand name
    .replace(/\bSPOK\b/g, 'Spock')
    // Block and inline LaTeX math — convert common patterns before stripping
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 over $2')
    .replace(/\\sqrt\{([^}]*)\}/g, 'the square root of $1')
    .replace(/\\times/g, ' times ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\pm/g, ' plus or minus ')
    .replace(/\\infty/g, ' infinity ')
    .replace(/\\pi/g, ' pi ')
    .replace(/\\theta/g, ' theta ')
    .replace(/\\alpha/g, ' alpha ')
    .replace(/\\beta/g, ' beta ')
    .replace(/\\gamma/g, ' gamma ')
    .replace(/\\delta/g, ' delta ')
    .replace(/\\lambda/g, ' lambda ')
    .replace(/\\sigma/g, ' sigma ')
    .replace(/\\mu/g, ' mu ')
    .replace(/\\leq/g, ' is less than or equal to ')
    .replace(/\\geq/g, ' is greater than or equal to ')
    .replace(/\\neq/g, ' is not equal to ')
    .replace(/\\approx/g, ' is approximately ')
    .replace(/\\cdot/g, ' times ')
    .replace(/\^2/g, ' squared')
    .replace(/\^3/g, ' cubed')
    .replace(/\^{([^}]*)}/g, ' to the power of $1')
    .replace(/\^(\w)/g, ' to the power of $1')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]*?\$/g, ' ')
    .replace(/\\\([\s\S]*?\\\)/g, ' ')
    .replace(/\\\[[\s\S]*?\\\]/g, ' ')
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    // Markdown cleanup
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Punctuation & spacing
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
        voice_settings: { stability: 0.45, similarity_boost: 0.82, style: 0.35, use_speaker_boost: true },
      }),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    console.error('[TTS]', response.status, body)
    return new Response(`TTS error: ${response.status} ${body}`, { status: response.status })
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  })
}
