"use client"

import { useState, useImperativeHandle, forwardRef, type ReactNode, type Ref } from "react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"

export type SwipeDirection = "left" | "right" | "up"

export interface SwipeCardHandle {
  swipe: (direction: SwipeDirection) => void
}

interface SwipeCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  index?: number
}

export const SwipeCard = forwardRef(function SwipeCard(
  { children, onSwipeLeft, onSwipeRight, onSwipeUp, index = 0 }: SwipeCardProps,
  ref: Ref<SwipeCardHandle>
) {
  const [exitX, setExitX] = useState(0)
  const [exitY, setExitY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15])
  const likeOpacity = useTransform(x, [0, 80, 150], [0, 0.8, 1])
  const nopeOpacity = useTransform(x, [-150, -80, 0], [1, 0.8, 0])
  const superLikeOpacity = useTransform(y, [-150, -80, 0], [1, 0.8, 0])

  const isTopCard = index === 0
  const scale = 1 - index * 0.05
  const yOffset = index * 8

  const completeSwipe = (direction: SwipeDirection) => {
    if (direction === "right") onSwipeRight?.()
    else if (direction === "left") onSwipeLeft?.()
    else if (direction === "up") onSwipeUp?.()
  }

  const animateOut = (direction: SwipeDirection) => {
    if (direction === "right") setExitX(1000)
    else if (direction === "left") setExitX(-1000)
    else if (direction === "up") setExitY(-1000)
  }

  useImperativeHandle(ref, () => ({
    swipe: (direction: SwipeDirection) => {
      if (!isTopCard) return
      animateOut(direction)
      // Trigger the swipe action after the exit animation.
      setTimeout(() => completeSwipe(direction), 300)
    },
  }))

  const handleDragStart = () => {
    if (isTopCard) setIsDragging(true)
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isTopCard) return
    setIsDragging(false)
    const threshold = 100
    const velocity = 400

    if (info.offset.y < -threshold || info.velocity.y < -velocity) {
      animateOut("up")
      completeSwipe("up")
    } else if (info.offset.x > threshold || info.velocity.x > velocity) {
      animateOut("right")
      completeSwipe("right")
    } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      animateOut("left")
      completeSwipe("left")
    }
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTopCard ? x : 0,
        y: isTopCard ? y : yOffset,
        rotate: isTopCard ? rotate : 0,
        scale,
        zIndex: 100 - index,
      }}
      drag={isTopCard}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ scale, y: yOffset, opacity: index < 3 ? 1 : 0 }}
      animate={
        exitX !== 0
          ? { x: exitX, opacity: 0, transition: { duration: 0.3 } }
          : exitY !== 0
            ? { y: exitY, opacity: 0, transition: { duration: 0.3 } }
            : { scale, y: yOffset, opacity: index < 3 ? 1 : 0 }
      }
    >
      {/* LIKE indicator */}
      {isTopCard && (
        <motion.div
          className="absolute top-8 left-6 z-20 rotate-[-15deg] border-4 border-accent rounded-2xl px-5 py-2 bg-accent/20 backdrop-blur-sm pointer-events-none"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-accent text-3xl font-bold tracking-wider">LIKE</span>
        </motion.div>
      )}

      {/* NOPE indicator */}
      {isTopCard && (
        <motion.div
          className="absolute top-8 right-6 z-20 rotate-[15deg] border-4 border-destructive rounded-2xl px-5 py-2 bg-destructive/20 backdrop-blur-sm pointer-events-none"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-destructive text-3xl font-bold tracking-wider">NOPE</span>
        </motion.div>
      )}

      {/* SUPER LIKE indicator */}
      {isTopCard && (
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 z-20 border-4 border-primary rounded-2xl px-5 py-2 bg-primary/20 backdrop-blur-sm pointer-events-none"
          style={{ opacity: superLikeOpacity }}
        >
          <span className="text-primary text-2xl font-bold tracking-wider">SUPER LIKE</span>
        </motion.div>
      )}

      <div className={`h-full w-full ${isDragging ? "pointer-events-none" : ""} ${isTopCard ? "cursor-grab active:cursor-grabbing" : ""}`}>
        {children}
      </div>
    </motion.div>
  )
})
