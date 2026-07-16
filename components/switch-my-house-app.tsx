"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { AppHeader } from "./app-header"
import { BottomNav } from "./bottom-nav"
import { SwipeFeed } from "./swipe-feed"
import { MessagesScreen } from "./messages-screen"
import { ProfileScreen } from "./profile-screen"
import { SearchScreen } from "./search-screen"
import { AddPropertyScreen } from "./add-property-screen"
import { PrivacyScreen } from "./privacy-screen"
import { PremiumScreen } from "./premium-screen"
import { HelpCenterScreen } from "./help-center-screen"
import { NotificationsScreen } from "./notifications-screen"
import { ChatDetailScreen } from "./chat-detail-screen"
import { MatchesScreen } from "./matches-screen"
import { LikedScreen } from "./liked-screen"
import { BuyerCriteriaScreen } from "./buyer-criteria-screen"
import { VerificationScreen } from "./verification-screen"
import type { VerificationStatus } from "./verification-screen"
import { UnlockChatScreen } from "./unlock-chat-screen"
import { PropertyDetailScreen } from "./property-detail-screen"
import { TestingScreen } from "./testing-screen"
import { OnboardingFlow } from "./onboarding-flow"
import type { Property } from "./property-card"
import { useUserData } from "@/context/user-data-context"

type Tab = "discover" | "search" | "add" | "messages" | "profile"
type Screen = Tab | "privacy" | "premium" | "help" | "notifications" | "chat" | "matches" | "liked" | "criteria" | "verification" | "unlock" | "property-detail" | "testing" | "onboarding"

