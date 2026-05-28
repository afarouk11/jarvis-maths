import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// GET /api/teacher/class-code — generate a new class code for the teacher
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/sign-in', req.url))

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const code = generateCode()

  // Store a placeholder self-link row to "register" the class code (we use a separate codes table in a future migration;
  // for now we embed the code concept in teacher_student_links when students join)
  // Just return the code — it becomes meaningful when a student uses it via POST /api/teacher/join
  return NextResponse.redirect(new URL(`/teacher?code=${code}`, req.url))
}

// POST /api/teacher/join — student joins a class using a code
// Body: { classCode: string, teacherEmail: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { classCode } = await req.json() as { classCode: string }
  if (!classCode) return NextResponse.json({ error: 'classCode required' }, { status: 400 })

  // Look up the teacher by the class code (stored as teacher_id in existing links, or via a lookup)
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find which teacher owns this class code
  const { data: existingLink } = await admin
    .from('teacher_student_links')
    .select('teacher_id')
    .eq('class_code', classCode)
    .limit(1)
    .single()

  if (!existingLink) return NextResponse.json({ error: 'Invalid class code' }, { status: 404 })

  // Link student to teacher
  await admin.from('teacher_student_links').upsert({
    teacher_id: existingLink.teacher_id,
    student_id: user.id,
    class_code: classCode,
  }, { onConflict: 'teacher_id,student_id' })

  return NextResponse.json({ ok: true })
}
