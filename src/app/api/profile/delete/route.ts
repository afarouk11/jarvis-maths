import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await Promise.all([
    admin.from('student_progress').delete().eq('student_id', user.id),
    admin.from('question_attempts').delete().eq('student_id', user.id),
    admin.from('spok_messages').delete().eq('user_id', user.id),
    admin.from('student_insights').delete().eq('student_id', user.id),
    admin.from('grade_snapshots').delete().eq('student_id', user.id),
  ])

  await admin.from('profiles').delete().eq('id', user.id)

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
