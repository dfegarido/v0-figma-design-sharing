import { supabase } from "@/lib/supabase"
import type { VerificationStatus } from "@/components/verification-screen"
import {
  isSubscriptionActive,
  mapSubscriptionPlan,
  type SubscriptionProfile,
} from "@/lib/subscription"
import type { PremiumPlan } from "@/components/premium-screen"

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  verification_status: VerificationStatus
  subscription_plan: string
  address: string | null
  suburb: string | null
  is_premium: boolean
  premium_expires_at: string | null
  subscription_status: string
}

export interface ProfileListing {
  id: string
  image: string
  address: string
  city: string
  price: number
  beds: number
  baths: number
  sqft: number
  status: "active" | "pending" | "matched"
  matches: number
  views: number
}

export interface ProfileStats {
  swipes: number
  matches: number
  conversations: number
  liked: number
  listings: number
}

export interface ProfileData {
  profile: UserProfile | null
  stats: ProfileStats
  listings: ProfileListing[]
  isPremium: boolean
  premiumPlan: PremiumPlan
}

function mapVerificationStatus(status: string | null | undefined): VerificationStatus {
  if (status === "verified" || status === "pending") return status
  return "unverified"
}

function mapListingStatus(status: string | null | undefined): ProfileListing["status"] {
  if (status === "pending" || status === "matched") return status
  return "active"
}

export async function fetchProfileData(userId: string): Promise<ProfileData> {
  const [
    { data: profileData },
    { count: likedCount },
    { count: matchCount },
    { count: listingCount },
    { count: swipeCount },
    { data: listingsData },
    { data: matchDetailsData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, verification_status, subscription_plan, address, suburb, is_premium, premium_expires_at, subscription_status"
      )
      .eq("id", userId)
      .single(),
    supabase
      .from("swipes")
      .select("*", { count: "exact", head: true })
      .eq("swiper_id", userId)
      .in("direction", ["right", "up"]),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", userId),
    supabase
      .from("swipes")
      .select("*", { count: "exact", head: true })
      .eq("swiper_id", userId),
    supabase
      .from("properties")
      .select("id, address, suburb, price, bedrooms, bathrooms, parking, sqm, status, property_images(url)")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("matches")
      .select("property_a_id, property_b_id")
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`),
  ])

  const matchCountMap = new Map<string, number>()
  for (const match of matchDetailsData || []) {
    matchCountMap.set(
      match.property_a_id,
      (matchCountMap.get(match.property_a_id) || 0) + 1
    )
    matchCountMap.set(
      match.property_b_id,
      (matchCountMap.get(match.property_b_id) || 0) + 1
    )
  }

  const listingIds = (listingsData || []).map((listing) => listing.id)
  const viewsMap = new Map<string, number>()

  if (listingIds.length > 0) {
    const { data: swipeViews } = await supabase
      .from("swipes")
      .select("swiped_property_id")
      .in("swiped_property_id", listingIds)

    for (const swipe of swipeViews || []) {
      viewsMap.set(
        swipe.swiped_property_id,
        (viewsMap.get(swipe.swiped_property_id) || 0) + 1
      )
    }
  }

  const listings: ProfileListing[] = (listingsData || []).map((listing) => {
    const images = listing.property_images as { url: string }[] | null
    return {
      id: listing.id,
      image: images?.[0]?.url || "/placeholder.svg",
      address: listing.address || "Untitled listing",
      city: listing.suburb || "",
      price: listing.price ?? 0,
      beds: listing.bedrooms ?? 0,
      baths: listing.bathrooms ?? 0,
      sqft: listing.sqm ?? 0,
      status: mapListingStatus(listing.status),
      matches: matchCountMap.get(listing.id) || 0,
      views: viewsMap.get(listing.id) || 0,
    }
  })

  const subscription: SubscriptionProfile = {
    subscription_plan: (profileData?.subscription_plan as string) || "free",
    is_premium: Boolean(profileData?.is_premium),
    premium_expires_at: (profileData?.premium_expires_at as string | null) || null,
    subscription_status: (profileData?.subscription_status as string) || "free",
    verification_status: (profileData?.verification_status as string) || "unverified",
  }

  const isPremium = isSubscriptionActive(subscription)
  const premiumPlan: PremiumPlan = isPremium
    ? mapSubscriptionPlan(subscription.subscription_plan)
    : null

  const profile: UserProfile | null = profileData
    ? {
        id: profileData.id,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        verification_status: mapVerificationStatus(profileData.verification_status),
        subscription_plan: subscription.subscription_plan,
        address: profileData.address,
        suburb: profileData.suburb,
        is_premium: subscription.is_premium,
        premium_expires_at: subscription.premium_expires_at,
        subscription_status: subscription.subscription_status,
      }
    : null

  return {
    profile,
    stats: {
      swipes: swipeCount ?? 0,
      matches: matchCount ?? 0,
      conversations: matchCount ?? 0,
      liked: likedCount ?? 0,
      listings: listingCount ?? 0,
    },
    listings,
    isPremium,
    premiumPlan,
  }
}

export async function fetchUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) return 0
  return count ?? 0
}

export async function fetchUnreadMessageCount(userId: string): Promise<number> {
  const { data: convos } = await supabase
    .from("matches")
    .select("conversations!inner(id)")
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)

  const conversationIds: string[] = []
  for (const match of convos || []) {
    for (const conversation of match.conversations || []) {
      conversationIds.push(conversation.id)
    }
  }

  if (conversationIds.length === 0) return 0

  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .neq("sender_id", userId)
    .eq("read", false)
    .in("conversation_id", conversationIds)

  return count ?? 0
}
