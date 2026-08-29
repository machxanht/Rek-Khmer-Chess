import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Kanit, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-kanit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'រែកខ្មែរ - Rek Khmer',
  description:
    'Play Rek Khmer (ល្បែងរែក), the classic Cambodian strategy game of flanking and encirclement. Local Pass & Play, Vs AI Bot, 7 King Puzzles, and Online Matchmaking.',
  openGraph: {
    title: 'រែកខ្មែរ - Rek Khmer',
    description:
      'Play Rek Khmer (ល្បែងរែក), the classic Cambodian strategy game of flanking and encirclement.',
  },
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#241d14',
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
  return (
    <html lang="en" className={`${inter.variable} ${kanit.variable} bg-background`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
