import type { Metadata } from 'next'
import StudentSuccessClient from './StudentSuccessClient'

export const metadata: Metadata = {
  title: 'Student Success',
  description: 'Real students, real results. Stories from A-Level Maths students using StudiQ and SPOK to understand topics, build confidence, and change how they revise.',
  alternates: { canonical: 'https://studiq.org/student-success' },
  openGraph: {
    title: 'Student Success | StudiQ',
    description: 'Real students. Real results. Stories from A-Level Maths students using StudiQ.',
    url: 'https://studiq.org/student-success',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Student Success | StudiQ', description: 'Real students. Real results. Stories from A-Level Maths students using StudiQ.' },
}

export default function StudentSuccessPage() {
  return <StudentSuccessClient />
}
