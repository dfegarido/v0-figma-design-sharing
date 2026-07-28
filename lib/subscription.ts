import { supabase } from "@/lib/supabase"

const FREE_STATUSES = ["free", "canceled", "unpaid", "incomplete"]

export interface SubscriptionProfile {
  id: string
  subscription_plan: string
  is_premium: boolean
  premium_expires_at: string | null
  subscription_status: string
  subscription_period_end: string | null
  stripe_customer_id: string | null
  revenuecat_app_user_id: string | null
  premium_started_at: string | null
  verification_status: string
}

export function isSubscriptionActive(profile: {
  is_premium: boolean
  premium_expires_at: string | null
  subscription_status: string
}): boolean {
  const status = (profile.subscription_status || "free").toLowerCase()
  if (FREE_STATUSES.includes(status)) return false

  if (profile.is_premium && !profile.premium_expires_at) return true

  if (profile.premium_expires_at) {
    return new Date(profile.premium_expires_at).getTime() > Date.now()
  }

  return false
}

export function mapSubscriptionPlan(plan: string): "monthly" | "yearly" | null {
  const normalized = plan.toLowerCase()
  if (normalized.includes("year")) return "yearly"
  if (normalized.includes("month")) return "monthly"
  return null
}

const PROFILE_SELECT =
  "id, subscription_plan, is_premium, premium_expires_at, subscription_status, subscription_period_end, stripe_customer_id, revenuecat_app_user_id, premium_started_at, verification_status"

export async function fetchSubscriptionProfile(userId: string): Promise<SubscriptionProfile | null> {
  const { data, error } = await supabase.from("profiles").select(PROFILE_SELECT).eq("id", userId).single()

  if (error || !data) return null

  return {
    id: data.id as string,
    subscription_plan: (data.subscription_plan as string) || "free",
    is_premium: Boolean(data.is_premium),
    premium_expires_at: (data.premium_expires_at as string | null) || null,
    subscription_status: (data.subscription_status as string) || "free",
    subscription_period_end: (data.subscription_period_end as string | null) || null,
    stripe_customer_id: (data.stripe_customer_id as string | null) || null,
    revenuecat_app_user_id: (data.revenuecat_app_user_id as string | null) || null,
    premium_started_at: (data.premium_started_at as string | null) || null,
    verification_status: (data.verification_status as string) || "unverified",
  }
}

export async function updateSubscriptionProfile(
  userId: string,
  updates: Partial<SubscriptionProfile>
): Promise<SubscriptionProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(PROFILE_SELECT)
    .single()

  if (error || !data) {
    console.error("[updateSubscriptionProfile] failed:", error)
    return null
  }

  return {
    id: data.id as string,
    subscription_plan: (data.subscription_plan as string) || "free",
    is_premium: Boolean(data.is_premium),
    premium_expires_at: (data.premium_expires_at as string | null) || null,
    subscription_status: (data.subscription_status as string) || "free",
    subscription_period_end: (data.subscription_period_end as string | null) || null,
    stripe_customer_id: (data.stripe_customer_id as string | null) || null,
    revenuecat_app_user_id: (data.revenuecat_app_user_id as string | null) || null,
    premium_started_at: (data.premium_started_at as string | null) || null,
    verification_status: (data.verification_status as string) || "unverified",
  }
}
