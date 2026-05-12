import { createClient as createServiceClient } from '@supabase/supabase-js'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'

export async function POST() {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const rows = AQA_TOPICS.map(t => ({
    name: t.name,
    slug: t.slug,
    exam_board: t.exam_board,
    year_group: t.year_group,
    order_index: t.order_index,
    icon: t.icon ?? null,
  }))

  const { error } = await supabase
    .from('topics')
    .upsert(rows, { onConflict: 'slug' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ seeded: rows.length })
}
