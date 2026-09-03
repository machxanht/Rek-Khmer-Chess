'use client'

import { useEffect, useState } from 'react'
import { Bot, Loader2 } from 'lucide-react'
import { useRekEngine } from '@/hooks/use-rek-engine'
import { RekGameView } from '@/components/game/rek-game-view'
import { chooseAiMove, type GameMode } from '@/lib/rek/engine'

export default function AiGamePage() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [gameMode, setGameMode] = useState<GameMode>('REK_POAT')
  const engine = useRekEngine(gameMode, (player) => player === 'you')

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
    <div className="border-b border-border bg-background/68">
      <div className="mx-auto grid w-full max-w-[1280px] gap-2 px-3 py-2.5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center border border-opp/30 bg-opp-soft text-opp">
            {aiThinking ? <Loader2 className="size-4 animate-spin" /> : <Bot className="size-4" />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="rk-eyebrow">Khmer AI</p>
              {aiThinking && <span className="font-mono text-[9px] font-black uppercase tracking-[0.1em] text-opp">Thinking</span>}
            </div>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as 'easy' | 'medium' | 'hard')}
              className="mt-0.5 cursor-pointer bg-transparent text-xs font-bold text-foreground outline-none sm:text-sm"
              aria-label="AI difficulty"
            >
              <option value="easy" className="bg-background text-foreground">Apprentice</option>
              <option value="medium" className="bg-background text-foreground">Veteran</option>
              <option value="hard" className="bg-background text-foreground">Grandmaster</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border border-border bg-border">
          <ModeButton active={gameMode === 'REK_POAT'} onClick={() => handleModeChange('REK_POAT')}>
            Rek Poat
          </ModeButton>
          <ModeButton active={gameMode === 'MIN_REK_CHANH'} onClick={() => handleModeChange('MIN_REK_CHANH')}>
            Min Rek Chanh
          </ModeButton>
        </div>
      </div>
    </div>
  )

  return (
    <RekGameView
      engine={engine}
      title="Khmer AI Battle"
      youName="Player"
      oppName={`Khmer AI · ${difficulty}`}
      perspective="you"
      canControlTurn={game.turn === 'you'}
      exitHref="/play"
      banner={banner}
    />
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-10 bg-card px-3 text-[11px] font-extrabold outline-none transition-colors focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/70 sm:px-4 sm:text-xs ${
        active ? 'text-gold' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
