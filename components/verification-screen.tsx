"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Shield,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import {
  fetchLatestVerificationStatus,
  fetchVerificationsForProperty,
  submitPropertyVerification,
  type VerificationDocumentType,
  type PropertyVerification,
} from "@/lib/verification"
export type VerificationStatus = "unverified" | "pending" | "verified"

interface VerificationScreenProps {
  propertyId?: string | null
  onBack: () => void
  status: VerificationStatus
  onStatusChange: (status: VerificationStatus) => void
}

type PropertyVerificationStatus = "unverified" | "pending" | "approved" | "rejected"

const documentTypes: { id: VerificationDocumentType; label: string; icon: typeof FileText }[] = [
  { id: "title-deed", label: "Title Deed / Certificate of Title", icon: FileText },
  { id: "rates-notice", label: "Council Rates Notice", icon: FileText },
  { id: "utility-bill", label: "Utility Bill (matching address)", icon: FileText },
]

const processingSteps = ["Upload received", "Checking ownership", "Finalizing verification"]

export function VerificationScreen({
  propertyId,
  onBack,
  status,
  onStatusChange,
}: VerificationScreenProps) {
  const [accountStatus, setAccountStatus] = useState<VerificationStatus>(status)
  const [propertyStatus, setPropertyStatus] = useState<PropertyVerificationStatus>("unverified")
  const [property, setProperty] = useState<{
    id: string
    address: string
    suburb: string
    image?: string
  } | null>(null)
  const [verifications, setVerifications] = useState<PropertyVerification[]>([])

  const [selectedDocType, setSelectedDocType] = useState<VerificationDocumentType | "">("")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(0)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isPropertyMode = Boolean(propertyId)
  const effectiveStatus = isPropertyMode ? propertyStatus : accountStatus

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user || cancelled) {
          if (!cancelled) setLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("verification_status")
          .eq("id", user.id)
          .single()

        if (!cancelled) {
          setAccountStatus((profile?.verification_status as VerificationStatus) || "unverified")
        }

        if (propertyId) {
          const { data: prop } = await supabase
            .from("properties")
            .select("id, address, suburb, property_images(url)")
            .eq("id", propertyId)
            .single()

          if (prop && !cancelled) {
            setProperty({
              id: prop.id,
              address: prop.address,
              suburb: prop.suburb,
              image: prop.property_images?.[0]?.url,
            })
          }

          const latest = await fetchLatestVerificationStatus(propertyId)
          const history = await fetchVerificationsForProperty(propertyId)

          if (!cancelled) {
            setPropertyStatus(latest || "unverified")
            setVerifications(history)
          }
        }
      } catch (err) {
        console.error("Failed to load verification screen data:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [propertyId])

  useEffect(() => {
    if (!documentFile) {
      setDocumentPreview(null)
      return
    }
    const url = URL.createObjectURL(documentFile)
    setDocumentPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [documentFile])

  const handlePickDocument = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocumentFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveDocument = () => {
    setDocumentFile(null)
    setDocumentPreview(null)
  }

  const handleSubmit = async () => {
    if (!propertyId) {
      toast.error("No property selected for verification.")
      return
    }
    if (!documentFile || !selectedDocType) {
      toast.error("Please select a document type and upload a document.")
      return
    }

    setSubmitting(true)
    setCurrentStep(0)
    setCompletedSteps(0)
    setSuccess(false)

    toast.info("Verification submitted. Pending review.")

    const stepTimers: NodeJS.Timeout[] = []
    stepTimers.push(
      setTimeout(() => {
        setCurrentStep(1)
        setCompletedSteps(1)
      }, 800)
    )
    stepTimers.push(
      setTimeout(() => {
        setCurrentStep(2)
        setCompletedSteps(2)
      }, 2200)
    )

    try {
      await submitPropertyVerification(propertyId, selectedDocType, documentFile)
      setCompletedSteps(3)
      setSuccess(true)

      await new Promise((resolve) => setTimeout(resolve, 500))

      setPropertyStatus("pending")
      const history = await fetchVerificationsForProperty(propertyId)
      setVerifications(history)

      setDocumentFile(null)
      setSelectedDocType("")
    } catch (err) {
      setPropertyStatus("unverified")
      const message = err instanceof Error ? err.message : "Could not submit verification."
      toast.error(message)
    } finally {
      stepTimers.forEach(clearTimeout)
      setSubmitting(false)
      setCurrentStep(0)
      setCompletedSteps(0)
      setSuccess(false)
    }
  }

  const statusConfig = {
    unverified: {
      icon: ShieldAlert,
      color: "text-muted-foreground",
      bg: "bg-muted",
      title: "Not Verified",
      badgeVariant: "outline" as const,
    },
    pending: {
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
      title: "Pending Review",
      badgeVariant: "default" as const,
    },
    approved: {
      icon: ShieldCheck,
      color: "text-accent",
      bg: "bg-accent/10",
      title: "Verified",
      badgeVariant: "default" as const,
    },
    rejected: {
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      title: "Verification Rejected",
      badgeVariant: "destructive" as const,
    },
  }

  const normalizedStatus: keyof typeof statusConfig =
    effectiveStatus === "verified" ? "approved" : effectiveStatus
  const config = statusConfig[normalizedStatus] || statusConfig.unverified
  const StatusIcon = config.icon
  const canSubmit = documentFile !== null && selectedDocType !== ""

  if (loading) {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-border px-4 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-lg font-bold">Verification</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {submitting ? (
            <ProcessingView key="processing" currentStep={currentStep} completedSteps={completedSteps} success={success} />
          ) : effectiveStatus === "approved" ? (
            <SuccessView key="success" property={property} onDone={onBack} />
          ) : effectiveStatus === "pending" ? (
            <PendingView
              key="pending"
              property={property}
              onDone={onBack}
            />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full ${config.bg}`}>
                  <StatusIcon className={`h-10 w-10 ${config.color}`} />
                </div>
                <h2 className="text-2xl font-bold">{config.title}</h2>
                <Badge variant={config.badgeVariant}>{effectiveStatus.toUpperCase()}</Badge>
              </div>

              {property && isPropertyMode && (
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                  {property.image ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <Image src={property.image} alt="Property" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{property.address}</p>
                    <p className="text-sm text-muted-foreground">{property.suburb}</p>
                  </div>
                </div>
              )}

              {(effectiveStatus === "unverified" || effectiveStatus === "rejected") && (
                <div className="space-y-6">
                  <p className="text-center text-sm text-muted-foreground">
                    {isPropertyMode
                      ? "Upload proof of ownership for this property so matches can chat with you."
                      : "To ensure trust and safety, please verify your property ownership by uploading one of the following documents."}
                  </p>

                  <div className="space-y-3">
                    <p className="font-semibold">Document type</p>
                    {documentTypes.map((doc) => {
                      const DocIcon = doc.icon
                      const selected = selectedDocType === doc.id
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setSelectedDocType(doc.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                              selected ? "bg-primary/20" : "bg-secondary"
                            }`}
                          >
                            {selected ? (
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            ) : (
                              <DocIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <span className={`font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
                            {doc.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold">Upload document</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {!documentPreview ? (
                      <button
                        type="button"
                        onClick={handlePickDocument}
                        className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-input transition-colors hover:border-primary/50"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Tap to upload document</span>
                      </button>
                    ) : (
                      <div className="relative h-40 w-full overflow-hidden rounded-2xl">
                        <Image
                          src={documentPreview}
                          alt="Document preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveDocument}
                          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {effectiveStatus === "rejected" && verifications[0]?.reviewerNotes && (
                    <div className="rounded-2xl bg-destructive/10 p-4">
                      <p className="font-semibold text-destructive">Reason for rejection</p>
                      <p className="text-sm text-muted-foreground">{verifications[0].reviewerNotes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start gap-3 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  Your documents are securely stored and only used for ownership verification. They are never shared with other users.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {effectiveStatus !== "approved" && effectiveStatus !== "pending" && !submitting && (
        <div className="flex-shrink-0 border-t border-border p-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-12 w-full rounded-xl text-base font-medium"
          >
            Submit for Review
          </Button>
        </div>
      )}
    </div>
  )
}

function ProcessingView({
  currentStep,
  completedSteps,
  success,
}: {
  currentStep: number
  completedSteps: number
  success: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center"
    >
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-primary/10">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Verifying Your Property</h2>
        <p className="text-sm text-muted-foreground">We&apos;re securely reviewing your verification.<br />This usually takes just a few seconds.</p>
      </div>

      <div className="w-full max-w-xs space-y-3 rounded-2xl border border-border bg-card p-4">
        {processingSteps.map((label, index) => {
          const isCompleted = index < completedSteps || success
          const isCurrent = index === currentStep && !success
          return (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-green-500"
                    : isCurrent
                    ? "bg-primary/20"
                    : "bg-secondary"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : isCurrent ? (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                )}
              </div>
              <span
                className={`flex-1 text-sm ${
                  isCompleted ? "text-foreground" : isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                {isCurrent ? `${label}...` : label}
              </span>
            </div>
          )
        })}
      </div>

      <p className="max-w-xs text-xs text-muted-foreground">Please don&apos;t close the app while verification is in progress.</p>
    </motion.div>
  )
}

function SuccessView({
  property,
  onDone,
}: {
  property: { id: string; address: string; suburb: string; image?: string } | null
  onDone: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center"
    >
      <div className="space-y-2">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent/20">
          <ShieldCheck className="h-12 w-12 text-accent" />
        </div>
        <h2 className="text-3xl font-bold">Congratulations!</h2>
        <p className="text-lg font-semibold">Property Verified</p>
      </div>

      <p className="max-w-xs text-sm text-muted-foreground">
        Your property is now verified.<br /><br />
        You can start chatting with matched homeowners and your profile will display a Verified badge.
      </p>

      {property && (
        <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-3">
          {property.image ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={property.image} alt="Property" fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 text-left">
            <p className="font-semibold">{property.address || "Verified property"}</p>
            <p className="text-sm text-muted-foreground">{property.suburb || "Switch community"}</p>
          </div>
          <Badge className="rounded-full bg-accent/20 text-accent">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        </div>
      )}

      <Button onClick={onDone} className="h-14 w-full max-w-sm rounded-xl text-base font-medium">
        Done
      </Button>
    </motion.div>
  )
}

function PendingView({
  property,
  onDone,
}: {
  property: { id: string; address: string; suburb: string; image?: string } | null
  onDone: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center"
    >
      <div className="space-y-2">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Verification Submitted</h2>
      </div>

      <p className="max-w-xs text-sm text-muted-foreground">
        We&apos;ve received your verification documents and they&apos;re now being reviewed by our team.
        <br /><br />
        You&apos;ll be notified once your property has been approved.
      </p>

      {property && (
        <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-3">
          {property.image ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={property.image} alt="Property" fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 text-left">
            <p className="font-semibold">{property.address || "Property under review"}</p>
            <p className="text-sm text-muted-foreground">{property.suburb || "Switch community"}</p>
          </div>
          <Badge className="rounded-full bg-primary/20 text-primary">
            <Clock className="mr-1 h-3 w-3" />
            Pending Review
          </Badge>
        </div>
      )}

      <Button onClick={onDone} className="h-14 w-full max-w-sm rounded-xl text-base font-medium">
        Done
      </Button>
    </motion.div>
  )
}
