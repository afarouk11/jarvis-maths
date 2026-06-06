import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const resend = new Resend(process.env.EMAIL_OUTREACH_API_KEY)
  const secret = req.headers.get('x-cron-secret') ?? new URL(req.url).searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  // Find users with due topics and an email
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, exam_date, exam_board, level')
    .eq('onboarding_complete', true)
    .not('email', 'is', null)

  if (!users || users.length === 0) {
    return Response.json({ sent: 0 })
  }

  const sentIds: string[] = []
  const errors: string[] = []

  for (const user of users) {
    const { data: dueProg } = await supabase
      .from('student_progress')
      .select('topic_id')
      .eq('student_id', user.id)
      .lte('next_review_at', now)
      .limit(5)

    if (!dueProg || dueProg.length === 0) continue

    const dueCount = dueProg.length
    const firstName = (user.full_name as string | null)?.split(' ')[0] ?? 'there'

    let daysToExam: number | null = null
    if (user.exam_date) {
      const diff = new Date(user.exam_date as string).getTime() - Date.now()
      daysToExam = Math.max(0, Math.ceil(diff / 86400000))
    }

    const urgencyLine = daysToExam !== null && daysToExam < 30
      ? `<p style="color:#f87171;font-size:14px;margin:0;">⚠️ ${daysToExam} days to your exam — don't skip today.</p>`
      : ''

    try {
      await resend.emails.send({
        from: 'SPOK · StudiQ <spok@studiq.org>',
        to: user.email as string,
        subject: `${firstName}, you have ${dueCount} topic${dueCount > 1 ? 's' : ''} due for review`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#080d19;color:#e2e8f0;">
            <p style="font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f59e0b;margin:0 0 16px;">
              SPOK · StudiQ
            </p>
            <h1 style="font-size:24px;font-weight:700;margin:0 0 8px;color:#ffffff;">
              Hey ${firstName} — time to review
            </h1>
            <p style="font-size:15px;color:#94a3b8;margin:0 0 24px;line-height:1.6;">
              You have <strong style="color:#f59e0b;">${dueCount} topic${dueCount > 1 ? 's' : ''}</strong> due
              for spaced repetition review today. Doing them now keeps your knowledge sharp
              and boosts your predicted grade.
            </p>
            ${urgencyLine}
            <a href="https://studiq.org/practice"
               style="display:inline-block;margin-top:20px;padding:12px 24px;background:#f59e0b;color:#080d19;font-weight:700;font-size:14px;text-decoration:none;border-radius:12px;">
              Start reviewing →
            </a>
            <p style="font-size:11px;color:#374151;margin-top:32px;">
              You're receiving this because you have a StudiQ account.
              <a href="https://studiq.org/settings" style="color:#5a7aaa;">Manage notifications</a>
            </p>
          </div>
        `,
      })
      sentIds.push(user.id)
    } catch (err) {
      errors.push(`${user.id}: ${err}`)
    }
  }

  return Response.json({ sent: sentIds.length, errors })
}
