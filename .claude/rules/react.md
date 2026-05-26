---
paths:
  - "**/*.tsx"
  - "**/components/**"
  - "**/hooks/**"
---

# React Standards

## Component Rules

### Functional Components Only
- No class components
- Use hooks for all state and lifecycle

### Component Structure
```tsx
// 1. Imports
import { useState, useEffect } from 'react'

// 2. Types
interface Props {
  // ...
}

// 3. Component
export function Component({ prop }: Props) {
  // 4. Hooks (in order)
  const [state, setState] = useState()
  const data = useQuery()
  const mutation = useMutation()

  // 5. Effects
  useEffect(() => {
    // ...
  }, [])

  // 6. Handlers
  const handleClick = () => {
    // ...
  }

  // 7. Early returns
  if (loading) return <Loading />
  if (error) return <Error />

  // 8. Main render
  return (
    // ...
  )
}
```

### Component Size
- Maximum 300 lines per component
- Extract sub-components when > 200 lines
- Extract custom hooks for complex logic

## Hooks Rules

### Rules of Hooks
- Only call at top level
- Only call from React functions
- Name custom hooks with `use` prefix

### Dependency Arrays
```tsx
// Good - all dependencies listed
useEffect(() => {
  fetchData(userId)
}, [userId, fetchData])

// Bad - missing dependency
useEffect(() => {
  fetchData(userId)
}, [])
```

### Custom Hook Pattern
```tsx
function useResource(id: string) {
  const [data, setData] = useState<Resource | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    fetchResource(id)
      .then(data => {
        if (!cancelled) setData(data)
      })
      .catch(error => {
        if (!cancelled) setError(error)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  return { data, error, isLoading }
}
```

## Performance Rules

### Avoid Unnecessary Re-renders
```tsx
// Bad - new function every render
<Button onClick={() => handleClick(id)} />

// Good - memoized callback
const handleButtonClick = useCallback(() => {
  handleClick(id)
}, [id, handleClick])
<Button onClick={handleButtonClick} />
```

### Memoization Guidelines
- `useMemo` for expensive calculations
- `useCallback` for callbacks passed to children
- `memo()` for pure components receiving complex props
- Don't memoize everything - measure first

## Forbidden Patterns

- Inline function definitions in JSX (when causes re-renders)
- Index as key in dynamic lists
- Direct DOM manipulation
- `dangerouslySetInnerHTML` without sanitization
- State updates during render
- Mutating props or state directly
