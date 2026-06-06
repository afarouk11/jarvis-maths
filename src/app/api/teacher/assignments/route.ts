import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { asEnum, asString, badRequest } from '@/lib/api/validate'

function admin() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function requireTeacher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { supabase, user }
}

// GET — the teacher's assignments, each with derived completion counts.
export async function GET() {
  const ctx = await requireTeacher()
  if (ctx.error) return ctx.error
  const { supabase, user } = ctx

  const { data: assignments } = await supabase
    .from('assignments').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false })
  if (!assignments || assignments.length === 0) return NextResponse.json({ assignments: [] })

  const db = admin()
  const { data: links } = await db.from('teacher_student_links').select('student_id, class_code').eq('teacher_id', user.id)
  const studentsByClass = new Map<string, string[]>()
  for (const l of links ?? []) {
    const arr = studentsByClass.get(l.class_code) ?? []
    arr.push(l.student_id)
    studentsByClass.set(l.class_code, arr)
  }

  const slugs = [...new Set(assignments.filter(a => a.topic_slug).map(a => a.topic_slug as string))]
  const { data: topicRows } = slugs.length
    ? await db.from('topics').select('id, slug').in('slug', slugs)
    : { data: [] as Array<{ id: string; slug: string }> }
  const idBySlug = new Map((topicRows ?? []).map((t: { id: string; slug: string }) => [t.slug, t.id]))

  const out = []
  for (const a of assignments) {
    const students = studentsByClass.get(a.class_code) ?? []
    let completed = 0
    if (students.length > 0) {
      try {
        if (a.type === 'topic' && a.topic_slug && idBySlug.get(a.topic_slug)) {
          const { data: prog } = await db.from('student_progress')
            .select('student_id, last_attempted_at')
            .eq('topic_id', idBySlug.get(a.topic_slug)).in('student_id', students)
          completed = (prog ?? []).filter(p => p.last_attempted_at && new Date(p.last_attempted_at) >= new Date(a.created_at)).length
        } else if (a.type === 'paper') {
          const { data: papers } = await db.from('generated_papers')
            .select('student_id, created_at').in('student_id', students).gte('created_at', a.created_at)
          completed = new Set((papers ?? []).map(p => p.student_id)).size
        }
      } catch { /* best-effort completion */ }
    }
    out.push({ ...a, total: students.length, completed })
  }

  return NextResponse.json({ assignments: out })
}

// POST — create an assignment for one of the teacher's class codes.
export async function POST(req: Request) {
  const ctx = await requireTeacher()
  if (ctx.error) return ctx.error
  const { supabase, user } = ctx

  const body = await req.json().catch(() => ({}))
  const title = asString(body.title, 120)
  const classCode = asString(body.classCode, 12)
  const type = asEnum(body.type, ['topic', 'paper'] as const) ?? 'topic'
  const topicSlug = type === 'topic' ? asString(body.topicSlug, 100) : null
  const dueDate = typeof body.dueDate === 'string' && body.dueDate ? body.dueDate : null
  if (!title || !classCode) return badRequest('title and classCode are required')
  if (type === 'topic' && !topicSlug) return badRequest('topicSlug is required for a topic assignment')

  // The teacher must own this class code (it must appear in their links).
  const db = admin()
  const { data: owns } = await db.from('teacher_student_links')
    .select('class_code').eq('teacher_id', user.id).eq('class_code', classCode).limit(1).maybeSingle()
  if (!owns) return NextResponse.json({ error: 'Unknown class code' }, { status: 400 })

  const { data, error } = await supabase.from('assignments')
    .insert({ teacher_id: user.id, class_code: classCode, title, type, topic_slug: topicSlug, due_date: dueDate })
    .select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}

// DELETE — remove an assignment.
export async function DELETE(req: Request) {
  const ctx = await requireTeacher()
  if (ctx.error) return ctx.error
  const { supabase, user } = ctx
  const { id } = await req.json().catch(() => ({}))
  if (!id) return badRequest('id is required')
  await supabase.from('assignments').delete().eq('id', id).eq('teacher_id', user.id)
  return NextResponse.json({ ok: true })
}
