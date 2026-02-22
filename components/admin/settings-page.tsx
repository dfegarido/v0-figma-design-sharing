"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  DollarSign,
  Shield,
  Users,
  Save,
  Plus,
  Trash2,
} from "lucide-react"

const adminAccounts = [
  { name: "Zoe Vasquez", email: "zoev@beagl.au", role: "Super Admin", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop" },
  { name: "Mark Davidson", email: "markd@beagl.au", role: "Admin", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" },
  { name: "Anna Song", email: "annas@beagl.au", role: "Moderator", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" },
]

export function SettingsPage() {
  const [monthlyPrice, setMonthlyPrice] = useState("29.99")
  const [yearlyPrice, setYearlyPrice] = useState("199.99")
  const [singlePrice, setSinglePrice] = useState("4.99")
  const [trialDays, setTrialDays] = useState("7")
  const [commissionRate, setCommissionRate] = useState("2.5")
  const [autoFlag, setAutoFlag] = useState(true)
  const [flagKeywords, setFlagKeywords] = useState("scam, fraud, fake, spam")
  const [reportThreshold, setReportThreshold] = useState("3")
  const [autoSuspend, setAutoSuspend] = useState(false)
  const [requireVerification, setRequireVerification] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-mono">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pricing" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="moderation" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Team
          </TabsTrigger>
        </TabsList>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription Pricing</CardTitle>
              <CardDescription>Set pricing tiers for premium subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly">Monthly Price (AUD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="monthly"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearly">Yearly Price (AUD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="yearly"
                      value={yearlyPrice}
                      onChange={(e) => setYearlyPrice(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="single">Single Unlock (AUD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="single"
                      value={singlePrice}
                      onChange={(e) => setSinglePrice(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trial & Commission</CardTitle>
              <CardDescription>Configure free trial and platform commission settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trial">Free Trial Duration (days)</Label>
                  <Input
                    id="trial"
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission Rate (%)</Label>
                  <Input
                    id="commission"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Auto-Flagging</CardTitle>
              <CardDescription>Automatically flag content containing specific keywords</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable Auto-Flagging</p>
                  <p className="text-xs text-muted-foreground">Automatically flag messages and listings with suspicious content</p>
                </div>
                <Switch checked={autoFlag} onCheckedChange={setAutoFlag} />
              </div>
              {autoFlag && (
                <div className="space-y-2">
                  <Label>Flagged Keywords (comma-separated)</Label>
                  <Textarea
                    value={flagKeywords}
                    onChange={(e) => setFlagKeywords(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Thresholds</CardTitle>
              <CardDescription>Configure automatic actions based on user reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Reports before auto-review</Label>
                <Select value={reportThreshold} onValueChange={setReportThreshold}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 report</SelectItem>
                    <SelectItem value="3">3 reports</SelectItem>
                    <SelectItem value="5">5 reports</SelectItem>
                    <SelectItem value="10">10 reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-Suspend on Threshold</p>
                  <p className="text-xs text-muted-foreground">Automatically suspend users when report threshold is reached</p>
                </div>
                <Switch checked={autoSuspend} onCheckedChange={setAutoSuspend} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Require Verification for Chat</p>
                  <p className="text-xs text-muted-foreground">Users must verify property ownership before messaging</p>
                </div>
                <Switch checked={requireVerification} onCheckedChange={setRequireVerification} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Admin Accounts</CardTitle>
                  <CardDescription>Manage team members with admin access</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Admin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminAccounts.map((admin) => (
                  <div
                    key={admin.email}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={admin.avatar} />
                      <AvatarFallback className="text-xs">{admin.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{admin.name}</p>
                      <p className="text-xs text-muted-foreground">{admin.email}</p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">{admin.role}</Badge>
                    {admin.role !== "Super Admin" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
