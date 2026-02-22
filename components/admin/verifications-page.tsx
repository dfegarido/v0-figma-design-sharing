"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
} from "lucide-react"
import { mockVerifications, type AdminVerification } from "./mock-data"

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  approved: "bg-accent/10 text-accent-foreground border-accent/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

const docLabels: Record<string, string> = {
  "title-deed": "Title Deed",
  "rates-notice": "Rates Notice",
  "utility-bill": "Utility Bill",
}

export function VerificationsPage() {
  const [verifications, setVerifications] = useState(mockVerifications)
  const [rejectDialog, setRejectDialog] = useState<AdminVerification | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [selectedVerification, setSelectedVerification] = useState<AdminVerification | null>(null)

  const pending = verifications.filter((v) => v.status === "pending")
  const processed = verifications.filter((v) => v.status !== "pending")

  const handleApprove = (id: string) => {
    setVerifications((prev) => prev.map((v) => v.id === id ? { ...v, status: "approved" as const } : v))
    setSelectedVerification(null)
  }

  const handleReject = (id: string) => {
    setVerifications((prev) => prev.map((v) => v.id === id ? { ...v, status: "rejected" as const } : v))
    setRejectDialog(null)
    setRejectReason("")
    setSelectedVerification(null)
  }

  const stats = [
    { label: "Pending Review", value: pending.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Approved", value: verifications.filter((v) => v.status === "approved").length, icon: ShieldCheck, color: "text-accent-foreground", bg: "bg-accent/10" },
    { label: "Rejected", value: verifications.filter((v) => v.status === "rejected").length, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-mono">Verifications</h1>
        <p className="text-sm text-muted-foreground">Review ownership verification requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Queue */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">PENDING REVIEW ({pending.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map((v) => (
              <Card key={v.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={v.userAvatar} />
                      <AvatarFallback className="text-xs">{v.userName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-foreground">{v.userName}</p>
                        <Badge variant="outline" className={`text-[10px] ${statusColors.pending}`}>
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.propertyAddress}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <FileText className="h-3 w-3" />
                          {docLabels[v.documentType]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">Submitted {v.submittedDate}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" className="h-7 text-xs" onClick={() => handleApprove(v.id)}>
                          <CheckCircle className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive hover:text-destructive bg-transparent"
                          onClick={() => setRejectDialog(v)}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setSelectedVerification(v)}
                        >
                          <MessageSquare className="mr-1 h-3.5 w-3.5" />
                          More Info
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed History */}
      {processed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">PROCESSED ({processed.length})</h2>
          <div className="space-y-2">
            {processed.map((v) => (
              <Card key={v.id} className="bg-card/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={v.userAvatar} />
                      <AvatarFallback className="text-[10px]">{v.userName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{v.userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{v.propertyAddress}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <FileText className="h-3 w-3" />
                      {docLabels[v.documentType]}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] capitalize ${statusColors[v.status]}`}>
                      {v.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason("") }}>
        <DialogContent>
          {rejectDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {"Reject " + rejectDialog.userName + "'s Verification?"}
                </DialogTitle>
                <DialogDescription>
                  Please provide a reason for rejection. The user will be notified.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason("") }}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleReject(rejectDialog.id)} disabled={!rejectReason.trim()}>
                  Reject Verification
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Request More Info Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent>
          {selectedVerification && (
            <>
              <DialogHeader>
                <DialogTitle>Request More Information</DialogTitle>
                <DialogDescription>
                  {"Send a message to " + selectedVerification.userName + " requesting additional verification documents."}
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Please provide additional documentation such as..."
                rows={4}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedVerification(null)}>Cancel</Button>
                <Button onClick={() => setSelectedVerification(null)}>Send Request</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
