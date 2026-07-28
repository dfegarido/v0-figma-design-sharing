"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface NewMatchSkeletonProps {
  index?: number
}

export function NewMatchSkeleton({ index = 0 }: NewMatchSkeletonProps) {
  return (
    <div
      className="flex flex-col items-center gap-2 min-w-[78px]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Skeleton className="h-[67px] w-[67px] rounded-full" />
      <Skeleton className="h-3 w-12 rounded" />
    </div>
  )
}
