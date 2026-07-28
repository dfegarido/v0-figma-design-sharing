"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Camera, User, Phone, FileText, MapPin, Mail } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface EditProfileScreenProps {
  onBack: () => void
}

interface ProfileData {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
  address: string | null
  suburb: string | null
  email: string | null
}

export function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [address, setAddress] = useState("")
  const [suburb, setSuburb] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, phone, bio, address, suburb")
        .eq("id", user.id)
        .single()

      if (data) {
        const mapped: ProfileData = {
          id: data.id,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          phone: data.phone,
          bio: data.bio,
          address: data.address,
          suburb: data.suburb,
          email: user.email || null,
        }
        setProfile(mapped)
        setFullName(data.full_name || "")
        setEmail(user.email || "")
        setPhone(data.phone || "")
        setBio(data.bio || "")
        setAddress(data.address || "")
        setSuburb(data.suburb || "")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const handleSave = useCallback(async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          bio: bio.trim() || null,
          address: address.trim() || null,
          suburb: suburb.trim() || null,
        })
        .eq("id", profile.id)

      if (error) throw error
      toast.success("Profile updated.")
      onBack()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile."
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }, [profile, fullName, phone, bio, address, suburb, onBack])

  const displayName = fullName || profile?.full_name || "User"
  const avatarUrl = profile?.avatar_url || ""

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <div className="w-10" />
      </div>

      {loading ? (
        <div className="flex-1 space-y-6 px-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <div className="space-y-6">
              {/* Avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 120 }}
                className="flex flex-col items-center gap-2"
              >
                <button
                  className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-card shadow-lg"
                  aria-label="Change profile photo"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-semibold text-muted-foreground">
                      {displayName.charAt(0)}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-card bg-primary shadow">
                    <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                </button>
                <p className="text-sm text-muted-foreground">Tap to change photo</p>
              </motion.div>

              {/* Form */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0 }}
                  className="space-y-1.5"
                >
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="rounded-lg"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="space-y-1.5"
                >
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </Label>
                  <Input
                    value={email}
                    disabled
                    placeholder="Your email address"
                    className="rounded-lg"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-1.5"
                >
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="rounded-lg"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-1.5"
                >
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" /> Bio
                  </Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others a bit about yourself"
                    className="min-h-[100px] rounded-lg"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1.5"
                >
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> Address
                  </Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your street address"
                    className="rounded-lg"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-1.5"
                >
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> Suburb
                  </Label>
                  <Input
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    placeholder="Enter your suburb"
                    className="rounded-lg"
                  />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="border-t border-border px-4 py-4">
            <Button
              className="w-full rounded-xl"
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
