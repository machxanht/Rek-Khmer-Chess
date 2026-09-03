import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import type { CSSProperties } from 'react'
import { PreferencesHydrator } from '@/components/settings/preferences-hydrator'
import './globals.css'
import './offline-preferences.css'

const systemFontVariables = {
  '--font-inter':
    '"Noto Sans Khmer", "Khmer OS System", "Leelawadee UI", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  '--font-kanit':
    '"Noto Serif Khmer", "Khmer OS Muol Light", Georgia, "Times New Roman", serif',
} as CSSProperties

export const metadata: Metadata = {
  title: 'រែកខ្មែរ - Rek Khmer',
  description:
    'Play Rek Khmer (ល្បែងរែក), the Cambodian strategy game of flanking and encirclement. Practice with Local Pass & Play, Khmer AI, and tactical puzzles.',
  openGraph: {
    title: 'រែកខ្មែរ - Rek Khmer',
    description:
      'Play Rek Khmer (ល្បែងរែក), the Cambodian strategy game of flanking and encirclement.',
  },
  generator: 'Rek Khmer',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#15120e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const analyticsEnabled = process.env.VERCEL === '1'

  return (
    <html lang="en" className="bg-background" style={systemFontVariables}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <PreferencesHydrator />
        {children}
        {analyticsEnabled && <Analytics />}
      </body>
    </html>
  )
}
