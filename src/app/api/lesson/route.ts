import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// List lessons for a topic slug — used by the SPOK workspace panel, which
// renders notes in place instead of navigating to the topic page.
export async function GET(req: Request): Promise<NextResponse> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const topicSlug = new URL(req.url).searchParams.get('topic')
  if (!topicSlug) return NextResponse.json({ error: 'topic is required' }, { status: 400 })

  const { data: topic } = await supabase
    .from('topics').select('id').eq('slug', topicSlug).single()
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })

  const { data: lessons, error } = await supabase
    .from('lessons')
    .select()
    .eq('topic_id', topic.id)
    .order('difficulty')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(lessons ?? [])
}
