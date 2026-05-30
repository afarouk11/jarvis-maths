import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('official_papers')
    .select('*')
    .order('year',  { ascending: false })
    .order('paper', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ papers: data ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: prof } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!prof?.is_admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { title, board, year, paper, pdf_url, mark_scheme_url } = await req.json()
  const { data, error } = await supabase
    .from('official_papers')
    .insert({ title, board, year, paper, pdf_url: pdf_url || null, mark_scheme_url: mark_scheme_url || null })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: prof } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!prof?.is_admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  const { error } = await supabase.from('official_papers').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
