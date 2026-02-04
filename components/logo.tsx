"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 32 },
    md: { width: 180, height: 48 },
    lg: { width: 240, height: 64 },
  };

  const { width, height } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={height}
        height={height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Infinity symbol made of two house shapes */}
        <path
          d="M16 32C16 32 8 24 8 18C8 12 12 8 18 8C24 8 28 14 32 20C36 14 40 8 46 8C52 8 56 12 56 18C56 24 48 32 48 32C48 32 56 40 56 46C56 52 52 56 46 56C40 56 36 50 32 44C28 50 24 56 18 56C12 56 8 52 8 46C8 40 16 32 16 32Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        {/* Left house roof */}
        <path
          d="M12 28L18 22L24 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        {/* Right house roof */}
        <path
          d="M40 28L46 22L52 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
      </svg>
      <span
        className="font-semibold tracking-tight text-foreground"
        style={{ fontSize: height * 0.4 }}
      >
        Switch My House
      </span>
    </div>
  );
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Infinity symbol made of two house shapes */}
      <path
        d="M16 32C16 32 8 24 8 18C8 12 12 8 18 8C24 8 28 14 32 20C36 14 40 8 46 8C52 8 56 12 56 18C56 24 48 32 48 32C48 32 56 40 56 46C56 52 52 56 46 56C40 56 36 50 32 44C28 50 24 56 18 56C12 56 8 52 8 46C8 40 16 32 16 32Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      {/* Left house roof */}
      <path
        d="M12 28L18 22L24 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      {/* Right house roof */}
      <path
        d="M40 28L46 22L52 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
    </svg>
  );
}
