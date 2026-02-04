"use client"

import { Home, Search, Plus, MessageCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "discover" | "search" | "add" | "messages" | "profile"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  messageCount?: number
}

const tabs = [
  { id: "discover" as Tab, icon: Home, label: "Discover" },
  { id: "search" as Tab, icon: Search, label: "Search" },
  { id: "add" as Tab, icon: Plus, label: "Add", isMain: true },
  { id: "messages" as Tab, icon: MessageCircle, label: "Messages" },
  { id: "profile" as Tab, icon: User, label: "Profile" },
]

export function BottomNav({ activeTab, onTabChange, messageCount = 0 }: BottomNavProps) {
  return (
    <nav className="flex-shrink-0 bg-card/95 backdrop-blur-lg border-t border-border z-40">
      <div className="flex items-center justify-around h-16 px-2 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          if (tab.isMain) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative -mt-5 flex items-center justify-center"
                type="button"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95">
                  <Icon className="h-6 w-6 text-card" />
                </div>
              </button>
            )
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center py-2 px-3 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              type="button"
            >
              <Icon className={cn("h-5 w-5 mb-0.5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.id === "messages" && messageCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                  {messageCount > 9 ? "9+" : messageCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
