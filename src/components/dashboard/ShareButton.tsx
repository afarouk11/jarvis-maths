'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface ShareButtonProps {
  name: string
  grade: string
  mastery: number
  topic: string
}

export function ShareButton({ name, grade, mastery, topic }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  function share() {
    const params = new URLSearchParams({ name, grade, mastery: String(mastery), topic })
    const ogUrl = `${window.location.origin}/api/og?${params}`
    const shareUrl = `${window.location.origin}/dashboard`
    const text = `I'm aiming for ${grade} in ${topic} with SPOK on StudiQ! 📊 ${Math.round(mastery)}% avg mastery so far.`

    if (navigator.share) {
      navigator.share({ title: 'My StudiQ progress', text, url: shareUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${text}\n${ogUrl}`).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <button
      onClick={share}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
      style={{
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.2)',
        color: '#a5b4fc',
      }}>
      {copied ? <Check size={12} /> : <Share2 size={12} />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
