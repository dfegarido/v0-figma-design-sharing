"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { supabase } from "@/lib/supabase"
import {
  fetchBuyerCriteria,
  saveBuyerCriteria as persistBuyerCriteria,
} from "@/lib/buyer-criteria"
import {
  fetchProfileData,
  fetchUnreadMessageCount,
  fetchUnreadNotificationCount,
  type ProfileData,
  type ProfileListing,
  type ProfileStats,
  type UserProfile,
} from "@/lib/profile"
import {
  defaultBuyerCriteria,
  type BuyerCriteria,
} from "@/components/buyer-criteria-screen"
import type { VerificationStatus } from "@/components/verification-screen"
import type { PremiumPlan } from "@/components/premium-screen"

interface UserDataContextValue {
  loading: boolean
  profile: UserProfile | null
  stats: ProfileStats
  listings: ProfileListing[]
  buyerCriteria: BuyerCriteria
  verificationStatus: VerificationStatus
  isPremium: boolean
  premiumPlan: PremiumPlan
  notificationCount: number
  messageCount: number
  refresh: () => Promise<void>
  setBuyerCriteria: (criteria: BuyerCriteria) => void
  saveBuyerCriteria: (criteria: BuyerCriteria) => Promise<boolean>
}

const defaultStats: ProfileStats = {
  swipes: 0,
  matches: 0,
  conversations: 0,
  liked: 0,
  listings: 0,
}

const UserDataContext = createContext<UserDataContextValue | null>(null)

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats>(defaultStats)
  const [listings, setListings] = useState<ProfileListing[]>([])
  const [buyerCriteria, setBuyerCriteriaState] = useState<BuyerCriteria>(defaultBuyerCriteria)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified")
  const [isPremium, setIsPremium] = useState(false)
  const [premiumPlan, setPremiumPlan] = useState<PremiumPlan>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  const applyProfileData = useCallback((data: ProfileData) => {
    setProfile(data.profile)
    setStats(data.stats)
    setListings(data.listings)
    setVerificationStatus(data.profile?.verification_status ?? "unverified")
    setIsPremium(data.isPremium)
    setPremiumPlan(data.premiumPlan)
  }, [])

  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setProfile(null)
      setStats(defaultStats)
      setListings([])
      setBuyerCriteriaState(defaultBuyerCriteria)
      setVerificationStatus("unverified")
      setIsPremium(false)
      setPremiumPlan(null)
      setNotificationCount(0)
      setMessageCount(0)
      setLoading(false)
      return
    }

    try {
      const [profileData, criteria, notifications, messages] = await Promise.all([
        fetchProfileData(user.id),
        fetchBuyerCriteria(user.id),
        fetchUnreadNotificationCount(user.id),
        fetchUnreadMessageCount(user.id),
      ])

      applyProfileData(profileData)
      if (criteria) setBuyerCriteriaState(criteria)
      setNotificationCount(notifications)
      setMessageCount(messages)
    } finally {
      setLoading(false)
    }
  }, [applyProfileData])

  useEffect(() => {
    refresh()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh()
    })

    return () => subscription.unsubscribe()
  }, [refresh])

  const setBuyerCriteria = useCallback((criteria: BuyerCriteria) => {
    setBuyerCriteriaState(criteria)
  }, [])

  const saveBuyerCriteria = useCallback(async (criteria: BuyerCriteria) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    try {
      await persistBuyerCriteria(user.id, criteria)
      setBuyerCriteriaState(criteria)
      return true
    } catch (error) {
      console.error("Failed to save buyer criteria:", error)
      return false
    }
  }, [])

  return (
    <UserDataContext.Provider
      value={{
        loading,
        profile,
        stats,
        listings,
        buyerCriteria,
        verificationStatus,
        isPremium,
        premiumPlan,
        notificationCount,
        messageCount,
        refresh,
        setBuyerCriteria,
        saveBuyerCriteria,
      }}
    >
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext)
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider")
  }
  return context
}
