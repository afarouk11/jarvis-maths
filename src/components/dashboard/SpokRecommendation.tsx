import Link from 'next/link'
import { computeExamReadiness } from '@/lib/exam-readiness'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import type { StudentProgress } from '@/types'

interface Props {
  progress: StudentProgress[]
  examDate: string | null
  targetGrade: string
  examBoard: string
  topicsRows: Array<{ id: string; slug: string }>
}

export function SpokRecommendation({ progress, examDate, targetGrade, examBoard, topicsRows }: Props) {
  const slugById   = new Map(topicsRows.map(t => [t.id,   t.slug]))
  const topicNames = new Map(AQA_TOPICS.map(t => [t.slug, t.name]))
  const totalTopics = AQA_TOPICS.length

  const readiness = computeExamReadiness({
    progress, totalTopics, examDate, targetGrade, slugById, topicNames,
  })

  const urgencyBg: Record<typeof readiness.urgency, string> = {
    low:      'rgba(59,130,246,0.06)',
    medium:   'rgba(245,158,11,0.06)',
    high:     'rgba(239,68,68,0.07)',
    critical: 'rgba(239,68,68,0.10)',
  }
  const urgencyBorder: Record<typeof readiness.urgency, string> = {
    low:      'rgba(59,130,246,0.18)',
    medium:   'rgba(245,158,11,0.25)',
    high:     'rgba(239,68,68,0.25)',
    critical: 'rgba(239,68,68,0.35)',
  }
  const urgencyAccent: Record<typeof readiness.urgency, string> = {
    low:      '#3b82f6',
    medium:   '#f59e0b',
    high:     '#ef4444',
    critical: '#f87171',
  }

  const accent = readiness.urgency === 'low' ? readiness.color : urgencyAccent[readiness.urgency]
  const href   = readiness.topPrioritySlug
    ? `/practice?topic=${readiness.topPrioritySlug}`
    : '/practice'

  if (progress.length === 0) {
    return (
      <div className="rounded-2xl p-5 flex items-center gap-5"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)' }}>
        <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
          🧠
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">SPOK doesn't know your gaps yet.</p>
          <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
            Start a topic to let SPOK build your knowledge map.
          </p>
        </div>
        <Link href="/topics">
          <button className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 0 16px rgba(59,130,246,0.3)' }}>
            Browse topics →
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-5 flex items-center gap-5"
      style={{
        background: urgencyBg[readiness.urgency],
        border: `1px solid ${urgencyBorder[readiness.urgency]}`,
        boxShadow: readiness.urgency === 'critical'
          ? '0 0 30px rgba(239,68,68,0.06)'
          : undefined,
      }}>

      {/* Score ring */}
      <div className="shrink-0 relative w-14 h-14">
        <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
          <circle
            cx="28" cy="28" r="24" fill="none"
            stroke={accent}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - readiness.score / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 4px ${accent})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold leading-none" style={{ color: accent, fontFamily: 'var(--font-space-grotesk)' }}>
            {readiness.score}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
            SPOK
          </span>
          {readiness.daysToExam !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: readiness.urgency === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                color: readiness.urgency === 'critical' ? '#f87171' : '#5a7aaa',
                border: `1px solid ${readiness.urgency === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              {readiness.daysToExam}d to exam
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-white leading-snug">
          {readiness.improvementNeeded ?? `You're at ${readiness.score}% exam readiness. Keep going.`}
        </p>
      </div>

      {/* CTA */}
      <Link href={href}>
        <button className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105 whitespace-nowrap"
          style={{
            background: `linear-gradient(135deg, ${accent}cc, ${accent})`,
            boxShadow: `0 0 16px ${accent}40`,
          }}>
          Study now →
        </button>
      </Link>
    </div>
  )
}
