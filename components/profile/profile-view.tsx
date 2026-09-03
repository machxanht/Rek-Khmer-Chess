'use client'

import Link from 'next/link'
import { ArrowRight, Bot, Settings, Trophy, Users } from 'lucide-react'
import { PieceToken } from '@/components/game/piece-token'

const QUICK_LINKS = [
  {
    href: '/play/local',
    icon: Users,
    eyebrow: 'Local',
    title: 'Pass & Play',
    body: 'Start a two-player match on this device.',
  },
  {
    href: '/play/ai',
    icon: Bot,
    eyebrow: 'Solo',
    title: 'Khmer AI Battle',
    body: 'Practice either engine mode against the built-in AI.',
  },
  {
    href: '/play/puzzle',
    icon: Trophy,
    eyebrow: 'Training',
    title: 'King Defense Puzzles',
    body: 'Work through the published engine-validated positions.',
  },
] as const

export function ProfileView() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-rise">
      <header className="grid gap-6 border-b border-border pb-8 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <div className="flex size-20 items-center justify-center border border-gold/30 bg-card p-2 sm:size-24">
          <PieceToken piece={{ player: 'you', king: true, id: 'local-profile' }} size="board" />
        </div>

        <div>
          <p className="rk-eyebrow">Local profile</p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-foreground">Bopha Nak</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            This offline build does not claim a cloud rating, competitive rank, online match history, or achievement system. Gameplay progress is currently centered on Local, AI, and Puzzle modes.
          </p>
        </div>

        <Link
          href="/settings"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <Settings className="size-4" />
          Preferences
        </Link>
      </header>

      <section className="py-8">
        <p className="rk-eyebrow">Continue playing</p>
        <div className="mt-3 divide-y divide-border border-y border-border">
          {QUICK_LINKS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group grid min-h-[112px] grid-cols-[auto_1fr_auto] items-center gap-4 py-4 outline-none transition-colors hover:bg-card/32 focus-visible:bg-card/42 sm:gap-6 sm:px-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-black text-muted-foreground">0{index + 1}</span>
                <span className="flex size-10 items-center justify-center border border-border bg-card text-gold">
                  <item.icon className="size-4" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="rk-eyebrow">{item.eyebrow}</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground transition-colors group-hover:text-gold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-gold" />
            </Link>
          ))}
        </div>
      </section>

      <aside className="border border-border bg-card/40 p-4 sm:p-5">
        <p className="rk-eyebrow">What is stored now</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Board theme, animation, tactical hints, sound, and Khmer voice preferences are device-local. Persistent ratings and online history should only appear after a real account/data system exists.
        </p>
      </aside>
    </div>
  )
}
