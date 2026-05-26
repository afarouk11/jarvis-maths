'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Clapperboard } from 'lucide-react'

interface CreatorVideo {
  id: string
  creator_name: string
  creator_handle: string | null
  creator_avatar_url: string | null
  title: string
  description: string | null
  youtube_id: string
  topic_tag: string | null
  created_at: string
}

function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export function CreatorsReel() {
  const [videos, setVideos]     = useState<CreatorVideo[]>([])
  const [loading, setLoading]   = useState(true)
  const [active, setActive]     = useState<CreatorVideo | null>(null)
  const [watched, setWatched]   = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/creators')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setVideos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function open(v: CreatorVideo) {
    setActive(v)
    setWatched(prev => new Set([...prev, v.id]))
  }

  function close() {
    setActive(null)
  }

  // Close modal on backdrop click or Escape
  useEffect(() => {
    if (!active) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-4 w-20 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-[72px] h-[72px] rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-3 w-14 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (videos.length === 0) return null

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clapperboard size={14} style={{ color: '#a78bfa' }} />
            <h2 className="text-sm font-semibold text-white">Creators</h2>
          </div>
          <span className="text-xs" style={{ color: '#3a4a5c' }}>tap to watch</span>
        </div>

        {/* Stories strip */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {videos.map(v => {
            const seen = watched.has(v.id)
            return (
              <motion.button
                key={v.id}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => open(v)}
                className="flex flex-col items-center gap-2 shrink-0 focus:outline-none"
              >
                {/* Ring + thumbnail bubble */}
                <div
                  className="relative rounded-full p-[2.5px]"
                  style={{
                    background: seen
                      ? 'rgba(255,255,255,0.1)'
                      : 'linear-gradient(135deg, #a78bfa, #6366f1, #3b82f6)',
                  }}
                >
                  <div
                    className="w-[68px] h-[68px] rounded-full overflow-hidden relative"
                    style={{ background: '#0d1020' }}
                  >
                    {/* YouTube thumbnail */}
                    <img
                      src={ytThumb(v.youtube_id)}
                      alt={v.title}
                      className="w-full h-full object-cover"
                      style={{ opacity: seen ? 0.55 : 1 }}
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.28)' }}>
                      <Play size={18} fill="white" style={{ color: 'white', opacity: seen ? 0.5 : 0.9 }} />
                    </div>
                  </div>
                </div>

                {/* Creator name */}
                <div className="text-center max-w-[76px]">
                  <p className="text-[11px] font-medium text-white truncate leading-tight">
                    {v.creator_name}
                  </p>
                  {v.topic_tag && (
                    <p className="text-[10px] truncate" style={{ color: '#5a7aaa' }}>{v.topic_tag}</p>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{ background: '#0d1020', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* 16:9 YouTube embed */}
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${active.youtube_id}?autoplay=1&rel=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Info bar */}
              <div className="flex items-start justify-between gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm leading-snug">{active.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs" style={{ color: '#6366f1' }}>
                      {active.creator_handle ? `@${active.creator_handle}` : active.creator_name}
                    </span>
                    {active.topic_tag && (
                      <>
                        <span style={{ color: '#3a4a5c' }}>·</span>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
                          {active.topic_tag}
                        </span>
                      </>
                    )}
                  </div>
                  {active.description && (
                    <p className="text-xs mt-2 line-clamp-2" style={{ color: '#5a7aaa' }}>{active.description}</p>
                  )}
                </div>
                <button
                  onClick={close}
                  className="p-2 rounded-xl shrink-0 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#5a7aaa' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5a7aaa' }}
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
