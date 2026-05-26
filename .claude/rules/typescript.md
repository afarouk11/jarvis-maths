---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Standards

## Strict Mode Required

All projects must use strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Type Rules

### Forbidden Patterns
- `any` type - Use `unknown` and narrow with type guards
- Type assertions without validation (`as Type`)
- Non-null assertions (`!`) without justification
- `// @ts-ignore` or `// @ts-expect-error` without explanation

### Required Patterns
- Explicit return types for exported functions
- Interface for object shapes, type for unions/primitives
- Readonly for immutable data
- Discriminated unions for complex state

## Examples

### Type Guards
```ts
// Good
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}

// Bad
const user = data as User
```

### Discriminated Unions
```ts
// Good
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
  | { status: 'loading' }

// Bad
type Result<T> = {
  data?: T
  error?: Error
  loading?: boolean
}
```

### Null Handling
```ts
// Good
const value = map.get(key)
if (value === undefined) {
  throw new Error('Key not found')
}
return value

// Bad
return map.get(key)!
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Interface | PascalCase + noun | `UserProfile` |
| Type alias | PascalCase | `UserId` |
| Enum | PascalCase | `UserRole` |
| Generic | Single uppercase or descriptive | `T`, `TResponse` |
| Constant | SCREAMING_SNAKE | `MAX_RETRIES` |
