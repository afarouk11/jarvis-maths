/**
 * Downloads a CC0 ambient/cinematic background track.
 * Uses Kevin MacLeod's "Cipher" from incompetech.com (CC BY 4.0 — free to use).
 */

import { writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/music.mp3')

if (existsSync(OUT)) { console.log('music.mp3 already exists — skipping'); process.exit(0) }

// Kevin MacLeod "Cipher" — cinematic, subtle, no lyrics — CC BY 4.0
const URL = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher.mp3'

console.log('Downloading background music…')

const res = await fetch(URL, {
  headers: { 'User-Agent': 'Mozilla/5.0 StudiQ/1.0' },
})
if (!res.ok) { console.error('Download failed:', res.status); process.exit(1) }

const buf = Buffer.from(await res.arrayBuffer())
writeFileSync(OUT, buf)
console.log(`✓ Saved ${buf.length} bytes → ${OUT}`)
