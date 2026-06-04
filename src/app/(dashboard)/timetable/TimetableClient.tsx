'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS } from '@/lib/curriculum/gcse-topics'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TimetableSession {
  topicSlug: string
  topicName: string
  activityType: 'practice' | 'lesson' | 'review'
  durationMinutes: number
  reason: string
}

interface TimetableDay {
  day: string
  date: string
  totalMinutes: number
  sessions: TimetableSession[]
}

interface TimetableData {
  summary: string
  examCountdown: number
  weeklyPlan: TimetableDay[]
}

interface Props {
  profile: {
    exam_date: string | null
    target_grade: string
    full_name: string | null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTIVITY_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  practice: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#f59e0b', label: 'Practice' },
  lesson:   { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)',  text: '#60a5fa', label: 'Lesson'   },
  review:   { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)', text: '#a78bfa', label: 'Review'   },
}

function getTopicIcon(slug: string): string {
  return AQA_TOPICS.find(t => t.slug === slug)?.icon
    ?? GCSE_TOPICS.find(t => t.slug === slug)?.icon
    ?? '📚'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function examCountdownText(examDate: string | null): string {
  if (!examDate) return ''
  const today = new Date()
  const exam = new Date(examDate)
  const diff = Math.round((exam.getTime() - today.getTime()) / 86400000)
  if (diff <= 0) return 'Exam has passed'
  if (diff === 1) return '1 day until exam'
  return `${diff} days until exam`
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function sessionHref(session: TimetableSession): string {
  if (session.activityType === 'lesson') return `/topics/${session.topicSlug}`
  return `/practice?topic=${session.topicSlug}`
}

function SessionCard({ session }: { session: TimetableSession }) {
  const activity = ACTIVITY_COLORS[session.activityType] ?? ACTIVITY_COLORS.practice
  const icon = getTopicIcon(session.topicSlug)
  const href = sessionHref(session)

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = `${activity.bg}`
          el.style.borderColor = activity.border
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = 'rgba(255,255,255,0.03)'
          el.style.borderColor = 'rgba(255,255,255,0.06)'
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#d0dbe8', lineHeight: 1.2 }}>
              {session.topicName}
            </p>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              background: activity.bg, border: `1px solid ${activity.border}`,
              color: activity.text, borderRadius: 6, padding: '2px 7px',
              textTransform: 'uppercase', flexShrink: 0,
            }}>
              {activity.label}
            </span>
          </div>
          <p style={{ fontSize: 10, color: '#4a6080', lineHeight: 1.4, marginBottom: 3 }}>
            {session.reason}
          </p>
          <p style={{ fontSize: 10, color: '#3a5070', fontWeight: 600 }}>
            {session.durationMinutes} min
          </p>
        </div>
        <span style={{ fontSize: 12, color: '#3a5070', flexShrink: 0, marginTop: 2 }}>→</span>
      </div>
    </Link>
  )
}

