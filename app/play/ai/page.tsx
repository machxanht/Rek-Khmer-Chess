'use client'

import { useEffect, useState } from 'react'
import { useRekEngine } from '@/hooks/use-rek-engine'
import { RekGameView } from '@/components/game/rek-game-view'
import { chooseAiMove, type GameMode } from '@/lib/rek/engine'
import { Bot, Loader2 } from 'lucide-react'

export default function AiGamePage() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [gameMode, setGameMode] = useState<GameMode>('REK_POAT')
  const engine = useRekEngine(gameMode, (p) => p === 'you')

  const { game, applyExternal, reset } = engine
  const aiThinking = game.status === 'playing' && game.turn === 'opp'

  useEffect(() => {
    if (!aiThinking) return

    const thinkTime = difficulty === 'easy' ? 400 : difficulty === 'medium' ? 650 : 850
    const timer = setTimeout(() => {
      const bestMove = chooseAiMove(game.board, 'opp', game.mode, difficulty)
      if (bestMove) applyExternal(bestMove.from, bestMove.to)
    }, thinkTime)

    return () => clearTimeout(timer)
  }, [aiThinking, game.board, game.mode, difficulty, applyExternal])

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode)
    reset(mode)
  }

  const banner = (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-2 px-3 py-2 text-xs font-semibold sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex min-h-10 items-center justify-between gap-2 rounded-xl bg-card/80 px-3 py-1.5 border border-border/80 sm:justify-start">
        <div className="flex items-center gap-1.5">
          {aiThinking ? <Loader2 className="size-4 animate-spin text-opp" /> : <Bot className="size-4 text-opp" />}
          <span className="text-muted-foreground">Bot:</span>
        </div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
          aria-label="AI difficulty"
        >
          <option value="easy" className="bg-background text-foreground">Apprentice</option>
          <option value="medium" className="bg-background text-foreground">Veteran</option>
          <option value="hard" className="bg-background text-foreground">Grandmaster</option>
        </select>
        {aiThinking && <span className="text-[10px] font-bold text-opp">THINKING</span>}
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-card/80 p-1 border border-border/80">
        <button
          onClick={() => handleModeChange('REK_POAT')}
          className={`min-h-9 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
            gameMode === 'REK_POAT'
              ? 'bg-gold text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Rek Poat
        </button>
        <button
          onClick={() => handleModeChange('MIN_REK_CHANH')}
          className={`min-h-9 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
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
