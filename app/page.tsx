import { AppShell } from "@/components/app-shell";

// Avoid static prerender requiring Supabase env at build time.
export const dynamic = "force-dynamic";

export default function Home() {
  return <AppShell />;
}
