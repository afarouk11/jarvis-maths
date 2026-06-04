'use client'

import { useState, useEffect } from 'react'
import { PanelLeftOpen } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface Props {
  children: React.ReactNode
}

export function SidebarShell({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag + localStorage read for SSR-safe hydration; can only run on the client
    setMounted(true)
    setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')
  }, [])

  function toggle() {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <>
      <Sidebar collapsed={mounted && collapsed} onToggle={toggle} />

      {/* Re-open tab — only visible when sidebar is collapsed */}
      {mounted && collapsed && (
        <button
          onClick={toggle}
          title="Open sidebar"
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 items-center justify-center w-6 h-12 rounded-r-lg transition-all hover:w-8"
          style={{
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderLeft: 'none',
            color: '#60a5fa',
          }}>
          <PanelLeftOpen size={13} />
        </button>
      )}

      <main
        className="md:pl-[220px] pb-20 md:pb-0 min-h-screen transition-[padding] duration-300 ease-in-out"
        style={mounted && collapsed ? { paddingLeft: 0 } : undefined}
      >
        {children}
      </main>
    </>
  )
}
