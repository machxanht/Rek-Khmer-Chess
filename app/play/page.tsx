'use client'

import Link from 'next/link'
import { Users, Bot, BookOpen, Globe, ChevronRight, Swords, Sparkles, Trophy } from 'lucide-react'
import { AppShell } from '@/components/shell/app-shell'

export default function PlayPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl animate-fade-rise">
        <header className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-semibold text-gold shadow-sm mb-2">
            <Swords className="size-3.5" />
            <span>Select Battlefield</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Choose Game Mode
          </h1>
          <p className="mt-1.5 text-muted-foreground text-sm sm:text-base">
            Every mode uses the authentic 8×8 tactical board with authentic Rek flanking and Poat encirclement rules.
          </p>
        </header>

        <div className="grid gap-4">
          <BigMode
            href="/play/local"
            icon={Users}
            title="Pass & Play (2 Players)"
            desc="Battle against a friend on one device with interactive move hints and undo support."
            accent="you"
            tag="Local 2P"
          />

          <BigMode
            href="/play/ai"
            icon={Bot}
            title="Vs Khmer AI Master"
            desc="Practice against the AI bot with 3 strategic levels: Apprentice, Veteran, and Grandmaster."
            accent="opp"
            tag="Solo AI"
          />

          <BigMode
            href="/play/puzzle"
            icon={Trophy}
            title="King Defense Puzzles"
            desc="Master the 7 authentic Angkor tactical puzzles: Triangle Shield, Dual Column, and Hao Rek Counter-Trap."
            accent="gold"
            tag="7 Levels"
          />

          <BigMode
            href="/play/online"
            icon={Globe}
            title="Online Matchmaking"
            desc="Match with real players or create private rooms with 6-digit invite codes."
            accent="opp"
            tag="P2P Multiplayer"
          />
        </div>
      </div>
    </AppShell>
  )
}

function BigMode({
  href,
  icon: Icon,
  title,
  desc,
  accent,
  tag,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  accent: 'you' | 'opp' | 'gold'
  tag: string
}) {
  const getStyle = () => {
    if (accent === 'you') {
      return {
        bg: 'var(--you-soft)',
        color: 'var(--you)',
        border: '1px solid oklch(0.66 0.23 28 / 0.5)',
      }
    }
    if (accent === 'opp') {
      return {
        bg: 'var(--opp-soft)',
        color: 'var(--opp)',
        border: '1px solid oklch(0.76 0.16 175 / 0.5)',
      }
    }
    return {
      bg: 'var(--gold-soft)',
      color: 'var(--gold)',
      border: '1px solid oklch(0.86 0.16 82 / 0.5)',
    }
  }

  const s = getStyle()

  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl hover:shadow-black/40 active:scale-[0.99]"
    >
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105"
        style={{
          background: s.bg,
          color: s.color,
          border: s.border,
        }}
      >
        <Icon className="size-7" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-gold transition-colors">
            {title}
          </h3>
          <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-[0.68rem] font-bold text-gold ring-1 ring-gold/40">
            {tag}
          </span>
        </div>
        <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground leading-snug">{desc}</p>
      </div>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground transition-all duration-200 group-hover:bg-gold group-hover:text-background group-hover:translate-x-1">
        <ChevronRight className="size-4" />
      </div>
    </Link>
  )
}
