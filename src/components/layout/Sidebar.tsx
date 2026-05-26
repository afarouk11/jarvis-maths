'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, BookOpen, Zap, FileText,
  User, LogOut, Brain, Bot, Database,
  TrendingUp, Trophy, CalendarDays, Sparkles,
  PanelLeftClose,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_GROUPS = [
  {
    label: 'Study',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/topics',    icon: BookOpen,        label: 'Topics' },
      { href: '/practice',  icon: Zap,             label: 'Practice' },
      { href: '/jarvis',    icon: Bot,             label: 'Ask SPOK' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/brain',     icon: Brain,        label: 'Brain Map' },
      { href: '/timetable', icon: CalendarDays, label: 'Timetable' },
      { href: '/papers',    icon: FileText,     label: 'Past Papers' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { href: '/progress',    icon: TrendingUp, label: 'Progress' },
      { href: '/leaderboard', icon: Trophy,     label: 'Leaderboard' },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
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
    await createClient().auth.signOut()
    router.push('/sign-in')
  }

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] flex-col z-50 transition-transform duration-300 ease-in-out"
      style={{
        background: '#070c1a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        transform: collapsed ? 'translateX(-220px)' : 'translateX(0)',
      }}
    >
      {/* Logo + collapse button */}
      <div className="px-5 py-5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                fontFamily: 'var(--font-space-grotesk)',
              }}
            >
              S
            </div>
            <span
              className="text-base font-bold text-white"
              style={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.01em' }}
            >
              StudiQ
            </span>
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: '#3a4a5c' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#5a7aaa' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#3a4a5c' }}
            >
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="mx-4 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p
              className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: '#3a4a5c' }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href)
                return (
                  <Link key={href} href={href}>
                    <div
                      className="relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                      style={{
                        background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                        color: active ? '#e8f0fe' : '#5a7aaa',
                      }}
                      onMouseEnter={e => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                      }}
                      onMouseLeave={e => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                      }}
                    >
                      {/* Active left bar */}
                      {active && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                          style={{ background: '#3b82f6' }}
                        />
                      )}

                      <Icon size={15} style={{ color: active ? '#3b82f6' : '#3a4a5c', flexShrink: 0 }} />
                      <span className="text-sm font-medium">{label}</span>

                      {/* Due badge on Practice */}
                      {href === '/practice' && dueCount > 0 && (
                        <span
                          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                        >
                          {dueCount > 9 ? '9+' : dueCount}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Knowledge base (admin) — smaller, at bottom of nav */}
        <div>
          <p
            className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: '#3a4a5c' }}
          >
            Account
          </p>
          <div className="space-y-0.5">
            {[
              { href: '/profile', icon: User,     label: 'Profile' },
              { href: '/admin',   icon: Database, label: 'Knowledge Base' },
            ].map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href}>
                  <div
                    className="relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                    style={{
                      background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                      color: active ? '#e8f0fe' : '#5a7aaa',
                    }}
                    onMouseEnter={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                    }}
                    onMouseLeave={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    {active && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                        style={{ background: '#3b82f6' }}
                      />
                    )}
                    <Icon size={15} style={{ color: active ? '#3b82f6' : '#3a4a5c', flexShrink: 0 }} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="mx-4 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Bottom: Upgrade + sign out */}
      <div className="px-3 py-4 space-y-2 shrink-0">
        <Link href="/pricing">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <Sparkles size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Upgrade to Pro</p>
              <p className="text-[10px]" style={{ color: '#7a6030' }}>Unlimited SPOK + AI marking</p>
            </div>
          </div>
        </Link>

        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors"
          style={{ color: '#3a4a5c' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#f87171'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#3a4a5c'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <LogOut size={15} />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  )
}

const MOBILE_NAV = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Home' },
  { href: '/practice',    icon: Zap,             label: 'Practice' },
  { href: '/jarvis',      icon: Bot,             label: 'SPOK' },
  { href: '/leaderboard', icon: Trophy,          label: 'Ranks' },
  { href: '/topics',      icon: BookOpen,        label: 'Topics' },
  { href: '/profile',     icon: User,            label: 'Profile' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
      style={{
        background: 'rgba(7,12,26,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {MOBILE_NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl"
          >
            <Icon size={20} style={{ color: active ? '#3b82f6' : '#3a4a5c' }} />
            <span
              className="text-[10px] font-medium"
              style={{ color: active ? '#3b82f6' : '#3a4a5c' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
