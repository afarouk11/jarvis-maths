'use client'

import { useState, useEffect } from 'react'
import type { StudentProgress } from '@/types'

export function useProgress() {
  const [progress, setProgress] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/progress')
      if (res.ok) {
        const data = await res.json()
        setProgress(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  function refresh() {
    setLoading(true)
    fetch('/api/progress')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setProgress(data); setLoading(false) })
  }

  const avgPKnown = progress.length > 0
    ? progress.reduce((s, p) => s + p.p_known, 0) / progress.length
    : 0

  const dueForReview = progress.filter(p => new Date(p.next_review_at) <= new Date())

  return { progress, loading, refresh, avgPKnown, dueForReview }
}
