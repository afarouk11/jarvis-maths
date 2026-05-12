import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function makeAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await makeAdmin()
      .from('generated_papers')
      .select('id, title, created_at, focus_topics, total_marks, time_minutes')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[saved GET] db error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ papers: data ?? [] })
  } catch (err: any) {
    console.error('[saved GET] thrown:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { paper, focusTopics } = await req.json()
    if (!paper) return NextResponse.json({ error: 'No paper provided' }, { status: 400 })

    const { data, error } = await makeAdmin()
      .from('generated_papers')
      .insert({
        student_id:   user.id,
        title:        paper.title ?? `Mock Paper — ${new Date().toLocaleDateString('en-GB')}`,
        focus_topics: focusTopics ?? [],
        paper,
        total_marks:  paper.totalMarks ?? null,
        time_minutes: paper.timeMinutes ?? null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[saved POST] db error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ id: data.id })
  } catch (err: any) {
    console.error('[saved POST] thrown:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}
