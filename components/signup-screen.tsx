"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Home,
  Building2,
  Landmark,
  LayoutGrid,
  Flag,
  ChevronDown,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { Slider } from "@/components/ui/slider"
import { AuthLayout } from "./auth/auth-layout"
import { AuthFormField } from "./auth/auth-form-field"
import { AuthPrimaryButton } from "./auth/auth-primary-button"
import { AuthOutlineButton } from "./auth/auth-outline-button"
import { ProgressDots } from "./auth/progress-dots"
import { completeSignup } from "@/lib/signup"
import { useAuth } from "@/context/auth-context"

interface SignupScreenProps {
  onBack: () => void
  onNavigateLogin: () => void
}

const STEPS = [
  { title: "Create Account", subtitle: "Start your home exchange experience." },
  { title: "Your Address", subtitle: "We need to know how to contact you" },
  { title: "What Do You Want?", subtitle: "Tell us your preferences" },
  { title: "Property Type", subtitle: "What type of property are you after?" },
  { title: "Land Size", subtitle: "How much land do you need?" },
  { title: "Features", subtitle: "Pick features that matter to you" },
]

const FEATURES = [
  "Pool",
  "Garden",
  "Ocean View",
  "City View",
  "Mountain View",
  "Granny Flat",
  "Garage",
  "Solar Panels",
  "Renovated",
  "Heritage",
  "Smart Home",
  "Fireplace",
  "Pet Friendly",
  "Quiet Street",
]

const PROPERTY_TYPES = [
  { key: "House", icon: Home },
  { key: "Apartment", icon: Building2 },
  { key: "Townhouse", icon: Landmark },
  { key: "Unit", icon: LayoutGrid },
  { key: "Land", icon: Flag },
]

const NUMBER_OPTIONS = ["1", "2", "3", "4", "5+"]

