'use client'

import { cn } from '@/lib/utils'
import { SIZE, rc, type Cell, type MoveResult } from '@/lib/rek/engine'
import { PieceToken } from './piece-token'
import { Zap, Crown } from 'lucide-react'

export function Board({
  board,
  selected,
  moveResults,
  lastMove,
  lastCaptured,
  interactive,
  flipped,
  onSelect,
  winnerKing,
  threatened,
}: {
  board: Cell[]
  selected: number | null
  moveResults: Map<number, MoveResult>
  lastMove: { from: number; to: number } | null
  lastCaptured: number[]
  interactive: boolean
  flipped?: boolean
  onSelect: (index: number) => void
  winnerKing?: number | null
  threatened?: Set<number>
}) {
  const order = Array.from({ length: SIZE * SIZE }, (_, i) => i)
  const cells = flipped ? [...order].reverse() : order

  return (
    <div className="relative aspect-square w-full max-w-[min(92vw,36rem)] select-none">
      {/* Outer Luxury Board Frame with carved teak wood & Angkor gold trim */}
      <div
        className="relative h-full w-full rounded-3xl p-3 sm:p-4 shadow-2xl ring-2 ring-gold/60 shadow-black/70 transition-all duration-300 backdrop-blur-xl"
        style={{
          background:
            'linear-gradient(135deg, oklch(0.32 0.04 60) 0%, oklch(0.22 0.03 52) 50%, oklch(0.18 0.025 48) 100%)',
          boxShadow:
            '0 25px 50px -12px oklch(0 0 0 / 0.8), inset 0 2px 4px oklch(1 0 0 / 0.15), inset 0 -2px 6px oklch(0 0 0 / 0.6)',
        }}
      >
        {/* Angkor Corner Ornaments */}
        <div className="absolute top-2 left-2 size-6 border-t-2 border-l-2 border-gold/70 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-2 right-2 size-6 border-t-2 border-r-2 border-gold/70 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 size-6 border-b-2 border-l-2 border-gold/70 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-2 right-2 size-6 border-b-2 border-r-2 border-gold/70 rounded-br-xl pointer-events-none" />

        {/* Board inner playing 8x8 grid */}
        <div className="grid h-full w-full grid-cols-8 overflow-hidden rounded-2xl ring-1 ring-border/80 shadow-inner bg-background/60">
          {cells.map((index) => {
            const { row, col } = rc(index)
            const isDark = (row + col) % 2 === 1
            const piece = board[index]
            const result = moveResults.get(index)
            const isSelected = selected === index
            const isLegal = !!result
            const isRek = result?.rek
            const isPoat = result?.poat
            const isCapture = result && result.captures.length > 0
            const isLastFrom = lastMove?.from === index
            const isLastTo = lastMove?.to === index
            const wasCaptured = lastCaptured.includes(index)
            const isWinnerKing = winnerKing === index
            const isThreatened = threatened?.has(index) && !!piece

            return (
              <button
                key={index}
                type="button"
                disabled={!interactive}
                onClick={() => onSelect(index)}
                aria-label={`Square ${String.fromCharCode(97 + col)}${SIZE - row}`}
                className={cn(
                  'relative flex aspect-square items-center justify-center outline-none transition-all duration-200 select-none overflow-visible group',
                  isDark
                    ? 'bg-board-dark/90 hover:brightness-115'
                    : 'bg-board-light/90 hover:brightness-115',
                  interactive ? 'cursor-pointer' : 'cursor-default',
                  'focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset',
                )}
              >
                {/* Subtle Coordinates */}
                {col === 0 && (
                  <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-bold text-foreground/40 pointer-events-none select-none font-mono">
                    {SIZE - row}
                  </span>
                )}
                {row === 7 && (
                  <span className="absolute bottom-0.5 right-1 text-[8px] sm:text-[9px] font-bold text-foreground/40 pointer-events-none select-none font-mono">
                    {String.fromCharCode(97 + col)}
                  </span>
                )}

                {/* Last move trail glow */}
                {(isLastFrom || isLastTo) && (
                  <span
                    className="absolute inset-0 bg-gold/25 ring-1 ring-gold/60 animate-pulse pointer-events-none z-0"
                    aria-hidden="true"
                  />
                )}

                {/* Selected square highlight */}
                {isSelected && (
                  <span
                    className="absolute inset-0 bg-gold/35 ring-2 ring-gold ring-inset shadow-[inset_0_0_18px_var(--gold-glow)] z-10 pointer-events-none animate-pulse"
                    aria-hidden="true"
                  />
                )}

                {/* Rek (Gánh) Target Flanking Wave */}
                {isRek && (
                  <span
                    className="animate-rek-pulse absolute inset-0.5 rounded-xl ring-3 ring-gold bg-gold/30 z-20 pointer-events-none flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-1.5 py-0.2 text-[9px] font-black text-background shadow-lg ring-1 ring-gold animate-bounce">
                      REK!
                    </span>
                  </span>
                )}

                {/* Poat (Vây) Target Halo */}
                {isPoat && !isRek && (
                  <span
                    className="absolute inset-0.5 rounded-xl ring-3 ring-cyan-400 bg-cyan-400/25 animate-pulse z-20 pointer-events-none flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-1.5 py-0.2 text-[9px] font-black text-background shadow-lg animate-bounce">
                      POAT!
                    </span>
                  </span>
                )}

                {/* Piece */}
                {piece && (
                  <PieceToken
                    piece={piece}
                    selected={isSelected}
                    className={cn(
                      'z-10 transition-transform duration-200',
                      isWinnerKing && 'ring-4 ring-gold animate-bounce shadow-[0_0_25px_var(--gold)]',
                      wasCaptured && 'animate-ping opacity-60',
                    )}
                  />
                )}

                {/* Threatened victim warning icon */}
                {isThreatened && (
                  <span
                    className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive shadow-lg ring-2 ring-background animate-bounce z-30"
                    aria-hidden="true"
                    title="Under attack!"
                  >
                    <Zap className="size-2.5 text-white" />
                  </span>
                )}

                {/* Legal move destination indicator */}
                {isLegal && !piece && (
                  <span
                    className="size-[28%] rounded-full bg-gold shadow-[0_0_12px_var(--gold)] ring-2 ring-gold/70 transition-transform duration-200 group-hover:scale-130 z-20 pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                {/* Legal capture on occupied square */}
                {isLegal && piece && (
                  <span
                    className="absolute inset-0 rounded-xl ring-2 ring-inset ring-gold bg-gold/25 z-20 pointer-events-none animate-pulse"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
