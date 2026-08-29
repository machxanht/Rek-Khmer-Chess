'use client'

import { useState } from 'react'
import { Sparkles, Trophy, RotateCcw, Swords, CheckCircle2, ChevronRight, Zap } from 'lucide-react'
import { PieceToken } from './piece-token'
import { sounds } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function DailyPuzzle() {
  // Puzzle initial setup: 4x4 mini-board
  // 0  1  2  3
  // 4  5  6  7
  // 8  9  10 11
  // 12 13 14 15
  // You have pieces at 1 (Pol) and 13 (Pol).
  // Opponent has piece at 5 (Pol).
  // Target: Move piece from 13 -> 9. Now position 9 and position 1 sandwich position 5!
  // Result: REK Capture of piece 5!

  const [selected, setSelected] = useState<number | null>(null)
  const [board, setBoard] = useState<(('you' | 'opp') | null)[]>([
    null, 'you', null, null,
    null, 'opp', null, null,
    null, null, null, null,
    null, 'you', null, null,
  ])
  const [solved, setSolved] = useState(false)

  const handleSelect = (idx: number) => {
    if (solved) return

    if (idx === 13) {
      setSelected(13)
      sounds.playSelect()
      return
    }

    if (selected === 13 && idx === 9) {
      // Execute the puzzle move!
      const next = [...board]
      next[13] = null
      next[9] = 'you'
      // Rek occurs: 1 (you), 5 (opp), 9 (you) -> capture 5!
      next[5] = null
      setBoard(next)
      setSelected(null)
      setSolved(true)
      sounds.playRek()
      setTimeout(() => sounds.playVictory(), 250)
      return
    }

    setSelected(null)
  }

  const handleReset = () => {
    setBoard([
      null, 'you', null, null,
      null, 'opp', null, null,
      null, null, null, null,
      null, 'you', null, null,
    ])
    setSelected(null)
    setSolved(false)
    sounds.playSelect()
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-card/85 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        {/* Left explanation */}
        <div className="flex-1 space-y-3 text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold-soft px-3 py-1 text-xs font-bold text-gold">
            <Zap className="size-3.5" />
            <span>Interactive Tactical Puzzle</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            Execute the <span className="text-gold">Rek Flank</span>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Can you capture the enemy piece in one move? Tap your lower piece at <strong className="text-gold">b1</strong> and slide it to <strong className="text-gold">b2</strong> to sandwich the opponent!
          </p>

          {solved ? (
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-success font-bold text-sm bg-success/15 px-3 py-1.5 rounded-xl border border-success/30 animate-fade-rise">
                <CheckCircle2 className="size-4.5" />
                <span>Flank Executed! +50 Glory XP</span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-gold/40 transition-colors"
              >
                <RotateCcw className="size-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-gold flex items-center gap-1.5 font-semibold">
              <Sparkles className="size-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Tap a glowing piece to test the mechanic</span>
            </div>
          )}
        </div>

        {/* Mini 4x4 interactive board */}
        <div className="relative size-56 shrink-0 rounded-2xl border-2 border-gold/50 bg-background/90 p-2 shadow-xl ring-1 ring-border">
          <div className="grid grid-cols-4 h-full w-full rounded-xl overflow-hidden shadow-inner">
            {board.map((cell, idx) => {
              const row = Math.floor(idx / 4)
              const col = idx % 4
              const isDark = (row + col) % 2 === 1
              const isSelected = selected === idx
              const isTarget = selected === 13 && idx === 9

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={solved}
                  className={cn(
                    'relative flex aspect-square items-center justify-center transition-all select-none',
                    isDark ? 'bg-board-dark' : 'bg-board-light',
                    idx === 13 && !solved && 'ring-2 ring-gold ring-inset animate-pulse cursor-pointer',
                    isTarget && 'bg-gold/25 ring-2 ring-gold animate-bounce cursor-pointer',
                  )}
                >
                  {cell && (
                    <PieceToken
                      piece={{ player: cell, king: false, id: `pz-${idx}` }}
                      selected={isSelected}
                    />
                  )}
                  {isTarget && (
                    <span className="size-3 rounded-full bg-gold shadow-[0_0_8px_var(--gold)] ring-2 ring-gold" />
                  )}
                </button>
              )
            })}
          </div>

          {solved && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm animate-fade-rise">
              <div className="flex flex-col items-center gap-1 text-center p-3">
                <Trophy className="size-8 text-gold animate-bounce" />
                <span className="font-display font-extrabold text-sm text-gold">REK CAPTURED!</span>
                <span className="text-[11px] text-muted-foreground">Custodial sandwich verified</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
