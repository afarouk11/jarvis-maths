import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// One-click unsubscribe from reminder emails. Token-based so the link works
// straight from the email without a login.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  const page = (message: string) =>
    new NextResponse(
      `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>StudiQ</title></head>` +
      `<body style="font-family:system-ui,sans-serif;background:#080d19;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">` +
      `<div style="text-align:center;max-width:420px;padding:24px;">` +
      `<p style="font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f59e0b;">SPOK · StudiQ</p>` +
      `<p style="font-size:15px;line-height:1.6;color:#cbd5e1;">${message}</p>` +
      `<a href="https://studiq.org/profile" style="color:#60a5fa;font-size:13px;">Manage preferences</a>` +
      `</div></body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )

  if (!token) return page('This unsubscribe link is invalid or incomplete.')

  try {
    const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { error } = await admin.from('profiles').update({ email_reminders: false }).eq('unsubscribe_token', token)
    if (error) return page('Sorry, something went wrong. Please try again later.')
  } catch {
    return page('Sorry, something went wrong. Please try again later.')
  }

  return page("You've been unsubscribed from reminder emails. You can turn them back on any time in your profile settings.")
}
