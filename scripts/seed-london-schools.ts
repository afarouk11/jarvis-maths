/**
 * Fetches London secondary schools from the DfE Get Information About Schools
 * public CSV and upserts them into the school_outreach table.
 *
 * Filters to schools that:
 *   - Are in a London borough (GOR = "London" or London LA code)
 *   - Teach up to at least age 16 (statutory high age >= 16) → confirms GCSE Maths
 *   - Have a contact email address
 *   - Are open / active
 *
 * Stores whether the school also offers A-level (statutory high age >= 18)
 * in the personalisation column so the email can reference the right courses.
 *
 * Run with:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx ts-node -r tsconfig-paths/register scripts/seed-london-schools.ts
 */

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// DfE GIAS — all establishments (open + closed), updated periodically
const GIAS_CSV_URL =
  'https://ea-edubase-api-prod.azurewebsites.net/edubase/downloads/public/edubasealldata20240601.csv'

// London Local Authority codes as a fallback filter (GOR field is cleaner but
// not always populated in older rows)
const LONDON_LA_CODES = new Set([
  201, 202, 203, 204, 205, 206, 207, 208, 209, 210,
  211, 212, 213, 301, 302, 303, 304, 305, 306, 307,
  308, 309, 310, 311, 312, 313, 314, 315, 316, 317,
  318, 319, 320, 321, 322, 323, 331, 332, 333,
])

// Establishment types that teach maths at secondary level
// (Excludes: primary, nursery, special schools, PRUs, AP academies)
const VALID_TYPES = new Set([
  'Academy sponsor led',
  'Academy converter',
  'Free schools',
  'Foundation school',
  'Voluntary aided school',
  'Voluntary controlled school',
  'Community school',
  'Studio schools',
  'University technical college',
  'Further education',
  'Sixth form centres',
  'Free schools 16 to 19',
  'Academy 16-19 sponsor led',
  'Academy 16-19 converter',
])

interface SchoolRow {
  school_name: string
  contact_email: string
  school_type: string
  borough: string
  website: string
  personalisation: {
    offersGCSE: boolean
    offersAlevel: boolean
    courses: string
    emailDerived: boolean  // true = guessed as info@domain, not from official record
  }
}

