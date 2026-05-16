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

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://studiq.org/#website',
      name: 'StudiQ',
      url: 'https://studiq.org',
      description: 'AI-powered A-Level Maths tutoring that knows exactly what you don\'t know — and fixes it.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://studiq.org/topics?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://studiq.org/#organization',
      name: 'StudiQ',
      url: 'https://studiq.org',
      logo: 'https://studiq.org/icon',
      description: 'AI-powered A-Level Maths tutoring platform for UK students. SPOK uses Bayesian Knowledge Tracing and spaced repetition to find exactly what you don\'t know and fix it.',
      email: 'admin@studiq.org',
      areaServed: 'GB',
      knowsAbout: ['A-Level Mathematics', 'AQA Maths', 'Edexcel Maths', 'OCR Maths', 'GCSE Mathematics'],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'admin@studiq.org',
        contactType: 'customer support',
        areaServed: 'GB',
        availableLanguage: 'English',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://studiq.org/#app',
      name: 'StudiQ',
      applicationCategory: 'EducationApplication',
      operatingSystem: 'Web, iOS, Android',
      url: 'https://studiq.org',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free',
          price: '0',
          priceCurrency: 'GBP',
          description: '10 SPOK messages per day, all topics and lessons, unlimited practice questions.',
        },
        {
          '@type': 'Offer',
          name: 'Pro Monthly',
          price: '40',
          priceCurrency: 'GBP',
          description: 'Unlimited SPOK chat, voice tutor, past paper AI, mock exam generator.',
        },
        {
          '@type': 'Offer',
          name: 'Pro Annual',
          price: '400',
          priceCurrency: 'GBP',
          description: 'Everything in Pro Monthly — save £80 per year.',
        },
      ],
    },
  ],
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LandingPage />
    </>
  )
}
