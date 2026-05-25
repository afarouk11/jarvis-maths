const BLOCKED: string[] = [
  'fuck', 'shit', 'cunt', 'bitch', 'cock', 'dick', 'pussy', 'ass', 'arse',
  'nigger', 'nigga', 'chink', 'spic', 'kike', 'fag', 'faggot', 'retard',
  'whore', 'slut', 'twat', 'wank', 'piss', 'bastard', 'bollocks',
  'admin', 'moderator', 'studiq', 'spok', 'support', 'official',
]

export function validateName(name: string): string | null {
  const trimmed = name.trim()

  if (trimmed.length < 2)  return 'Name must be at least 2 characters.'
  if (trimmed.length > 50) return 'Name must be 50 characters or fewer.'

  // Only letters (including accented), spaces, hyphens, apostrophes
  if (!/^[\p{L}\p{M}'\- ]+$/u.test(trimmed)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes.'
  }

  // Must contain at least one actual letter
  if (!/\p{L}/u.test(trimmed)) return 'Please enter a real name.'

  const lower = trimmed.toLowerCase()
  for (const word of BLOCKED) {
    if (lower.includes(word)) return 'Please enter an appropriate name.'
  }

  return null
}
