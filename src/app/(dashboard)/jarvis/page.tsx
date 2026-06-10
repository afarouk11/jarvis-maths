import { redirect } from 'next/navigation'

// SPOK's home moved from /jarvis to /spok — keep old links and installed
// PWAs working.
export default async function JarvisRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') qs.set(key, value)
  }
  const suffix = qs.size > 0 ? `?${qs.toString()}` : ''
  redirect(`/spok${suffix}`)
}