export function SwitchMyHouseApp() {
  const {
    profile,
    buyerCriteria,
    verificationStatus: profileVerificationStatus,
    isPremium,
    premiumPlan,
    notificationCount,
    messageCount,
    setBuyerCriteria,
    saveBuyerCriteria,
    refresh,
  } = useUserData()

  const [activeTab, setActiveTab] = useState<Tab>("discover")
  const [activeScreen, setActiveScreen] = useState<Screen>("discover")
  const [previousScreen, setPreviousScreen] = useState<Screen>("discover")
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [freeUnlockedChatId, setFreeUnlockedChatId] = useState<string | null>(null)
  const [verificationOverride, setVerificationOverride] = useState<VerificationStatus | null>(null)
  const [detailProperty, setDetailProperty] = useState<Property | null>(null)

  const verificationStatus = verificationOverride ?? profileVerificationStatus
  const canChat = verificationStatus === "verified" || isPremium

  // Premium users can chat freely; reset any free-tier single-slot unlock.
  useEffect(() => {
    if (isPremium) setFreeUnlockedChatId(null)
  }, [isPremium])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setActiveScreen(tab)
    setPreviousScreen(tab)
  }

  const handleNavigateToScreen = (screen: string, chatId?: string) => {
    if (["discover", "search", "add", "messages", "profile"].includes(screen)) {
      handleTabChange(screen as Tab)
    } else {
      setPreviousScreen(activeScreen)
      setActiveScreen(screen as Screen)
      if (chatId) setActiveChatId(chatId)
    }
  }

  const handleBack = () => {
    if (activeScreen === "chat" && ["matches", "notifications"].includes(previousScreen)) {
      setActiveScreen(previousScreen)
    } else if (activeScreen === "property-detail") {
      setActiveScreen(previousScreen)
    } else {
      setActiveScreen(activeTab)
    }
    setActiveChatId(null)
  }

  const handleOpenChat = (chatId: string) => {
    setPreviousScreen(activeScreen)
    setActiveChatId(chatId)
    setActiveScreen("chat")
  }

  const handleOpenPropertyDetail = (property: Property) => {
    setPreviousScreen(activeScreen)
    setDetailProperty(property)
    setActiveScreen("property-detail")
  }

  const handleNavigateUnlock = () => {
    if (verificationStatus !== "verified") {
      setPreviousScreen(activeScreen)
      setActiveScreen("verification")
    } else if (!isPremium) {
      setPreviousScreen(activeScreen)
      setActiveScreen("unlock")
    }
  }

  const renderContent = () => {
    switch (activeScreen) {
      case "privacy":
        return <PrivacyScreen onBack={handleBack} />
      case "premium":
        return (
          <PremiumScreen
            onBack={handleBack}
            isPremium={isPremium}
            activePlan={premiumPlan}
            onSubscribe={() => {
              toast.message("Premium checkout is not connected on web yet.")
            }}
            onCancel={() => {
              toast.message("Manage subscription in the mobile app for now.")
            }}
          />
        )
      case "help":
        return <HelpCenterScreen onBack={handleBack} />
      case "notifications":
        return (
          <NotificationsScreen
            onBack={handleBack}
            onViewMessage={handleOpenChat}
            onViewMatch={() => handleNavigateToScreen("matches")}
          />
        )
      case "chat":
        return <ChatDetailScreen chatId={activeChatId || "1"} onBack={handleBack} />
      case "matches":
        return <MatchesScreen onBack={handleBack} onOpenChat={handleOpenChat} />
      case "liked":
        return <LikedScreen onBack={handleBack} />
      case "criteria":
        return (
          <BuyerCriteriaScreen
            onBack={handleBack}
            criteria={buyerCriteria}
            onSave={async (criteria) => {
              const saved = await saveBuyerCriteria(criteria)
              if (!saved) {
                toast.error("Failed to save your criteria.")
              }
            }}
          />
        )
      case "verification":
        return (
          <VerificationScreen
            onBack={handleBack}
            status={verificationStatus}
            onStatusChange={(status) => {
              setVerificationOverride(status)
              if (status === "verified" && !isPremium) {
                setPreviousScreen("verification")
                setActiveScreen("unlock")
              }
            }}
          />
        )
      case "unlock":
        return (
          <UnlockChatScreen
            onBack={handleBack}
            verificationStatus={verificationStatus}
            chatUnlocked={canChat}
            onNavigateVerification={() => {
              setPreviousScreen(activeScreen)
              setActiveScreen("verification")
            }}
            onUnlockChat={() => {
              setVerificationOverride("verified")
            }}
          />
        )
      case "property-detail":
        return detailProperty ? (
          <PropertyDetailScreen
            property={detailProperty}
            onBack={handleBack}
          />
        ) : null
      case "testing":
        return (
          <TestingScreen
            onBack={handleBack}
            onNavigate={(screen) => {
              if (screen === "test-chat") {
                handleOpenChat("1")
              } else {
                handleNavigateToScreen(screen)
              }
            }}
            verificationStatus={verificationStatus}
            chatUnlocked={canChat}
            onResetVerification={() => setVerificationOverride("unverified")}
            onResetChat={() => setVerificationOverride("unverified")}
            onResetAll={() => {
              setVerificationOverride("unverified")
              void refresh()
            }}
            onSetVerification={(status) => setVerificationOverride(status as VerificationStatus)}
            onSetChatUnlocked={() => setVerificationOverride("verified")}
            onSetPremiumPlan={() => {
              toast.message("Premium state comes from your Supabase profile.")
            }}
          />
        )
      case "onboarding":
        return (
          <OnboardingFlow
            onBack={handleBack}
            onComplete={async (criteria) => {
              if (criteria) {
                setBuyerCriteria(criteria)
                await saveBuyerCriteria(criteria)
              }
              handleTabChange("discover")
            }}
          />
        )
    }

    switch (activeTab) {
      case "discover":
        return (
          <SwipeFeed
            onNavigate={(screen) => handleTabChange(screen as Tab)}
            buyerCriteria={buyerCriteria}
            canChat={canChat}
            isPremium={isPremium}
            onNavigateUnlock={handleNavigateUnlock}
          />
        )
      case "search":
        return <SearchScreen />
      case "add":
        return <AddPropertyScreen onComplete={() => handleTabChange("discover")} />
      case "messages":
        return (
          <MessagesScreen
            onOpenChat={handleOpenChat}
            verificationStatus={verificationStatus}
            onNavigateUnlock={handleNavigateUnlock}
            isPremium={isPremium}
            freeUnlockedChatId={freeUnlockedChatId}
            onUnlockChatSlot={(chatId) => setFreeUnlockedChatId(chatId)}
          />
        )
      case "profile":
        return <ProfileScreen onNavigate={handleNavigateToScreen} />
      default:
        return (
          <SwipeFeed
            onNavigate={(screen) => handleTabChange(screen as Tab)}
            buyerCriteria={buyerCriteria}
            canChat={canChat}
            isPremium={isPremium}
            onNavigateUnlock={handleNavigateUnlock}
          />
        )
    }
  }

  const showNavigation = !["privacy", "premium", "help", "notifications", "chat", "matches", "liked", "criteria", "verification", "unlock", "property-detail", "testing", "onboarding"].includes(activeScreen)

  return (
    <div className="h-dvh bg-background flex flex-col max-w-lg mx-auto overflow-hidden">
      {showNavigation && (
        <AppHeader
          notificationCount={notificationCount}
          avatarUrl={profile?.avatar_url}
          userName={profile?.full_name}
          onProfileClick={() => handleTabChange("profile")}
          onNotificationsClick={() => handleNavigateToScreen("notifications")}
        />
      )}

      <main className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showNavigation && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          messageCount={messageCount}
        />
      )}
    </div>
  )
}
