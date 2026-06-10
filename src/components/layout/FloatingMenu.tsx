'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Zap, FileText, User, LogOut, Brain, Bot,
  TrendingUp, Trophy, CalendarDays, Sparkles, Menu, X, type LucideIcon,
} from 'lucide-react'
import { StudiQLogo } from '@/components/ui/StudiQLogo'
import { createClient } from '@/lib/supabase/client'

// SPOK is the interface — everything else lives one tap away in here.
const NAV: Array<{ href: string; icon: LucideIcon; label: string }> = [
  { href: '/jarvis',      icon: Bot,             label: 'SPOK' },
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/topics',      icon: BookOpen,        label: 'Learn' },
  { href: '/practice',    icon: Zap,             label: 'Practice' },
  { href: '/progress',    icon: TrendingUp,      label: 'Progress' },
  { href: '/brain',       icon: Brain,           label: 'Brain Map' },
  { href: '/timetable',   icon: CalendarDays,    label: 'Timetable' },
  { href: '/papers',      icon: FileText,        label: 'Past Papers' },
  { href: '/leaderboard', icon: Trophy,          label: 'Leaderboard' },
  { href: '/profile',     icon: User,            label: 'Profile' },
]

export function FloatingMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Trigger — the only persistent chrome on the whole app */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed top-4 right-4 z-[70] flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
        style={{
          background: 'rgba(7,12,26,0.85)',
          border: '1px solid rgba(59,130,246,0.25)',
          backdropFilter: 'blur(12px)',
          color: '#60a5fa',
        }}
      >
        <Menu size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80]"
              style={{ background: 'rgba(2,5,12,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            />

            {/* Menu card */}
            <motion.div
              initial={{ opacity: 0, x: 16, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="fixed top-4 right-4 z-[90] w-64 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl p-3"
              style={{
                background: '#070c1a',
                border: '1px solid rgba(59,130,246,0.2)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
              }}
            >
              <div className="flex items-center justify-between px-2 pb-3">
                <div className="flex items-center gap-2">
                  <StudiQLogo size={24} />
                  <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    StudiQ
                  </span>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close menu"
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#3a4a5c' }}>
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-0.5">
                {NAV.map(({ href, icon: Icon, label }) => {
                  const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
                  return (
                    <Link key={href} href={href} onClick={() => setOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
                        style={{
                          background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                          color: active ? '#e8f0fe' : '#7c98c4',
                        }}>
                        <Icon size={16} style={{ color: active ? '#3b82f6' : '#5a7aaa' }} />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="my-2 mx-2 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

              <Link href="/pricing" onClick={() => setOpen(false)}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-opacity hover:opacity-90"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Sparkles size={14} style={{ color: '#f59e0b' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Upgrade to Pro</p>
                    <p className="text-[10px]" style={{ color: '#7a6030' }}>Unlimited SPOK + AI marking</p>
                  </div>
                </div>
              </Link>

              <button
                onClick={signOut}
                className="flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-lg transition-colors hover:bg-red-500/10"
                style={{ color: '#3a4a5c' }}>
                <LogOut size={14} />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
