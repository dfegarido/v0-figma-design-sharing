import { Purchases, LogLevel, type CustomerInfo, type Package, type Offerings } from "@revenuecat/purchases-js"
import { supabase } from "@/lib/supabase"
import { updateSubscriptionProfile } from "@/lib/subscription"

const WEB_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY ?? ""

export const PRO_ENTITLEMENT_ID = "Switch My Home Pro"
export const DEFAULT_OFFERING_ID = "monthly"

let purchasesInstance: Purchases | null = null

export function isConfiguredPurchases(): boolean {
  return Purchases.isConfigured()
}

export function configurePurchases(userId: string): Purchases | null {
  if (!WEB_API_KEY) {
    console.warn("[Purchases] RevenueCat web API key is not set. Set NEXT_PUBLIC_REVENUECAT_WEB_API_KEY.")
    return null
  }

  if (typeof window === "undefined") return null

  if (purchasesInstance) return purchasesInstance

  Purchases.setLogLevel(LogLevel.Debug)
  purchasesInstance = Purchases.configure({
    apiKey: WEB_API_KEY,
    appUserId: userId,
  })

  return purchasesInstance
}

export async function changeUser(userId: string): Promise<CustomerInfo | null> {
  const instance = purchasesInstance
  if (!instance) return null
  try {
    return await instance.changeUser(userId)
  } catch (error) {
    console.warn("[Purchases] changeUser failed:", error)
    return null
  }
}

export async function getOfferings(): Promise<Offerings | null> {
  const instance = purchasesInstance
  if (!instance) return null
  try {
    return await instance.getOfferings()
  } catch (error) {
    console.warn("[Purchases] getOfferings failed:", error)
    return null
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  const instance = purchasesInstance
  if (!instance) return null
  try {
    return await instance.getCustomerInfo()
  } catch (error) {
    console.warn("[Purchases] getCustomerInfo failed:", error)
    return null
  }
}

export async function purchasePackage(pkg: Package, customerEmail?: string): Promise<CustomerInfo | null> {
  const instance = purchasesInstance
  if (!instance) return null
  const result = await instance.purchase({ rcPackage: pkg, customerEmail })
  return result.customerInfo
}

export async function presentPaywall(): Promise<CustomerInfo | null> {
  const instance = purchasesInstance
  if (!instance) return null
  const result = await instance.presentPaywall({})
  return result.customerInfo
}

export function isProEntitlementActive(info: CustomerInfo | null): boolean {
  if (!info) return false
  const entitlement = info.entitlements.active[PRO_ENTITLEMENT_ID]
  if (entitlement?.isActive) return true
  return false
}

export function getProExpirationDate(info: CustomerInfo | null): string | null {
  if (!info) return null
  const entitlement = info.entitlements.active[PRO_ENTITLEMENT_ID]
  if (entitlement?.expirationDate) return entitlement.expirationDate.toISOString()
  return null
}

export function getPurchasesErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "errorCode" in error) {
    const rcError = error as { errorCode: number; message?: string }
    switch (rcError.errorCode) {
      case 1:
        return "The purchase was cancelled."
      case 2:
        return "The store is not available right now. Try again later."
      case 3:
        return "Purchase not allowed on this device or account."
      case 4:
        return "Purchase not available for purchase."
      case 5:
        return "Product not available for purchase."
      case 6:
        return "You are already subscribed."
      case 7:
        return "Receipt already in use."
      default:
        return rcError.message ?? "Purchase failed. Please try again."
    }
  }
  if (error instanceof Error) return error.message
  return "An unexpected error occurred."
}

export async function syncPremiumToBackend(info: CustomerInfo | null, userId: string): Promise<void> {
  if (!info) return
  if (!isProEntitlementActive(info)) return

  const expirationDate = getProExpirationDate(info)

  try {
    await updateSubscriptionProfile(userId, {
      is_premium: true,
      subscription_status: "active",
      subscription_plan: "monthly",
      premium_expires_at: expirationDate,
      revenuecat_app_user_id: info.originalAppUserId ?? userId,
    })
  } catch (error) {
    console.error("[Purchases] backend sync failed:", error)
  }
}

export async function refreshCustomerInfoAndSync(userId: string): Promise<CustomerInfo | null> {
  const info = await getCustomerInfo()
  if (info) {
    await syncPremiumToBackend(info, userId)
  }
  return info
}
