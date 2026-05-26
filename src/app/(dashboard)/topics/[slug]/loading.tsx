import { Skeleton } from '@/components/ui/skeleton'

export default function TopicLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header — icon + title + mastery bar */}
      <div className="flex items-start gap-4 mb-6">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Two-column: Lessons + Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Lessons */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <Skeleton className="h-4 w-6 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent attempts */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SPOK chat skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  )
}
