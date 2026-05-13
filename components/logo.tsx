"use client";

import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = "md", className = "", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 14 },
    md: { icon: 40, text: 18 },
    lg: { icon: 56, text: 24 },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="Switch My House"
        width={icon}
        height={icon}
        className="object-contain"
      />
      {showText && (
        <span
          className="font-semibold tracking-tight text-foreground"
          style={{ fontSize: text }}
        >
          Switch My House
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Switch My House"
      width={size}
      height={size}
      className="object-contain"
    />
  );
}
