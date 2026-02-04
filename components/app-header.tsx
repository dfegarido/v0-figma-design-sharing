"use client"

import { Bell, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AppHeaderProps {
  notificationCount?: number
  onNotificationsClick?: () => void
  onProfileClick?: () => void
}

export function AppHeader({ notificationCount = 0, onNotificationsClick, onProfileClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Home className="w-5 h-5 text-card" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">Switch</h1>
            <p className="text-[10px] text-muted-foreground font-medium">MY HOUSE</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            onClick={onNotificationsClick}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onProfileClick}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
