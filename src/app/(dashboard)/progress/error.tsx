'use client'

import { RouteError } from '@/components/ui/RouteError'

export default function ProgressError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} />
}
