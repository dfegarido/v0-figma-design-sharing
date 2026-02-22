"use client"

import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface AdminHeaderProps {
  pageTitle: string
}

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  listings: "Listings",
  swaps: "Swaps",
  chats: "Chats",
  verifications: "Verifications",
  payments: "Payments",
  settings: "Settings",
}

export function AdminHeader({ pageTitle }: AdminHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span className="text-muted-foreground text-sm">Admin</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pageTitles[pageTitle] || pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users, listings..."
            className="w-64 pl-9 h-9 bg-background"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