type PickerField = "minBedrooms" | "minBathrooms" | "minCarBays"

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value}`
}

export function SignupScreen({ onBack, onNavigateLogin }: SignupScreenProps) {
  const { startSignupTransition, endSignupTransition, cancelSignupTransition } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [ownsHome, setOwnsHome] = useState(true)
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [pickerField, setPickerField] = useState<PickerField | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    address: "",
    regionSuburb: "",
    minBedrooms: "",
    minBathrooms: "",
    minCarBays: "",
    minSqm2: "",
    costLow: 500_000,
    costHigh: 1_200_000,
    landSizeLow: 0,
    landSizeHigh: 2_000,
  })

  const updateField = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const togglePropertyType = (type: string) => {
    setPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }

  const handleContinue = () => {
    if (step < 6) {
      setStep((s) => s + 1)
    } else {
      void handleFinish()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1)
    } else {
      onBack()
    }
  }

  const handleFinish = async () => {
    const { email, password, firstName, lastName } = formData
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }

    startSignupTransition()
    setLoading(true)

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 2000))
    const signupPromise = completeSignup(
      { email: email.trim(), password: password.trim() },
      {
        firstName,
        lastName,
        address: formData.address,
        ownsHome,
        regionSuburb: formData.regionSuburb,
        minBedrooms: formData.minBedrooms,
        minBathrooms: formData.minBathrooms,
        minCarBays: formData.minCarBays,
        minSqm2: formData.minSqm2,
        costLow: formData.costLow,
        costHigh: formData.costHigh,
        propertyTypes,
        landSizeLow: formData.landSizeLow,
        landSizeHigh: formData.landSizeHigh,
        features: selectedFeatures,
      }
    )

    const [, result] = await Promise.all([minDelay, signupPromise])
    setLoading(false)

    if (result.error) {
      cancelSignupTransition()
      toast.error(result.error.message)
      return
    }

    endSignupTransition()
  }

  const pickerLabel =
    pickerField === "minBedrooms"
      ? "Bedrooms"
      : pickerField === "minBathrooms"
        ? "Bathrooms"
        : pickerField === "minCarBays"
          ? "Car bays"
          : ""

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <AuthFormField
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              leftIcon={<User className="h-5 w-5 text-[#717171]" />}
            />
            <AuthFormField
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              leftIcon={<User className="h-5 w-5 text-[#717171]" />}
            />
            <AuthFormField
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              autoComplete="email"
              leftIcon={<Mail className="h-5 w-5 text-[#717171]" />}
            />
            <AuthFormField
              label="Password"
              placeholder="Create a password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              autoComplete="new-password"
              leftIcon={<Lock className="h-5 w-5 text-[#717171]" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="p-1 text-[#717171]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />
            <p className="text-xs text-[#717171]">
              Password must be at least 8 characters and include a number and a special character.
            </p>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <AuthFormField
              label="Your Address"
              placeholder="Start typing your address..."
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setOwnsHome((value) => !value)}
              className="ml-auto flex items-center gap-3"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                  ownsHome ? "border-[#FF5A5F] bg-[#FF5A5F]" : "border-[#EAEAEA] bg-transparent"
                }`}
              >
                {ownsHome && <Check className="h-3.5 w-3.5 text-white" />}
              </div>
              <span className="text-base text-[#222222]">I own a home</span>
            </button>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <AuthFormField
              label="Region or suburb"
              value={formData.regionSuburb}
              onChange={(e) => updateField("regionSuburb", e.target.value)}
            />

            {(
              [
                { key: "minBedrooms" as const, label: "Minimum Bedrooms" },
                { key: "minBathrooms" as const, label: "Minimum Bathrooms" },
                { key: "minCarBays" as const, label: "Minimum car bays" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-[#222222]">{label}</label>
                <button
                  type="button"
                  onClick={() => setPickerField(key)}
                  className="flex min-h-[58px] w-full items-center gap-2 rounded-[18px] border border-[#EAEAEA] bg-white px-4 text-left"
                >
                  <span
                    className={`flex-1 text-base ${
                      formData[key] ? "text-[#222222]" : "text-[#717171]"
                    }`}
                  >
                    {formData[key] || "Select minimum"}
                  </span>
                  <ChevronDown className="h-5 w-5 text-[#717171]" />
                </button>
              </div>
            ))}

            <AuthFormField
              label="Minimum Sqm2"
              value={formData.minSqm2}
              onChange={(e) => updateField("minSqm2", e.target.value)}
              inputMode="numeric"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#222222]">Cost</label>
              <Slider
                value={[formData.costLow, formData.costHigh]}
                min={0}
                max={5_000_000}
                step={50_000}
                onValueChange={([low, high]) => {
                  updateField("costLow", low)
                  updateField("costHigh", high)
                }}
                className="py-2"
              />
              <div className="flex justify-between text-sm text-[#717171]">
                <span>{formatCurrency(formData.costLow)}</span>
                <span>{formatCurrency(formData.costHigh)}</span>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-center text-base text-[#717171]">Select all that interest you</p>
            <div className="grid grid-cols-2 gap-4">
              {PROPERTY_TYPES.map(({ key, icon: Icon }) => {
                const selected = propertyTypes.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePropertyType(key)}
                    className={`relative flex aspect-[1.4] flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-colors ${
                      selected
                        ? "border-[#FF5A5F] bg-[#FF5A5F14]"
                        : "border-[#EAEAEA] bg-white"
                    }`}
                  >
                    {selected && (
                      <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A5F]">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <Icon className={`h-8 w-8 ${selected ? "text-[#FF5A5F]" : "text-[#717171]"}`} />
                    <span
                      className={`text-base ${
                        selected ? "font-semibold text-[#FF5A5F]" : "text-[#222222]"
                      }`}
                    >
                      {key}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <p className="text-center text-base text-[#717171]">Enter your preferred land size</p>
            <AuthFormField
              label="Land size (m²)"
              placeholder="e.g. 500"
              value={formData.landSizeLow > 0 ? String(formData.landSizeLow) : ""}
              onChange={(e) => updateField("landSizeLow", Number(e.target.value) || 0)}
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 w-full text-center text-base text-[#FF5A5F] underline"
            >
              I don&apos;t mind
            </button>
          </div>
        )

      case 6:
        return (
          <div className="flex flex-wrap justify-center gap-2">
            {FEATURES.map((feature) => {
              const selected = selectedFeatures.includes(feature)
              return (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`rounded-xl border-[1.5px] px-5 py-3 text-base transition-colors ${
                    selected
                      ? "border-[#FF5A5F] bg-[#FF5A5F] font-semibold text-white"
                      : "border-[#EAEAEA] bg-white text-[#222222]"
                  }`}
                >
                  {feature}
                </button>
              )
            })}
          </div>
        )

      default:
        return null
    }
  }

  const cardFooter =
    step === 1 ? (
      <AuthPrimaryButton onClick={handleContinue} loading={loading} className="mt-2">
        Continue
      </AuthPrimaryButton>
    ) : (
      <div className="mt-2 flex gap-3">
        <AuthOutlineButton soft onClick={handleBack} className="flex-1">
          Back
        </AuthOutlineButton>
        <AuthPrimaryButton onClick={handleContinue} loading={loading} className="flex-1">
          {loading
            ? step === 6
              ? "Creating Account..."
              : "Please wait..."
            : step === 6
              ? "Finish"
              : "Next"}
        </AuthPrimaryButton>
      </div>
    )

  return (
    <>
      <AuthLayout
        title={STEPS[step - 1].title}
        subtitle={STEPS[step - 1].subtitle}
        cardTop={<ProgressDots step={step} />}
        cardFooter={cardFooter}
        footer={
          <div className="flex justify-center gap-1 text-sm">
            <span className="text-[#717171]">Already have an account?</span>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-medium text-[#FF5A5F] hover:underline"
            >
              Log In
            </button>
          </div>
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </AuthLayout>

      <AnimatePresence>
        {pickerField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={() => setPickerField(null)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg rounded-t-3xl bg-white px-6 pb-8 pt-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-center text-xl font-semibold text-[#222222]">
                {pickerLabel}
              </h3>
              <div className="space-y-2">
                {NUMBER_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      updateField(pickerField, opt)
                      setPickerField(null)
                    }}
                    className={`w-full rounded-xl border px-5 py-4 text-left text-base font-semibold transition-colors ${
                      formData[pickerField] === opt
                        ? "border-[#FF5A5F] bg-[#FF5A5F] text-white"
                        : "border-[#EAEAEA] bg-[#F7F7F7] text-[#222222]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
