import { supabase } from "@/lib/supabase"
import type { Property } from "@/lib/properties"
import { isSubscriptionActive } from "@/lib/subscription"

export interface MatchWithDetails {
  id: string
  created_at: string
  status: string
  user_a_id: string
  user_b_id: string
  property_a_id: string
  property_b_id: string
  my_property_id: string
  other_property_id: string
  other_user_id: string
  other_user: {
    full_name: string | null
    avatar_url: string | null
  } | null
  my_property: {
    id: string
    address: string
    suburb: string
    price: number
    verified: boolean
    bedrooms: number
    bathrooms: number
    sqm: number | null
    tags: string[]
    property_images: { url: string; sort_order: number }[]
  } | null
  other_property: {
    id: string
    address: string
    suburb: string
    price: number
    verified: boolean
    bedrooms: number
    bathrooms: number
    sqm: number | null
    tags: string[]
    property_images: { url: string; sort_order: number }[]
  } | null
  conversation_id: string | null
}

export interface SwipeWithProperty {
  id: string
  direction: "left" | "right" | "up"
  created_at: string
  swiped_property_id: string
  swiped_property: {
    id: string
    address: string
    suburb: string
    price: number
    bedrooms: number
    bathrooms: number
    sqm: number | null
    status: string | null
    verified: boolean
    tags: string[]
    property_images: { url: string; sort_order: number }[]
  } | null
}

export async function fetchMatches(userId: string): Promise<MatchWithDetails[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      created_at,
      status,
      user_a_id,
      user_b_id,
      property_a_id,
      property_b_id,
      user_a:profiles!matches_user_a_id_fkey(full_name, avatar_url),
      user_b:profiles!matches_user_b_id_fkey(full_name, avatar_url),
      property_a:properties!matches_property_a_id_fkey(id, address, suburb, price, verified, bedrooms, bathrooms, sqm, property_images(url, sort_order)),
      property_b:properties!matches_property_b_id_fkey(id, address, suburb, price, verified, bedrooms, bathrooms, sqm, property_images(url, sort_order)),
      conversations:id
    `
    )
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) throw error

  return ((data || []) as unknown as any[]).map((match) => {
    const isUserA = match.user_a_id === userId
    return {
      ...match,
      my_property_id: isUserA ? match.property_a_id : match.property_b_id,
      other_property_id: isUserA ? match.property_b_id : match.property_a_id,
      other_user_id: isUserA ? match.user_b_id : match.user_a_id,
      other_user: isUserA ? match.user_b : match.user_a,
      my_property: isUserA ? match.property_a : match.property_b,
      other_property: isUserA ? match.property_b : match.property_a,
      conversation_id: match.conversations?.[0]?.id ?? null,
    }
  }) as MatchWithDetails[]
}

export async function fetchLikedProperties(userId: string): Promise<SwipeWithProperty[]> {
  const { data, error } = await supabase
    .from("swipes")
    .select(
      `
      id,
      direction,
      created_at,
      swiped_property_id,
      swiped_property:properties!swipes_swiped_property_id_fkey(
        id,
        address,
        suburb,
        price,
        bedrooms,
        bathrooms,
        sqm,
        verified,
        tags,
        property_images(url, sort_order)
      )
    `
    )
    .eq("swiper_id", userId)
    .in("direction", ["right", "up"])
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data || []) as unknown as SwipeWithProperty[]
}

export async function fetchLikedPropertyIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("swipes")
    .select("swiped_property_id")
    .eq("swiper_id", userId)
    .in("direction", ["right", "up"])

  if (error) throw error
  return ((data || []) as { swiped_property_id: string }[]).map((s) => s.swiped_property_id)
}

export function firstImageUrl(
  images: { url: string; sort_order: number }[] | null | undefined
): string {
  if (!images || images.length === 0) return "/placeholder.svg"
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0].url
}

export function formatPrice(price: number): string {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
  return `$${(price / 1000).toFixed(0)}K`
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export async function findConversationForProperty(
  userId: string,
  propertyId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      user_a_id,
      user_b_id,
      property_a_id,
      property_b_id,
      conversations!inner(id)
    `
    )
    .or(
      `and(user_a_id.eq.${userId},property_a_id.eq.${propertyId}),and(user_a_id.eq.${userId},property_b_id.eq.${propertyId}),and(user_b_id.eq.${userId},property_a_id.eq.${propertyId}),and(user_b_id.eq.${userId},property_b_id.eq.${propertyId})`
    )
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn("findConversationForProperty error:", error)
    return null
  }

  return data?.conversations?.[0]?.id ?? null
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  read: boolean
  created_at: string
}

export interface ConversationWithDetails {
  id: string
  match_id: string
  last_message: string | null
  last_message_at: string | null
  created_at: string
  other_user: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  other_property: {
    id: string
    address: string
    suburb: string
    price: number
    property_images: { url: string; sort_order: number }[]
  }
  my_property: {
    id: string
    verified: boolean
  }
  unread_count: number
  locked: boolean
  matchType: "like" | "superlike" | undefined
  matchDate: string | undefined
}

