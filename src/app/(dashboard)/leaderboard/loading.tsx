import { Skeleton } from '@/components/ui/skeleton'

export default function LeaderboardLoading() {
  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* Current user card */}
      <Skeleton className="h-16 w-full rounded-xl mb-6" />

      {/* Leaderboard rows */}
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Skeleton className="h-5 w-6 shrink-0" />
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