function DayCard({ dayPlan }: { dayPlan: TimetableDay }) {
  const isToday = dayPlan.date === new Date().toISOString().slice(0, 10)

  return (
    <div style={{
      background: 'rgba(4,6,16,0.93)',
      backdropFilter: 'blur(24px)',
      border: `1px solid ${isToday ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.12)'}`,
      borderRadius: 20,
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Day header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <div>
          <p style={{
            fontSize: 13, fontWeight: 800,
            color: isToday ? '#f59e0b' : '#c0d0e0',
            letterSpacing: '0.04em',
          }}>
            {dayPlan.day}
            {isToday && <span style={{ fontSize: 9, marginLeft: 6, letterSpacing: '0.12em', color: '#f59e0b' }}>TODAY</span>}
          </p>
          <p style={{ fontSize: 10, color: '#4a6080', marginTop: 1 }}>
            {formatDate(dayPlan.date)}
          </p>
        </div>
        <div style={{
          fontSize: 10, color: '#5a7aaa', fontWeight: 600,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8, padding: '3px 8px',
        }}>
          {dayPlan.totalMinutes} min
        </div>
      </div>

      {/* Sessions */}
      {dayPlan.sessions.length === 0 ? (
        <p style={{ fontSize: 11, color: '#2a3a50', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
          Rest day — no sessions
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dayPlan.sessions.map((session, i) => (
            <SessionCard key={`${session.topicSlug}-${i}`} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonDayCard() {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: 'rgba(4,6,16,0.93)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(245,158,11,0.08)',
        borderRadius: 20,
        padding: 18,
        minHeight: 160,
      }}
    >
      <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.07)', width: '40%', marginBottom: 8 }} />
      <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.04)', width: '25%', marginBottom: 18 }} />
      <div style={{ height: 60, borderRadius: 12, background: 'rgba(255,255,255,0.04)', marginBottom: 8 }} />
      <div style={{ height: 60, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function TimetableClient({ profile }: Props) {
  const [timetable, setTimetable] = useState<TimetableData | null>(null)
  const [loading, setLoading] = useState(false)
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (hours: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursPerDay: hours }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Failed to generate timetable')
      }
      const data = await res.json() as TimetableData
      setTimetable(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-generate on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- generates the initial timetable on mount; setState here is intentional
    generate(hoursPerDay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const countdown = profile.exam_date ? examCountdownText(profile.exam_date) : null

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060d1f',
      padding: '32px 24px 48px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 9, letterSpacing: '0.25em', fontWeight: 700,
            color: '#f59e0b', textTransform: 'uppercase', marginBottom: 6,
          }}>
            Study Timetable
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
            {profile.full_name ? `${profile.full_name}'s Week` : 'Your Week'}
          </h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {countdown && (
              <p style={{ fontSize: 13, color: '#5a7aaa' }}>{countdown}</p>
            )}
            <p style={{ fontSize: 13, color: '#5a7aaa' }}>
              Target: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{profile.target_grade}</span>
            </p>
          </div>
        </div>

        {/* ── Controls row ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
          flexWrap: 'wrap',
        }}>
          {/* Hours stepper */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(4,6,16,0.93)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: 14, padding: '8px 12px',
          }}>
            <span style={{ fontSize: 11, color: '#5a7aaa', fontWeight: 600, marginRight: 4 }}>Hours/day</span>
            <button
              onClick={() => setHoursPerDay(h => Math.max(1, h - 1))}
              disabled={loading || hoursPerDay <= 1}
              style={{
                width: 26, height: 26, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#8a9ab0', fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                opacity: hoursPerDay <= 1 ? 0.4 : 1,
              }}>
              −
            </button>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b', minWidth: 18, textAlign: 'center' }}>
              {hoursPerDay}
            </span>
            <button
              onClick={() => setHoursPerDay(h => Math.min(6, h + 1))}
              disabled={loading || hoursPerDay >= 6}
              style={{
                width: 26, height: 26, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#8a9ab0', fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                opacity: hoursPerDay >= 6 ? 0.4 : 1,
              }}>
              +
            </button>
          </div>

          {/* Regenerate button */}
          <button
            onClick={() => generate(hoursPerDay)}
            disabled={loading}
            style={{
              padding: '10px 20px', borderRadius: 14, fontSize: 12, fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              background: loading ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.4)',
              color: '#f59e0b',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
            }}>
            <motion.span
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.7, repeat: loading ? Infinity : 0, ease: 'linear' }}
              style={{ display: 'inline-block', fontSize: 14 }}
            >
              ↻
            </motion.span>
            {loading ? 'Generating...' : 'Regenerate'}
          </button>
        </div>

        {/* ── Error ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 14, padding: '12px 16px',
                marginBottom: 20,
                fontSize: 12, color: '#f87171',
              }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Summary card ─────────────────────────────────────────── */}
        <AnimatePresence>
          {!loading && timetable && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'rgba(4,6,16,0.93)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 20,
                padding: '18px 22px',
                marginBottom: 24,
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 6 }}>
                  Week Summary
                </p>
                <p style={{ fontSize: 13, color: '#8a9ab0', lineHeight: 1.6 }}>
                  {timetable.summary}
                </p>
              </div>
              {timetable.examCountdown > 0 && (
                <div style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 14, padding: '12px 16px',
                  textAlign: 'center', flexShrink: 0,
                }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
                    {timetable.examCountdown}
                  </p>
                  <p style={{ fontSize: 9, color: '#8a7040', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>
                    days left
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 7-day grid ──────────────────────────────────────────── */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonDayCard key={i} />
            ))}
          </div>
        ) : timetable ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
            {timetable.weeklyPlan.map(dayPlan => (
              <DayCard key={dayPlan.date} dayPlan={dayPlan} />
            ))}
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
