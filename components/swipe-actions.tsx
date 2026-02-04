"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Heart, Star, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface SwipeActionsProps {
  onNope: () => void
  onLike: () => void
  onSuperLike: () => void
  onUndo?: () => void
  canUndo?: boolean
}

export function SwipeActions({
  onNope,
  onLike,
  onSuperLike,
  onUndo,
  canUndo = false,
}: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* Undo */}
      {onUndo && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full border-2 border-muted-foreground/30 bg-card text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all shadow-sm",
              !canUndo && "opacity-40 cursor-not-allowed"
            )}
            onClick={onUndo}
            disabled={!canUndo}
          >
            <RotateCcw className="w-5 h-5" />
            <span className="sr-only">Undo</span>
          </Button>
        </motion.div>
      )}

      {/* Nope */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full border-2 border-destructive/50 bg-card text-destructive hover:bg-destructive/10 hover:border-destructive transition-all shadow-lg"
          onClick={onNope}
        >
          <X className="w-8 h-8" />
          <span className="sr-only">Pass</span>
        </Button>
      </motion.div>

      {/* Super Like */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="outline"
          size="icon"
          className="w-14 h-14 rounded-full border-2 border-primary/50 bg-card text-primary hover:bg-primary/10 hover:border-primary transition-all shadow-lg"
          onClick={onSuperLike}
        >
          <Star className="w-6 h-6 fill-current" />
          <span className="sr-only">Super Like</span>
        </Button>
      </motion.div>

      {/* Like */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full border-2 border-accent/50 bg-card text-accent hover:bg-accent/10 hover:border-accent transition-all shadow-lg"
          onClick={onLike}
        >
          <Heart className="w-8 h-8 fill-current" />
          <span className="sr-only">Like</span>
        </Button>
      </motion.div>
    </div>
  )
}
