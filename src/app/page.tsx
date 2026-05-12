import type { Viewport } from 'next'
import { LandingPage } from './_LandingClient'

export const viewport: Viewport = {
  width: 1024,
  initialScale: 1,
}

export default function Page() {
  return <LandingPage />
}
