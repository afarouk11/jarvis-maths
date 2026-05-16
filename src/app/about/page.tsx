import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About',
  description: 'StudiQ is an AI-powered A-Level Maths tutoring platform built to help every UK student get the grade they deserve.',
  alternates: { canonical: 'https://studiq.org/about' },
  openGraph: {
    title: 'About StudiQ | AI A-Level Maths Tutor',
    description: 'Built to help every UK student get the grade they deserve.',
    url: 'https://studiq.org/about',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'About StudiQ', description: 'Built to help every UK student get the grade they deserve.' },
}

export default function AboutPage() {
  return <AboutClient />
}
