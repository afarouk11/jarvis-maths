/**
 * Fetches London secondary schools from the DfE Get Information About Schools
 * public CSV and upserts them into the school_outreach table.
 *
 * Run with:
 *   npx ts-node -r tsconfig-paths/register scripts/seed-london-schools.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

// DfE GIAS public download — all open state-funded schools
// Updated URL: https://ea-edubase-api-prod.azurewebsites.net/edubase/downloads/public/links_edubaseallstatefunded20240101.csv
// We use the "all establishments" extract which includes contact emails
const GIAS_CSV_URL =
  'https://ea-edubase-api-prod.azurewebsites.net/edubase/downloads/public/edubasealldata20240601.csv'

// London Local Authority numbers (DfE codes)
const LONDON_LA_CODES = new Set([
  201, 202, 203, 204, 205, 206, 207, 208, 209, 210, // Inner London
  211, 212, 213, 301, 302, 303, 304, 305, 306, 307, // Inner London cont.
  308, 309, 310, 311, 312, 313, 314, 315, 316, 317, // Outer London
  318, 319, 320, 321, 322, 323, 331, 332, 333,       // Outer London cont.
])

// Phase codes for secondary schools
const SECONDARY_PHASES = new Set(['Secondary', 'All-through', '16 plus'])

// Establishment types to include
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
])

interface SchoolRow {
  school_name: string
  contact_email: string
  school_type: string
  borough: string
  website: string
}

async function downloadCSV(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        https.get(res.headers.location!, r2 => {
          r2.pipe(file)
          file.on('finish', () => { file.close(); resolve() })
        }).on('error', reject)
        return
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', reject)
  })
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const csvPath = path.join(__dirname, 'gias_all.csv')

  if (!fs.existsSync(csvPath)) {
    console.log('Downloading GIAS data from DfE...')
    await downloadCSV(GIAS_CSV_URL, csvPath)
    console.log('Download complete.')
  } else {
    console.log('Using cached GIAS CSV.')
  }

  const raw = fs.readFileSync(csvPath, 'latin1') // DfE CSVs use ISO-8859-1
  const records: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  })

  console.log(`Total records in GIAS: ${records.length}`)

  const schools: SchoolRow[] = []

  for (const r of records) {
    // Filter: London LA
    const laCode = parseInt(r['LA (code)'] ?? r['LEA code'] ?? '0', 10)
    if (!LONDON_LA_CODES.has(laCode)) continue

    // Filter: open establishments only
    const status = r['EstablishmentStatus (name)'] ?? r['Status'] ?? ''
    if (!status.toLowerCase().includes('open')) continue

    // Filter: secondary phase
    const phase = r['PhaseOfEducation (name)'] ?? r['Phase'] ?? ''
    if (!SECONDARY_PHASES.has(phase)) continue

    // Must have an email
    const email = (r['SchoolWebsite'] ?? r['Email'] ?? '').trim().toLowerCase()
    // GIAS often stores website not email — we'll use school email field
    const contactEmail = (r['Email address'] ?? r['SchoolEmail'] ?? '').trim().toLowerCase()
    if (!contactEmail || !contactEmail.includes('@')) continue

    const name = (r['EstablishmentName'] ?? r['School Name'] ?? '').trim()
    if (!name) continue

    const type = r['TypeOfEstablishment (name)'] ?? r['Type'] ?? 'Secondary'
    const borough = r['LA (name)'] ?? r['Local Authority'] ?? ''
    const website = (r['SchoolWebsite'] ?? '').trim().replace(/^http:\/\//, 'https://')

    schools.push({
      school_name: name,
      contact_email: contactEmail,
      school_type: type,
      borough,
      website,
    })
  }

  console.log(`London secondary schools with email: ${schools.length}`)

  if (schools.length === 0) {
    console.error('No schools found — check column names in the CSV match the parser above.')
    console.log('Sample columns:', Object.keys(records[0] ?? {}).slice(0, 20).join(', '))
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
      console.error('Batch error:', error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\rInserted ${inserted}/${schools.length}...`)
    }
  }

  console.log(`\nDone. ${inserted} schools seeded into school_outreach.`)
}

main().catch(e => { console.error(e); process.exit(1) })
