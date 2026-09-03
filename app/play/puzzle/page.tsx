'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRekEngine } from '@/hooks/use-rek-engine'
import { RekGameView } from '@/components/game/rek-game-view'
import { KHMER_PUZZLES, coordToIdx } from '@/lib/rek/engine'
import { CheckCircle2, ChevronRight, HelpCircle, RotateCcw, XCircle } from 'lucide-react'

export default function PuzzleGamePage() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const puzzle = KHMER_PUZZLES[currentIdx]

  const engine = useRekEngine('REK_POAT', (player) => player === 'you')
  const { game, loadPuzzle } = engine

  useEffect(() => {
    loadPuzzle(KHMER_PUZZLES[0])
  }, [loadPuzzle])

  const handleSelectPuzzle = (index: number) => {
    setCurrentIdx(index)
    setShowHint(false)
    loadPuzzle(KHMER_PUZZLES[index])
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
    <div className="border-b border-border bg-background/70">
      <div className="mx-auto w-full max-w-[1280px] px-3 py-3 sm:px-5 lg:px-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="rk-eyebrow">Puzzle {puzzle.id} of {KHMER_PUZZLES.length}</p>
                <h2 className="mt-1 truncate font-display text-lg font-semibold text-foreground sm:text-xl">
                  {puzzle.titleEn}
                </h2>
                <p className="mt-0.5 truncate text-xs text-gold/90">{puzzle.titleKhmer}</p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectPuzzle(currentIdx)}
                  title="Reset puzzle"
                  aria-label="Reset puzzle"
                  className="flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowHint((value) => !value)}
                  aria-expanded={showHint}
                  className="flex h-10 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <HelpCircle className="size-4 text-gold" />
                  Hint
                </button>
              </div>
            </div>

            {(showHint || isSolved || isWrongAttempt) && (
              <div className="mt-3 border-t border-border pt-3">
                {isSolved && (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="size-4" />
                      <span className="font-bold">Target move solved.</span>
                    </div>
                    {currentIdx < KHMER_PUZZLES.length - 1 && (
                      <button
                        type="button"
                        onClick={handleNextPuzzle}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-gold px-3 text-xs font-extrabold text-background outline-none transition-colors hover:bg-[#e3c783] focus-visible:ring-2 focus-visible:ring-gold/70"
                      >
                        Next puzzle
                        <ChevronRight className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {isWrongAttempt && (
                  <button
                    type="button"
                    onClick={() => handleSelectPuzzle(currentIdx)}
                    className="flex min-h-10 w-full items-center gap-2 text-left text-sm font-bold text-destructive outline-none focus-visible:ring-2 focus-visible:ring-destructive/60"
                  >
                    <XCircle className="size-4 shrink-0" />
                    <span>That move is legal, but it is not the published target. Retry this position.</span>
                  </button>
                )}

                {showHint && !isSolved && (
                  <div className="flex items-start gap-2 text-sm leading-5 text-muted-foreground">
                    <HelpCircle className="mt-0.5 size-4 shrink-0 text-gold" />
                    <p><strong className="text-foreground">Tactical hint:</strong> {puzzle.hint}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-px overflow-x-auto bg-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:max-w-[25rem]">
            {KHMER_PUZZLES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPuzzle(index)}
                aria-current={currentIdx === index ? 'step' : undefined}
                aria-label={`Puzzle ${item.id}: ${item.titleEn}`}
                className={`flex size-10 shrink-0 items-center justify-center bg-card font-mono text-xs font-black outline-none transition-colors focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/70 ${
                  currentIdx === index ? 'text-gold' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {item.id}
              </button>
            ))}
          </div>
        </div>
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
