import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { z } from 'zod'

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
  return data?.is_admin === true
}

const bodySchema = z.object({
  email: z.string().email(),
  days: z.number().int().min(1).max(365).default(1),
})

// POST /api/admin/grant-pro — grant temporary pro access to a user by email
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!await isAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { email, days } = parsed.data

  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: authUser } = await adminClient.auth.admin.listUsers()
  const target = authUser?.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (!target) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })

  const proAccessUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await adminClient
    .from('profiles')
    .update({ pro_access_until: proAccessUntil })
    .eq('id', target.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, email, pro_access_until: proAccessUntil })
}
