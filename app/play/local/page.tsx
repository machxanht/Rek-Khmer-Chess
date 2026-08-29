'use client'

import { useState } from 'react'
import { useRekEngine } from '@/hooks/use-rek-engine'
import { RekGameView } from '@/components/game/rek-game-view'
import type { GameMode } from '@/lib/rek/engine'

export default function LocalGamePage() {
  const [gameMode, setGameMode] = useState<GameMode>('REK_POAT')
  const engine = useRekEngine(gameMode)
  const { reset } = engine

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode)
    reset(mode)
  }

  const banner = (
    <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-2 px-4 py-2 text-xs font-semibold">
      <span className="text-muted-foreground">Rule Mode:</span>
      <div className="flex items-center gap-1 rounded-xl bg-card/80 p-1 border border-border/80">
        <button
          onClick={() => handleModeChange('REK_POAT')}
          className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
            gameMode === 'REK_POAT'
              ? 'bg-gold text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Rek Poat (Standard)
        </button>
        <button
          onClick={() => handleModeChange('MIN_REK_CHANH')}
          className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
            gameMode === 'MIN_REK_CHANH'
              ? 'bg-gold text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Min Rek Chanh (Palace King)
        </button>
      </div>
    </div>
  )

  return (
    <RekGameView
      engine={engine}
      title="Pass & Play (2P)"
      youName="White (Garnet)"
      oppName="Black (Jade)"
      perspective="neutral"
      canControlTurn
      exitHref="/play"
      banner={banner}
    />
  )
}
