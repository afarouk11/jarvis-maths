import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { schoolOutreachEmail } from '@/lib/email/school-outreach-template'

const resend = new Resend(process.env.RESEND_API_KEY)

// Safety cap per API call to avoid accidental blasts and stay inside Resend rate limits
const BATCH_SIZE = 50

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
  return data?.is_admin === true
}

// GET /api/admin/outreach — fetch stats + pending list
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: counts } = await admin
    .from('school_outreach')
    .select('status')

  const stats = (counts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const { data: preview } = await admin
    .from('school_outreach')
    .select('id, school_name, contact_email, borough, status, sent_at')
    .eq('status', 'pending')
    .order('borough')
    .limit(20)

  return NextResponse.json({ stats, preview })
}

// POST /api/admin/outreach — send next batch
// Body: { dryRun?: boolean, limit?: number }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { dryRun = false, limit = BATCH_SIZE } = await req.json() as { dryRun?: boolean; limit?: number }
  const batchLimit = Math.min(limit, BATCH_SIZE)

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: batch } = await admin
    .from('school_outreach')
    .select('id, school_name, contact_email, personalisation')
    .eq('status', 'pending')
    .order('created_at')
    .limit(batchLimit)

  if (!batch?.length) {
    return NextResponse.json({ sent: 0, message: 'No pending schools.' })
  }

  const results = { sent: 0, failed: 0, errors: [] as string[] }

  for (const school of batch) {
    const p = (school.personalisation ?? {}) as { offersAlevel?: boolean; offersGCSE?: boolean }
    const { subject, html, text } = schoolOutreachEmail({
      schoolName: school.school_name,
      offersAlevel: p.offersAlevel ?? false,
      offersGCSE: p.offersGCSE ?? true,
    })

    if (dryRun) {
      results.sent++
      continue
    }

    try {
      const { error } = await resend.emails.send({
        from: 'Muhammad at StudiQ <admin@studiq.org>',
        to: school.contact_email,
        subject,
        html,
        text,
        headers: {
          'List-Unsubscribe': '<mailto:hello@studiq.org?subject=unsubscribe>',
        },
      })

      if (error) {
        results.failed++
        results.errors.push(`${school.school_name}: ${error.message}`)
        await admin.from('school_outreach').update({ status: 'bounced' }).eq('id', school.id)
      } else {
        results.sent++
        await admin.from('school_outreach').update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        }).eq('id', school.id)
      }
    } catch (e: unknown) {
      results.failed++
      const msg = e instanceof Error ? e.message : String(e)
      results.errors.push(`${school.school_name}: ${msg}`)
    }

    // Throttle — Resend's free tier is 2 req/s
    await new Promise(r => setTimeout(r, 600))
  }

  return NextResponse.json({
    sent: results.sent,
    failed: results.failed,
    dryRun,
    errors: results.errors,
  })
}

// DELETE /api/admin/outreach — mark a school as opted out
// Body: { email: string }
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email } = await req.json() as { email: string }
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await admin.from('school_outreach').update({ status: 'opted_out' }).eq('contact_email', email)
  return NextResponse.json({ ok: true })
}
