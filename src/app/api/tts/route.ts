export const maxDuration = 30

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
    const nm = line.match(/^\s*\d+\.\s+(.+)/)
    if (bm) { flushNumbered(); bullets.push(bm[1].trim()) }
    else if (nm) { flushBullets(); numbered.push(nm[1].trim()) }
    else { flushBullets(); flushNumbered(); result.push(line) }
  }
  flushBullets()
  flushNumbered()
  return result.filter(l => l !== '').join('\n')
}

function stripLatex(text: string): string {
  text = convertListsToSpeech(text)

  // Step 1: Brand name
  text = text.replace(/\bSPOK\b/g, 'Spock')

  // Step 2: Convert LaTeX math to speakable text — BEFORE stripping delimiters
  // so patterns inside $...$ and $$...$$ are caught too

  // Fractions (specific before general)
  text = text
    .replace(/\\frac\{1\}\{2\}/g, 'a half')
    .replace(/\\frac\{1\}\{3\}/g, 'a third')
    .replace(/\\frac\{1\}\{4\}/g, 'a quarter')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 over $2')

  // Roots
  text = text
    .replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, 'the $1th root of $2')
    .replace(/\\sqrt\{([^}]*)\}/g, 'the square root of $1')
    .replace(/\\sqrt/g, 'root ')

  // Powers and indices — specific before general, braced before bare
  text = text
    .replace(/\^\{-1\}/g, ' inverse')
    .replace(/\^\{2\}/g, ' squared')
    .replace(/\^\{3\}/g, ' cubed')
    .replace(/\^\{n\+1\}/g, ' to the power of n plus 1')
    .replace(/\^\{n-1\}/g, ' to the power of n minus 1')
    .replace(/\^\{([^}]+)\}/g, (_, e) => ` to the power of ${e}`)
    .replace(/\^2/g, ' squared')
    .replace(/\^3/g, ' cubed')
    .replace(/\^(-?\w+)/g, (_, e) => ` to the power of ${e}`)

  // Subscripts — after powers so x_1^2 reads "x sub 1 squared"
  text = text
    .replace(/_\{([^}]+)\}/g, ' sub $1')
    .replace(/_(\w)/g, ' sub $1')

  // Arithmetic & relations
  text = text
    .replace(/\\times/g, ' times ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\pm/g, ' plus or minus ')
    .replace(/\\cdot/g, ' times ')
    .replace(/\\leq/g, ' less than or equal to ')
    .replace(/\\geq/g, ' greater than or equal to ')
    .replace(/\\neq/g, ' not equal to ')
    .replace(/\\approx/g, ' approximately ')
    .replace(/\\equiv/g, ' is equivalent to ')
    .replace(/\\lt/g, ' less than ')
    .replace(/\\gt/g, ' greater than ')

  // Constants & Greek letters
  text = text
    .replace(/\\infty/g, ' infinity ')
    .replace(/\\pi/g, ' pi ')
    .replace(/\\theta/g, ' theta ')
    .replace(/\\phi/g, ' phi ')
    .replace(/\\alpha/g, ' alpha ')
    .replace(/\\beta/g, ' beta ')
    .replace(/\\gamma/g, ' gamma ')
    .replace(/\\delta/g, ' delta ')
    .replace(/\\epsilon/g, ' epsilon ')
    .replace(/\\lambda/g, ' lambda ')
    .replace(/\\sigma/g, ' sigma ')
    .replace(/\\mu/g, ' mu ')
    .replace(/\\omega/g, ' omega ')
    .replace(/\\rho/g, ' rho ')

  // Calculus & functions
  text = text
    .replace(/\\int/g, ' the integral of ')
    .replace(/\\sum/g, ' the sum of ')
    .replace(/\\lim/g, ' the limit of ')
    .replace(/\\log/g, ' log ')
    .replace(/\\ln/g, ' ln ')
    .replace(/\\sin/g, ' sine ')
    .replace(/\\cos/g, ' cosine ')
    .replace(/\\tan/g, ' tangent ')
    .replace(/\\sec/g, ' sec ')
    .replace(/\\csc/g, ' cosec ')
    .replace(/\\cot/g, ' cot ')
    .replace(/\\mathrm\{d\}/g, ' d')
    .replace(/\\frac\{d\}\{dx\}/g, ' the derivative with respect to x of ')
    .replace(/\\frac\{dy\}\{dx\}/g, ' dy by dx ')

  // Step 3: Strip math delimiters but KEEP their (now-converted) content
  text = text
    .replace(/\$\$([\s\S]*?)\$\$/g, ' $1 ')
    .replace(/\$([^$\n]*?)\$/g, ' $1 ')
    .replace(/\\\(([\s\S]*?)\\\)/g, ' $1 ')
    .replace(/\\\[([\s\S]*?)\\\]/g, ' $1 ')

  // Step 4: Strip any remaining LaTeX commands, keeping their arguments
  text = text
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')

  // Step 5: Markdown cleanup
  text = text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')

  // Step 6: Clean spacing
  return text.replace(/\s+/g, ' ').trim()
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
