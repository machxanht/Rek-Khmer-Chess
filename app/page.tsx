'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  BookOpen,
  Settings,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { AppShell } from '@/components/shell/app-shell'
import { Emblem } from '@/components/brand/logo'
import { sounds } from '@/lib/sound'

const MODES = [
  {
    href: '/play/local',
    icon: Users,
    kicker: 'Local',
    title: 'Pass & Play',
    desc: 'Two players, one board, no account required.',
  },
  {
    href: '/play/ai',
    icon: Bot,
    kicker: 'Solo',
    title: 'Khmer AI Battle',
    desc: 'Practice Rek Poat or Min Rek Chanh against the existing engine-driven AI.',
  },
  {
    href: '/play/puzzle',
    icon: Trophy,
    kicker: 'Training',
    title: 'King Defense Puzzles',
    desc: 'Seven engine-validated tactical positions built around Rek and Poat.',
  },
] as const

export default function HomePage() {
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted())

  const toggleSound = () => {
    setIsMuted(sounds.toggleMute())
  }

  return (
    <AppShell>
      <section className="grid items-stretch gap-8 border-b border-border pb-9 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:pb-12">
        <div className="flex flex-col justify-center py-3 lg:py-10">
          <div className="mb-6 flex items-center gap-3">
            <Emblem className="size-10 opacity-90 sm:size-12" />
            <div>
              <p className="rk-eyebrow">Cambodian strategy board game</p>
              <p className="mt-1 text-xs text-muted-foreground">រែក • flanking • encirclement</p>
            </div>
          </div>

          <h1 className="font-display text-[clamp(3.4rem,9vw,7.6rem)] leading-[0.82] tracking-[-0.045em] text-foreground">
            <span className="block text-gold">រែកខ្មែរ</span>
            <span className="mt-3 block text-[0.46em] font-semibold tracking-[-0.02em] text-foreground/92">
              Rek Khmer
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
            A quiet board, sharp geometry, and two ways to take space: intervene with Rek or close every liberty with Poat.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/play"
              onClick={() => sounds.playSelect()}
              className="group inline-flex h-12 items-center gap-3 rounded-md bg-gold px-5 text-sm font-extrabold text-background outline-none transition-colors hover:bg-[#e3c783] focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>Play</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/how-to-play"
              onClick={() => sounds.playSelect()}
              className="inline-flex h-12 items-center gap-2 rounded-md border border-border bg-card/45 px-4 text-sm font-semibold text-foreground outline-none transition-colors hover:border-gold/35 hover:bg-accent focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              <BookOpen className="size-4 text-gold" />
              <span>How to Play</span>
            </Link>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={isMuted ? 'Enable sound' : 'Mute sound'}
              className="inline-flex size-12 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground outline-none transition-colors hover:border-gold/35 hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
        </div>

        <div className="relative min-h-[340px] overflow-hidden border border-border bg-card sm:min-h-[430px] lg:min-h-[560px]">
          <img
            src="/images/temple-hero.png"
            alt="Angkor temple towers"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-72 grayscale-[18%] contrast-[1.06]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,18,14,0.03),rgba(21,18,14,0.25)_45%,rgba(21,18,14,0.96))]" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <div className="mb-4 rk-rule" />
            <div className="grid grid-cols-3 gap-3 text-xs sm:text-sm">
              <Fact label="Board" value="8×8" />
              <Fact label="Movement" value="Orthogonal" />
              <Fact label="Core" value="Rek → Poat" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="rk-eyebrow">Offline modes</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">Choose your board</h2>
          </div>
          <Link
            href="/settings"
            className="inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <Settings className="size-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {MODES.map((mode, index) => (
            <Link
              key={mode.href}
              href={mode.href}
              onClick={() => sounds.playSelect()}
              className="group grid min-h-[104px] grid-cols-[auto_1fr_auto] items-center gap-4 py-4 outline-none transition-colors hover:bg-card/35 focus-visible:bg-card/45 sm:gap-6 sm:px-3"
            >
              <div className="flex size-11 items-center justify-center border border-border bg-card text-gold sm:size-12">
                <mode.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">0{index + 1}</span>
                  <span className="rk-eyebrow">{mode.kicker}</span>
                </div>
                <h3 className="mt-1 font-display text-xl font-semibold text-foreground transition-colors group-hover:text-gold">
                  {mode.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">{mode.desc}</p>
              </div>
              <ArrowRight className="size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-gold" />
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  )
}
