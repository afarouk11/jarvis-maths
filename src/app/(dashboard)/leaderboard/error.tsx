'use client'

import { RouteError } from '@/components/ui/RouteError'

export default function LeaderboardError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} />
}
