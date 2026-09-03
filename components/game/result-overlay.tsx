'use client'

import Link from 'next/link'
import { Home, RotateCcw, Scale, Trophy } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import type { Player } from '@/lib/rek/engine'

export function ResultOverlay({
  open,
  winner,
  reason,
  youName,
  oppName,
  perspective = 'you',
  onPlayAgain,
}: {
  open: boolean
  winner: Player | 'draw' | null
  reason: string | null
  youName: string
  oppName: string
  perspective?: Player | 'neutral'
  onPlayAgain: () => void
}) {
  if (!winner) return null

  const isDraw = winner === 'draw'
  const winnerName = winner === 'you' ? youName : oppName
  const didWin = perspective !== 'neutral' && perspective === winner
  const outcome = isDraw
    ? 'Draw'
    : perspective === 'neutral'
      ? `${winnerName} wins`
      : didWin
        ? 'Victory'
        : 'Defeat'

  return (
    <Modal open={open} dismissable={false} className="max-w-[30rem]">
      <div className="py-1 text-center">
        <div
          className={`mx-auto flex size-14 items-center justify-center rounded-full border bg-background ${
            isDraw
              ? 'border-border text-muted-foreground'
              : winner === 'you'
                ? 'border-you/45 text-you'
                : 'border-opp/45 text-opp'
          }`}
          aria-hidden="true"
        >
          {isDraw ? <Scale className="size-6" /> : <Trophy className="size-6" />}
        </div>

        <p className="rk-eyebrow mt-5">Match concluded</p>
        <h2 className="mt-1 font-display text-4xl font-semibold tracking-tight text-foreground">{outcome}</h2>

        {!isDraw && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{winnerName}</span> takes the match.
          </p>
        )}

        {isDraw && (
          <p className="mt-2 text-sm text-muted-foreground">Neither side takes the match.</p>
        )}

        {reason && (
          <div className="mx-auto mt-5 max-w-sm border-y border-border py-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Engine result</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{reason}</p>
          </div>
        )}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex h-12 items-center justify-center gap-2 rounded-md bg-gold font-extrabold text-background outline-none transition-colors hover:bg-[#e3c783] focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <RotateCcw className="size-4" />
            <span>Play Again</span>
          </button>
          <Link
            href="/play"
            className="flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-card font-semibold text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <Home className="size-4" />
            <span>Game Modes</span>
          </Link>
        </div>
      </div>
    </Modal>
  )
}
