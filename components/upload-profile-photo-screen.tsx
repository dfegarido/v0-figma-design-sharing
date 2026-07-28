"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Camera, Image as ImageIcon, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface UploadProfilePhotoScreenProps {
  onBack: () => void
}

export function UploadProfilePhotoScreen({ onBack }: UploadProfilePhotoScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || cancelled) return
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single()
      if (!data || cancelled) return
      setCurrentUserName(data.full_name || "")
      setCurrentAvatarUrl(data.avatar_url || null)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  const handlePick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.")
      return
    }
    setSelectedFile(file)
  }

  const handleSave = useCallback(async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const path = `avatars/${user.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(path, selectedFile, { contentType: "image/jpeg" })

      if (uploadError) {
        const msg = uploadError.message || ""
        if (msg.toLowerCase().includes("bucket not found")) {
          throw new Error("Storage bucket does not exist. Please create it in Supabase Dashboard.")
        }
        if (
          msg.toLowerCase().includes("row-level security") ||
          msg.toLowerCase().includes("violates row-level")
        ) {
          throw new Error("Storage policy blocks uploads. Run the storage RLS fix migration.")
        }
        throw uploadError
      }

      const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id)

      if (updateError) throw updateError
      toast.success("Profile photo updated.")
      onBack()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload photo."
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }, [selectedFile, onBack])

  const displayUrl = previewUrl || currentAvatarUrl || null
  const displayName = currentUserName || "User"

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Profile Photo</h2>
        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 px-6 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 140 }}
          className="relative"
        >
          <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-card shadow-xl">
            {displayUrl ? (
              <Image src={displayUrl} alt={displayName} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-semibold text-muted-foreground">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          {previewUrl && (
            <div className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-card bg-accent shadow">
              <Check className="h-4 w-4 text-accent-foreground" />
            </div>
          )}
        </motion.div>

        <p className="text-center text-sm text-muted-foreground">
          {previewUrl
            ? "Photo selected. Tap Save to update your profile."
            : "Choose a new profile photo from your device."}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          onClick={handlePick}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground shadow"
        >
          <ImageIcon className="h-5 w-5" />
          Choose from Library
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handlePick}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 font-semibold text-foreground"
        >
          <Camera className="h-5 w-5" />
          Take Photo
        </motion.button>

        <div className="mt-auto w-full">
          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={handleSave}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
