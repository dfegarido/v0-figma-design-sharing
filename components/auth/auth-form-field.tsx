"use client"

import { useState, type InputHTMLAttributes, type ReactNode } from "react"

interface AuthFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  error?: string
}

export function AuthFormField({
  label,
  leftIcon,
  rightIcon,
  error,
  className = "",
  ...props
}: AuthFormFieldProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#222222]">{label}</label>
      <div
        className={`flex min-h-[48px] items-center gap-2 rounded-[14px] border bg-white px-3 transition-colors ${
          focused ? "border-[#FF5A5F]" : "border-[#EAEAEA]"
        } ${className}`}
      >
        {leftIcon}
        <input
          {...props}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className="min-h-[48px] w-full flex-1 bg-transparent text-sm text-[#222222] outline-none placeholder:text-[#717171]"
        />
        {rightIcon}
      </div>
      {error && <p className="text-xs text-[#E76F61]">{error}</p>}
    </div>
  )
}