async function downloadCSV(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    function get(u: string) {
      https.get(u, res => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          get(res.headers.location)
          return
        }
        const file = fs.createWriteStream(dest)
        res.pipe(file)
        file.on('finish', () => { file.close(); resolve() })
      }).on('error', reject)
    }
    get(url)
  })
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const csvPath = path.join(__dirname, 'gias_all.csv')

  if (!fs.existsSync(csvPath)) {
    console.log('Downloading DfE GIAS data (~30 MB, one-time)...')
    await downloadCSV(GIAS_CSV_URL, csvPath)
    console.log('Download complete.')
  } else {
    console.log('Using cached GIAS CSV (delete scripts/gias_all.csv to re-download).')
  }

  const raw = fs.readFileSync(csvPath, 'latin1') // DfE CSVs use ISO-8859-1 encoding
  const records: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  })

  console.log(`\nTotal rows in GIAS dataset: ${records.length}`)
  if (records.length === 0) {
    console.error('CSV parsed as empty — check the download succeeded.')
    process.exit(1)
  }

  // Print sample column names to help debug if field names differ
  const sampleCols = Object.keys(records[0] ?? {})
  console.log('Sample columns (first 30):', sampleCols.slice(0, 30).join(' | '))

  const schools: SchoolRow[] = []
  const skipReasons: Record<string, number> = {}

  for (const r of records) {
    // ── 1. Must be open ────────────────────────────────────────────────────────
    const status = (r['EstablishmentStatus (name)'] ?? r['Status'] ?? '').toLowerCase()
    if (!status.includes('open')) {
      skipReasons['not open'] = (skipReasons['not open'] ?? 0) + 1
      continue
    }

    // ── 2. Must be in London ───────────────────────────────────────────────────
    const gor = (r['GOR (name)'] ?? r['GovernmentOfficeRegion (name)'] ?? '').toLowerCase()
    const laCode = parseInt(r['LA (code)'] ?? r['LEA code'] ?? '0', 10)
    const isLondon = gor.includes('london') || LONDON_LA_CODES.has(laCode)
    if (!isLondon) {
      skipReasons['not London'] = (skipReasons['not London'] ?? 0) + 1
      continue
    }

    // ── 3. Must teach up to at least age 16 (GCSE level) ─────────────────────
    const highAge = parseInt(
      r['StatutoryHighAge'] ?? r['Statutory High Age'] ?? r['AgeHigh'] ?? '0',
      10
    )
    if (highAge < 16) {
      skipReasons['max age < 16 (primary/junior)'] = (skipReasons['max age < 16 (primary/junior)'] ?? 0) + 1
      continue
    }

    // ── 4. Must be a valid secondary/post-16 type ─────────────────────────────
    const type = r['TypeOfEstablishment (name)'] ?? r['Type'] ?? ''
    if (!VALID_TYPES.has(type)) {
      skipReasons[`invalid type: ${type}`] = (skipReasons[`invalid type: ${type}`] ?? 0) + 1
      continue
    }

    // ── 5. Build row ──────────────────────────────────────────────────────────
    const name = (r['EstablishmentName'] ?? r['School Name'] ?? '').trim()
    if (!name) continue

    // Try explicit email field first, then derive from website domain
    const rawEmail = (
      r['Email Address'] ?? r['Email address'] ?? r['Email'] ?? r['SchoolEmail'] ?? ''
    ).trim().toLowerCase()

    const rawWebsite = (r['SchoolWebsite'] ?? r['Website'] ?? '').trim()
    const website = rawWebsite.replace(/^http:\/\//, 'https://')

    let contactEmail = ''
    let emailDerived = false

    if (rawEmail && rawEmail.includes('@')) {
      contactEmail = rawEmail
    } else if (rawWebsite) {
      // Derive info@domain from website URL — most UK schools use this pattern
      try {
        const url = new URL(rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`)
        const domain = url.hostname.replace(/^www\./, '')
        if (domain && domain.includes('.')) {
          contactEmail = `info@${domain}`
          emailDerived = true
        }
      } catch {
        // invalid URL — skip
      }
    }

    if (!contactEmail) {
      skipReasons['no email or website'] = (skipReasons['no email or website'] ?? 0) + 1
      continue
    }

    const offersGCSE   = highAge >= 16
    const offersAlevel = highAge >= 18

    schools.push({
      school_name: name,
      contact_email: contactEmail,
      school_type: type,
      borough: r['LA (name)'] ?? r['Local Authority'] ?? '',
      website,
      personalisation: {
        offersGCSE,
        offersAlevel,
        courses: offersAlevel ? 'GCSE & A-level Maths' : 'GCSE Maths',
        emailDerived,
      },
    })
  }

  console.log(`\n✓ London schools teaching Maths GCSE (or above) with an email: ${schools.length}`)
  console.log(`  — of which also offer A-level: ${schools.filter(s => s.personalisation.offersAlevel).length}`)
  console.log(`  — GCSE only: ${schools.filter(s => !s.personalisation.offersAlevel).length}`)

  if (schools.length === 0) {
    console.error('\nNo schools matched — the GIAS column names may have changed.')
    console.log('Top skip reasons:')
    Object.entries(skipReasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([reason, count]) => console.log(`  ${count.toString().padStart(6)} — ${reason}`))
    process.exit(1)
  }

  // Upsert in batches of 100
  let inserted = 0
  for (let i = 0; i < schools.length; i += 100) {
    const batch = schools.slice(i, i + 100)
    const { error } = await supabase.from('school_outreach').upsert(
      batch.map(s => ({ ...s, status: 'pending' })),
      { onConflict: 'contact_email', ignoreDuplicates: true }
    )
    if (error) {
      console.error(`\nBatch error at row ${i}:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\rInserting... ${inserted}/${schools.length}`)
    }
  }

  console.log(`\n\nDone — ${inserted} schools seeded into school_outreach table.`)
  console.log('Go to /admin/outreach to send emails.')
}

main().catch(e => { console.error(e); process.exit(1) })
