import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { embedBatch, chunkText, guessTopicSlug } from '@/lib/ai/embeddings'
import { join } from 'path'
import { pathToFileURL } from 'url'

export const maxDuration = 120

async function extractPDFText(buffer: Buffer): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // Point directly to the worker file in node_modules — bypasses Turbopack bundling
  GlobalWorkerOptions.workerSrc = pathToFileURL(
    join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  ).href

  const loadingTask = getDocument({ data: new Uint8Array(buffer) })
  const pdf = await loadingTask.promise
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }

  await pdf.destroy()
  return pages.join('\n\n')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file         = form.get('file') as File | null
    const title        = form.get('title') as string | null
    const exam_board   = (form.get('exam_board') as string) || 'AQA'
    const year         = form.get('year') ? parseInt(form.get('year') as string) : null
    const paper_number = form.get('paper_number') ? parseInt(form.get('paper_number') as string) : null

    if (!file || !title) return NextResponse.json({ error: 'file and title required' }, { status: 400 })
    if (!file.name.endsWith('.pdf')) return NextResponse.json({ error: 'PDF files only' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    let text = ''
    try {
      text = await extractPDFText(buffer)
    } catch (err) {
      console.error('[PDF upload] parse error:', err)
      return NextResponse.json({ error: `Failed to parse PDF: ${(err as any)?.message ?? err}` }, { status: 500 })
    }

    if (text.trim().length < 100) {
      return NextResponse.json({ error: 'PDF appears to be image-based (no extractable text)' }, { status: 400 })
    }

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: paper, error: paperErr } = await admin
      .from('past_papers')
      .insert({ title, exam_board, year, paper_number })
      .select()
      .single()

    if (paperErr) return NextResponse.json({ error: paperErr.message }, { status: 500 })

    const chunks = chunkText(text)
    const BATCH = 20
    let totalInserted = 0

    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch      = chunks.slice(i, i + BATCH)
      const embeddings = await embedBatch(batch)
      const rows = batch.map((content, j) => ({
        paper_id:   paper.id,
        content,
        topic_slug: guessTopicSlug(content),
        page_num:   Math.floor((i + j) / 3) + 1,
        embedding:  embeddings[j],
      }))
      const { error } = await admin.from('paper_chunks').insert(rows)
      if (!error) totalInserted += rows.length
    }

    await admin.from('past_papers').update({ processed: true, chunk_count: totalInserted }).eq('id', paper.id)

    return NextResponse.json({ paperId: paper.id, chunks: totalInserted })
  } catch (err) {
    console.error('[PDF upload] unhandled error:', err)
    return NextResponse.json({ error: `Server error: ${(err as any)?.message ?? 'Unknown error'}` }, { status: 500 })
  }
}
