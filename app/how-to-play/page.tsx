import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, Crown, Shield, Sparkles, Swords, Target } from 'lucide-react'
import { AppShell } from '@/components/shell/app-shell'
import { MiniBoard, buildCells } from '@/components/learn/mini-board'
import { PieceToken } from '@/components/game/piece-token'

export const metadata: Metadata = {
  title: 'How to Play — Rek Khmer Board Game',
  description:
    'Learn the engine-authoritative Rek Khmer rules: orthogonal sliding, adjacent-pair Rek captures, Poat encirclement, and Min Rek Chanh compulsory Rek.',
}

const N = 5

const movementCells = buildCells(N, [
  { at: 12, player: 'you' },
  { at: 2, player: 'opp' },
])

// Post-landing geometry: the moving side occupies the center while the two
// adjacent enemies on opposite sides are Rek victims.
const rekCells = buildCells(N, [
  { at: 11, player: 'opp' },
  { at: 12, player: 'you' },
  { at: 13, player: 'opp' },
])

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

const palaceCells = buildCells(N, [
  { at: 2, player: 'opp', king: true },
  { at: 7, player: 'opp' },
  { at: 17, player: 'you' },
  { at: 22, player: 'you', king: true },
])

const RULES = [
  {
    number: '01',
    icon: Swords,
    title: 'Orthogonal movement',
    body: 'Every piece slides horizontally or vertically through empty squares. A piece stops at the first occupied square, cannot jump, and cannot land on an occupied square.',
    board: <MiniBoard n={N} cells={movementCells} markers={{ 12: 'select', 17: 'move' }} className="w-36" />,
  },
  {
    number: '02',
    icon: Target,
    title: 'Rek — land between an enemy pair',
    body: 'After a legal move lands on an empty square, the engine checks the immediately adjacent squares on opposite sides. If both hold enemy pieces, that pair is captured. Rek resolves before Poat.',
    board: <MiniBoard n={N} cells={rekCells} markers={{ 12: 'rek' }} className="w-36" />,
  },
  {
    number: '03',
    icon: Shield,
    title: 'Poat — zero liberties',
    body: 'After Rek is resolved, each connected enemy group is checked for orthogonal liberties. A group with no empty orthogonally adjacent square is removed. Board edges act as walls.',
    board: <MiniBoard n={N} cells={poatCells} markers={{ 12: 'capture' }} className="w-36" />,
  },
  {
    number: '04',
    icon: Crown,
    title: 'Win and draw adjudication',
    body: 'A decisive win comes from capturing the opposing King, removing all opposing pieces, immobilizing the opponent, or a Min Rek Chanh forfeit. The engine also tracks its configured draw conditions.',
    board: <MiniBoard n={N} cells={palaceCells} markers={{ 2: 'rek' }} className="w-36" />,
  },
] as const

export default function HowToPlayPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl animate-fade-rise">
        <header className="grid gap-5 border-b border-border pb-8 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-7">
          <div className="flex size-14 items-center justify-center border border-border bg-card text-gold">
            <BookOpen className="size-6" />
          </div>
          <div>
            <p className="rk-eyebrow">Engine-authoritative guide</p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              How to Play <span className="text-gold">Rek Khmer</span>
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              Rek Khmer is a Cambodian strategy game played on an 8×8 board. This page explains the behavior implemented by the repository engine; the interface does not invent a second rule set.
            </p>
          </div>
        </header>

        <section className="divide-y divide-border border-b border-border">
          {RULES.map((rule) => (
            <article
              key={rule.number}
              className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:py-8"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-black text-muted-foreground">{rule.number}</span>
                  <span className="flex size-9 items-center justify-center border border-border bg-card text-gold">
                    <rule.icon className="size-4" />
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">{rule.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{rule.body}</p>
              </div>
              <div className="justify-self-center border border-border bg-card/45 p-3 sm:justify-self-end">{rule.board}</div>
            </article>
          ))}
        </section>

        <section className="grid gap-8 border-b border-border py-8 lg:grid-cols-2">
          <div>
            <p className="rk-eyebrow">Pieces</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">One movement family, two roles</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Both Kings and regular pieces use the core movement model in Rek Poat. Min Rek Chanh changes the King&apos;s role by keeping it stationary.
            </p>

            <div className="mt-5 divide-y divide-border border-y border-border">
              <PieceRow
                piece={{ player: 'you', king: true, id: 'guide-king' }}
                title="Sdech — King"
                body="Royal piece. Capturing the opposing King is an immediate decisive result. In Min Rek Chanh the Palace King does not move."
              />
              <PieceRow
                piece={{ player: 'opp', king: false, id: 'guide-man' }}
                title="Regular piece"
                body="Uses the same orthogonal sliding geometry and can create Rek or Poat through legal moves."
              />
            </div>
          </div>

          <div>
            <p className="rk-eyebrow">Game modes</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">Rek Poat and Min Rek Chanh</h2>
            <div className="mt-5 divide-y divide-border border-y border-border">
              <ModeRule
                icon={Sparkles}
                title="Rek Poat"
                body="Rek is optional, Poat is active, and the King moves with the normal orthogonal sliding rules."
              />
              <ModeRule
                icon={Crown}
                title="Min Rek Chanh"
                body="The Palace King is stationary. If the side to move has any Rek available anywhere, Rek is compulsory; attempting a different legal geometric move forfeits the game. Poat remains active."
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 py-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="rk-eyebrow">Practice the geometry</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">Start with AI or a published puzzle</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Legal destinations, captures, compulsory Rek, and end states are calculated by the same engine used in Local play.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/play/puzzle"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-bold text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              Puzzles
            </Link>
            <Link
              href="/play/ai"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-gold px-4 text-sm font-extrabold text-background outline-none transition-colors hover:bg-[#e3c783] focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              Play vs AI
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function PieceRow({
  piece,
  title,
  body,
}: {
  piece: { player: 'you' | 'opp'; king: boolean; id: string }
  title: string
  body: string
}) {
  return (
    <div className="grid grid-cols-[3rem_1fr] items-center gap-4 py-4">
      <div className="size-11">
        <PieceToken piece={piece} size="board" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}

function ModeRule({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3 py-4">
      <Icon className="mt-0.5 size-4 text-gold" />
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}
