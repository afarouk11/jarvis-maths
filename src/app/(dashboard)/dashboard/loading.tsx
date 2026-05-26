import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Top greeting + XP bar */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Morning briefing / SPOK recommendation strip */}
      <Skeleton className="h-20 w-full rounded-2xl" />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Main two-column grid */}
      <div className="grid grid-cols-3 gap-5">

        {/* Left — big mastery heatmap */}
        <div className="col-span-2 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Right — exam readiness + study plan */}
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>

      {/* Due for review row */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Recent lessons */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

    </div>
  )
}
