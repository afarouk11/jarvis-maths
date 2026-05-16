import type { Metadata, Viewport } from 'next'
import { LandingPage } from './_LandingClient'

export const viewport: Viewport = {
  width: 1024,
  initialScale: 1,
}

export const metadata: Metadata = {
  alternates: { canonical: 'https://studiq.org' },
  openGraph: { url: 'https://studiq.org' },
}

export default function Page() {
  return <LandingPage />
}
