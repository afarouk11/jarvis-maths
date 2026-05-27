/**
 * Seed graph reference images into the knowledge base.
 *
 * For each visual A-level topic:
 *  1. Fetch a known CC-licensed SVG from Wikimedia Commons (no search API)
 *  2. Upload to Supabase Storage (knowledge-images bucket)
 *  3. Describe it with Claude Vision (Haiku)
 *  4. Embed the description with OpenAI
 *  5. Insert into knowledge_base as type='graph_example'
 *
 * Run: node scripts/seed-graph-images.mjs
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'

// ─── Env ──────────────────────────────────────────────────────────────────────

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx), l.slice(idx + 1).trim()]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
const ANTHROPIC_KEY = env.ANTHROPIC_API_KEY

// ─── Curated Wikimedia Commons images ─────────────────────────────────────────
// All CC-BY-SA or Public Domain. Using Special:FilePath (stable redirect) with
// width=800 so we get a PNG thumbnail even for SVG sources.
// License verified: https://commons.wikimedia.org/wiki/File:<filename>

const COMMONS_BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath/'

const VISUAL_TOPICS = [
  {
    slug: 'algebra-functions',
    title: 'Quadratic Function — Parabola',
    file: 'Parabola2.svg',
    license: 'Public domain',
  },
  {
    slug: 'coordinate-geometry',
    title: 'Circle in Coordinate Geometry',
    file: 'Tangent_to_a_curve.svg',
    license: 'CC BY-SA 3.0',
  },
  {
    slug: 'trigonometry',
    title: 'Sine and Cosine Graphs — One Period',
    file: 'Sine_cosine_one_period.svg',
    license: 'Public domain',
  },
  {
    slug: 'exponentials-logarithms',
    title: 'Exponential and Natural Logarithm Curves',
    file: 'Lnex.svg',
    license: 'Public domain',
  },
  {
    slug: 'differentiation',
    title: 'Derivative — Tangent Line to a Curve',
    file: 'Derivative_-_geometric_meaning.svg',
    license: 'CC BY-SA 3.0',
  },
  {
    slug: 'integration',
    title: 'Definite Integral — Area Under a Curve',
    file: 'Integral_example.svg',
    license: 'Public domain',
  },
  {
    slug: 'vectors',
    title: 'Vector Addition Diagram',
    file: 'Vector_addition.svg',
    license: 'Public domain',
  },
  {
    slug: 'functions',
    title: 'Function Transformations — Graph of f(x)',
    file: 'Function_machine2.svg',
    license: 'CC BY-SA 3.0',
  },
  {
    slug: 'parametric-equations',
    title: 'Parametric Curve — Lissajous Figure',
    file: 'Lissajous_curve_5by4.svg',
    license: 'Public domain',
  },
  {
    slug: 'data-presentation',
    title: 'Histogram — Frequency Distribution',
    file: 'Histogram_example.svg',
    license: 'CC BY-SA 3.0',
  },
  {
    slug: 'normal-distribution',
    title: 'Normal Distribution — Bell Curve',
    file: 'Normal_Distribution_PDF.svg',
    license: 'CC BY-SA 3.0',
  },
  {
    slug: 'statistical-distributions',
    title: 'Binomial Distribution — Probability Mass Function',
    file: 'Binomial_distribution_pmf.svg',
    license: 'CC BY-SA 3.0',
  },
  {
    slug: 'kinematics',
    title: 'Velocity-Time Graph',
    file: 'Velocity_vs_time_graph.svg',
    license: 'Public domain',
  },
  {
    slug: 'projectiles',
    title: 'Projectile Motion — Parabolic Trajectory',
    file: 'Projectile_motion.svg',
    license: 'CC BY-SA 3.0',
  },
  {
    slug: 'regression-correlation',
    title: 'Scatter Plot with Regression Line',
    file: 'Linear_least_squares_example2.svg',
    license: 'Public domain',
  },
  {
    slug: 'further-calculus',
    title: 'Volume of Revolution — Solid of Rotation',
    file: 'Rotationskoerper_animation.gif',
    license: 'CC BY-SA 3.0',
  },
]

// ─── Fetch image from Commons ──────────────────────────────────────────────────

async function fetchCommonsImage(file) {
  // GIFs don't support the width thumbnail param — fetch directly
  const isGif = file.toLowerCase().endsWith('.gif')
  const url = isGif
    ? `${COMMONS_BASE}${encodeURIComponent(file)}`
    : `${COMMONS_BASE}${encodeURIComponent(file)}?width=800`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'StudiQ-GraphSeeder/1.0 (educational; contact: admin@studiq.app)' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${file}`)
  const contentType = res.headers.get('content-type') ?? 'image/png'
  const bytes = await res.arrayBuffer()
  // Detect mime from content-type (may be image/svg+xml for small files)
  const mime = contentType.split(';')[0].trim()
  const ext = mime === 'image/svg+xml' ? 'svg' : mime === 'image/jpeg' ? 'jpg' : 'png'
  return { bytes, mime: mime === 'image/svg+xml' ? 'image/png' : mime, ext, finalUrl: res.url }
}

// ─── Claude Vision ─────────────────────────────────────────────────────────────

async function describeWithVision(bytes, mime) {
  // If we got SVG bytes, Claude Vision can't process SVG — skip vision, return empty
  // (SVG rarely happens since we request width=800 PNG thumbnail)
  const useMime = mime === 'image/svg+xml' ? null : mime
  if (!useMime) {
    console.log('  SVG received, skipping vision (description will use title only)')
    return ''
  }

  const base64 = Buffer.from(bytes).toString('base64')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: useMime, data: base64 },
          },
          {
            type: 'text',
            text: `You are an A-level maths teacher. Describe this graph precisely so an AI can recreate a similar one.
Include:
- Type of graph/function (e.g. quadratic, sine, exponential, histogram)
- Approximate axis limits shown (domain and range)
- Key features: intercepts, turning points, asymptotes, shaded regions, labelled points
- Shape and direction (e.g. "opens upward", "increasing left to right")
- Any annotations, arrows, or labels visible
- Style notes: axis thickness, grid lines, colour coding

Keep it under 200 words. Be specific and precise.`,
          },
        ],
      }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic Vision ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

// ─── Embedding ─────────────────────────────────────────────────────────────────

async function embed(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return res.data[0].embedding
}

// ─── Upload to Supabase Storage ────────────────────────────────────────────────

async function ensureBucket() {
  const { error } = await supabase.storage.createBucket('knowledge-images', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  })
  if (error && !error.message.includes('already exists')) {
    throw new Error(`Bucket creation failed: ${error.message}`)
  }
}

async function uploadToStorage(bytes, topicSlug, ext) {
  const path = `${topicSlug}/reference.${ext}`
  const mime = ext === 'jpg' ? 'image/jpeg' : 'image/png'

  const { error } = await supabase.storage
    .from('knowledge-images')
    .upload(path, bytes, { contentType: mime, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: { publicUrl } } = supabase.storage
    .from('knowledge-images')
    .getPublicUrl(path)

  return publicUrl
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSeeding graph reference images for ${VISUAL_TOPICS.length} visual topics`)

  // Ensure bucket exists
  await ensureBucket()
  console.log('Storage bucket ready\n')

  let inserted = 0
  let skipped = 0

  for (const topic of VISUAL_TOPICS) {
    console.log(`\n[${topic.slug}] ${topic.title}`)

    // Skip if already seeded
    const { data: existing } = await supabase
      .from('knowledge_base')
      .select('id')
      .eq('topic_slug', topic.slug)
      .eq('type', 'graph_example')
      .limit(1)

    if (existing && existing.length > 0) {
      console.log('  Already seeded — skipping')
      skipped++
      continue
    }

    // 1. Download image from Commons
    let imgData
    try {
      imgData = await fetchCommonsImage(topic.file)
      console.log(`  Downloaded ${Math.round(imgData.bytes.byteLength / 1024)} KB (${imgData.mime}) from ${imgData.finalUrl.slice(0, 80)}`)
    } catch (e) {
      console.warn(`  Download failed: ${e.message}`)
      skipped++
      await new Promise(r => setTimeout(r, 2000))
      continue
    }

    // 2. Upload to storage
    let publicUrl
    try {
      publicUrl = await uploadToStorage(imgData.bytes, topic.slug, imgData.ext)
      console.log(`  Uploaded → ${publicUrl}`)
    } catch (e) {
      console.warn(`  Upload failed: ${e.message}`)
      skipped++
      continue
    }

    // 3. Describe with Claude Vision
    let description = ''
    try {
      description = await describeWithVision(imgData.bytes, imgData.mime)
      if (description) console.log(`  Vision: ${description.slice(0, 120)}…`)
    } catch (e) {
      console.warn(`  Vision failed (continuing without description): ${e.message}`)
    }

    // 4. Build content: embed image URL as first line so the chat route can parse it
    //    without needing an image_url column in the schema.
    const content = [
      `IMAGE_URL: ${publicUrl}`,
      `Graph reference for ${topic.title}`,
      `Source: ${topic.file} (Wikimedia Commons, ${topic.license})`,
      description || `A clear graph showing ${topic.title} with labelled axes and key features marked.`,
    ].join('\n\n')

    // 5. Embed (title + description only, not the raw URL line)
    const embedding = await embed(`${topic.title}\n\n${description || topic.title}`)

    // 6. Insert — use type 'concept' (compatible with existing schema constraint).
    //    Graph entries are identified by the IMAGE_URL: marker in content.
    const { error: insertError } = await supabase.from('knowledge_base').insert({
      topic_slug: topic.slug,
      type: 'concept',
      title: `[Graph Reference] ${topic.title}`,
      content,
      embedding,
    })

    if (insertError) {
      console.error(`  DB insert failed: ${insertError.message}`)
      skipped++
    } else {
      console.log(`  ✓ Inserted`)
      inserted++
    }

    // Polite delay
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`\n── Done ─────────────────────────────────────────`)
  console.log(`Inserted: ${inserted}  Skipped: ${skipped}`)
}

main().catch(err => { console.error(err); process.exit(1) })
