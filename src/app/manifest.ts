import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StudiQ — AI A-Level Maths Tutor',
    short_name: 'StudiQ',
    description: 'SPOK knows exactly what you don\'t know — and fixes it. AI-powered A-Level Maths tutoring.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F1724',
    theme_color: '#0F1724',
    orientation: 'portrait',
    categories: ['education'],
    lang: 'en-GB',
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
    screenshots: [
      {
        src: '/opengraph-image',
        sizes: '1200x630',
        type: 'image/png',
        // @ts-ignore — not yet in the type definition
        form_factor: 'wide',
        label: 'StudiQ dashboard',
      },
    ],
  }
}
