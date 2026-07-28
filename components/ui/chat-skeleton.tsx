"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ChatSkeleton() {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header skeleton */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>

      {/* Property context skeleton */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-hidden">
        <div className="flex justify-start">
          <Skeleton className="h-12 w-2/3 rounded-2xl rounded-bl-md" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-12 w-1/2 rounded-2xl rounded-br-md" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-16 w-3/4 rounded-2xl rounded-bl-md" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-2/5 rounded-2xl rounded-br-md" />
        </div>
      </div>

      {/* Input skeleton */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Skeleton className="h-12 flex-1 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}
