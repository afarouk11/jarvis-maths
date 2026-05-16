import type { Metadata } from 'next'
import HowItWorksClient from './HowItWorksClient'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'SPOK uses Bayesian Knowledge Tracing and spaced repetition to find exactly what you don\'t know and fix it. Step-by-step A-Level Maths tutoring that adapts to you.',
  alternates: { canonical: 'https://studiq.org/how-it-works' },
  openGraph: {
    title: 'How StudiQ Works | AI A-Level Maths Tutor',
    description: 'Bayesian Knowledge Tracing, spaced repetition, and voice tutoring — SPOK adapts to you.',
    url: 'https://studiq.org/how-it-works',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'How StudiQ Works', description: 'SPOK finds exactly what you don\'t know and fixes it.' },
}

export default function HowItWorksPage() {
  return <HowItWorksClient />
}
