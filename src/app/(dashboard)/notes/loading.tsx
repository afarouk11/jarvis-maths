import { Skeleton } from '@/components/ui/skeleton'

export default function NotesLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, ci) => (
        <div key={ci} className="mb-8">
          <Skeleton className="h-4 w-28 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Skeleton className="h-8 w-8 rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
