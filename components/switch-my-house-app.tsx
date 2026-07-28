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
import { MyListingsScreen } from "./my-listings-screen"
import { BuyerCriteriaScreen } from "./buyer-criteria-screen"
import { VerificationScreen } from "./verification-screen"
import type { VerificationStatus } from "./verification-screen"
import { UnlockChatScreen } from "./unlock-chat-screen"
import { PropertyDetailScreen } from "./property-detail-screen"
import { TestingScreen } from "./testing-screen"
import { OnboardingFlow } from "./onboarding-flow"
import { EditPropertyScreen } from "./edit-property-screen"
import { EditProfileScreen } from "./edit-profile-screen"
import { UploadProfilePhotoScreen } from "./upload-profile-photo-screen"
import type { Property } from "./property-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useUserData } from "@/context/user-data-context"

type Tab = "discover" | "search" | "add" | "messages" | "profile"
type Screen = Tab | "privacy" | "premium" | "help" | "notifications" | "chat" | "matches" | "liked" | "criteria" | "verification" | "unlock" | "property-detail" | "testing" | "onboarding" | "edit-profile" | "upload-photo" | "my-listings" | "edit-property" | "public-profile"

export function SwitchMyHouseApp() {
  const {
    profile,
    listings,
    likedProperties,
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
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null)
  const [activeVerificationPropertyId, setActiveVerificationPropertyId] = useState<string | null>(null)

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

  const handleNavigateToEditProperty = (propertyId?: string) => {
    setPreviousScreen(activeScreen)
    if (propertyId) setActivePropertyId(propertyId)
    setActiveScreen("edit-property")
  }

  const handleBack = () => {
    if (activeScreen === "chat" && ["matches", "notifications"].includes(previousScreen)) {
      setActiveScreen(previousScreen)
    } else if (activeScreen === "property-detail") {
      setActiveScreen(previousScreen)
    } else if (activeScreen === "public-profile") {
      setActiveScreen(previousScreen)
    } else {
      setActiveScreen(activeTab)
    }
    if (activeScreen !== "property-detail" && activeScreen !== "public-profile") {
      setActiveChatId(null)
    }
  }

  const handleOpenChat = (chatId: string) => {
    setPreviousScreen(activeScreen)
    setActiveChatId(chatId)
    setActiveScreen("chat")
  }

  const handleOpenPropertyDetail = (property: Property) => {
    setPreviousScreen(activeScreen)
    setActivePropertyId(property.id)
    setActiveScreen("property-detail")
  }

  const handleOpenPropertyDetailById = (propertyId: string) => {
    setPreviousScreen(activeScreen)
    setActivePropertyId(propertyId)
    setActiveScreen("property-detail")
  }

  const handleOpenChatFromNotification = (chatId: string, requiresPremium: boolean) => {
    if (requiresPremium && !isPremium) {
      setPreviousScreen(activeScreen)
      setActiveScreen("premium")
      return
    }
    setPreviousScreen(activeScreen)
    setActiveChatId(chatId)
    setActiveScreen("chat")
  }

  const handleOpenVerificationFromNotification = (propertyId?: string) => {
    if (propertyId) setActiveVerificationPropertyId(propertyId)
    setPreviousScreen(activeScreen)
    setActiveScreen("verification")
  }

  const handleNavigateUnlock = (propertyId?: string) => {
    if (propertyId) {
      setActiveVerificationPropertyId(propertyId)
    }
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
            isPremium={isPremium}
            onOpenChat={handleOpenChatFromNotification}
            onOpenProperty={handleOpenPropertyDetailById}
            onOpenMatches={() => handleNavigateToScreen("matches")}
            onOpenVerification={handleOpenVerificationFromNotification}
            onOpenPremium={() => handleNavigateToScreen("premium")}
          />
        )
      case "chat":
        return (
          <ChatDetailScreen
            chatId={activeChatId || "1"}
            onBack={handleBack}
            onViewProperty={(propertyId) => {
              setActivePropertyId(propertyId)
              setPreviousScreen("chat")
              setActiveScreen("property-detail")
            }}
            onViewProfile={(userId) => {
              setPreviousScreen("chat")
              setActiveScreen("public-profile")
            }}
          />
        )
      case "matches":
        return (
          <MatchesScreen
            onBack={handleBack}
            onOpenChat={handleOpenChat}
            onOpenVerification={(propertyId) => {
              if (propertyId) setActiveVerificationPropertyId(propertyId)
              setPreviousScreen(activeScreen)
              setActiveScreen("verification")
            }}
            onOpenPremium={() => {
              setPreviousScreen(activeScreen)
              setActiveScreen("premium")
            }}
          />
        )
      case "liked":
        return (
          <LikedScreen
            onBack={handleBack}
            onNavigate={(screen, propertyId) => {
              if (screen === "property-detail" && propertyId) {
                setActivePropertyId(propertyId)
                setPreviousScreen(activeScreen)
                setActiveScreen("property-detail")
              }
            }}
          />
        )
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
            propertyId={activeVerificationPropertyId}
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
        return activePropertyId ? (
          <PropertyDetailScreen
            propertyId={activePropertyId}
            onBack={handleBack}
            onEdit={(propertyId) => handleNavigateToEditProperty(propertyId)}
            onMessage={(chatId) => handleOpenChat(chatId)}
          />
        ) : null
      case "public-profile":
        return (
          <div className="flex h-full flex-col items-center justify-center bg-background p-6">
            <Button variant="ghost" size="icon" onClick={handleBack} className="absolute left-4 top-4 rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <p className="text-muted-foreground">Public profile coming soon.</p>
          </div>
        )
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
      case "edit-profile":
        return <EditProfileScreen onBack={handleBack} />
      case "upload-photo":
        return <UploadProfilePhotoScreen onBack={handleBack} />
      case "my-listings":
        return (
          <MyListingsScreen
            onBack={handleBack}
            onNavigate={(screen, propertyId) => {
              if (screen === "property-detail" && propertyId) {
                setActivePropertyId(propertyId)
                setPreviousScreen(activeScreen)
                setActiveScreen("property-detail")
              } else if (screen === "edit-property" && propertyId) {
                handleNavigateToEditProperty(propertyId)
              } else if (screen === "premium") {
                setPreviousScreen(activeScreen)
                setActiveScreen("premium")
              } else if (screen === "verification" && propertyId) {
                setActiveVerificationPropertyId(propertyId)
                setPreviousScreen(activeScreen)
                setActiveScreen("verification")
              }
            }}
          />
        )
      case "edit-property":
        return activePropertyId ? (
          <EditPropertyScreen
            propertyId={activePropertyId}
            onBack={handleBack}
            onNavigate={(screen, propertyId) => {
              if (screen === "premium") {
                setPreviousScreen(activeScreen)
                setActiveScreen("premium")
              } else if (screen === "verification" && propertyId) {
                setActiveVerificationPropertyId(propertyId)
                setPreviousScreen(activeScreen)
                setActiveScreen("verification")
              }
            }}
          />
        ) : null
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
            onNavigate={(screen, chatId) => {
              if (screen === "chat" && chatId) {
                handleOpenChat(chatId)
              } else {
                handleTabChange(screen as Tab)
              }
            }}
            buyerCriteria={buyerCriteria}
            canChat={canChat}
            isPremium={isPremium}
            onNavigateUnlock={handleNavigateUnlock}
          />
        )
      case "search":
        return (
          <SearchScreen
            onOpenPropertyDetail={(property) => {
              setPreviousScreen(activeScreen)
              setActivePropertyId(property.id)
              setActiveScreen("property-detail")
            }}
          />
        )
      case "add":
        return <AddPropertyScreen onComplete={() => handleTabChange("discover")} />
      case "messages":
        return (
          <MessagesScreen
            onOpenChat={handleOpenChat}
            onNavigateToMatches={() => handleNavigateToScreen("matches")}
            onNavigateToVerification={(propertyId) => {
              if (propertyId) {
                setActiveVerificationPropertyId(propertyId)
              }
              if (verificationStatus !== "verified") {
                setPreviousScreen(activeScreen)
                setActiveScreen("verification")
              } else if (!isPremium) {
                setPreviousScreen(activeScreen)
                setActiveScreen("unlock")
              }
            }}
            onNavigateToEditProperty={(propertyId) => {
              if (propertyId) {
                setActiveVerificationPropertyId(propertyId)
                setPreviousScreen(activeScreen)
                setActiveScreen("verification")
              }
            }}
            onNavigateToUnlock={() => {
              if (verificationStatus !== "verified") {
                setPreviousScreen(activeScreen)
                setActiveScreen("verification")
              } else if (!isPremium) {
                setPreviousScreen(activeScreen)
                setActiveScreen("unlock")
              }
            }}
            onNavigateToPremium={() => {
              setPreviousScreen(activeScreen)
              setActiveScreen("premium")
            }}
            isPremium={isPremium}
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

  const showNavigation = !["privacy", "premium", "help", "notifications", "chat", "matches", "liked", "criteria", "verification", "unlock", "property-detail", "public-profile", "testing", "onboarding", "edit-profile", "upload-photo", "my-listings", "edit-property"].includes(activeScreen)

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
