import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin === true
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('creator_videos')
    .select('id, creator_name, creator_handle, creator_avatar_url, title, description, youtube_id, topic_tag, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const supabase = await createClient()
  if (!await isAdmin(supabase)) return new Response('Forbidden', { status: 403 })

  const body = await req.json()
  const { creator_name, creator_handle, creator_avatar_url, title, description, youtube_url, topic_tag, approved } = body

  if (!creator_name?.trim() || !title?.trim() || !youtube_url?.trim()) {
    return new Response('Missing fields', { status: 400 })
  }

  const youtube_id = extractYouTubeId(youtube_url.trim())
  if (!youtube_id) return new Response('Invalid YouTube URL', { status: 400 })

  const { data, error } = await supabase
    .from('creator_videos')
    .insert({
      creator_name: creator_name.trim(),
      creator_handle: creator_handle?.trim() || null,
      creator_avatar_url: creator_avatar_url?.trim() || null,
      title: title.trim(),
      description: description?.trim() || null,
      youtube_id,
      topic_tag: topic_tag?.trim() || null,
      approved: approved ?? false,
    })
    .select('id')
    .single()

  if (error) return new Response(error.message, { status: 500 })
  return NextResponse.json({ id: data.id })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  if (!await isAdmin(supabase)) return new Response('Forbidden', { status: 403 })

  const { id } = await req.json()
  await supabase.from('creator_videos').delete().eq('id', id)
  return new Response('OK')
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  if (!await isAdmin(supabase)) return new Response('Forbidden', { status: 403 })

  const { id, approved } = await req.json()
  await supabase.from('creator_videos').update({ approved }).eq('id', id)
  return new Response('OK')
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return m[1]
  }
  return null
}
