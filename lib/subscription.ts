const FREE_STATUSES = ["free", "canceled", "unpaid", "incomplete"]

export interface SubscriptionProfile {
  subscription_plan: string
  is_premium: boolean
  premium_expires_at: string | null
  subscription_status: string
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
