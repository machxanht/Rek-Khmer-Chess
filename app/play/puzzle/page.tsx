'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRekEngine } from '@/hooks/use-rek-engine'
import { RekGameView } from '@/components/game/rek-game-view'
import { KHMER_PUZZLES, coordToIdx } from '@/lib/rek/engine'
import { HelpCircle, ChevronRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react'

export default function PuzzleGamePage() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const puzzle = KHMER_PUZZLES[currentIdx]

  const engine = useRekEngine('REK_POAT', (p) => p === 'you')
  const { game, loadPuzzle } = engine

  useEffect(() => {
    loadPuzzle(KHMER_PUZZLES[0])
  }, [loadPuzzle])

  const handleSelectPuzzle = (idx: number) => {
    setCurrentIdx(idx)
    setShowHint(false)
    loadPuzzle(KHMER_PUZZLES[idx])
  }

  const handleNextPuzzle = () => {
    const nextIdx = (currentIdx + 1) % KHMER_PUZZLES.length
    handleSelectPuzzle(nextIdx)
  }

  const solution = useMemo(
    () => ({
      from: coordToIdx(puzzle.solution.fromCoord),
      to: coordToIdx(puzzle.solution.toCoord),
    }),
    [puzzle],
  )

  const isSolved = game.lastMove?.from === solution.from && game.lastMove?.to === solution.to
  const attempted = game.moveCount > 0 || game.status !== 'playing'
  const isWrongAttempt = attempted && !isSolved

  const banner = (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-2 px-3 py-2 text-xs sm:px-4">
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-card/90 p-3 border border-border/80 shadow-md">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-gold text-background font-black font-mono">
            {puzzle.id}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-display font-bold text-foreground text-sm leading-tight">
              {puzzle.titleEn}
            </h3>
            <p className="truncate text-[11px] text-gold font-medium">{puzzle.titleKhmer}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => handleSelectPuzzle(currentIdx)}
            title="Reset Puzzle"
            aria-label="Reset puzzle"
            className="flex size-9 items-center justify-center rounded-xl bg-secondary/80 text-muted-foreground hover:bg-gold hover:text-background transition-all touch-manipulation"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex min-h-9 items-center gap-1 rounded-xl bg-secondary/80 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-gold hover:text-background transition-all touch-manipulation"
          >
            <HelpCircle className="size-3.5" />
            <span>Hint</span>
          </button>
        </div>
      </div>

      {isSolved && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-500/15 p-3 border border-emerald-500/40 text-emerald-400 font-bold animate-fade-rise">
          <div className="flex min-w-0 items-center gap-2">
            <CheckCircle2 className="size-4.5 shrink-0 text-emerald-400" />
            <span className="truncate">Solved! Kbuon Mastered!</span>
          </div>
          {currentIdx < KHMER_PUZZLES.length - 1 && (
            <button
              onClick={handleNextPuzzle}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-background shadow hover:bg-emerald-400 transition-colors touch-manipulation"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {isWrongAttempt && (
        <button
          type="button"
          onClick={() => handleSelectPuzzle(currentIdx)}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 font-bold text-destructive transition-colors hover:bg-destructive/15 touch-manipulation"
        >
          <XCircle className="size-4" />
          <span>Not the target move — tap to retry</span>
        </button>
      )}

      {showHint && !isSolved && (
        <div className="rounded-xl bg-gold/15 p-2.5 border border-gold/40 text-gold font-medium animate-fade-rise">
          💡 <strong>Tactical Hint:</strong> {puzzle.hint}
        </div>
      )}

      <div className="flex items-center gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {KHMER_PUZZLES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => handleSelectPuzzle(i)}
            aria-current={currentIdx === i ? 'step' : undefined}
            className={`flex min-h-9 items-center gap-1 shrink-0 rounded-xl px-3 py-1.5 font-bold transition-all text-xs touch-manipulation ${
              currentIdx === i
                ? 'bg-gold text-background shadow-md shadow-gold/30'
                : 'bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Level {p.id}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <RekGameView
      engine={engine}
      title="King Defense Puzzles"
      youName="Defender (White)"
      oppName="Challenger (Black)"
      perspective="you"
      canControlTurn={game.turn === 'you' && !isSolved && !isWrongAttempt}
      exitHref="/play"
      banner={banner}
      showUtilityBar={false}
      showMatchControls={false}
      showResultOverlay={false}
    />
  )
}
