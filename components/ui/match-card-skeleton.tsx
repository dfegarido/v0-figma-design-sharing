"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function MatchCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2 pt-0.5">
          <Skeleton className="h-4 w-[45%] rounded" />
          <Skeleton className="h-3 w-[35%] rounded" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Property thumbnail + details */}
      <div className="flex gap-3">
        <Skeleton className="h-[72px] w-[72px] rounded-lg shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-3">
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      </div>

      {/* Price */}
      <Skeleton className="h-6 w-[40%] rounded" />

      {/* Status pill */}
      <Skeleton className="h-[22px] w-[32%] rounded-full" />

      {/* CTA */}
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  )
}
