import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'
import { getTopics } from '@/lib/curriculum'
import type { Level } from '@/lib/curriculum'
import Link from 'next/link'
import { Users, Flame, BookOpen, Trophy, Copy, Zap } from 'lucide-react'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, exam_board')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') redirect('/dashboard')

  // Fetch linked students
  const { data: links } = await supabase
    .from('teacher_student_links')
    .select('student_id, class_code')
    .eq('teacher_id', user.id)

  const studentIds = (links ?? []).map(l => l.student_id)
  const classCodes = [...new Set((links ?? []).map(l => l.class_code))]

  let students: StudentRow[] = []

  if (studentIds.length > 0) {
    const [{ data: profiles }, { data: allProgress }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, level, xp, streak_days, last_active_at, exam_date, target_grade, exam_board')
        .in('id', studentIds),
      supabase
        .from('student_progress')
        .select('student_id, topic_id, p_known')
        .in('student_id', studentIds),
    ])

    students = (profiles ?? []).map(p => {
      const prog = (allProgress ?? []).filter(pr => pr.student_id === p.id)
      const allTopics = getTopics((p.level as Level) ?? 'A-Level')
      const avgPKnown = allTopics.length > 0
        ? prog.reduce((s: number, pr: { p_known: number }) => s + pr.p_known, 0) / allTopics.length
        : 0
      const grade = predictedGrade(avgPKnown)
      const today = new Date().toISOString().slice(0, 10)
      const studiedToday = p.last_active_at ? p.last_active_at.slice(0, 10) === today : false

      return {
        id: p.id,
        name: p.full_name ?? 'Unknown',
        level: (p.level as Level) ?? 'A-Level',
        xp: p.xp ?? 0,
        streak: p.streak_days ?? 0,
        topicsStudied: prog.length,
        totalTopics: allTopics.length,
        mastery: Math.round(avgPKnown * 100),
        grade,
        studiedToday,
        targetGrade: p.target_grade ?? 'A*',
      }
    })
  }

  const name = profile?.full_name?.split(' ')[0] ?? 'Teacher'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-white"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 26, letterSpacing: '-0.02em' }}>
            Welcome back, {name}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>
            {studentIds.length} student{studentIds.length !== 1 ? 's' : ''} linked · Teacher Portal
          </p>
        </div>
      </div>

      {/* Class codes */}
      {classCodes.length > 0 && (
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <p className="text-sm font-semibold text-white">Your Class Codes</p>
          <p className="text-xs" style={{ color: '#5a7aaa' }}>
            Students join using these codes — share them with your class.
          </p>
          <div className="flex flex-wrap gap-2">
            {classCodes.map(code => (
              <ClassCodeBadge key={code} code={code} />
            ))}
          </div>
        </div>
      )}

      {/* Summary stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Users size={15} />}
            label="Total Students"
            value={String(students.length)}
            color="#3b82f6"
          />
          <SummaryCard
            icon={<Flame size={15} />}
            label="Active Today"
            value={String(students.filter(s => s.studiedToday).length)}
            color="#f97316"
          />
          <SummaryCard
            icon={<Trophy size={15} />}
            label="Avg Mastery"
            value={`${Math.round(students.reduce((s, st) => s + st.mastery, 0) / students.length)}%`}
            color="#f59e0b"
          />
          <SummaryCard
            icon={<Zap size={15} />}
            label="Total XP Earned"
            value={String(students.reduce((s, st) => s + st.xp, 0).toLocaleString())}
            color="#a78bfa"
          />
        </div>
      )}

      {/* Student list */}
      {students.length === 0 ? (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-semibold text-white mb-2">No students yet</p>
          <p className="text-xs" style={{ color: '#5a7aaa' }}>
            Generate a class code and share it so students can link to your class.
          </p>
          <NewClassCodeButton teacherId={user.id} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Students</h2>
            <NewClassCodeButton teacherId={user.id} />
          </div>
          <div className="space-y-2">
            {students
              .sort((a, b) => b.mastery - a.mastery)
              .map(s => <StudentRow key={s.id} student={s} />)}
          </div>
        </div>
      )}
    </div>
  )
}

interface StudentRow {
  id: string
  name: string
  level: Level
  xp: number
  streak: number
  topicsStudied: number
  totalTopics: number
  mastery: number
  grade: string
  studiedToday: boolean
  targetGrade: string
}

function StudentRow({ student: s }: { student: StudentRow }) {
  const gradeColor = s.grade === 'A*' ? '#fbbf24' : s.grade === 'A' ? '#4ade80' : s.grade === 'B' ? '#60a5fa' : '#94a3b8'
  const atTarget = s.grade === s.targetGrade || (s.grade === 'A*' && s.targetGrade === 'A*')

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
        style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
        {s.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">{s.name}</p>
          {s.studiedToday && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
              Active today
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
          {s.level} · {s.topicsStudied}/{s.totalTopics} topics
        </p>
      </div>

      {/* Mastery bar */}
      <div className="hidden sm:block w-28">
        <div className="flex justify-between text-[10px] mb-1">
          <span style={{ color: '#5a7aaa' }}>Mastery</span>
          <span style={{ color: '#94a3b8' }}>{s.mastery}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full"
            style={{ width: `${s.mastery}%`, background: s.mastery >= 70 ? '#4ade80' : s.mastery >= 40 ? '#f59e0b' : '#f87171' }} />
        </div>
      </div>

      {/* Grade */}
      <div className="text-center shrink-0">
        <p className="text-sm font-bold" style={{ color: gradeColor }}>{s.grade}</p>
        <p className="text-[10px]" style={{ color: atTarget ? '#4ade80' : '#5a7aaa' }}>
          {atTarget ? 'on track' : `target ${s.targetGrade}`}
        </p>
      </div>

      {/* Streak */}
      <div className="text-center shrink-0 hidden md:block">
        <p className="text-sm font-bold" style={{ color: '#f97316' }}>{s.streak}d</p>
        <p className="text-[10px]" style={{ color: '#5a7aaa' }}>streak</p>
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}18`, color }}>{icon}</div>
        <p className="text-xs font-medium" style={{ color: '#5a7aaa' }}>{label}</p>
      </div>
      <p className="font-bold" style={{ color, fontFamily: 'var(--font-space-grotesk)', fontSize: 28, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  )
}

function ClassCodeBadge({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm"
      style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}>
      {code}
      <Copy size={12} style={{ color: '#5a7aaa' }} />
    </div>
  )
}

function NewClassCodeButton({ teacherId }: { teacherId: string }) {
  return (
    <Link href={`/api/teacher/class-code?teacher_id=${teacherId}`}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}>
      + New class code
    </Link>
  )
}
