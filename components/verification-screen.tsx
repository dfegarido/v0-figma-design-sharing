"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"

export type VerificationStatus = "unverified" | "pending" | "verified"

interface VerificationScreenProps {
  onBack: () => void
  status: VerificationStatus
  onStatusChange: (status: VerificationStatus) => void
}

const documentTypes = [
  { id: "title-deed", label: "Title Deed / Certificate of Title", icon: FileText },
  { id: "rates-notice", label: "Council Rates Notice", icon: FileText },
  { id: "utility-bill", label: "Utility Bill (matching address)", icon: FileText },
]

export function VerificationScreen({ onBack, status, onStatusChange }: VerificationScreenProps) {
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleUpload = (docId: string) => {
    if (!uploadedDocs.includes(docId)) {
      setUploadedDocs([...uploadedDocs, docId])
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onStatusChange("pending")
    setSubmitting(false)
  }

  const statusConfig = {
    unverified: {
      icon: ShieldAlert,
      color: "text-destructive",
      bg: "bg-destructive/10",
      badge: "Unverified",
      badgeVariant: "destructive" as const,
    },
    pending: {
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      badge: "Pending Review",
      badgeVariant: "secondary" as const,
    },
    verified: {
      icon: ShieldCheck,
      color: "text-primary",
      bg: "bg-primary/10",
      badge: "Verified",
      badgeVariant: "default" as const,
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1">Property Verification</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${config.bg} rounded-2xl p-6 text-center`}
        >
          <StatusIcon className={`h-12 w-12 mx-auto mb-3 ${config.color}`} />
          <Badge variant={config.badgeVariant} className="mb-2">
            {config.badge}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            {status === "unverified" && "Verify your property ownership to unlock communication with your matches."}
            {status === "pending" && "Your documents are being reviewed. This usually takes 1-2 business days."}
            {status === "verified" && "Your property ownership has been verified. You can now communicate freely with matches."}
          </p>
        </motion.div>

        {/* Why Verify */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary/50 rounded-2xl p-4 space-y-3"
        >
          <h3 className="font-semibold text-foreground">Why verify?</h3>
          <div className="space-y-2">
            {[
              "Ensures all parties are genuine property owners",
              "Unlocks ability to message and call your matches",
              "Builds trust in the swap process",
              "Required before finalising any swap agreement",
            ].map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{reason}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upload Documents */}
        {status === "unverified" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-foreground">Upload Documents</h3>
            <p className="text-sm text-muted-foreground">
              Upload at least one document proving you own the listed property.
            </p>

            <div className="space-y-3">
              {documentTypes.map((doc) => {
                const uploaded = uploadedDocs.includes(doc.id)
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleUpload(doc.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      uploaded
                        ? "border-primary bg-primary/5"
                        : "border-dashed border-border hover:border-primary/50"
                    }`}
                  >
                    {uploaded ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${uploaded ? "text-primary" : "text-foreground"}`}>
                        {doc.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {uploaded ? "Document uploaded" : "Tap to upload"}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Pending Timeline */}
        {status === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-foreground">Verification Progress</h3>
            <div className="space-y-0">
              {[
                { label: "Documents submitted", done: true },
                { label: "Under review", done: false, active: true },
                { label: "Verification complete", done: false },
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.done ? "bg-primary" : step.active ? "bg-amber-500" : "bg-secondary"
                    }`}>
                      {step.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                      ) : step.active ? (
                        <Clock className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    {i < 2 && <div className={`w-0.5 h-8 ${step.done ? "bg-primary" : "bg-border"}`} />}
                  </div>
                  <div className="pb-8">
                    <p className={`text-sm font-medium ${step.done ? "text-primary" : step.active ? "text-amber-500" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    {step.active && (
                      <p className="text-xs text-muted-foreground mt-0.5">Usually 1-2 business days</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Verified Success */}
        {status === "verified" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-primary/5 rounded-2xl p-6 text-center"
          >
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">All set!</h3>
            <p className="text-sm text-muted-foreground">
              You can now communicate with all your matches and begin the swap process.
            </p>
          </motion.div>
        )}

        {/* Info notice */}
        <div className="flex items-start gap-3 text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>Your documents are securely stored and only used for ownership verification. They are never shared with other users.</p>
        </div>
      </div>

      {/* Submit Button */}
      {status === "unverified" && (
        <div className="flex-shrink-0 p-4 border-t border-border">
          <Button
            onClick={handleSubmit}
            disabled={uploadedDocs.length === 0 || submitting}
            className="w-full rounded-xl h-12 text-base font-medium"
          >
            {submitting ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>
      )}
    </div>
  )
}
