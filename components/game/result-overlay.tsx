'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Trophy, RotateCcw, Home, Sparkles, Award } from 'lucide-react'
import confetti from 'canvas-confetti'
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
  useEffect(() => {
    if (open && winner && winner !== 'draw') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#d97706', '#fbbf24', '#e11d48', '#06b6d4'],
        })
      } catch {}
    }
  }, [open, winner])

  if (!winner) return null
  const isDraw = winner === 'draw'
  const winnerName = winner === 'you' ? youName : oppName
  const loserName = winner === 'you' ? oppName : youName
  const didWin = perspective !== 'neutral' && perspective === winner

  const outcome = isDraw
    ? 'Stalemate Peace'
    : perspective === 'neutral'
      ? `${winnerName} Victory!`
      : didWin
        ? 'Glorious Victory!'
        : 'Game Over'

  return (
    <Modal open={open} dismissable={false} className="text-center">
      <div className="flex flex-col items-center gap-4 py-2">
        <div
          className="relative flex size-20 items-center justify-center rounded-3xl shadow-xl animate-bounce"
          style={{
            background:
              winner === 'you'
                ? 'linear-gradient(135deg, oklch(0.85 0.22 85), oklch(0.7 0.22 45))'
                : 'linear-gradient(135deg, oklch(0.86 0.18 175), oklch(0.65 0.18 180))',
            boxShadow: '0 0 30px var(--gold-glow)',
          }}
        >
          <Trophy className="size-10 text-background drop-shadow-md" />
          <Sparkles
            className="absolute -top-2 -right-2 size-6 text-gold animate-spin"
            style={{ animationDuration: '6s' }}
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/40 mb-2">
            <Award className="size-3.5" />
            <span>Match Concluded</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            {outcome}
          </h2>
          {!isDraw && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              <strong className="text-gold font-bold">{winnerName}</strong> outmaneuvered{' '}
              <span className="text-foreground/90 font-medium">{loserName}</span>
            </p>
          )}
          {reason && (
            <span className="mt-3 inline-block rounded-xl bg-card border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground/90 shadow-sm">
              {reason}
            </span>
          )}
        </div>

        <div className="mt-3 flex w-full flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-gold font-bold text-background shadow-lg shadow-gold/30 ring-2 ring-gold/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold/50 active:translate-y-0"
          >
            <RotateCcw className="size-5" />
            <span>Play Again</span>
          </button>
          <Link
            href="/"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/80 font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:bg-accent hover:border-gold/40"
          >
            <Home className="size-4.5" />
            <span>Return to Lobby</span>
          </Link>
        </div>
      </div>
    </Modal>
  )
}
