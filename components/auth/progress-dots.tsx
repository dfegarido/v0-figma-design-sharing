"use client"

import { motion } from "framer-motion"

interface ProgressDotsProps {
  step: number
  total?: number
}

export function ProgressDots({ step, total = 6 }: ProgressDotsProps) {
  const dotSlotWidth = 16
  const indicatorWidth = 14
  const indicatorX = (step - 1) * dotSlotWidth + (dotSlotWidth - indicatorWidth) / 2

  return (
    <div className="mb-6 flex justify-center">
      <div className="relative flex items-center">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className="flex w-4 items-center justify-center"
          >
            <div className="h-2 w-2 rounded-full bg-[#EAEAEA]" />
          </div>
        ))}
        <motion.div
          className="absolute left-0 top-0 h-2 rounded-full bg-[#FF5A5F]"
          style={{ width: indicatorWidth }}
          animate={{ x: indicatorX }}
          transition={{ type: "spring", damping: 18, stiffness: 120, mass: 0.8 }}
        />
      </div>
    </div>
  )
}
