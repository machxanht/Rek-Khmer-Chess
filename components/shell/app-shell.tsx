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
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="bg-temple min-h-dvh selection:bg-gold/20 selection:text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            onClick={() => sounds.playSelect()}
            aria-label="Rek Khmer home"
            className="rounded-md outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <Logo size="md" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => sounds.playSelect()}
                  className={cn(
                    'group relative flex h-14 items-center gap-2 text-sm font-semibold outline-none transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    'focus-visible:text-gold',
                  )}
                >
                  <item.icon className={cn('size-4', active && 'text-gold')} />
                  <span>{item.label}</span>
                  <span
                    className={cn(
                      'absolute inset-x-0 bottom-0 h-px origin-left bg-gold transition-transform duration-200',
                      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                    )}
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-5 sm:px-6 sm:pt-8 md:pb-12 lg:px-8">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/96 backdrop-blur-md md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid h-[68px] max-w-lg grid-cols-4 px-2">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => sounds.playSelect()}
                className={cn(
                  'relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-md text-[0.68rem] font-semibold outline-none transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground',
                  'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/70',
                )}
              >
                <item.icon className={cn('size-5', active && 'text-gold')} />
                <span className="truncate">{item.label}</span>
                {active && <span className="absolute top-0 h-px w-7 bg-gold" aria-hidden="true" />}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
