"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Home,
  ArrowLeftRight,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  CreditCard,
  Ban,
  FileText,
} from "lucide-react"
import {
  mockUsers,
  mockListings,
  mockSwaps,
  mockPayments,
  mockVerifications,
  mockActivity,
  signupChartData,
  revenueChartData,
  listingsBySuburb,
} from "./mock-data"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

const stats = [
  {
    title: "Total Users",
    value: mockUsers.length.toString(),
    change: "+12%",
    icon: Users,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    title: "Active Listings",
    value: mockListings.filter((l) => l.status === "active").length.toString(),
    change: "+5%",
    icon: Home,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Active Swaps",
    value: mockSwaps.filter((s) => s.status === "in-progress" || s.status === "matched").length.toString(),
    change: "+8%",
    icon: ArrowLeftRight,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    title: "Monthly Revenue",
    value: `$${mockPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
    change: "+22%",
    icon: DollarSign,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    title: "Pending Verifications",
    value: mockVerifications.filter((v) => v.status === "pending").length.toString(),
    change: "",
    icon: ShieldCheck,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Flagged Users",
    value: mockUsers.filter((u) => u.status === "banned" || u.status === "suspended").length.toString(),
    change: "",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
]

const activityIcons: Record<string, typeof Users> = {
  signup: UserPlus,
  verification: ShieldCheck,
  ban: Ban,
  payment: CreditCard,
  listing: Home,
  swap: ArrowLeftRight,
}

const activityColors: Record<string, string> = {
  signup: "text-chart-3 bg-chart-3/10",
  verification: "text-amber-500 bg-amber-500/10",
  ban: "text-destructive bg-destructive/10",
  payment: "text-chart-4 bg-chart-4/10",
  listing: "text-primary bg-primary/10",
  swap: "text-accent bg-accent/10",
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-mono">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your platform activity</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                {stat.change && (
                  <Badge variant="secondary" className="text-[10px] font-medium gap-1 bg-accent/10 text-accent-foreground border-0">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Signups Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">User Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={signupChartData}>
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.14 25)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.72 0.14 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 280)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 280)" />
                <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 280)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.02 280)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="oklch(0.72 0.14 25)"
                  strokeWidth={2}
                  fill="url(#signupGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 280)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 280)" />
                <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 280)" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.02 280)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="oklch(0.82 0.12 165)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Listings by Suburb + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listings by Suburb */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Listings by Suburb</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={listingsBySuburb} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 280)" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 280)" />
                <YAxis dataKey="suburb" type="category" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 280)" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.02 280)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="oklch(0.78 0.1 250)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              <button
                onClick={() => onNavigate("users")}
                className="text-xs text-primary hover:underline"
              >
                View all users
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {mockActivity.map((item) => {
                const Icon = activityIcons[item.type] || FileText
                const colorClass = activityColors[item.type] || "text-muted-foreground bg-secondary"
                const [iconColor, iconBg] = colorClass.split(" ")
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{item.message}</p>
                      <p className="text-[11px] text-muted-foreground">{item.timestamp}</p>
                    </div>
                    {item.user && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage
                          src={mockUsers.find((u) => u.name === item.user)?.avatar}
                        />
                        <AvatarFallback className="text-[10px]">
                          {item.user.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
