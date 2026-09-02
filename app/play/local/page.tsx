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
    <div className="mx-auto flex w-full max-w-lg flex-col gap-2 px-3 py-2 text-xs font-semibold sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <span className="text-muted-foreground">Rule Mode:</span>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-card/80 p-1 border border-border/80">
        <button
          onClick={() => handleModeChange('REK_POAT')}
          className={`min-h-9 rounded-lg px-2 py-1 text-[11px] font-bold leading-tight transition-all sm:px-3 sm:text-xs ${
            gameMode === 'REK_POAT'
              ? 'bg-gold text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Rek Poat
          <span className="hidden sm:inline"> (Standard)</span>
        </button>
        <button
          onClick={() => handleModeChange('MIN_REK_CHANH')}
          className={`min-h-9 rounded-lg px-2 py-1 text-[11px] font-bold leading-tight transition-all sm:px-3 sm:text-xs ${
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
