"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AppHeader } from "./app-header"
import { BottomNav } from "./bottom-nav"
import { SwipeFeed } from "./swipe-feed"
import { MessagesScreen } from "./messages-screen"
import { ProfileScreen } from "./profile-screen"
import { SearchScreen } from "./search-screen"
import { AddPropertyScreen } from "./add-property-screen"
import { PrivacyScreen } from "./privacy-screen"
import { PremiumScreen } from "./premium-screen"
import type { PremiumPlan } from "./premium-screen"
import { HelpCenterScreen } from "./help-center-screen"
import { NotificationsScreen } from "./notifications-screen"
import { ChatDetailScreen } from "./chat-detail-screen"
import { MatchesScreen } from "./matches-screen"
import { LikedScreen } from "./liked-screen"
import { BuyerCriteriaScreen, defaultBuyerCriteria } from "./buyer-criteria-screen"
import type { BuyerCriteria } from "./buyer-criteria-screen"
import { VerificationScreen } from "./verification-screen"
import type { VerificationStatus } from "./verification-screen"
import { UnlockChatScreen } from "./unlock-chat-screen"
import { PropertyDetailScreen } from "./property-detail-screen"
import { TestingScreen } from "./testing-screen"
import { OnboardingFlow } from "./onboarding-flow"
import type { Property } from "./property-card"

type Tab = "discover" | "search" | "add" | "messages" | "profile"
type Screen = Tab | "privacy" | "premium" | "help" | "notifications" | "chat" | "matches" | "liked" | "criteria" | "verification" | "unlock" | "property-detail" | "testing" | "onboarding"

export function SwitchMyHouseApp() {
  const [activeTab, setActiveTab] = useState<Tab>("discover")
  const [activeScreen, setActiveScreen] = useState<Screen>("discover")
  const [previousScreen, setPreviousScreen] = useState<Screen>("discover")
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [notificationCount] = useState(3)
  const [messageCount] = useState(2)

  // Buyer criteria state
  const [buyerCriteria, setBuyerCriteria] = useState<BuyerCriteria>(defaultBuyerCriteria)

  // Verification & unlock state
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified")
  const [chatUnlocked, setChatUnlocked] = useState(false)

  // Premium plan state
  const [premiumPlan, setPremiumPlan] = useState<PremiumPlan>(null)

  // Property detail state
  const [detailProperty, setDetailProperty] = useState<Property | null>(null)

  const canChat = verificationStatus === "verified" && chatUnlocked

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
    if (activeScreen === "chat" && previousScreen === "matches") {
      setActiveScreen("matches")
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
    } else {
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
            isPremium={canChat}
            activePlan={premiumPlan}
            onSubscribe={(plan) => {
              setPremiumPlan(plan)
              setVerificationStatus("verified")
              setChatUnlocked(true)
            }}
            onCancel={() => {
              setPremiumPlan(null)
              setVerificationStatus("unverified")
              setChatUnlocked(false)
            }}
          />
        )
      case "help":
        return <HelpCenterScreen onBack={handleBack} />
      case "notifications":
        return <NotificationsScreen onBack={handleBack} onViewMessage={handleOpenChat} />
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
            onSave={(c) => setBuyerCriteria(c)}
          />
        )
      case "verification":
        return (
          <VerificationScreen
            onBack={handleBack}
            status={verificationStatus}
            onStatusChange={(s) => {
              setVerificationStatus(s)
              if (s === "verified" && !chatUnlocked) {
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
            chatUnlocked={chatUnlocked}
            onNavigateVerification={() => {
              setPreviousScreen(activeScreen)
              setActiveScreen("verification")
            }}
            onUnlockChat={() => {
              setChatUnlocked(true)
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
            chatUnlocked={chatUnlocked}
            onResetVerification={() => setVerificationStatus("unverified")}
            onResetChat={() => setChatUnlocked(false)}
            onResetAll={() => {
              setVerificationStatus("unverified")
              setChatUnlocked(false)
              setPremiumPlan(null)
              setBuyerCriteria(defaultBuyerCriteria)
            }}
            onSetVerification={(s) => setVerificationStatus(s as typeof verificationStatus)}
            onSetChatUnlocked={(u) => setChatUnlocked(u)}
            onSetPremiumPlan={(p) => setPremiumPlan(p)}
          />
        )
      case "onboarding":
        return (
          <OnboardingFlow
            onBack={handleBack}
            onComplete={(criteria) => {
              if (criteria) setBuyerCriteria(criteria)
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
            chatUnlocked={chatUnlocked}
            onNavigateUnlock={handleNavigateUnlock}
          />
        )
      case "profile":
        return (
          <ProfileScreen
            onNavigate={handleNavigateToScreen}
          />
        )
      default:
        return (
          <SwipeFeed
            onNavigate={(screen) => handleTabChange(screen as Tab)}
            buyerCriteria={buyerCriteria}
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
