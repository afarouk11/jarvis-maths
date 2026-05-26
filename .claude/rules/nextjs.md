---
paths:
  - "app/**"
  - "src/app/**"
---

# Next.js App Router Standards

## Server vs Client Components

### Default to Server Components
- Components are Server Components by default
- Only add `'use client'` when needed for:
  - Event handlers (onClick, onChange)
  - Browser APIs (localStorage, window)
  - React hooks (useState, useEffect)
  - Third-party client libraries

### Client Component Boundaries
```tsx
// Good - minimal client boundary
// app/page.tsx (Server Component)
import { ClientForm } from './ClientForm'

export default function Page() {
  const data = await fetchData() // Server-side fetch
  return (
    <div>
      <h1>Server-rendered title</h1>
      <ClientForm initialData={data} />
    </div>
  )
}

// ClientForm.tsx
'use client'
export function ClientForm({ initialData }) {
  const [state, setState] = useState(initialData)
  // ...
}
```

## Data Fetching

### Server Components
```tsx
// Good - fetch in Server Component
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  return <Display data={data} />
}
```

### Caching Strategies
```tsx
// Static data (cached indefinitely)
fetch(url)

// Revalidate periodically
fetch(url, { next: { revalidate: 3600 } })

// No cache (dynamic)
fetch(url, { cache: 'no-store' })
```

## Route Handlers

### API Route Structure
```ts
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Handle GET
}

export async function POST(request: NextRequest) {
  // Handle POST
}
```

### Always Validate Input
```ts
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    )
  }

  // Process validated data
}
```

## File Conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Route UI |
| `layout.tsx` | Shared layout |
| `loading.tsx` | Loading UI |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 page |
| `route.ts` | API endpoint |
| `template.tsx` | Re-rendered layout |
| `default.tsx` | Parallel route fallback |

## Forbidden Patterns

- Using `getServerSideProps` / `getStaticProps` (Pages Router)
- Fetching in Client Components when Server Component works
- Missing error boundaries
- Missing loading states
- Exposing sensitive data to client
- Not using `next/image` for images
- Not using `next/font` for fonts
