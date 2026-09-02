import type { Metadata } from 'next'
import Link from 'next/link'
import { AppShell } from '@/components/shell/app-shell'
import { MiniBoard, buildCells } from '@/components/learn/mini-board'
import { PieceToken } from '@/components/game/piece-token'
import { ArrowRight, Crown, Swords, Shield, Target, BookOpen, Sparkles, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How to Play — Rek Khmer Board Game',
  description:
    'Learn the rules of Rek Khmer (ល្បែងរែក): Rook-like sliding moves, custodial Rek flanking captures, and Poat flood-fill encirclement.',
}

const N = 5

// Rule 01 — Rek Sandwich
const custodyCells = buildCells(N, [
  { at: 11, player: 'you' },
  { at: 12, player: 'opp' },
  { at: 13, player: 'you' },
])

// Rule 02 — 4-Way Rek Cross
const crossCells = buildCells(N, [
  { at: 7, player: 'opp' },
  { at: 11, player: 'opp' },
  { at: 12, player: 'you' },
  { at: 13, player: 'opp' },
  { at: 17, player: 'opp' },
])

// Rule 03 — Poat Encirclement
const poatCells = buildCells(N, [
  { at: 6, player: 'you' },
  { at: 7, player: 'you' },
  { at: 8, player: 'you' },
  { at: 11, player: 'you' },
  { at: 12, player: 'opp' },
  { at: 13, player: 'you' },
  { at: 16, player: 'you' },
  { at: 17, player: 'you' },
  { at: 18, player: 'you' },
])

// Rule 04 — King Palace Defense
const kingCells = buildCells(N, [
  { at: 2, player: 'opp', king: true },
  { at: 1, player: 'opp' },
  { at: 3, player: 'opp' },
  { at: 7, player: 'opp' },
  { at: 22, player: 'you', king: true },
])

