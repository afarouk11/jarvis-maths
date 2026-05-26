import { MobileNav } from '@/components/layout/Sidebar'
import { SidebarShell } from '@/components/layout/SidebarShell'
import { JarvisChat } from '@/components/jarvis/JarvisChat'
import { NotebookBackground } from '@/components/layout/NotebookBackground'
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotebookBackground>
      <SidebarShell>
        {children}
      </SidebarShell>
      <MobileNav />
      <JarvisChat />
      <AccessibilityPanel />
    </NotebookBackground>
  )
}
