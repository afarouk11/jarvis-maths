import { Sidebar, MobileNav } from '@/components/layout/Sidebar'
import { JarvisChat } from '@/components/jarvis/JarvisChat'
import { NotebookBackground } from '@/components/layout/NotebookBackground'
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotebookBackground>
      <Sidebar />
      <main className="md:pl-16 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
      <MobileNav />
      <JarvisChat />
      <AccessibilityPanel />
    </NotebookBackground>
  )
}
