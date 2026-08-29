import type { Metadata } from "next"
import { AppShell } from "@/components/shell/app-shell"
import { SettingsView } from "@/components/settings/settings-view"

export const metadata: Metadata = {
  title: "Settings — Rek Khmer Chess",
  description: "Tune your board, sound, and gameplay preferences.",
}

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsView />
    </AppShell>
  )
}
