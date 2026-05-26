import { Skeleton } from '@/components/ui/skeleton'

export default function BrainLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header + grade pill */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-10 w-24 rounded-2xl" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>

      {/* Brain network canvas placeholder */}
      <Skeleton className="h-[480px] w-full rounded-2xl mb-6" />

      {/* Category legend */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-28 rounded-full" />
        ))}
      </div>
    </div>
  )
}
