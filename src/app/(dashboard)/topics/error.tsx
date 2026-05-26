'use client'

import { RouteError } from '@/components/ui/RouteError'

export default function TopicsError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} />
}
