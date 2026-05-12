/**
 * StudiQ Reel Agent
 *
 * Fully automated pipeline:
 *   1. Screen-records studiq.org/demo in portrait (1080x1920)
 *   2. Overlays bold hook caption
 *   3. Mixes in the cinematic voiceover
 *   4. (Optional) mixes in background music at low volume
 *   5. Exports a final MP4 ready for Instagram Reels
 *
 * Usage:
 *   node scripts/create-reel.mjs
 *   node scripts/create-reel.mjs --music /path/to/track.mp3
 *   node scripts/create-reel.mjs --caption "Your custom hook text"
 *   node scripts/create-reel.mjs --url http://localhost:3000/demo
 */

import { chromium } from 'playwright'
import { execSync } from 'child_process'
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'

// ─── Config ────────────────────────────────────────────────────────────────
const HOME        = process.env.HOME
const ARGS        = Object.fromEntries(
  process.argv.slice(2).reduce((acc, val, i, arr) => {
    if (val.startsWith('--')) acc.push([val.slice(2), arr[i + 1] ?? true])
    return acc
  }, [])
)

const DEMO_URL     = ARGS.url      ?? 'https://studiq.org/demo?record'
const VOICEOVER    = ARGS.voice    ?? join(HOME, 'Downloads/studiq_ad_voiceover_v2.mp3')
const MUSIC_PATH   = ARGS.music    ?? null   // optional background track
const CAPTION_LINE1 = 'This AI knows exactly'
const CAPTION_LINE2 = "where you're losing marks"
const CAPTION      = ARGS.caption  ?? null   // single-line override
const RECORD_MS    = Number(ARGS.duration ?? 48000)
const OUTPUT       = ARGS.output   ?? join(HOME, 'Downloads/studiq_reel_final.mp4')
const TMP_DIR      = '/tmp/studiq-reel'
const FONT         = '/System/Library/Fonts/ArialHB.ttc'
// ───────────────────────────────────────────────────────────────────────────

function log(msg)  { console.log(`\x1b[36m▶\x1b[0m  ${msg}`) }
function ok(msg)   { console.log(`\x1b[32m✓\x1b[0m  ${msg}`) }
function warn(msg) { console.log(`\x1b[33m⚠\x1b[0m  ${msg}`) }
function run(cmd)  { execSync(cmd, { stdio: 'pipe' }) }

mkdirSync(TMP_DIR, { recursive: true })

// ─── Step 1: Record demo page ───────────────────────────────────────────────
log(`Recording ${DEMO_URL} for ${RECORD_MS / 1000}s…`)

// Record at phone resolution with 2× pixel density — content fills frame natively
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport:         { width: 390, height: 693 },  // exact 9:16
  deviceScaleFactor: 2,
  recordVideo: { dir: TMP_DIR, size: { width: 390, height: 693 } },
})
const page = await context.newPage()

await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(RECORD_MS)

await context.close()
await browser.close()

const webmFiles = readdirSync(TMP_DIR).filter(f => f.endsWith('.webm')).sort()
if (!webmFiles.length) { console.error('No recording found in', TMP_DIR); process.exit(1) }
const WEBM = join(TMP_DIR, webmFiles.at(-1))
ok(`Recording saved: ${WEBM}`)

// ─── Step 2: Convert WebM → MP4 ────────────────────────────────────────────
log('Converting to MP4 and scaling to 1080x1920…')
const RAW_MP4 = join(TMP_DIR, 'raw.mp4')
run(`ffmpeg -y -i "${WEBM}" -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset fast -crf 18 -an "${RAW_MP4}"`)
ok('Converted to MP4')

// ─── Step 3: Render caption PNG via Pillow, overlay with ffmpeg ─────────────
log('Rendering caption overlay...')

const line1 = CAPTION ?? CAPTION_LINE1
const line2 = CAPTION ? null : CAPTION_LINE2
const CAPTION_PNG = join(TMP_DIR, 'caption.png')
const PY_SCRIPT   = join(TMP_DIR, 'make_caption.py')

writeFileSync(PY_SCRIPT, `
from PIL import Image, ImageDraw, ImageFont

line1 = ${JSON.stringify(line1)}
line2 = ${JSON.stringify(line2)}
out   = ${JSON.stringify(CAPTION_PNG)}

W, H = 1080, 360
img  = Image.new('RGBA', (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 82, index=0)

lines = [line1] + ([line2] if line2 else [])
y = 20
for text in lines:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw   = bbox[2] - bbox[0]
    th   = bbox[3] - bbox[1]
    x    = (W - tw) // 2
    pad  = 24
    # solid dark pill — no transparency issues with ffmpeg overlay
    draw.rounded_rectangle([x - pad, y - 12, x + tw + pad, y + th + 12], radius=18, fill=(0, 0, 0, 210))
    # white text
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    y += th + 18

img.save(out, 'PNG')
`)

run(`python3 "${PY_SCRIPT}"`)
ok('Caption PNG rendered')

const CAPTIONED = join(TMP_DIR, 'captioned.mp4')
run(
  `ffmpeg -y -i "${RAW_MP4}" -i "${CAPTION_PNG}" ` +
  `-filter_complex "[0:v][1:v]overlay=(W-w)/2:60[v]" ` +
  `-map "[v]" -c:v libx264 -preset fast -crf 18 -an "${CAPTIONED}"`
)
ok('Caption overlay applied')

// ─── Step 4: Mix audio ─────────────────────────────────────────────────────
log('Mixing audio…')

const voiceOk = existsSync(VOICEOVER)
const musicOk = MUSIC_PATH && existsSync(MUSIC_PATH)

if (!voiceOk) warn(`Voiceover not found at ${VOICEOVER} — exporting without audio`)

let finalCmd
if (voiceOk && musicOk) {
  // Voice at full volume + music at 20% underneath, mixed together
  finalCmd = `ffmpeg -y \
    -i "${CAPTIONED}" \
    -i "${VOICEOVER}" \
    -i "${MUSIC_PATH}" \
    -filter_complex "\
      [1:a]volume=1.0[voice]; \
      [2:a]volume=0.20[music]; \
      [voice][music]amix=inputs=2:duration=shortest[a]" \
    -map 0:v -map "[a]" \
    -c:v copy -c:a aac -b:a 192k \
    -shortest "${OUTPUT}"`
} else if (voiceOk) {
  finalCmd = `ffmpeg -y \
    -i "${CAPTIONED}" \
    -i "${VOICEOVER}" \
    -map 0:v -map 1:a \
    -c:v copy -c:a aac -b:a 192k \
    -shortest "${OUTPUT}"`
} else {
  finalCmd = `ffmpeg -y -i "${CAPTIONED}" -c:v copy "${OUTPUT}"`
}

run(finalCmd)
ok(`Final reel exported: ${OUTPUT}`)

// ─── Step 5: Clean up tmp ──────────────────────────────────────────────────
;[WEBM, RAW_MP4, CAPTIONED].forEach(f => { try { unlinkSync(f) } catch {} })

// ─── Done ──────────────────────────────────────────────────────────────────
console.log(`
\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Reel ready: ${OUTPUT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
Post to Instagram Reels as-is, or open in CapCut to add trending music.
`)
