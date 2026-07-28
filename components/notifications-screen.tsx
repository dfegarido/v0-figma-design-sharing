"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Bell, Check, Loader2, Star, Heart, MessageSquare, ShieldCheck, Users } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { timeAgo } from "@/lib/matches"
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
  type AppNotification,
} from "@/lib/matches"

interface NotificationsScreenProps {
  onBack: () => void
  isPremium?: boolean
  onOpenChat?: (chatId: string, requiresPremium: boolean) => void
  onOpenProperty?: (propertyId: string) => void
  onOpenMatches?: () => void
  onOpenVerification?: (propertyId?: string) => void
  onOpenPremium?: () => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  match: Star,
  superlike: Star,
  like: Heart,
  message: MessageSquare,
  verification: ShieldCheck,
  representative: Users,
  system: Bell,
}

export function NotificationsScreen({
  onBack,
  isPremium = false,
  onOpenChat,
  onOpenProperty,
  onOpenMatches,
  onOpenVerification,
  onOpenPremium,
}: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user || cancelled) return
        setUserId(user.id)

        const data = await fetchNotifications(user.id)
        if (cancelled) return
        setNotifications(data)
      } catch (error) {
        console.error("Failed to load notifications:", error)
        toast.error("Failed to load notifications.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    const unsubscribe = subscribeToNotifications(
      userId || "00000000-0000-0000-0000-000000000000",
      ({ event, notification }) => {
        setNotifications((prev) => {
          const exists = prev.some((n) => n.id === notification.id)
          if (exists) {
            return prev.map((n) => (n.id === notification.id ? notification : n))
          }
          if (event === "INSERT") {
            return [notification, ...prev]
          }
          return prev
        })
      }
    )

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [userId])

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error("Failed to mark notification read:", error)
      toast.error("Failed to update notification.")
    }
  }

  const handleMarkAllRead = async () => {
    if (!userId) return
    try {
      await markAllNotificationsRead(userId)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Failed to mark all read:", error)
      toast.error("Failed to mark all as read.")
    }
  }

  const handlePress = (notification: AppNotification) => {
    if (!notification.action_id) {
      void handleMarkRead(notification.id)
      return
    }

    if (notification.type === "message") {
      if (!isPremium) {
        onOpenPremium?.()
        return
      }
      onOpenChat?.(notification.action_id, true)
      void handleMarkRead(notification.id)
      return
    }

    if (["like", "superlike"].includes(notification.type)) {
      onOpenProperty?.(notification.action_id)
      void handleMarkRead(notification.id)
      return
    }

    if (notification.type === "verification") {
      onOpenVerification?.(notification.action_id)
      void handleMarkRead(notification.id)
      return
    }

    if (notification.type === "match") {
      onOpenMatches?.()
      void handleMarkRead(notification.id)
      return
    }

    void handleMarkRead(notification.id)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="h-full overflow-auto pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="relative">
              <h2 className="text-xl font-bold text-foreground">Notifications</h2>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-4 bg-primary text-primary-foreground text-[10px] px-1.5 py-0 rounded-full min-w-[1.25rem] h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || loading}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No notifications yet</h3>
            <p className="text-sm text-muted-foreground">
              Matches, likes, messages and verification updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const Icon = iconMap[notification.type] || Bell
              const unread = !notification.read
              const isGatedMessage = notification.type === "message" && !isPremium

              return (
                <motion.button
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handlePress(notification)}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                    unread
                      ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                      : "bg-card border-border hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {timeAgo(notification.created_at)}
                          </span>
                          {unread && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${isGatedMessage ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {isGatedMessage
                          ? "Upgrade to Premium to read this message."
                          : notification.message}
                      </p>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
