'use client'

import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'

interface Video {
  id: string
  title: string
  creator_name: string
  youtube_id: string
  topic_tag: string | null
}

interface Props {
  topicName: string
  topicSlug: string
}

const lc = (s?: string | null) => (s ?? '').toLowerCase().trim()

/**
 * Shown when a student doesn't fully crack a question — offers a video to watch.
 * Prefers a curated creator video tagged to the topic; otherwise falls back to a
 * YouTube search so there is always a video option ("link video explanations when
 * AI can't fully explain").
 */
export function VideoExplanation({ topicName, topicSlug }: Props) {
  const [video, setVideo] = useState<Video | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/creators')
      .then(r => r.json())
      .then((vids: unknown) => {
        if (cancelled) return
        const list = Array.isArray(vids) ? (vids as Video[]) : []
        const name = lc(topicName)
        const slug = lc(topicSlug)
        const match = list.find(v => {
          const tag = lc(v.topic_tag)
          if (!tag) return false
          return tag === slug || tag === name || name.includes(tag) || tag.includes(slug) || slug.includes(tag)
        })
        setVideo(match ?? null)
        setLoaded(true)
      })
      .catch(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [topicName, topicSlug])

  if (!loaded) return null

  if (video) {
    return (
      <a
        href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
        <div
          className="shrink-0 rounded-lg overflow-hidden relative flex items-center justify-center"
          style={{
            width: 96, height: 54,
            backgroundImage: `url(https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg)`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}>
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <Play size={18} className="text-white" fill="white" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#f87171' }}>
            Watch a video explanation
          </p>
          <p className="text-sm text-white truncate">{video.title}</p>
          <p className="text-xs truncate" style={{ color: '#5a7aaa' }}>{video.creator_name} · YouTube</p>
        </div>
      </a>
    )
  }

  // Fallback — no curated video for this topic yet
  return (
    <a
      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`A level maths ${topicName} explained`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 p-3 rounded-xl transition-all hover:scale-[1.01]"
      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
      <Play size={16} style={{ color: '#f87171' }} className="shrink-0" fill="#f87171" />
      <p className="text-sm" style={{ color: '#fca5a5' }}>
        Still stuck? Watch a video explanation for <span className="font-semibold">{topicName}</span> →
      </p>
    </a>
  )
}
