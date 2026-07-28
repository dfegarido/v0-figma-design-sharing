"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  HelpCircle,
  Lock,
  MapPin,
  Check,
  Star,
  ShieldCheck,
  Crown,
  Loader2,
  Gem,
} from "lucide-react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { getCache, setCache, CACHE_KEYS } from "@/lib/cache"
import {
  fetchConversationList,
  type ConversationWithDetails,
  firstImageUrl,
  timeAgo,
} from "@/lib/matches"
import { ChatSkeleton } from "@/components/ui/chat-skeleton"
import { ConversationSkeleton } from "@/components/ui/conversation-skeleton"
import { NewMatchSkeleton } from "@/components/ui/new-match-skeleton"

interface MessagesScreenProps {
  onOpenChat: (chatId: string) => void
  onNavigateToMatches?: () => void
  onNavigateToVerification?: (propertyId?: string) => void
  onNavigateToEditProperty?: (propertyId?: string) => void
  onNavigateToUnlock?: () => void
  onNavigateToPremium?: () => void
  isPremium?: boolean
}

function LikeInfoDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">Likes vs Super Likes</DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-6 pb-6 space-y-5">
          <InfoRow
            icon={<Check className="h-4 w-4 text-green-500" />}
            title="Like"
            bullets={[
              "Shows standard interest in swapping homes",
              "Appears in your matches",
              "Start chatting after a mutual match",
            ]}
            color="bg-green-500/10"
          />
          <InfoRow
            icon={<Star className="h-4 w-4 text-amber-500" fill="currentColor" />}
            title="Super Like"
            bullets={[
              "Shows stronger interest",
              "Highlighted and gets noticed immediately",
              "Stand out from other matches",
            ]}
            color="bg-amber-500/10"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({
  icon,
  title,
  bullets,
  color,
}: {
  icon: React.ReactNode
  title: string
  bullets: string[]
  color: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <ul className="mt-1 space-y-1">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function LockedChatModal({
  open,
  conversation,
  verifiedPropertyCount,
  isPremium,
  onClose,
  onVerify,
  onUpgrade,
}: {
  open: boolean
  conversation: ConversationWithDetails | null
  verifiedPropertyCount: number
  isPremium?: boolean
  onClose: () => void
  onVerify: () => void
  onUpgrade: () => void
}) {
  if (!conversation) return null
  const canVerify = isPremium || verifiedPropertyCount === 0
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl p-0 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Unlock Messaging</h2>
          <p className="text-sm text-muted-foreground">
            {canVerify
              ? "Verify the property in this match to start chatting, or upgrade to Premium to unlock all messages."
              : "Upgrade to Premium to start chatting and unlock unlimited messaging."}
          </p>
        </div>
        <div className="px-6 pb-2 space-y-3">
          {canVerify && (
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">Verify Property</p>
                <p className="text-sm text-muted-foreground">
                  Verify your property for this match to unlock chat.
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/50">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Upgrade to Premium</p>
              <p className="text-sm text-muted-foreground">
                Unlimited messaging and more.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {canVerify && (
            <Button onClick={onVerify} className="w-full rounded-xl h-14 text-base font-semibold">
              <ShieldCheck className="h-5 w-5 mr-2" />
              Verify Property
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onUpgrade}
            className="w-full rounded-xl h-14 text-base font-semibold border-primary text-primary hover:bg-primary/5"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Premium
          </Button>
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {action && (
        <button
          onClick={onAction}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  )
}

function NewMatchAvatar({
  conversation,
  index,
  onPress,
}: {
  conversation: ConversationWithDetails
  index: number
  onPress: () => void
}) {
  const isSuperLike = conversation.matchType === "superlike"
  const name = conversation.other_user?.full_name?.split(" ")[0] || "Unknown"
  const avatar = conversation.other_user?.avatar_url || "/placeholder.svg"

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.36 }}
      onClick={onPress}
      className="flex flex-col items-center gap-2 min-w-[78px]"
    >
      <div className="relative w-[67px] h-[67px]">
        {isSuperLike ? (
          <div className="absolute inset-0 rounded-full p-[2.5px] bg-gradient-to-br from-amber-400 to-orange-500">
            <div className="w-full h-full rounded-full bg-card overflow-hidden border-2 border-card">
              <Image src={avatar} alt={name} width={62} height={62} className="object-cover w-full h-full" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 rounded-full p-[2.5px] border-2 border-border">
            <div className="w-full h-full rounded-full bg-card overflow-hidden">
              <Image src={avatar} alt={name} width={62} height={62} className="object-cover w-full h-full" />
            </div>
          </div>
        )}
        <div
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-card ${
            isSuperLike ? "bg-amber-500" : "bg-green-500"
          }`}
        >
          {isSuperLike ? (
            <Gem className="h-3 w-3 text-white" />
          ) : (
            <Check className="h-3 w-3 text-white" />
          )}
        </div>
      </div>
      <span className="text-xs font-semibold text-foreground text-center truncate w-[70px]">
        {name}
      </span>
    </motion.button>
  )
}

function NewMatchesLoading() {
  return (
    <div className="px-4">
      <SectionHeader title="New Matches" action="View all" />
      <div className="flex gap-3 overflow-x-auto pb-2 pl-4">
        {[0, 1, 2].map((i) => (
          <NewMatchSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  )
}

function ConversationCard({
  conversation,
  index,
  onPress,
}: {
  conversation: ConversationWithDetails
  index: number
  onPress: () => void
}) {
  const name = conversation.other_user?.full_name?.split(" ")[0] || "Unknown"
  const avatar = conversation.other_user?.avatar_url || "/placeholder.svg"
  const houseImage = firstImageUrl(conversation.other_property?.property_images)
  const suburb = conversation.other_property?.suburb || "Unknown suburb"
  const isUnread = conversation.unread_count > 0 && !conversation.locked
  const time = conversation.last_message_at ? timeAgo(conversation.last_message_at) : ""

  const lockedPreview = conversation.locked
    ? "Upgrade to Premium to unlock this conversation."
    : "Verify your property to start chatting."
  const preview = conversation.locked
    ? lockedPreview
    : conversation.last_message?.trim() || "Start chatting"

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow text-left"
      style={{ opacity: conversation.locked ? 0.72 : 1 }}
    >
      <div className="relative w-12 h-12 shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Image src={avatar} alt={name} width={48} height={48} className="object-cover w-full h-full" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full overflow-hidden border-2 border-card bg-card shadow-sm">
          <Image src={houseImage} alt="House" width={22} height={22} className="object-cover w-full h-full" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-base text-foreground">{name}</span>
          {conversation.locked ? (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-secondary">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          ) : conversation.matchType === "superlike" ? (
            <Badge className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-amber-500 text-white border-amber-500">
              <Star className="h-3 w-3" fill="currentColor" />
              Super
            </Badge>
          ) : conversation.matchType === "like" ? (
            <Badge className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-green-500 text-white border-green-500">
              <Check className="h-3 w-3" />
              Like
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
          <MapPin className="h-3 w-3" />
          <span className="text-xs">{suburb}</span>
        </div>
        <p
          className={`text-sm truncate ${
            isUnread ? "text-foreground font-medium" : "text-muted-foreground"
          }`}
        >
          {preview}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-muted-foreground">{time}</span>
        {isUnread && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
          </span>
        )}
      </div>
    </motion.button>
  )
}

function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">No conversations yet</h3>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        Start chatting with one of your matches.
      </p>
    </div>
  )
}

export function MessagesScreen({
  onOpenChat,
  onNavigateToMatches,
  onNavigateToVerification,
  onNavigateToEditProperty,
  onNavigateToUnlock,
  onNavigateToPremium,
  isPremium = false,
}: MessagesScreenProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [infoOpen, setInfoOpen] = useState(false)
  const [lockedConversation, setLockedConversation] = useState<ConversationWithDetails | null>(null)
  const [verifiedPropertyCount, setVerifiedPropertyCount] = useState(0)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be signed in to view messages.")
        return
      }

      const cacheKey = `${CACHE_KEYS.CONVERSATIONS}_${user.id}`
      const cached = getCache<{
        conversations: ConversationWithDetails[]
        verifiedPropertyCount: number
      }>(cacheKey)

      if (cached && !silent) {
        setConversations(cached.conversations)
        setVerifiedPropertyCount(cached.verifiedPropertyCount)
        setLoading(false)
      }

      const result = await fetchConversationList(user.id)
      setConversations(result.conversations)
      setVerifiedPropertyCount(result.verifiedPropertyCount)
      setCache(cacheKey, result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load messages."
      console.error("Failed to load conversations:", err)
      setError(message)
    } finally {
      if (!silent) setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await load()
      if (cancelled) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const unsub = subscribeToConversationChanges(user.id, () => load(true))
      return unsub
    }
    let unsub: (() => void) | undefined
    run().then((u) => {
      unsub = u
    })
    return () => {
      cancelled = true
      unsub?.()
    }
  }, [load])

  const refresh = useCallback(() => {
    setRefreshing(true)
    void load(true)
  }, [load])

  const filtered = conversations.filter((match) => {
    const query = searchQuery.toLowerCase()
    const name = (match.other_user?.full_name || "").toLowerCase()
    const suburb = (match.other_property?.suburb || "").toLowerCase()
    return name.includes(query) || suburb.includes(query)
  })

  const activeConversations = filtered
    .filter((m) => m.last_message_at != null || m.last_message != null)
    .sort(
      (a, b) =>
        new Date(b.last_message_at || 0).getTime() -
        new Date(a.last_message_at || 0).getTime()
    )

  const newMatches = filtered
    .filter((m) => m.last_message_at == null && m.last_message == null)
    .slice()
    .sort((a, b) => {
      const aIsSuperLike = a.matchType === "superlike"
      const bIsSuperLike = b.matchType === "superlike"
      if (aIsSuperLike && !bIsSuperLike) return -1
      if (!aIsSuperLike && bIsSuperLike) return 1
      return (
        new Date(b.matchDate || 0).getTime() - new Date(a.matchDate || 0).getTime()
      )
    })

  const handleConversationPress = (conversation: ConversationWithDetails) => {
    if (conversation.locked) {
      setLockedConversation(conversation)
    } else {
      onOpenChat(conversation.id)
    }
  }

  const handleVerify = () => {
    setLockedConversation(null)
    const propertyId = lockedConversation?.my_property?.id
    if (propertyId && onNavigateToVerification) {
      onNavigateToVerification(propertyId)
    } else if (propertyId && onNavigateToEditProperty) {
      onNavigateToEditProperty(propertyId)
    } else {
      onNavigateToUnlock?.()
    }
  }

  const handleUpgrade = () => {
    setLockedConversation(null)
    onNavigateToPremium?.()
  }

  return (
    <div className="h-full overflow-y-auto pb-6 bg-[#F8F8FA]">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[28px] font-bold text-foreground tracking-tight">Messages</h2>
          <button
            onClick={() => setInfoOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Learn about Likes and Super Likes"
          >
            <HelpCircle className="h-6 w-6 text-primary" />
          </button>
        </div>
        <p className="text-base text-muted-foreground">
          Chat with buyers and sellers interested in your properties.
        </p>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search matches or conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-11 rounded-full bg-card border-0 shadow-sm text-base"
            aria-label="Search matches or conversations"
          />
        </div>
      </div>

      {refreshing && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <NewMatchesLoading />
        ) : newMatches.length > 0 ? (
          <div className="px-4">
            <SectionHeader title="New Matches" action="View all" onAction={onNavigateToMatches} />
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {newMatches.map((match, i) => (
                <NewMatchAvatar
                  key={match.id}
                  conversation={match}
                  index={i}
                  onPress={() => handleConversationPress(match)}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <SectionHeader title="Conversations" />
          <div className="px-4 space-y-2">
            {error ? (
              <p className="text-center text-destructive py-8">{error}</p>
            ) : loading ? (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <ConversationSkeleton key={i} index={i} />
                ))}
              </>
            ) : activeConversations.length === 0 ? (
              <EmptyConversations />
            ) : (
              activeConversations.map((match, i) => (
                <ConversationCard
                  key={match.id}
                  conversation={match}
                  index={i}
                  onPress={() => handleConversationPress(match)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8">
        <Button
          variant="outline"
          onClick={refresh}
          disabled={refreshing || loading}
          className="w-full rounded-xl h-12"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <LikeInfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
      <LockedChatModal
        open={lockedConversation !== null}
        conversation={lockedConversation}
        verifiedPropertyCount={verifiedPropertyCount}
        isPremium={isPremium}
        onClose={() => setLockedConversation(null)}
        onVerify={handleVerify}
        onUpgrade={handleUpgrade}
      />
    </div>
  )
}

function subscribeToConversationChanges(
  userId: string,
  onChange: () => void
) {
  const conversationsChannel = supabase
    .channel(`conversations:user:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "conversations",
      },
      () => onChange()
    )
    .subscribe()

  const messagesChannel = supabase
    .channel(`messages:user:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
      () => onChange()
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(conversationsChannel)
    void supabase.removeChannel(messagesChannel)
  }
}
