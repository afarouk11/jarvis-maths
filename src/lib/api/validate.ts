// Tiny dependency-free request validators for route handlers.

export function asString(value: unknown, maxLength = 10000): string | null {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
    ? value
    : null
}

export function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null
}

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 })
}
