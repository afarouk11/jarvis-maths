import type { createClient } from '@/lib/supabase/server'

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * Fixed-window per-user rate limiter backed by the `rate_limits` table.
 * Serverless-safe (state lives in the DB, not process memory). Fails open if
 * the table isn't migrated yet so it can never lock real users out.
 */
export async function checkRateLimit(
  supabase: ServerSupabase,
  userId: string,
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = Date.now()
  try {
    const { data: row } = await supabase
      .from('rate_limits')
      .select('window_start, count')
      .eq('user_id', userId)
      .eq('bucket', bucket)
      .maybeSingle()

    const windowStart = row ? new Date(row.window_start).getTime() : 0
    const expired = !row || now - windowStart > windowSeconds * 1000

    if (expired) {
      await supabase.from('rate_limits').upsert(
        { user_id: userId, bucket, window_start: new Date(now).toISOString(), count: 1 },
        { onConflict: 'user_id,bucket' },
      )
      return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 }
    }

    if (row.count < limit) {
      await supabase.from('rate_limits')
        .update({ count: row.count + 1 })
        .eq('user_id', userId).eq('bucket', bucket)
      return { allowed: true, remaining: Math.max(0, limit - row.count - 1), retryAfterSeconds: 0 }
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((windowStart + windowSeconds * 1000 - now) / 1000))
    return { allowed: false, remaining: 0, retryAfterSeconds }
  } catch {
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 }
  }
}

export function tooManyRequests(result: RateLimitResult): Response {
  return Response.json(
    { error: 'rate_limited', retryAfterSeconds: result.retryAfterSeconds },
    { status: 429, headers: { 'Retry-After': String(result.retryAfterSeconds) } },
  )
}
