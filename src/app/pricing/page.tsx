import type { Metadata } from 'next'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Start free. Unlimited AI tutoring for A-Level Maths from £33/month. SPOK is available 24/7 — less than one tutoring session.',
  alternates: { canonical: 'https://studiq.org/pricing' },
  openGraph: {
    title: 'Pricing | StudiQ',
    description: 'Start free. Unlimited AI A-Level Maths tutoring from £33/month.',
    url: 'https://studiq.org/pricing',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Pricing | StudiQ', description: 'Less than one tutoring session. SPOK available 24/7.' },
}

export default function PricingPage() {
  return <PricingClient />
}
