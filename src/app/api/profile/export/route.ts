import { createClient } from '@/lib/supabase/server'

// GDPR subject-access export: returns everything we hold about the signed-in
// user as a downloadable JSON file. Each table is queried best-effort so a
// missing/unmigrated table never breaks the export.
const SOURCES: Array<{ table: string; column: string }> = [
  { table: 'profiles',                 column: 'id' },
  { table: 'student_progress',         column: 'student_id' },
  { table: 'question_attempts',        column: 'student_id' },
  { table: 'student_skill_progress',   column: 'student_id' },
  { table: 'student_misconceptions',   column: 'user_id' },
  { table: 'grade_snapshots',          column: 'student_id' },
  { table: 'generated_papers',         column: 'student_id' },
  { table: 'student_insights',         column: 'student_id' },
  { table: 'marking_reports',          column: 'student_id' },
  { table: 'analytics_events',         column: 'user_id' },
]

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const data: Record<string, unknown> = {}
  for (const { table, column } of SOURCES) {
    try {
      const { data: rows } = await supabase.from(table).select('*').eq(column, user.id)
      if (rows && rows.length > 0) data[table] = rows
    } catch {
      /* table absent — skip */
    }
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email },
    data,
  }

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="studiq-my-data.json"',
    },
  })
}
