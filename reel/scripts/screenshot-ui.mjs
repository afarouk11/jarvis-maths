/**
 * Captures screenshots of the real StudiQ UI for embedding in the reel.
 * Uses the /demo page (no auth required) at each phase.
 */

import { chromium } from 'playwright'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/ui')
mkdirSync(OUT, { recursive: true })

const BASE = 'http://localhost:3000'

const SHOTS = [
  // Chat interface — navigate to chat and screenshot
  { path: '/chat',            file: 'ui-chat.png',     delay: 2500, selector: 'main,body' },
  // Papers / predicted papers
  { path: '/papers',          file: 'ui-papers.png',   delay: 2500, selector: 'main,body' },
  // Dashboard / home
  { path: '/dashboard',       file: 'ui-dashboard.png',delay: 2500, selector: 'main,body' },
  // Demo page — phases
  { path: '/demo',            file: 'ui-demo.png',     delay: 1500, selector: 'body' },
]

console.log('Launching headless browser…')
const browser = await chromium.launch({ headless: true })
const ctx     = await browser.newContext({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
})

for (const shot of SHOTS) {
  const page = await ctx.newPage()
  console.log(`  → ${shot.path}`)
  try {
    await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle', timeout: 10000 })
    await page.waitForTimeout(shot.delay)
    const el = await page.$(shot.selector)
    const dest = join(OUT, shot.file)
    if (el) {
      await el.screenshot({ path: dest })
    } else {
      await page.screenshot({ path: dest, fullPage: false })
    }
    console.log(`  ✓ ${shot.file}`)
  } catch (e) {
    console.log(`  ✗ ${shot.file}: ${e.message}`)
  }
  await page.close()
}

await browser.close()
console.log(`\nScreenshots saved to ${OUT}/`)
