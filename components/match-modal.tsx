"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, ArrowLeftRight, PartyPopper, Lock } from "lucide-react"
import Confetti from "react-confetti"
import type { Property } from "./property-card"

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  onMessage?: () => void
  onUnlock?: () => void
  canChat?: boolean
  yourProperty: Property | null
  matchedProperty: Property | null
}

export function MatchModal({ isOpen, onClose, onMessage, onUnlock, canChat = true, yourProperty, matchedProperty }: MatchModalProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [showConfetti, setShowConfetti] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!yourProperty || !matchedProperty) return null

  const priceDiff = matchedProperty.price - yourProperty.price
  const formatPriceDiff = (diff: number) => {
    const absDiff = Math.abs(diff)
    if (absDiff >= 1000000) {
      return `$${(absDiff / 1000000).toFixed(1)}M`
    }
    return `$${(absDiff / 1000).toFixed(0)}K`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          {showConfetti && containerSize.width > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <Confetti
                width={containerSize.width}
                height={containerSize.height}
                recycle={false}
                numberOfPieces={200}
                colors={["#f0826d", "#4ade80", "#22d3ee", "#fbbf24", "#f472b6"]}
              />
            </div>
          )}
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="relative w-full max-w-md bg-card rounded-3xl p-8 shadow-2xl"
          >

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-muted-foreground"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
              >
                <PartyPopper className="w-8 h-8 text-primary" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-foreground mb-2"
              >
                {"It's a Match!"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground"
              >
                You and {matchedProperty.ownerName} both want to swap!
              </motion.p>
            </div>

            {/* Houses comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              {/* Your house */}
              <div className="text-center">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-primary shadow-lg mb-2">
                  <Image
                    src={yourProperty.images[0] || "/placeholder.svg"}
                    alt="Your house"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Your house</p>
              </div>

              {/* Swap icon */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <ArrowLeftRight className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>

              {/* Their house */}
              <div className="text-center">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-accent shadow-lg mb-2">
                  <Image
                    src={matchedProperty.images[0] || "/placeholder.svg"}
                    alt="Their house"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Their house</p>
              </div>
            </motion.div>

            {/* Price difference */}
            {priceDiff !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-secondary rounded-2xl p-4 mb-6 text-center"
              >
                <p className="text-sm text-muted-foreground mb-1">Estimated difference</p>
                <p className="text-2xl font-bold text-foreground">
                  {priceDiff > 0 ? "+" : "-"}{formatPriceDiff(priceDiff)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {priceDiff > 0 ? "You may pay" : "You may receive"}
                </p>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3"
            >
              {canChat ? (
                <Button
                  className="w-full h-14 text-lg font-semibold rounded-2xl bg-primary hover:bg-primary/90"
                  onClick={onMessage}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send a Message
                </Button>
              ) : (
                <Button
                  className="w-full h-14 text-lg font-semibold rounded-2xl"
                  variant="outline"
                  onClick={() => { onClose(); onUnlock?.(); }}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Unlock to Chat
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={onClose}
              >
                Keep Swiping
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
