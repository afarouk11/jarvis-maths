'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, BookOpen, Zap, FileText,
  User, LogOut, Brain, Bot, Database, Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',      glow: '#3b82f6' },
  { href: '/topics',    icon: BookOpen,        label: 'Topics',          glow: '#8b5cf6' },
  { href: '/practice',  icon: Zap,             label: 'Practice',        glow: '#f59e0b' },
  { href: '/jarvis',    icon: Bot,             label: 'SPOK',            glow: '#f59e0b' },
  { href: '/brain',     icon: Brain,           label: 'Knowledge Brain', glow: '#c47a20' },
  { href: '/papers',    icon: FileText,        label: 'Past Papers',     glow: '#60a5fa' },
  { href: '/profile',   icon: User,            label: 'Profile',         glow: '#a78bfa' },
  { href: '/admin',     icon: Database,        label: 'Knowledge Base',  glow: '#34d399' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [dueCount, setDueCount] = useState(0)

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.json())
      .then((data: Array<{ next_review_at: string }>) => {
        const now = new Date()
        setDueCount(data.filter(p => new Date(p.next_review_at) <= now).length)
      })
      .catch(() => {})
  }, [pathname])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 flex-col items-center py-6 gap-2 z-50"
      style={{
        background: 'rgba(7,11,22,0.97)',
        borderRight: '1px solid rgba(59,130,246,0.08)',
        backdropFilter: 'blur(16px)',
      }}>

      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div style={{ position: 'relative' }}>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute', inset: -3, borderRadius: '50%',
            border: '1px solid rgba(99,102,241,0.2)',
            pointerEvents: 'none',
          }} />
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.25) 100%)',
            padding: 1, borderRadius: 10,
          }}>
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0c1630, #1d4ed8)', fontFamily: 'var(--font-space-grotesk)' }}>
              S
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 w-full px-2">
        {NAV.map(({ href, icon: Icon, label, glow }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} title={label}>
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: 44, borderRadius: 12,
                  background: active ? `${glow}18` : 'transparent',
                  border: active ? `1px solid ${glow}35` : '1px solid transparent',
                }}>

                {/* Pulsing glow halo */}
                <motion.div
                  animate={{ opacity: [0.2, active ? 0.6 : 0.35, 0.2], scale: [0.85, 1.05, 0.85] }}
                  transition={{ duration: 3 + Math.random() * 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', inset: 3, borderRadius: 10, pointerEvents: 'none',
                    background: `radial-gradient(circle, ${glow}25 0%, transparent 70%)`,
                  }}
                />

                <div style={{ position: 'relative' }}>
                  <Icon size={18} style={{ color: active ? glow : '#3a4a5a', transition: 'color 0.2s' }} />
                  {href === '/practice' && dueCount > 0 && (
                    <div style={{
                      position: 'absolute', top: -4, right: -6,
                      minWidth: 14, height: 14, borderRadius: 99,
                      background: '#ef4444', fontSize: 8, fontWeight: 700,
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 3px',
                    }}>
                      {dueCount > 9 ? '9+' : dueCount}
                    </div>
                  )}
                </div>

                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 2, height: 20, borderRadius: '0 2px 2px 0', background: glow,
                      boxShadow: `0 0 8px ${glow}`,
                    }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Upgrade to Pro */}
      <Link href="/pricing" title="Upgrade to Pro" className="mb-1">
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.12) 100%)', padding: 1, borderRadius: 10 }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-[9px]"
              style={{ background: 'rgba(245,158,11,0.08)' }}>
              <Sparkles size={15} style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Sign out */}
      <button onClick={signOut} title="Sign out"
        className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:bg-red-500/10">
        <LogOut size={16} style={{ color: '#2d3a4a' }} />
      </button>
    </aside>
  )
}

const MOBILE_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/practice',  icon: Zap,             label: 'Practice' },
  { href: '/jarvis',    icon: Bot,             label: 'SPOK' },
  { href: '/topics',    icon: BookOpen,        label: 'Topics' },
  { href: '/profile',   icon: User,            label: 'Profile' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3"
      style={{
        background: 'rgba(7,11,22,0.97)',
        borderTop: '1px solid rgba(59,130,246,0.1)',
        backdropFilter: 'blur(20px)',
      }}>
      {MOBILE_NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
            style={{ minWidth: 56 }}>
            <Icon size={20} style={{ color: active ? '#3b82f6' : '#3a4a5a' }} />
            <span className="text-[10px] font-medium" style={{ color: active ? '#3b82f6' : '#3a4a5a' }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
