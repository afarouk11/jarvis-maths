import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StudiQ — AI A-Level Maths Tutor',
    short_name: 'StudiQ',
    description: "SPOK knows exactly what you don't know — and fixes it. AI-powered A-Level Maths tutoring.",
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0F1724',
    theme_color: '#0F1724',
    orientation: 'portrait',
    categories: ['education'],
    lang: 'en-GB',
    prefer_related_applications: false,
    icons: [
      {
        src: '/api/pwa-icon/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/api/pwa-icon/512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/api/pwa-icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Practice',
        short_name: 'Practice',
        description: 'Start a spaced repetition session',
        url: '/practice',
        icons: [{ src: '/api/pwa-icon/192', sizes: '192x192' }],
      },
      {
        name: 'Ask SPOK',
        short_name: 'SPOK',
        description: 'Chat with your AI maths tutor',
        url: '/jarvis',
        icons: [{ src: '/api/pwa-icon/192', sizes: '192x192' }],
      },
      {
        name: 'Topics',
        short_name: 'Topics',
        description: 'Browse all maths topics',
        url: '/topics',
        icons: [{ src: '/api/pwa-icon/192', sizes: '192x192' }],
      },
    ],
    screenshots: [
      {
        src: '/opengraph-image',
        sizes: '1200x630',
        type: 'image/png',
        form_factor: 'wide',
        label: 'StudiQ dashboard',
      },
    ],
  }
}
