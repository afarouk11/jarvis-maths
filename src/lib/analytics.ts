import type { createClient } from '@/lib/supabase/server'

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

/**
 * Fire-and-forget product analytics. Records a single event row. Always
 * non-fatal — analytics must never break a user action, and it no-ops cleanly
 * if the table isn't migrated yet.
 */
export async function logEvent(
  supabase: ServerSupabase,
  userId: string,
  event: string,
  props: Record<string, unknown> = {},
): Promise<void> {
  try {
    await supabase.from('analytics_events').insert({ user_id: userId, event, props })
  } catch {
    /* never throw from analytics */
  }
}
