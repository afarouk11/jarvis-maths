import { Skeleton } from '@/components/ui/skeleton'

export default function ProgressLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl space-y-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Grade trend chart */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>

      {/* Topic mastery map */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Strengths + Focus areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: 2 }).map((_, ci) => (
          <div key={ci} className="rounded-2xl p-5 space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Skeleton className="h-4 w-28" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-10 shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
