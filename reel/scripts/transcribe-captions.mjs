/**
 * Transcribes voiceover.mp3 with OpenAI Whisper (segment timestamps).
 * Writes public/captions.json for the Remotion subtitle overlay.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const AUDIO  = join(__dirname, '../public/voiceover.mp3')
const OUT    = join(__dirname, '../public/captions.json')
const APIKEY = process.env.OPENAI_API_KEY

console.log('Transcribing voiceover with Whisper…')

const buf  = readFileSync(AUDIO)
const blob = new Blob([buf], { type: 'audio/mpeg' })

const form = new FormData()
form.append('file', blob, 'voiceover.mp3')
form.append('model', 'whisper-1')
form.append('response_format', 'verbose_json')
form.append('timestamp_granularities[]', 'segment')

const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${APIKEY}` },
  body: form,
})

if (!res.ok) {
  console.error('Whisper error:', res.status, await res.text())
  process.exit(1)
}

const data = await res.json()

// Split each segment into ~6-word display chunks
const captions = []
for (const seg of data.segments) {
  const words     = seg.text.trim().split(/\s+/)
  const chunkSize = 6
  const duration  = seg.end - seg.start
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    const t0    = seg.start + (i / words.length) * duration
    const t1    = seg.start + (Math.min(i + chunkSize, words.length) / words.length) * duration
    captions.push({
      text:  chunk,
      start: parseFloat(t0.toFixed(3)),
      end:   parseFloat(t1.toFixed(3)),
    })
  }
}

writeFileSync(OUT, JSON.stringify(captions, null, 2))
console.log(`✓ Wrote ${captions.length} caption segments → ${OUT}`)
