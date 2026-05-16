import type { Metadata } from 'next'
import ForSchoolsClient from './ForSchoolsClient'

export const metadata: Metadata = {
  title: 'StudiQ for Schools',
  description: 'AI-powered A-Level Maths tutoring for every student. Site licences, teacher dashboards, and real-time progress tracking with Bayesian Knowledge Tracing.',
  alternates: { canonical: 'https://studiq.org/for-schools' },
  openGraph: {
    title: 'StudiQ for Schools — AI Maths for Every Student',
    description: 'Site licences and teacher dashboards for AI-powered A-Level Maths.',
    url: 'https://studiq.org/for-schools',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'StudiQ for Schools | AI Maths Tutor', description: 'Site licences and teacher dashboards for AI-powered A-Level Maths.' },
}

export default function ForSchoolsPage() {
  return <ForSchoolsClient />
}
