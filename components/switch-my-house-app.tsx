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
import { HelpCenterScreen } from "./help-center-screen"
import { NotificationsScreen } from "./notifications-screen"
import { ChatDetailScreen } from "./chat-detail-screen"
import { MatchesScreen } from "./matches-screen"
import { LikedScreen } from "./liked-screen"

type Tab = "discover" | "search" | "add" | "messages" | "profile"
type Screen = Tab | "privacy" | "premium" | "help" | "notifications" | "chat" | "matches" | "liked"

export function SwitchMyHouseApp() {
  const [activeTab, setActiveTab] = useState<Tab>("discover")
  const [activeScreen, setActiveScreen] = useState<Screen>("discover")
  const [previousScreen, setPreviousScreen] = useState<Screen>("discover")
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [notificationCount] = useState(3)
  const [messageCount] = useState(2)

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setActiveScreen(tab)
    setPreviousScreen(tab)
  }

  const handleNavigateToScreen = (screen: Screen, chatId?: string) => {
    // If navigating to a main tab, switch the tab
    if (["discover", "search", "add", "messages", "profile"].includes(screen)) {
      handleTabChange(screen as Tab)
    } else {
      setPreviousScreen(activeScreen)
      setActiveScreen(screen)
      if (chatId) setActiveChatId(chatId)
    }
  }

  const handleBack = () => {
    // If chat was opened from matches, go back to matches
    if (activeScreen === "chat" && previousScreen === "matches") {
      setActiveScreen("matches")
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

  const renderContent = () => {
    // Sub-screens that overlay the main tabs
    switch (activeScreen) {
      case "privacy":
        return <PrivacyScreen onBack={handleBack} />
      case "premium":
        return <PremiumScreen onBack={handleBack} />
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
    }

    // Main tab screens
    switch (activeTab) {
      case "discover":
        return <SwipeFeed onNavigate={(screen) => handleTabChange(screen as Tab)} />
      case "search":
        return <SearchScreen />
      case "add":
        return <AddPropertyScreen onComplete={() => handleTabChange("discover")} />
      case "messages":
        return (
          <MessagesScreen 
            onOpenChat={handleOpenChat}
          />
        )
      case "profile":
        return (
          <ProfileScreen 
            onNavigate={handleNavigateToScreen}
          />
        )
      default:
        return <SwipeFeed onNavigate={(screen) => handleTabChange(screen as Tab)} />
    }
  }

  const showNavigation = !["privacy", "premium", "help", "notifications", "chat", "matches", "liked"].includes(activeScreen)

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
