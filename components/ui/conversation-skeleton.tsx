"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface ConversationSkeletonProps {
  index?: number
}

export function ConversationSkeleton({ index = 0 }: ConversationSkeletonProps) {
  return (
    <div
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card shadow-sm"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative w-12 h-12 shrink-0">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="absolute -bottom-1 -right-1 h-[22px] w-[22px] rounded-full border-2 border-card" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <Skeleton className="h-3 w-10 rounded" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  )
}
