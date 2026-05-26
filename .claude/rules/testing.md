---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "**/tests/**"
  - "**/__tests__/**"
---

# Testing Standards

## Test Philosophy

1. Test behavior, not implementation
2. Each test should test one thing
3. Tests should be deterministic
4. Tests should be fast
5. Tests should be independent

## Test Structure

### Arrange-Act-Assert
```ts
it('should add item to cart', () => {
  // Arrange
  const cart = new Cart()
  const item = createItem({ price: 10 })

  // Act
  cart.add(item)

  // Assert
  expect(cart.items).toHaveLength(1)
  expect(cart.total).toBe(10)
})
```

### Describe Blocks
```ts
describe('Cart', () => {
  describe('add', () => {
    it('adds item to empty cart', () => {})
    it('adds item to cart with existing items', () => {})
    it('increases quantity for duplicate item', () => {})
  })

  describe('remove', () => {
    it('removes item from cart', () => {})
    it('throws for non-existent item', () => {})
  })
})
```

## Component Testing

### Use Testing Library
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('LoginForm', () => {
  it('submits with valid credentials', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<LoginForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
})
```

### Query Priority
1. `getByRole` - Most accessible
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - When label unavailable
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort

## Mocking

### Mock External Dependencies
```ts
// Mock API calls
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: 1, name: 'John' }])
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Don't Mock Internal Code
```ts
// Bad - mocking implementation details
vi.mock('./utils', () => ({
  formatDate: vi.fn().mockReturnValue('2024-01-01')
}))

// Good - test the actual behavior
const result = formatDate(new Date('2024-01-01'))
expect(result).toBe('January 1, 2024')
```

## Test Data

### Use Factories
```ts
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  }
}

// Usage
const admin = createUser({ role: 'admin' })
const customUser = createUser({ name: 'Custom Name' })
```

## Coverage Requirements

| Layer | Minimum |
|-------|---------|
| Domain | 100% |
| Application | 90% |
| Components | 80% |
| Integration | Critical paths |

## Forbidden Patterns

- Testing implementation details
- Snapshot tests for logic
- Flaky tests (timing-dependent)
- Tests that depend on other tests
- Over-mocking
- Testing framework code
- Empty test blocks
- Commented-out tests