export async function getOrCreateConversation(
  matchId: string,
  userId: string
): Promise<string> {
  // Try to find an existing conversation for this match.
  const { data: existing, error: findError } = await supabase
    .from("conversations")
    .select("id")
    .eq("match_id", matchId)
    .maybeSingle()

  if (findError) throw findError
  if (existing?.id) return existing.id

  // No conversation exists yet — create one on demand.
  // This can happen if a match row was created without the auto-trigger
  // that normally inserts a conversation.
  const { data: inserted, error: insertError } = await supabase
    .from("conversations")
    .insert({
      match_id: matchId,
      initiated_by: userId,
      initiated_as_superlike: false,
    })
    .select("id")
    .single()

  if (insertError) {
    // If another client created it in the race window, re-fetch and return it.
    const { data: raced, error: raceError } = await supabase
      .from("conversations")
      .select("id")
      .eq("match_id", matchId)
      .maybeSingle()

    if (raceError) throw raceError
    if (raced?.id) return raced.id
    throw insertError
  }

  if (!inserted?.id) {
    throw new Error("Failed to create conversation.")
  }

  return inserted.id
}

export interface LoadedConversation {
  id: string
  match_id: string
  other_user_id: string
  other_user: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  other_property: {
    id: string
    address: string
    suburb: string
    price: number
    property_images: { url: string; sort_order: number }[]
  }
  my_property_id: string
  my_property: {
    id: string
    verified: boolean
  }
  last_message: string | null
  last_message_at: string | null
}

export interface ConversationListResult {
  conversations: ConversationWithDetails[]
  verifiedPropertyCount: number
}

function firstName(fullName: string | null | undefined): string {
  if (!fullName) return "Unknown"
  return fullName.split(" ")[0] || "Unknown"
}

export async function fetchConversationList(userId: string): Promise<ConversationListResult> {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      match_id,
      last_message,
      last_message_at,
      created_at,
      initiated_by,
      initiated_as_superlike,
      matches!inner(
        id,
        user_a_id,
        user_b_id,
        property_a_id,
        property_b_id,
        created_at,
        user_a:profiles!matches_user_a_id_fkey(id, full_name, avatar_url),
        user_b:profiles!matches_user_b_id_fkey(id, full_name, avatar_url),
        property_a:properties!matches_property_a_id_fkey(id, address, suburb, price, verified, property_images(url, sort_order)),
        property_b:properties!matches_property_b_id_fkey(id, address, suburb, price, verified, property_images(url, sort_order))
      )
    `
    )
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`, { foreignTable: "matches" })
    .order("last_message_at", { ascending: false, nullsFirst: false })

  if (error) throw error

  const rows = (data || []) as unknown as any[]
  const conversationIds: string[] = []
  const verifiedPropertyIds = new Set<string>()

  const conversations: ConversationWithDetails[] = rows.map((convo) => {
    const match = convo.matches
    const isUserA = match.user_a_id === userId
    const otherUser = isUserA ? match.user_b : match.user_a
    const otherProperty = isUserA ? match.property_b : match.property_a
    const myProperty = isUserA ? match.property_a : match.property_b

    if (convo.id) conversationIds.push(convo.id)
    if (myProperty?.id && myProperty.verified) {
      verifiedPropertyIds.add(myProperty.id)
    }

    let matchType: "like" | "superlike" | undefined
    if (convo.initiated_by && convo.initiated_by !== userId) {
      matchType = convo.initiated_as_superlike ? "superlike" : "like"
    }

    return {
      id: convo.id,
      match_id: convo.match_id,
      last_message: convo.last_message,
      last_message_at: convo.last_message_at,
      created_at: convo.created_at,
      other_user: otherUser,
      other_property: otherProperty,
      my_property: myProperty,
      unread_count: 0,
      locked: false,
      matchType,
      matchDate: match.created_at || undefined,
    }
  })

  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at, subscription_status")
    .eq("id", userId)
    .single()

  const isPremium = profileData
    ? isSubscriptionActive({
        is_premium: Boolean(profileData.is_premium),
        premium_expires_at: (profileData.premium_expires_at as string | null) || null,
        subscription_status: (profileData.subscription_status as string) || "free",
      })
    : false

  // Lock each conversation where the current user's property is not verified,
  // unless the user has an active premium subscription.
  for (const convo of conversations) {
    convo.locked = !convo.my_property?.verified && !isPremium
  }

  // Free users can only have one unlocked conversation at a time.
  if (!isPremium) {
    let freeSlotUsed = false
    for (const convo of conversations) {
      if (!convo.locked) {
        if (!freeSlotUsed) {
          freeSlotUsed = true
        } else {
          convo.locked = true
        }
      }
    }
  }

  if (conversationIds.length > 0) {
    const { data: unreadData, error: unreadError } = await supabase
      .from("messages")
      .select("conversation_id")
      .neq("sender_id", userId)
      .eq("read", false)
      .in("conversation_id", conversationIds)

    if (unreadError) throw unreadError

    const unreadMap = new Map<string, number>()
    for (const msg of unreadData || []) {
      unreadMap.set(msg.conversation_id, (unreadMap.get(msg.conversation_id) || 0) + 1)
    }

    for (const convo of conversations) {
      convo.unread_count = unreadMap.get(convo.id) || 0
    }
  }

  // Always fetch the latest message preview and merge it into the conversation.
  // The conversations table trigger may not have populated last_message/last_message_at,
  // so this ensures conversations with messages appear correctly.
  if (conversationIds.length > 0) {
    const latestByConversation = await fetchLatestMessages(conversationIds)
    for (const convo of conversations) {
      const latest = latestByConversation.get(convo.id)
      if (latest) {
        convo.last_message = latest.text
        convo.last_message_at = latest.created_at
      }
    }
  }

  return {
    conversations,
    verifiedPropertyCount: verifiedPropertyIds.size,
  }
}

