"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeftRight, CheckCheck } from "lucide-react"
import { motion } from "framer-motion"

interface MessagesScreenProps {
  onOpenChat: (chatId: string) => void
}

interface Match {
  id: string
  name: string
  avatar: string
  houseImage: string
  lastMessage: string
  timestamp: string
  unread: boolean
  priceDiff: number
  isNew?: boolean
}

const sampleMatches: Match[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    houseImage: "/houses/house-1.jpg",
    lastMessage: "I'd love to schedule a video tour of your place!",
    timestamp: "2m ago",
    unread: true,
    priceDiff: 1500000,
    isNew: true,
  },
  {
    id: "2",
    name: "James Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    houseImage: "/houses/house-2.jpg",
    lastMessage: "The neighborhood is really quiet, perfect for families",
    timestamp: "1h ago",
    unread: true,
    priceDiff: -150000,
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    houseImage: "/houses/house-3.jpg",
    lastMessage: "Let me know when you're free to chat!",
    timestamp: "3h ago",
    unread: false,
    priceDiff: 200000,
  },
  {
    id: "4",
    name: "Michael Torres",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    houseImage: "/houses/house-4.jpg",
    lastMessage: "Sounds great! Looking forward to it.",
    timestamp: "1d ago",
    unread: false,
    priceDiff: 2200000,
  },
]

export function MessagesScreen({ onOpenChat }: MessagesScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  const filteredMatches = sampleMatches.filter((match) =>
    match.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const newMatches = filteredMatches.filter((m) => m.isNew)
  const conversations = filteredMatches.filter((m) => !m.isNew)

  const formatPriceDiff = (diff: number) => {
    const absDiff = Math.abs(diff)
    if (absDiff >= 1000000) {
      return `${diff > 0 ? "+" : "-"}$${(absDiff / 1000000).toFixed(1)}M`
    }
    return `${diff > 0 ? "+" : "-"}$${(absDiff / 1000).toFixed(0)}K`
  }

  return (
    <div className="h-full overflow-auto pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 rounded-xl bg-secondary border-0"
          />
        </div>
      </div>

      {/* New Matches */}
      {newMatches.length > 0 && (
        <div className="px-4 py-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">New Matches</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {newMatches.map((match) => (
              <motion.button
                key={match.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2 flex-shrink-0"
                onClick={() => onOpenChat(match.id)}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                    <Image
                      src={match.avatar || "/placeholder.svg"}
                      alt={match.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <ArrowLeftRight className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground max-w-16 truncate">
                  {match.name.split(" ")[0]}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div className="px-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Conversations</h3>
        <div className="space-y-2">
          {conversations.map((match, index) => (
            <motion.button
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary transition-colors text-left"
              onClick={() => onOpenChat(match.id)}
            >
              {/* Avatar and house preview */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={match.avatar || "/placeholder.svg"}
                    alt={match.name}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md overflow-hidden border-2 border-card">
                  <Image
                    src={match.houseImage || "/placeholder.svg"}
                    alt="House"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold ${match.unread ? "text-foreground" : "text-foreground/80"}`}>
                    {match.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{match.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${match.unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {match.lastMessage}
                  </p>
                  {match.unread ? (
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4 ml-2">
                      New
                    </Badge>
                  ) : (
                    <CheckCheck className="w-4 h-4 text-chart-1 ml-2 flex-shrink-0" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredMatches.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center px-8">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <ArrowLeftRight className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No matches yet</h3>
          <p className="text-sm text-muted-foreground">
            Keep swiping to find your perfect home swap!
          </p>
        </div>
      )}
    </div>
  )
}
