---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Security Standards

## Input Validation

### Always Validate User Input
```ts
import { z } from 'zod'

// Define strict schemas
const userInputSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).regex(/^[\w\s-]+$/),
  age: z.number().int().min(0).max(150),
})

// Validate before use
const result = userInputSchema.safeParse(input)
if (!result.success) {
  throw new ValidationError(result.error)
}
```

### Sanitize Output
```tsx
// Good - React escapes by default
<div>{userContent}</div>

// DANGEROUS - avoid unless absolutely necessary
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

// If you must use dangerouslySetInnerHTML
import DOMPurify from 'dompurify'
const sanitized = DOMPurify.sanitize(userHtml)
```

## Authentication & Authorization

### Protect Routes
```ts
// Next.js middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

### Check Permissions
```ts
// Always verify on server
export async function updateResource(id: string, data: unknown) {
  const session = await getServerSession()
  if (!session) {
    throw new UnauthorizedError()
  }

  const resource = await getResource(id)
  if (resource.ownerId !== session.user.id) {
    throw new ForbiddenError()
  }

  // Proceed with update
}
```

## Secrets Management

### Environment Variables
```ts
// Good - server-side only
const apiKey = process.env.API_KEY // Not exposed to client

// Bad - exposed to client
const apiKey = process.env.NEXT_PUBLIC_API_KEY // Visible in browser

// Validate env vars at startup
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(32),
})

export const env = envSchema.parse(process.env)
```

### Never Commit Secrets
- Use `.env.local` for local development
- Add `.env*` to `.gitignore`
- Use secret management for production

## API Security

### Rate Limiting
```ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }

  // Process request
}
```

### CORS Configuration
```ts
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE' },
        ],
      },
    ]
  },
}
```

## Forbidden Patterns

- Storing passwords in plain text
- Using `eval()` or `new Function()`
- SQL/NoSQL injection vulnerabilities
- Exposing stack traces to clients
- Hardcoded secrets in code
- Disabling HTTPS in production
- Using outdated dependencies with known vulnerabilities
- Logging sensitive data (passwords, tokens, PII)

## Security Checklist

- [ ] Input validation on all user data
- [ ] Output encoding/sanitization
- [ ] Authentication on protected routes
- [ ] Authorization checks for resources
- [ ] HTTPS in production
- [ ] Secure cookie settings
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Dependencies regularly updated
- [ ] Security headers configured
