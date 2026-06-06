import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — assignments for the logged-in student's classes, with completion
// derived from their own activity (no completion table needed).
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: links } = await supabase
    .from('teacher_student_links').select('class_code').eq('student_id', user.id)
  const codes = [...new Set((links ?? []).map(l => l.class_code))]
  if (codes.length === 0) return NextResponse.json({ assignments: [] })

  const { data: assignments } = await supabase
    .from('assignments').select('*').in('class_code', codes).order('created_at', { ascending: false }).limit(20)
  if (!assignments || assignments.length === 0) return NextResponse.json({ assignments: [] })

  // Resolve topic slugs → progress, to derive completion for topic assignments.
  const topicSlugs = [...new Set(assignments.filter(a => a.topic_slug).map(a => a.topic_slug as string))]
  const { data: topicRows } = topicSlugs.length
    ? await supabase.from('topics').select('id, slug').in('slug', topicSlugs)
    : { data: [] as Array<{ id: string; slug: string }> }
  const idBySlug = new Map((topicRows ?? []).map((t: { id: string; slug: string }) => [t.slug, t.id]))
  const ids = [...idBySlug.values()]
  const { data: prog } = ids.length
    ? await supabase.from('student_progress').select('topic_id, last_attempted_at').eq('student_id', user.id).in('topic_id', ids)
    : { data: [] as Array<{ topic_id: string; last_attempted_at: string | null }> }
  const lastByTopic = new Map((prog ?? []).map(p => [p.topic_id, p.last_attempted_at]))

  const out = assignments.map(a => {
    let completed = false
    if (a.type === 'topic' && a.topic_slug) {
      const tid = idBySlug.get(a.topic_slug)
      const last = tid ? lastByTopic.get(tid) : null
      completed = !!last && new Date(last) >= new Date(a.created_at)
    }
    return {
      id: a.id,
      title: a.title,
      type: a.type,
      topic_slug: a.topic_slug,
      due_date: a.due_date,
      completed,
    }
  })

  return NextResponse.json({ assignments: out })
}