export async function fetchConversations(userId: string): Promise<ConversationWithDetails[]> {
  const { conversations } = await fetchConversationList(userId)
  return conversations
}

export async function loadConversation(conversationId: string): Promise<{
  userId: string
  conversation: LoadedConversation
  messages: Message[]
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id
  if (!userId) {
    throw new Error("You must be signed in to view this conversation.")
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      match_id,
      last_message,
      last_message_at,
      created_at,
      matches!inner(
        id,
        user_a_id,
        user_b_id,
        property_a_id,
        property_b_id,
        created_at,
        user_a:profiles!matches_user_a_id_fkey(id, full_name, avatar_url),
        user_b:profiles!matches_user_b_id_fkey(id, full_name, avatar_url),
        property_a:properties!matches_property_a_id_fkey(id, address, suburb, price, verified, property_images(url, sort_order)),
        property_b:properties!matches_property_b_id_fkey(id, address, suburb, price, verified, property_images(url, sort_order))
      )
    `
    )
    .eq("id", conversationId)
    .single()

  if (error || !data) {
    throw new Error("Conversation not found or you do not have access.")
  }

  const match = (data as any).matches
  const isUserA = match.user_a_id === userId
  const otherUser = isUserA ? match.user_b : match.user_a
  const otherProperty = isUserA ? match.property_b : match.property_a
  const myProperty = isUserA ? match.property_a : match.property_b

  const conversation: LoadedConversation = {
    id: data.id,
    match_id: data.match_id,
    other_user_id: isUserA ? match.user_b_id : match.user_a_id,
    other_user: otherUser,
    other_property: otherProperty,
    my_property_id: isUserA ? match.property_a_id : match.property_b_id,
    my_property: myProperty,
    last_message: data.last_message,
    last_message_at: data.last_message_at,
  }

  const rawMessages = await fetchMessages(conversationId)
  return { userId, conversation, messages: rawMessages }
}

export async function fetchLatestMessages(
  conversationIds: string[]
): Promise<Map<string, Message>> {
  if (conversationIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, text, read, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })

  if (error) throw error

  const latestByConversation = new Map<string, Message>()
  for (const msg of data || []) {
    if (!latestByConversation.has(msg.conversation_id)) {
      latestByConversation.set(msg.conversation_id, msg as Message)
    }
  }
  return latestByConversation
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, text, read, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data || []) as Message[]
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text,
      read: false,
    })
    .select("id, conversation_id, sender_id, text, read, created_at")
    .single()

  if (error || !data) throw error || new Error("Failed to send message")
  return data as Message
}

export async function markMessagesRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("read", false)

  if (error) throw error
}

export function subscribeToMessages(
  conversationId: string,
  onChange: (payload: { event: "INSERT" | "UPDATE"; message: Message }) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          onChange({
            event: payload.eventType,
            message: payload.new as Message,
          })
        }
      }
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}

export interface AppNotification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  image_url: string | null
  action_id: string | null
  read: boolean
  created_at: string
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) throw error
  return (data || []) as AppNotification[]
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)
  if (error) throw error
}

export async function deleteSwipe(swiperId: string, swipedPropertyId: string): Promise<void> {
  const { error } = await supabase
    .from("swipes")
    .delete()
    .eq("swiper_id", swiperId)
    .eq("swiped_property_id", swipedPropertyId)

  if (error) throw error
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) throw error
}

export function subscribeToNotifications(
  userId: string,
  onChange: (payload: { event: "INSERT" | "UPDATE"; notification: AppNotification }) => void
) {
  const channel = supabase
    .channel(`notifications:user:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          onChange({
            event: payload.eventType,
            notification: payload.new as AppNotification,
          })
        }
      }
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
