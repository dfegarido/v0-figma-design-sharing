"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/context/user-data-context"
import {
  configurePurchases,
  changeUser,
  getOfferings,
  getCustomerInfo,
  purchasePackage,
  presentPaywall,
  isProEntitlementActive,
  getPurchasesErrorMessage,
  syncPremiumToBackend,
  refreshCustomerInfoAndSync,
} from "@/lib/purchases"
import type { CustomerInfo, Package, Offerings } from "@revenuecat/purchases-js"

export interface UsePurchasesResult {
  offerings: Offerings | null
  packages: Package[]
  currentPackage: Package | null
  selectedPackage: Package | null
  setSelectedPackage: (pkg: Package) => void
  customerInfo: CustomerInfo | null
  isPro: boolean
  isLoading: boolean
  isPurchasing: boolean
  error: string | null
  purchase: () => Promise<boolean>
  restore: () => Promise<boolean>
  refresh: () => Promise<void>
  presentRevenueCatPaywall: () => Promise<boolean>
}

export function usePurchases(): UsePurchasesResult {
  const [offerings, setOfferings] = useState<Offerings | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userIdRef = useRef<string | null>(null)
  const { refresh: refreshUserData, isPremium: backendIsPremium } = useUserData()

  const syncUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id ?? null
    if (userId === userIdRef.current) return { success: true, userId }
    userIdRef.current = userId
    if (!userId) return { success: true, userId: null }
    try {
      configurePurchases(userId)
      await changeUser(userId)
      return { success: true, userId }
    } catch (err) {
      console.warn("[usePurchases] changeUser failed:", err)
      return { success: false, userId }
    }
  }, [])

  const load = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { success, userId } = await syncUser()
      if (!userId || !success) {
        setIsLoading(false)
        return
      }
      const [offeringsResult, info] = await Promise.all([getOfferings(), getCustomerInfo()])
      setOfferings(offeringsResult)
      setCustomerInfo(info)
      if (info) {
        await syncPremiumToBackend(info, userId)
      }
    } catch (err) {
      const message = getPurchasesErrorMessage(err)
      setError(message)
      console.warn("[usePurchases] load failed:", err)
    } finally {
      setIsLoading(false)
    }
  }, [syncUser])

  const refresh = useCallback(async () => {
    try {
      await load()
    } catch (err) {
      console.warn("[usePurchases] refresh failed:", err)
    }
  }, [load])

  const purchase = useCallback(async () => {
    if (!selectedPackage) {
      toast.error("No package", { description: "Please choose a subscription plan." })
      return false
    }
    setIsPurchasing(true)
    try {
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id ?? null
      const info = await purchasePackage(selectedPackage)
      setCustomerInfo(info)
      if (info && userId) {
        await syncPremiumToBackend(info, userId)
        await refreshUserData()
      }
      return isProEntitlementActive(info)
    } catch (err) {
      const message = getPurchasesErrorMessage(err)
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsPurchasing(false)
    }
  }, [selectedPackage, refreshUserData])

  const restore = useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id ?? null
    if (!userId) return false
    setIsPurchasing(true)
    try {
      const info = await refreshCustomerInfoAndSync(userId)
      setCustomerInfo(info)
      await refreshUserData()
      return isProEntitlementActive(info)
    } catch (err) {
      const message = getPurchasesErrorMessage(err)
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsPurchasing(false)
    }
  }, [refreshUserData])

  const presentRevenueCatPaywall = useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id ?? null
    if (!userId) return false
    setIsPurchasing(true)
    try {
      const info = await presentPaywall()
      setCustomerInfo(info)
      if (info) {
        await syncPremiumToBackend(info, userId)
        await refreshUserData()
      }
      return isProEntitlementActive(info)
    } catch (err) {
      const message = getPurchasesErrorMessage(err)
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsPurchasing(false)
    }
  }, [refreshUserData])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!offerings) return
    const currentOffering = offerings.current
    const allPackages = currentOffering?.availablePackages ?? []
    const monthlyPackage = allPackages.find((pkg) => pkg.identifier === "monthly")
    const defaultPackage = monthlyPackage ?? allPackages[0] ?? null
    setPackages(allPackages)
    setCurrentPackage(defaultPackage)
    setSelectedPackage((prev) => prev ?? defaultPackage)
  }, [offerings])

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id ?? null
      if (newUserId && newUserId !== userIdRef.current) {
        userIdRef.current = newUserId
        changeUser(newUserId).catch(() => {
          // ignore
        })
      }
    })
    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const isPro = isProEntitlementActive(customerInfo) || backendIsPremium

  return {
    offerings,
    packages,
    currentPackage,
    selectedPackage,
    setSelectedPackage,
    customerInfo,
    isPro,
    isLoading,
    isPurchasing,
    error,
    purchase,
    restore,
    refresh,
    presentRevenueCatPaywall,
  }
}
