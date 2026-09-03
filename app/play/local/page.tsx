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
    <div className="border-b border-border bg-background/68">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-3 py-2.5 sm:px-5 lg:px-6">
        <div>
          <p className="rk-eyebrow">Rule mode</p>
          <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">Changing mode starts a fresh local match.</p>
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
      title="Pass & Play (2P)"
      youName="Ivory"
      oppName="Verdigris"
      perspective="neutral"
      canControlTurn
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
