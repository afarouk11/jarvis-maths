'use client'

import { RouteError } from '@/components/ui/RouteError'

export default function TopicError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} message="Couldn't load this topic. Try again or pick another from Topics." />
}
