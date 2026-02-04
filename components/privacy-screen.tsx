"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Shield, Eye, Lock, Trash2, Download, UserX } from "lucide-react"
import { motion } from "framer-motion"

interface PrivacyScreenProps {
  onBack: () => void
}

export function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  const [settings, setSettings] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    showLastActive: false,
    allowScreenshots: false,
    twoFactorAuth: true,
    biometricLogin: false,
  })

  const updateSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="h-full overflow-auto pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">Privacy & Security</h2>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Privacy Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Privacy
          </h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">Profile Visible</p>
                <p className="text-sm text-muted-foreground">Others can see your profile</p>
              </div>
              <Switch checked={settings.profileVisible} onCheckedChange={() => updateSetting("profileVisible")} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">Show Online Status</p>
                <p className="text-sm text-muted-foreground">Let others see when you are active</p>
              </div>
              <Switch checked={settings.showOnlineStatus} onCheckedChange={() => updateSetting("showOnlineStatus")} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">Show Last Active</p>
                <p className="text-sm text-muted-foreground">Display when you were last online</p>
              </div>
              <Switch checked={settings.showLastActive} onCheckedChange={() => updateSetting("showLastActive")} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">Allow Screenshots</p>
                <p className="text-sm text-muted-foreground">Let others screenshot your profile</p>
              </div>
              <Switch checked={settings.allowScreenshots} onCheckedChange={() => updateSetting("allowScreenshots")} />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Switch checked={settings.twoFactorAuth} onCheckedChange={() => updateSetting("twoFactorAuth")} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">Biometric Login</p>
                <p className="text-sm text-muted-foreground">Use Face ID or fingerprint</p>
              </div>
              <Switch checked={settings.biometricLogin} onCheckedChange={() => updateSetting("biometricLogin")} />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div>
                <p className="font-medium text-foreground">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180" />
            </motion.button>
          </div>
        </div>

        {/* Data Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Your Data
          </h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <Download className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Download My Data</p>
                <p className="text-sm text-muted-foreground">Get a copy of all your data</p>
              </div>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <UserX className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Blocked Users</p>
                <p className="text-sm text-muted-foreground">Manage blocked accounts</p>
              </div>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account</p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
