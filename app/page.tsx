'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Swords,
  Users,
  Bot,
  Globe,
  BookOpen,
  ChevronRight,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import { AppShell } from '@/components/shell/app-shell'
import { Emblem } from '@/components/brand/logo'
import { sounds } from '@/lib/sound'

export default function HomePage() {
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted())

  const handleToggleMute = () => {
    const muted = sounds.toggleMute()
    setIsMuted(muted)
  }

  return (
    <AppShell>
      {/* Hero Banner with Angkor Temple backdrop & gold glow */}
        <section className="relative overflow-hidden rounded-3xl border border-gold/40 shadow-2xl bg-card/70 transition-all duration-300">
          <img
            src="/images/temple-hero.png"
            alt="Angkor temple towers"
            className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />

          <div className="relative flex flex-col items-start gap-4 px-6 py-8 sm:px-10 sm:py-12">
            <div className="flex items-center justify-between w-full">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-bold text-gold shadow-[0_0_15px_var(--gold-soft)] animate-float">
                <Sparkles className="size-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Angkor Dynasty Strategy</span>
              </div>

              <button
                onClick={handleToggleMute}
                className="flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs font-bold text-muted-foreground border border-border/80 hover:text-gold hover:border-gold/50 backdrop-blur-md transition-all active:scale-95"
              >
                {isMuted ? <VolumeX className="size-3.5 text-destructive" /> : <Volume2 className="size-3.5 text-gold" />}
                <span>{isMuted ? 'Muted' : 'Audio On'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              <Emblem className="size-12 sm:size-14 animate-pulse" />
              <h1 className="font-display text-3xl sm:text-5xl leading-none font-extrabold tracking-tight text-foreground flex flex-wrap items-baseline gap-2">
                <span className="text-gold bg-gradient-to-r from-gold via-amber-300 to-yellow-200 bg-clip-text text-transparent drop-shadow-md">
                  រែកខ្មែរ
                </span>
                <span className="text-foreground/90 font-light text-2xl sm:text-4xl tracking-normal">
                  - Rek Khmer
                </span>
              </h1>
            </div>

            <p className="max-w-lg text-pretty text-muted-foreground text-sm sm:text-base leading-relaxed">
              The authentic Cambodian board game of flanking and encirclement. Move like Rooks, execute glorious <strong className="text-gold font-semibold">Rek (Gánh)</strong> sandwiches, and capture the Royal King!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/play/ai"
                onClick={() => sounds.playSelect()}
                className="group flex h-12 items-center gap-2 rounded-2xl bg-gold px-6 text-sm sm:text-base font-bold text-background shadow-xl shadow-gold/30 ring-2 ring-gold/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-gold/50 active:translate-y-0"
              >
                <Bot className="size-5 transition-transform duration-300 group-hover:scale-110" />
                <span>Play vs AI</span>
                <ChevronRight className="size-4 opacity-75 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/play/local"
                onClick={() => sounds.playSelect()}
                className="flex h-12 items-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-5 text-sm sm:text-base font-bold text-foreground backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:border-gold/40 hover:text-gold"
              >
                <Users className="size-5 text-gold" />
                <span>Pass & Play</span>
              </Link>
              <Link
                href="/play/puzzle"
                onClick={() => sounds.playSelect()}
                className="flex h-12 items-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-5 text-sm sm:text-base font-bold text-foreground backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:border-gold/40 hover:text-gold"
              >
                <Trophy className="size-5 text-gold" />
                <span>King Puzzles</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Mode Cards */}
        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          <ModeCard
            href="/play/local"
            icon={Users}
            title="Pass & Play (2P)"
            desc="Battle against a friend on one device with interactive hints and undo."
            accent="you"
            badge="Local"
          />
          <ModeCard
            href="/play/ai"
            icon={Bot}
            title="Vs AI Grandmaster"
            desc="Practice your strategy against the intelligent Angkor AI bot."
            accent="opp"
            badge="Solo"
          />
          <ModeCard
            href="/play/puzzle"
            icon={Trophy}
            title="7 King Defense Puzzles"
            desc="Authentic tactical formations: Triangle Shield, Dual Column, Radial Guard."
            accent="gold"
            badge="Puzzles"
          />
          <ModeCard
            href="/how-to-play"
            icon={BookOpen}
            title="Rules & Tactics Guide"
            desc="Interactive visual guide on Rek flanking, Poat encirclement, and Hao Rek traps."
            accent="opp"
            badge="Guide"
          />
        </section>
      </AppShell>
  )
}

function ModeCard({
  href,
  icon: Icon,
  title,
  desc,
  accent,
  badge,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  accent: 'you' | 'opp' | 'gold'
  badge?: string
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
      onClick={() => sounds.playSelect()}
      className="group relative flex items-center gap-3.5 overflow-hidden rounded-3xl border border-border/80 bg-card/85 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-xl hover:shadow-black/40 active:scale-[0.99]"
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-md"
        style={{
          background: s.bg,
          color: s.color,
          border: s.border,
        }}
      >
        <Icon className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-bold text-foreground group-hover:text-gold transition-colors">
            {title}
          </h3>
          {badge && (
            <span className="rounded-full bg-gold-soft px-2 py-0.2 text-[0.65rem] font-bold text-gold ring-1 ring-gold/40">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{desc}</p>
      </div>
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground transition-all duration-200 group-hover:bg-gold group-hover:text-background group-hover:translate-x-1">
        <ChevronRight className="size-3.5" />
      </div>
    </Link>
  )
}
