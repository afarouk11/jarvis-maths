import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { data } = await supabase
    .from('spok_messages')
    .select('id, role, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(40)

  return Response.json({ messages: data ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { messages } = await req.json() as { messages: Array<{ role: string; content: string }> }

  const rows = messages
    .filter(m => m.content?.trim())
    .map(m => ({ user_id: user.id, role: m.role, content: m.content }))

  if (!rows.length) return Response.json({ ok: true })

  await supabase.from('spok_messages').insert(rows)

  // Keep only the most recent 40 messages per student (20 exchanges)
  const { data: oldest } = await supabase
    .from('spok_messages')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(40, 1000)

  if (oldest?.length) {
    await supabase
      .from('spok_messages')
      .delete()
      .in('id', oldest.map((r: { id: string }) => r.id))
  }

  return Response.json({ ok: true })
}
