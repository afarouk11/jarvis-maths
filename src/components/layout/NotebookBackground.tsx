'use client'

export function NotebookBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="notebook-bg min-h-screen">
      {children}
    </div>
  )
}