export default function HowToPlayPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 animate-fade-rise">
        <header className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-3.5 py-1 text-xs font-semibold text-gold shadow-sm">
            <BookOpen className="size-3.5" />
            <span>Master Authentic Khmer Rules</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-5xl">
            How to Play <span className="text-gold">Rek Khmer (ល្បែងរែក)</span>
          </h1>
          <p className="mt-2.5 max-w-2xl leading-relaxed text-muted-foreground text-pretty sm:text-base">
            Rek is Cambodia&apos;s ancient strategic board game. Unlike chess, you never capture by stepping on enemy squares. Instead, pieces slide like Rooks and capture through tactical flanking (<strong className="text-gold font-medium">Rek</strong>) and group encirclement (<strong className="text-cyan-400 font-medium">Poat</strong>).
          </p>
        </header>

        <div className="space-y-4">
          <RuleCard
            icon={<Swords className="size-5" />}
            step="01"
            title="Movement: Rook-like Sliding"
            body="Every piece on the 8×8 board can slide any number of empty squares in orthogonal directions (horizontal or vertical). Pieces cannot jump or land on occupied squares."
          >
            <MiniBoard n={N} cells={custodyCells} markers={{ 11: 'select', 13: 'move' }} className="w-36" />
          </RuleCard>

          <RuleCard
            icon={<Zap className="size-5" />}
            step="02"
            title="Đòn Gánh (Rek Capture)"
            body="Step into the middle of two opponent pieces along a straight line (horizontal or vertical) to capture both simultaneously. In a 4-way cross, you can capture up to 4 pieces at once!"
            highlight
          >
            <MiniBoard n={N} cells={crossCells} markers={{ 12: 'rek' }} className="w-36" />
          </RuleCard>

          <RuleCard
            icon={<Shield className="size-5" />}
            step="03"
            title="Đòn Vây (Poat Encirclement)"
            body="When an enemy piece or group of connected pieces is completely surrounded with zero open adjacent squares (0 liberties), the entire cluster is removed from the board."
          >
            <MiniBoard n={N} cells={poatCells} markers={{ 12: 'capture' }} className="w-36" />
          </RuleCard>

          <RuleCard
            icon={<Crown className="size-5" />}
            step="04"
            title="Victory: Capture the Royal King"
            body="Win the game instantly by capturing the opposing King (Sdech), wiping out all enemy forces, or completely blocking all opposing legal moves."
          >
            <MiniBoard n={N} cells={kingCells} markers={{ 2: 'rek' }} className="w-36" />
          </RuleCard>
        </div>

        {/* The Pieces */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">The Pieces</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 backdrop-blur-sm shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary shadow-inner">
                <PieceToken piece={{ player: 'you', king: true, id: 'legend-king' }} size="board" />
              </div>
              <p className="font-display text-base font-bold text-foreground">Sdech — The Royal King (ស្ដេច)</p>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Embossed with the royal crown. Losing your King means immediate defeat. In Min Rek Chanh mode, the King stays anchored in the palace throne.
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 backdrop-blur-sm shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary shadow-inner">
                <PieceToken piece={{ player: 'opp', king: false, id: 'legend-man' }} size="board" />
              </div>
              <p className="font-display text-base font-bold text-foreground">Pol — The Warriors (ពល)</p>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Fifteen brave warriors per side. They form protective phalanxes, execute Rek flanking strikes, and seal the fate of enemy battalions.
              </p>
            </div>
          </div>
        </section>

        {/* Authentic Game Modes & Cultural Insights */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Authentic Khmer Game Modes
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gold/40 bg-card/90 p-5 shadow-lg shadow-gold/5">
              <div className="flex items-center gap-2 text-gold font-bold">
                <Sparkles className="size-4.5" />
                <h3 className="font-display text-base text-foreground">1. Rek Poat (រែកព័ទ្ធ) — Standard Mode</h3>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                The strategic freeplay mode. The Royal King moves freely like a warrior across the board. Flanking captures (Rek) and encirclement (Poat) are optional tactical choices.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/40 bg-card/90 p-5 shadow-lg shadow-cyan-500/5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Crown className="size-4.5" />
                <h3 className="font-display text-base text-foreground">2. Min Rek Chanh (មិនរែកចាញ់) — Palace King</h3>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                The classical palace format. The King stays anchored on the throne (d1/d8). When baited with <strong className="text-gold">Hao Rek</strong>, the defender is compulsory forced to capture; skipping forfeits the game!
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-gold/35 bg-gradient-to-b from-gold/15 to-card/60 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gold text-background shadow-lg shadow-gold/30">
            <Sparkles className="size-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground text-balance">
            Ready to test your strategy?
          </h2>
          <p className="max-w-md text-xs sm:text-sm leading-relaxed text-muted-foreground text-pretty">
            Play against the AI Bot, solve King Defense Puzzles, or challenge a friend in Pass &amp; Play.
          </p>
          <Link
            href="/play/ai"
            className="mt-1 flex h-12 items-center gap-2 rounded-2xl bg-gold px-8 font-bold text-background shadow-lg shadow-gold/30 ring-2 ring-gold/60 transition-all hover:-translate-y-0.5 hover:opacity-95"
          >
            <span>Play vs AI Grandmaster</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  )
}

function RuleCard({
  icon,
  step,
  title,
  body,
  children,
  highlight,
}: {
  icon: React.ReactNode
  step: string
  title: string
  body: string
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={
        'grid items-center gap-5 rounded-3xl border p-5 backdrop-blur-sm sm:grid-cols-[1fr_auto] transition-all duration-300 ' +
        (highlight
          ? 'border-gold/50 bg-gradient-to-br from-gold/15 to-card shadow-lg shadow-gold/10 ring-1 ring-gold/40'
          : 'border-border/80 bg-card/80')
      }
    >
      <div>
        <div className="flex items-center gap-3">
          <span
            className={
              'flex size-9 items-center justify-center rounded-xl shadow-sm ' +
              (highlight ? 'bg-gold text-background font-bold' : 'bg-secondary text-gold')
            }
          >
            {icon}
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-gold">
            Step {step}
          </span>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-foreground">{title}</h3>
        <p className="mt-1.5 max-w-md text-xs sm:text-sm leading-relaxed text-muted-foreground text-pretty">
          {body}
        </p>
      </div>
      <div className="justify-self-center sm:justify-self-end">{children}</div>
    </div>
  )
}
