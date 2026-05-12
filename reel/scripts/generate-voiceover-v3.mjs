/**
 * Generates the StudiQ ad voiceover via ElevenLabs.
 * SPOK is spelled "Spoke" so ElevenLabs pronounces it correctly.
 * Emotional settings: low stability, high style for cinematic delivery.
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_KEY  = 'a5c545f4946ad488efdeb0b6ecdb0e2cc284a3b12666ff8819af84aadeed475e'
const VOICE_ID = 'u02UBOIp77iFsMQucLHY'

// "Spock" = correct pronunciation for SPOK
const SCRIPT = `You've been studying for months. Every night, every weekend. And on results day... you still fall short.

It's not that you're not trying hard enough. It's that no one has ever shown you exactly where you're losing marks.

Sixty-four percent of A-level students miss their predicted grade. Not because they don't work hard. Because they're revising blind.

Spock is the AI that changes that.

Spock scans your entire A-level knowledge, builds your personal brain map, and finds every gap costing you marks — down to the exact skill. In seconds.

Unlike any textbook or tutor, Spock knows your specific mistakes. When you chat with it, it doesn't give generic answers. It shows you precisely where your reasoning broke... and fixes it, right there, in the conversation.

Your practice is targeted. Every question Spock gives you is there because that's exactly what you need — pulled from ten years of real past paper data.

And when your mock exam comes? Spock generates a full predicted paper built around your exact gaps. Nothing surprises you.

Students using StudiQ recover an average of thirty-four marks. That's the difference between a C... and an A star.

For teachers: real-time analytics on every student, updated after every session. Know who needs help before it becomes a disaster.

StudiQ. Know exactly what to revise. Start free at studiq dot org.`

const body = JSON.stringify({
  text: SCRIPT,
  model_id: 'eleven_multilingual_v2',
  voice_settings: {
    stability:        0.28,
    similarity_boost: 0.82,
    style:            0.72,
    use_speaker_boost: true,
  },
})

console.log('Generating voiceover with ElevenLabs…')

const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
  method:  'POST',
  headers: {
    'xi-api-key':   API_KEY,
    'Content-Type': 'application/json',
    'Accept':       'audio/mpeg',
  },
  body,
})

if (!res.ok) {
  const err = await res.text()
  console.error('ElevenLabs error:', res.status, err)
  process.exit(1)
}

const buf  = Buffer.from(await res.arrayBuffer())
const dest = join(__dirname, '../public/voiceover.mp3')
writeFileSync(dest, buf)
console.log(`✓ Saved ${buf.length} bytes → ${dest}`)
