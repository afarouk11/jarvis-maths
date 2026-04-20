import { Sidebar } from '@/components/layout/Sidebar'
import { JarvisChat } from '@/components/jarvis/JarvisChat'
import { NotebookBackground } from '@/components/layout/NotebookBackground'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotebookBackground>
      <Sidebar />
      <main className="pl-16 min-h-screen">
        {children}
      </main>
      <JarvisChat />
    </NotebookBackground>
  )
}
