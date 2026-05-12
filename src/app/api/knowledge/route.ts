import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { embedText } from '@/lib/ai/embeddings'

const ADMIN_EMAIL = 'adamfarouk7@hotmail.com'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return new Response('Forbidden', { status: 403 })
  }

  const { topic_slug, type, title, content } = await req.json()

  if (!title?.trim() || !content?.trim() || !type) {
    return new Response('Missing fields', { status: 400 })
  }

  const embedding = await embedText(`${title}\n\n${content}`)

  const service = createServiceClient()
  const { data, error } = await service
    .from('knowledge_base')
    .insert({ topic_slug: topic_slug || null, type, title: title.trim(), content: content.trim(), embedding })
    .select('id')
    .single()

  if (error) return new Response(error.message, { status: 500 })

  return Response.json({ id: data.id })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = await req.json()
  const service = createServiceClient()
  const { error } = await service.from('knowledge_base').delete().eq('id', id)

  if (error) return new Response(error.message, { status: 500 })

  return new Response('OK')
}
