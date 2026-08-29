'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Swords, BookOpen, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'
import { sounds } from '@/lib/sound'

const NAV = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/play', label: 'Play', icon: Swords },
  { href: '/play/puzzle', label: 'Puzzles', icon: Trophy },
  { href: '/how-to-play', label: 'Rules', icon: BookOpen },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || (href !== '/' && pathname.startsWith(href))
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="bg-temple min-h-dvh flex flex-col selection:bg-gold/30 selection:text-gold">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            onClick={() => sounds.playSelect()}
            aria-label="Rek Khmer home"
            className="transition-all duration-300 hover:opacity-90 active:scale-95"
          >
            <Logo size="md" />
          </Link>
          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => sounds.playSelect()}
                  className={cn(
                    'relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
                    active
                      ? 'bg-gold/15 text-gold shadow-sm ring-1 ring-gold/40'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground active:scale-95',
                  )}
                >
                  <item.icon
                    className={cn(
                      'size-4 transition-transform duration-200',
                      active && 'scale-110 text-gold',
                    )}
                  />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold rounded-full shadow-[0_0_8px_var(--gold)]" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 md:px-6 md:pb-12 animate-fade-rise">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-2xl shadow-2xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 py-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => sounds.playSelect()}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2 text-[0.72rem] font-bold transition-all duration-200 active:scale-90',
                  active ? 'text-gold font-bold' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl transition-all duration-300',
                    active
                      ? 'bg-gold/20 text-gold ring-1 ring-gold/50 shadow-[0_0_12px_var(--gold-soft)] scale-105'
                      : 'bg-transparent',
                  )}
                >
                  <item.icon className="size-5" />
                </span>
                <span>{item.label}</span>
                {active && (
                  <span className="absolute top-1 size-1 bg-gold rounded-full shadow-[0_0_6px_var(--gold)]" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
