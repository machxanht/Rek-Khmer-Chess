'use client'

import { useEffect, useState } from 'react'
import { useRekEngine } from '@/hooks/use-rek-engine'
import { RekGameView } from '@/components/game/rek-game-view'
import { chooseAiMove, type GameMode } from '@/lib/rek/engine'
import { Bot, Sparkles } from 'lucide-react'

export default function AiGamePage() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [gameMode, setGameMode] = useState<GameMode>('REK_POAT')
  const engine = useRekEngine(gameMode, (p) => p === 'you')

  const { game, applyExternal, reset } = engine

  // AI moves when it is 'opp' turn
  useEffect(() => {
    if (game.status !== 'playing' || game.turn !== 'opp') return

    const thinkTime = difficulty === 'easy' ? 400 : difficulty === 'medium' ? 650 : 850
    const timer = setTimeout(() => {
      const bestMove = chooseAiMove(game.board, 'opp', game.mode, difficulty)
      if (bestMove) {
        applyExternal(bestMove.from, bestMove.to)
      }
    }, thinkTime)

    return () => clearTimeout(timer)
  }, [game.turn, game.status, game.board, game.mode, difficulty, applyExternal])

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode)
    reset(mode)
  }

  const banner = (
    <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-2 px-4 py-2 text-xs font-semibold">
      <div className="flex items-center gap-1.5 rounded-xl bg-card/80 px-3 py-1.5 border border-border/80">
        <Bot className="size-4 text-opp" />
        <span className="text-muted-foreground">Bot:</span>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
        >
          <option value="easy" className="bg-background text-foreground">Apprentice</option>
          <option value="medium" className="bg-background text-foreground">Veteran</option>
          <option value="hard" className="bg-background text-foreground">Grandmaster</option>
        </select>
      </div>

      <div className="flex items-center gap-1 rounded-xl bg-card/80 p-1 border border-border/80">
        <button
          onClick={() => handleModeChange('REK_POAT')}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
            gameMode === 'REK_POAT'
              ? 'bg-gold text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Rek Poat
        </button>
        <button
          onClick={() => handleModeChange('MIN_REK_CHANH')}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
            gameMode === 'MIN_REK_CHANH'
              ? 'bg-gold text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Min Rek Chanh
        </button>
      </div>
    </div>
  )

  return (
    <RekGameView
      engine={engine}
      title="Khmer AI Battle"
      youName="Player (You)"
      oppName={`Angkor AI (${difficulty.toUpperCase()})`}
      perspective="you"
      canControlTurn={game.turn === 'you'}
      exitHref="/play"
      banner={banner}
    />
  )
}
