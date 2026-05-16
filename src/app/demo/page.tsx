import type { Metadata } from 'next'
import DemoClient from './DemoClient'

export const metadata: Metadata = {
  title: 'Try SPOK Free',
  description: 'Try SPOK — the AI A-Level Maths tutor — for free. No account needed. Ask any A-level Maths question and see how SPOK explains it step by step.',
  alternates: { canonical: 'https://studiq.org/demo' },
  openGraph: {
    title: 'Try SPOK Free | StudiQ Demo',
    description: 'Ask any A-level Maths question. No account needed.',
    url: 'https://studiq.org/demo',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Try SPOK Free | StudiQ', description: 'Ask any A-level Maths question. No account needed.' },
}

export default function DemoPage() {
  return <DemoClient />
}
