export interface XPLevel {
  level: number
  title: string
  minXP: number
  maxXP: number
  color: string
}

const LEVELS: XPLevel[] = [
  { level: 1,  title: 'Novice',      minXP: 0,     maxXP: 99,    color: '#94a3b8' },
  { level: 2,  title: 'Apprentice',  minXP: 100,   maxXP: 249,   color: '#60a5fa' },
  { level: 3,  title: 'Scholar',     minXP: 250,   maxXP: 499,   color: '#34d399' },
  { level: 4,  title: 'Analyst',     minXP: 500,   maxXP: 999,   color: '#4ade80' },
  { level: 5,  title: 'Expert',      minXP: 1000,  maxXP: 1999,  color: '#a78bfa' },
  { level: 6,  title: 'Master',      minXP: 2000,  maxXP: 3999,  color: '#f59e0b' },
  { level: 7,  title: 'Virtuoso',    minXP: 4000,  maxXP: 7999,  color: '#fb923c' },
  { level: 8,  title: 'Genius',      minXP: 8000,  maxXP: 14999, color: '#f87171' },
  { level: 9,  title: 'Prodigy',     minXP: 15000, maxXP: 29999, color: '#e879f9' },
  { level: 10, title: 'J.A.R.V.I.S', minXP: 30000, maxXP: Infinity, color: '#fbbf24' },
]

export function getXPLevel(xp: number): XPLevel & { progress: number; xpIntoLevel: number; xpToNext: number } {
  const lvl = LEVELS.findLast(l => xp >= l.minXP) ?? LEVELS[0]
  const isMax = lvl.level === 10
  const xpIntoLevel = xp - lvl.minXP
  const xpToNext = isMax ? 0 : lvl.maxXP - lvl.minXP + 1
  const progress = isMax ? 1 : xpIntoLevel / xpToNext
  return { ...lvl, progress, xpIntoLevel, xpToNext }
}
