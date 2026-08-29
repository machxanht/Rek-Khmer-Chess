'use client'

import { useState } from 'react'
import { useRekEngine } from '@/hooks/use-rek-engine'
import { RekGameView } from '@/components/game/rek-game-view'
import { KHMER_PUZZLES, type PuzzleSetup } from '@/lib/rek/engine'
import { Sparkles, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function PuzzleGamePage() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const puzzle = KHMER_PUZZLES[currentIdx]

  const engine = useRekEngine('REK_POAT', (p) => p === 'you')
  const { game, loadPuzzle, reset } = engine

  const handleSelectPuzzle = (idx: number) => {
    setCurrentIdx(idx)
    setShowHint(false)
    loadPuzzle(KHMER_PUZZLES[idx])
  }

  const banner = (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-2 px-4 py-2 text-xs">
      {/* Puzzle switcher header */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-card/90 p-3 border border-border/80 shadow-md">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-xl bg-gold text-background font-black font-mono">
            {puzzle.id}
          </span>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm leading-tight">
              {puzzle.titleEn}
            </h3>
            <p className="text-[11px] text-gold font-medium">{puzzle.titleKhmer}</p>
          </div>
        </div>

        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1 rounded-xl bg-secondary/80 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-gold hover:text-background transition-all"
        >
          <HelpCircle className="size-3.5" />
          <span>Hint</span>
        </button>
      </div>

      {showHint && (
        <div className="rounded-xl bg-gold/15 p-2.5 border border-gold/40 text-gold font-medium animate-fade-rise">
          💡 <strong>Tactical Hint:</strong> {puzzle.hint}
        </div>
      )}

      {/* Level selector tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {KHMER_PUZZLES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => handleSelectPuzzle(i)}
            className={`flex items-center gap-1 shrink-0 rounded-xl px-3 py-1.5 font-bold transition-all text-xs ${
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
      canControlTurn={game.turn === 'you'}
      exitHref="/play"
      banner={banner}
    />
  )
}
