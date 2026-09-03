'use client'

import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { SIZE, rc, type Cell, type MoveResult } from '@/lib/rek/engine'
import { PieceToken } from './piece-token'

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
    <div className="relative aspect-square w-full max-w-[43rem] select-none touch-manipulation">
      <div className="rek-board-shell h-full w-full">
        <span className="rek-board-corner rek-board-corner-tl" aria-hidden="true" />
        <span className="rek-board-corner rek-board-corner-tr" aria-hidden="true" />
        <span className="rek-board-corner rek-board-corner-br" aria-hidden="true" />
        <span className="rek-board-corner rek-board-corner-bl" aria-hidden="true" />

        <div className="rek-board-grid grid h-full w-full grid-cols-8">
          <span className="rek-board-medallion" aria-hidden="true" />

          {cells.map((index) => {
            const { row, col } = rc(index)
            const isDark = (row + col) % 2 === 1
            const piece = board[index]
            const result = moveResults.get(index)
            const isSelected = selected === index
            const isLegal = !!result
            const isRek = result?.rek
            const isPoat = result?.poat
            const isLastFrom = lastMove?.from === index
            const isLastTo = lastMove?.to === index
            const wasCaptured = lastCaptured.includes(index)
            const isWinnerKing = winnerKing === index
            const isThreatened = threatened?.has(index) && !!piece

            let moveStyle: CSSProperties | undefined
            if (isLastTo && piece && lastMove) {
              const from = rc(lastMove.from)
              const direction = flipped ? -1 : 1
              moveStyle = {
                '--move-x': (from.col - col) * direction,
                '--move-y': (from.row - row) * direction,
              } as CSSProperties
            }

            const coord = `${String.fromCharCode(97 + col)}${SIZE - row}`
            const pieceLabel = piece
              ? `${piece.player === 'you' ? 'White' : 'Black'} ${piece.king ? 'King' : 'piece'}`
              : 'empty'
            const actionLabel = isLegal ? ', legal destination' : ''
            const threatLabel = isThreatened ? ', tactically threatened' : ''

            const pieceToken = piece ? (
              <PieceToken
                piece={piece}
                selected={isSelected}
                className={cn(isWinnerKing && 'ring-2 ring-gold ring-offset-1 ring-offset-background')}
              />
            ) : null

            return (
              <button
                key={index}
                type="button"
                disabled={!interactive}
                onClick={() => onSelect(index)}
                aria-label={`${coord}, ${pieceLabel}${actionLabel}${threatLabel}`}
                aria-pressed={isSelected || undefined}
                className={cn(
                  'rek-board-square relative flex aspect-square items-center justify-center overflow-visible outline-none select-none touch-manipulation',
                  isDark ? 'rek-board-square-dark' : 'rek-board-square-light',
                  interactive ? 'cursor-pointer' : 'cursor-default',
                  'focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset',
                )}
              >
                {col === 0 && (
                  <span className="rek-coordinate pointer-events-none absolute left-1 top-0.5 font-mono text-[7px] font-bold sm:text-[9px]">
                    {SIZE - row}
                  </span>
                )}
                {row === 7 && (
                  <span className="rek-coordinate pointer-events-none absolute bottom-0.5 right-1 font-mono text-[7px] font-bold sm:text-[9px]">
                    {String.fromCharCode(97 + col)}
                  </span>
                )}

                {(isLastFrom || isLastTo) && <span className="rek-last-move" aria-hidden="true" />}
                {isSelected && <span className="rek-selected-square" aria-hidden="true" />}

                {isRek && (
                  <span className="rek-tactical-target rek-tactical-target-rek" aria-hidden="true">
                    <span className="rek-tactical-label">REK</span>
                  </span>
                )}

                {isPoat && !isRek && (
                  <span className="rek-tactical-target rek-tactical-target-poat" aria-hidden="true">
                    <span className="rek-tactical-label">POAT</span>
                  </span>
                )}

                {pieceToken && isLastTo ? (
                  <span
                    key={`${piece?.id ?? 'piece'}-${lastMove?.from ?? ''}-${lastMove?.to ?? ''}`}
                    className="rek-piece-flight"
                    style={moveStyle}
                    aria-hidden="true"
                  >
                    {pieceToken}
                  </span>
                ) : (
                  pieceToken
                )}

                {wasCaptured && <span className="rek-capture-burst" aria-hidden="true" />}

                {isThreatened && (
                  <span
                    className="absolute right-1 top-1 z-30 size-2 border border-background/80 bg-destructive"
                    aria-hidden="true"
                    title="Tactically threatened"
                  />
                )}

                {isLegal && !piece && !isRek && !isPoat && (
                  <span className="rek-legal-dot pointer-events-none z-20" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
