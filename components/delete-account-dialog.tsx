"use client"

import { useState } from "react"
import { Loader2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  deleteAccount,
  DELETE_REASONS,
  type DeleteReason,
} from "@/lib/delete-account"

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

type Step = "reason" | "confirm" | "deleting" | "done"

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onDeleted,
}: DeleteAccountDialogProps) {
  const [step, setStep] = useState<Step>("reason")
  const [selectedReason, setSelectedReason] = useState<DeleteReason | null>(null)
  const [otherText, setOtherText] = useState("")
  const [error, setError] = useState("")

  const handleClose = () => {
    if (step === "deleting") return
    onOpenChange(false)
    // Reset after close animation.
    setTimeout(() => {
      setStep("reason")
      setSelectedReason(null)
      setOtherText("")
      setError("")
    }, 200)
  }

  const handleContinue = () => {
    setError("")
    setStep("confirm")
  }

  const handleDelete = async () => {
    setStep("deleting")
    const result = await deleteAccount({
      reason: selectedReason ?? undefined,
      optionalText: selectedReason === "Other" ? otherText : undefined,
    })

    if (!result.success) {
      setError(result.error || "Account deletion failed.")
      setStep("confirm")
      return
    }

    setStep("done")
    onDeleted?.()
  }

  const reasonContent = (
    <>
      <DialogHeader>
        <DialogTitle>Why are you deleting your account?</DialogTitle>
        <DialogDescription>
          Your feedback helps us improve Switch My House. This question is optional.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 max-h-[50vh] overflow-y-auto pr-1">
        <RadioGroup
          value={selectedReason ?? ""}
          onValueChange={(value) => setSelectedReason(value as DeleteReason)}
          className="gap-3"
        >
          {DELETE_REASONS.map((reason) => (
            <Label
              key={reason}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 hover:bg-secondary/50"
            >
              <RadioGroupItem value={reason} className="mt-0.5" />
              <span className="text-sm">{reason}</span>
            </Label>
          ))}
        </RadioGroup>

        {selectedReason === "Other" && (
          <Textarea
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Please tell us (optional)"
            className="mt-3 min-h-[80px]"
          />
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter className="flex-col-reverse sm:flex-col-reverse">
        <Button variant="outline" className="w-full rounded-xl" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          className="w-full rounded-xl"
          variant="destructive"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </DialogFooter>
    </>
  )

  const confirmContent = (
    <>
      <DialogHeader className="items-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <Trash2 className="h-6 w-6 text-destructive" />
        </div>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogDescription>
          Deleting your account is permanent and cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <p className="mb-2 text-sm font-semibold">The following information will be removed:</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {["Profile", "Property listings", "Chats", "Saved information", "Account data"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter className="flex-col-reverse sm:flex-col-reverse">
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => setStep("reason")}
          disabled={step === "deleting"}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="w-full rounded-xl"
          onClick={handleDelete}
          disabled={step === "deleting"}
        >
          {step === "deleting" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting…
            </>
          ) : (
            "Delete My Account"
          )}
        </Button>
      </DialogFooter>
    </>
  )

  const doneContent = (
    <>
      <DialogHeader className="items-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Trash2 className="h-6 w-6 text-primary" />
        </div>
        <DialogTitle>Account Deleted</DialogTitle>
        <DialogDescription>
          Your account has been deleted successfully.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button className="w-full rounded-xl" onClick={handleClose}>
          OK
        </Button>
      </DialogFooter>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="rounded-2xl sm:max-w-md"
        showCloseButton={step !== "deleting"}
      >
        {step === "reason" && reasonContent}
        {(step === "confirm" || step === "deleting") && confirmContent}
        {step === "done" && doneContent}
      </DialogContent>
    </Dialog>
  )
}
