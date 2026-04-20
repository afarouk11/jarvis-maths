'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  FileText,
  User,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/topics', icon: BookOpen, label: 'Topics' },
  { href: '/practice', icon: Zap, label: 'Practice' },
  { href: '/papers', icon: FileText, label: 'Past Papers' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center py-6 gap-2 z-50"
      style={{ background: 'rgba(8,13,25,0.95)', borderRight: '1px solid rgba(59,130,246,0.12)', backdropFilter: 'blur(12px)' }}>
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full arc-glow-sm flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', border: '1px solid rgba(59,130,246,0.5)', color: '#fff' }}>
          J
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 w-full px-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} title={label}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center w-full h-10 rounded-lg transition-colors"
                style={{
                  background: active ? 'rgba(59,130,246,0.2)' : 'transparent',
                  border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                }}>
                <Icon size={18} style={{ color: active ? '#3b82f6' : '#5a7aaa' }} />
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: '#3b82f6' }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <button onClick={signOut} title="Sign out"
        className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:bg-red-500/10">
        <LogOut size={16} style={{ color: '#5a7aaa' }} />
      </button>
    </aside>
  )
}
