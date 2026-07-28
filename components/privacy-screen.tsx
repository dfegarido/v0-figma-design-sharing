"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Shield, Lock, Eye, FileText, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface PrivacyScreenProps {
  onBack: () => void
}

const sections = [
  { icon: Shield, title: "Data Protection", description: "Your personal data is encrypted and stored securely.", href: "https://www.switchmyhouse.com.au/privacy-policy/" },
  { icon: Lock, title: "Secure Messaging", description: "All messages are encrypted end-to-end.", href: "https://www.switchmyhouse.com.au/privacy-policy/" },
  { icon: Eye, title: "Visibility Controls", description: "Control who can see your property and profile.", href: "https://www.switchmyhouse.com.au/privacy-policy/" },
  { icon: FileText, title: "Terms of Service", description: "Read our terms and conditions.", href: "https://www.switchmyhouse.com.au/terms-of-use/" },
]

export function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Privacy</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {sections.map((section, index) => (
          <motion.a
            key={section.title}
            href={section.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-secondary"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
              <section.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{section.title}</p>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
            <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </motion.a>
        ))}
      </div>
    </div>
  )
}
