import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Beagl Admin Portal",
  description: "Admin dashboard for managing the Beagl property swap platform",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
