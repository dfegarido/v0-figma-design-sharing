"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Heart, ArrowLeftRight, MessageCircle, Star, Bell, Home, Check } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface NotificationsScreenProps {
  onBack: () => void
  onViewMatch?: (matchId: string) => void
  onViewMessage?: (chatId: string) => void
}

interface Notification {
  id: string
  type: "match" | "like" | "message" | "superlike" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
  image?: string
  actionId?: string
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "match",
    title: "New Match!",
    message: "You matched with Sarah Mitchell's property in Bondi Beach",
    timestamp: "2 minutes ago",
    read: false,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    actionId: "match-1",
  },
  {
    id: "2",
    type: "message",
    title: "New Message",
    message: "James Wilson: Hey! I loved your property...",
    timestamp: "1 hour ago",
    read: false,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    actionId: "chat-2",
  },
  {
    id: "3",
    type: "like",
    title: "Someone likes your home!",
    message: "A user in Paddington liked your property",
    timestamp: "3 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "superlike",
    title: "Super Like received!",
    message: "Emma Thompson super liked your property",
    timestamp: "1 day ago",
    read: true,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  },
  {
    id: "5",
    type: "system",
    title: "Profile boost active",
    message: "Your listing is being shown to more users",
    timestamp: "2 days ago",
    read: true,
  },
]

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "match": return ArrowLeftRight
    case "like": return Heart
    case "message": return MessageCircle
    case "superlike": return Star
    case "system": return Bell
  }
}

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "match": return "bg-primary text-primary-foreground"
    case "like": return "bg-destructive/80 text-white"
    case "message": return "bg-accent text-accent-foreground"
    case "superlike": return "bg-chart-4 text-foreground"
    case "system": return "bg-secondary text-foreground"
  }
}

export function NotificationsScreen({ onBack, onViewMatch, onViewMessage }: NotificationsScreenProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === "match" && notification.actionId && onViewMatch) {
      onViewMatch(notification.actionId)
    } else if (notification.type === "message" && notification.actionId && onViewMessage) {
      onViewMessage(notification.actionId)
    }
  }

  return (
    <div className="h-full overflow-auto pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-bold text-foreground">Notifications</h2>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-primary text-sm">
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="px-4 py-4">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type)
              return (
                <motion.button
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-colors ${
                    notification.read ? "bg-card" : "bg-primary/5"
                  } hover:bg-secondary`}
                >
                  {/* Icon or Avatar */}
                  {notification.image ? (
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={notification.image || "/placeholder.svg"}
                          alt=""
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold ${notification.read ? "text-foreground" : "text-foreground"}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              {"You're all caught up!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
