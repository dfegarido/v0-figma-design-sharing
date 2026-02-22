"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { DashboardPage } from "@/components/admin/dashboard-page"
import { UsersPage } from "@/components/admin/users-page"
import { ListingsPage } from "@/components/admin/listings-page"
import { SwapsPage } from "@/components/admin/swaps-page"
import { ChatsPage } from "@/components/admin/chats-page"
import { PaymentsPage } from "@/components/admin/payments-page"
import { VerificationsPage } from "@/components/admin/verifications-page"
import { SettingsPage } from "@/components/admin/settings-page"

export default function AdminPortal() {
  const [activePage, setActivePage] = useState("dashboard")

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage onNavigate={setActivePage} />
      case "users": return <UsersPage />
      case "listings": return <ListingsPage />
      case "swaps": return <SwapsPage />
      case "chats": return <ChatsPage />
      case "payments": return <PaymentsPage />
      case "verifications": return <VerificationsPage />
      case "settings": return <SettingsPage />
      default: return <DashboardPage onNavigate={setActivePage} />
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar activePage={activePage} onNavigate={setActivePage} />
      <SidebarInset>
        <AdminHeader pageTitle={activePage} />
        <div className="flex-1 overflow-auto p-6">
          {renderPage()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
