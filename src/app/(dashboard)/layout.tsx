import { FloatingMenu } from '@/components/layout/FloatingMenu'
import { JarvisChat } from '@/components/jarvis/JarvisChat'
import { NotebookBackground } from '@/components/layout/NotebookBackground'
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotebookBackground>
      <main className="min-h-screen">{children}</main>
      <FloatingMenu />
      <JarvisChat />
      <AccessibilityPanel />
    </NotebookBackground>
  )
}
