'use client'

import Link from 'next/link'
import { ArrowRight, Bot, Globe, Swords, Trophy, Users } from 'lucide-react'
import { AppShell } from '@/components/shell/app-shell'
import { sounds } from '@/lib/sound'

const PLAYABLE = [
  {
    href: '/play/local',
    icon: Users,
    number: '01',
    label: 'LOCAL MATCH',
    title: 'Pass & Play',
    description: 'Two players share one device. Full engine rules, undo, and tactical move hints.',
    detail: '2 players · offline',
    tone: 'you' as const,
  },
  {
    href: '/play/ai',
    icon: Bot,
    number: '02',
    label: 'SOLO MATCH',
    title: 'Khmer AI Battle',
    description: 'Play Rek Poat or Min Rek Chanh against Apprentice, Veteran, or Grandmaster difficulty.',
    detail: '1 player · 3 difficulties',
    tone: 'opp' as const,
  },
  {
    href: '/play/puzzle',
    icon: Trophy,
    number: '03',
    label: 'TACTICAL TRAINING',
    title: 'King Defense Puzzles',
    description: 'Seven published positions validated against the same engine used in normal matches.',
    detail: '7 puzzles · engine validated',
    tone: 'gold' as const,
  },
]

export default function PlayPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <header className="grid gap-5 border-b border-border pb-7 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-7">
          <div className="flex size-14 items-center justify-center border border-border bg-card text-gold">
            <Swords className="size-6" />
          </div>
          <div>
            <p className="rk-eyebrow">Select battlefield</p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Choose Game Mode
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Local, AI, and Puzzle modes all use the same Rek Khmer engine. Pick the kind of pressure you want to practice.
            </p>
          </div>
        </header>

        <section className="divide-y divide-border border-b border-border">
          {PLAYABLE.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              onClick={() => sounds.playSelect()}
              className="group grid min-h-[148px] grid-cols-[auto_1fr_auto] items-center gap-4 py-5 outline-none transition-colors hover:bg-card/32 focus-visible:bg-card/42 sm:gap-7 sm:px-3"
            >
              <div className="hidden font-mono text-xs font-bold text-muted-foreground sm:block">{mode.number}</div>

              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={`flex size-9 items-center justify-center border ${
                      mode.tone === 'you'
                        ? 'border-you/35 bg-you-soft text-you'
                        : mode.tone === 'opp'
                          ? 'border-opp/35 bg-opp-soft text-opp'
                          : 'border-gold/35 bg-gold-soft text-gold'
                    }`}
                  >
                    <mode.icon className="size-4" />
                  </span>
                  <span className="rk-eyebrow">{mode.label}</span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground transition-colors group-hover:text-gold sm:text-3xl">
                  {mode.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{mode.description}</p>
                <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                  {mode.detail}
                </p>
              </div>

              <ArrowRight className="size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-gold" />
            </Link>
          ))}
        </section>

        <section className="mt-8 grid gap-4 border border-border bg-card/32 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:p-6">
          <div className="flex size-10 items-center justify-center border border-border text-muted-foreground">
            <Globe className="size-4" />
          </div>
          <div>
            <p className="rk-eyebrow">Online multiplayer</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Coming after offline polish</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Networking stays out of the critical path while Local, AI, and Puzzle gameplay are being refined.
            </p>
          </div>
          <span className="w-fit border border-border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Not primary
          </span>
        </section>
      </div>
    </AppShell>
  )
}
