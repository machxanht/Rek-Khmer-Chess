import type { Metadata } from 'next'
import { AppShell } from '@/components/shell/app-shell'
import { ProfileView } from '@/components/profile/profile-view'

export const metadata: Metadata = {
  title: 'Local Profile — Rek Khmer',
  description: 'Local Rek Khmer player surface with offline play shortcuts and device preferences.',
}

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileView />
    </AppShell>
  )
}
