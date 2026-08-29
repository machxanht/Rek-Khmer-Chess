import type { Metadata } from "next"
import { AppShell } from "@/components/shell/app-shell"
import { ProfileView } from "@/components/profile/profile-view"

export const metadata: Metadata = {
  title: "Profile — Rek Khmer Chess",
  description: "Your Rek record, rank, and recent matches.",
}

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileView />
    </AppShell>
  )
}
