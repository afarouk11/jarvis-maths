import { Skeleton } from '@/components/ui/skeleton'

export default function TopicsLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-10 w-full rounded-xl mb-8" />

      {/* Category sections × 3 */}
      {Array.from({ length: 3 }).map((_, ci) => (
        <div key={ci} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Skeleton className="h-7 w-7 rounded shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
