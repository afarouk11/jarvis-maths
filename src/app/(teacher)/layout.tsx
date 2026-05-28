'use client'

import { NotebookBackground } from '@/components/layout/NotebookBackground'
import Link from 'next/link'
import { StudiQLogo } from '@/components/ui/StudiQLogo'
import { BarChart2, Users, GraduationCap, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/teacher',          icon: <BarChart2 size={16} />, label: 'Overview' },
  { href: '/teacher/students', icon: <Users size={16} />,     label: 'Students' },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/sign-in')
  }

  return (
    <NotebookBackground>
      <div className="flex min-h-screen">
        {/* Teacher sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r"
          style={{ background: 'rgba(8,12,24,0.92)', borderColor: 'rgba(255,255,255,0.06)' }}>

          <div className="flex items-center gap-2.5 px-5 py-5 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <StudiQLogo size={28} />
            <div>
              <p className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>StudiQ</p>
              <p className="text-[10px]" style={{ color: '#5a7aaa' }}>Teacher Portal</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV.map(({ href, icon, label }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors hover:text-white hover:bg-white/5"
                style={{ color: '#6b8cba' }}>
                {icon}
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-3 py-4 space-y-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Link href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors hover:text-white"
              style={{ color: '#5a7aaa' }}>
              <GraduationCap size={14} />
              Student view
            </Link>
            <button onClick={signOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors hover:text-white"
              style={{ color: '#5a7aaa' }}>
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </NotebookBackground>
  )
}
