import type { Metadata } from 'next'
import AccessibilityClient from './AccessibilityClient'

export const metadata: Metadata = {
  title: 'Accessibility & SEND',
  description: 'StudiQ is built for the full range of how students learn — including dyslexia, ADHD, and other neurodiverse profiles. Accessibility is not an afterthought.',
  alternates: { canonical: 'https://studiq.org/accessibility' },
  openGraph: {
    title: 'Accessibility & SEND | StudiQ',
    description: 'Learning that adapts to how you think — built for dyslexia, ADHD, and neurodiverse profiles.',
    url: 'https://studiq.org/accessibility',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Accessibility & SEND | StudiQ', description: 'Learning that adapts to how you think — built for dyslexia, ADHD, and neurodiverse profiles.' },
}

export default function AccessibilityPage() {
  return <AccessibilityClient />
}
