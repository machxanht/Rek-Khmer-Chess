'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  History,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Target,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { Board } from './board'
import { PlayerCard, type ConnectionState } from './player-card'
import { TurnIndicator } from './turn-indicator'
import { GameControls } from './game-controls'
import { ResultOverlay } from './result-overlay'
import { Modal } from '@/components/ui/modal'
import { countPieces, kingIndex, type Player } from '@/lib/rek/engine'
import type { useRekEngine } from '@/hooks/use-rek-engine'
import { sounds } from '@/lib/sound'
import { cn } from '@/lib/utils'

type Engine = ReturnType<typeof useRekEngine>

export function RekGameView({
  engine,
  title,
  youName,
  oppName,
  perspective = 'you',
  canControlTurn = true,
  flipped = false,
  timers,
  connections,
  exitHref = '/play',
  banner,
  showUtilityBar = true,
  showMatchControls = true,
  showResultOverlay = true,
}: {
  engine: Engine
  title: string
  youName: string
  oppName: string
  perspective?: Player | 'neutral'
  canControlTurn?: boolean
  flipped?: boolean
  timers?: { you: string; opp: string }
  connections?: { you?: ConnectionState; opp?: ConnectionState }
  exitHref?: string
  banner?: React.ReactNode
  showUtilityBar?: boolean
  showMatchControls?: boolean
  showResultOverlay?: boolean
}) {
  const {
    game,
    selected,
    moveResults,
    threatened,
    rekAvailable,
    bannerAlert,
    history,
    canUndo,
    undo,
    select,
    reset,
  } = engine

  const [pauseOpen, setPauseOpen] = useState(false)
  const [resignOpen, setResignOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted())
  const [resigned, setResigned] = useState<Player | null>(null)

  const modalOpen = pauseOpen || resignOpen || infoOpen || historyOpen
  const interactive = game.status === 'playing' && canControlTurn && !resigned && !modalOpen

  const winner = resigned ? (resigned === 'you' ? 'opp' : 'you') : game.winner
  const resignedName = resigned === 'you' ? youName : resigned === 'opp' ? oppName : null
  const winReason = resignedName ? `${resignedName} resigned` : game.winReason
  const gameOver = game.status !== 'playing' || resigned !== null
  const winnerKing = winner && winner !== 'draw' ? kingIndex(game.board, winner) : null

  const topPlayer: Player = perspective === 'opp' ? 'you' : 'opp'
  const bottomPlayer: Player = perspective === 'opp' ? 'opp' : 'you'

  const handlePlayAgain = () => {
    reset()
    setResigned(null)
    setResignOpen(false)
    setPauseOpen(false)
  }

  const handleToggleSound = () => {
    setIsMuted(sounds.toggleMute())
  }

  return (
    <div className="bg-temple relative flex min-h-dvh flex-col overflow-x-hidden selection:bg-gold/20">
      {bannerAlert && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-50 w-[min(92vw,34rem)] -translate-x-1/2 animate-fade-rise">
          <div className="flex items-center gap-2 border border-gold/45 bg-background/96 px-4 py-2.5 shadow-2xl shadow-black/40 backdrop-blur-md">
            <Sparkles className="size-4 shrink-0 text-gold" />
            <span className="text-xs font-black uppercase tracking-[0.1em] text-gold">{bannerAlert}</span>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/94 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
          <Link
            href={exitHref}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-1.5 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Exit</span>
          </Link>

          <div className="min-w-0 text-center">
            <p className="truncate font-display text-sm font-semibold text-foreground sm:text-base">{title}</p>
            <p className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Move {game.moveCount + 1} · {game.mode === 'MIN_REK_CHANH' ? 'Min Rek Chanh' : 'Rek Poat'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              className="flex size-10 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              aria-label="Open move history"
              className="flex size-10 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              <History className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {banner}

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-3 py-3 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:items-start lg:gap-5 xl:grid-cols-[240px_minmax(0,1fr)_250px] xl:gap-6">
          <div className="mb-2 lg:hidden">
            <PlayerCard
              player={topPlayer}
              name={oppName}
              active={game.turn === topPlayer && !gameOver}
              piecesLeft={countPieces(game.board, topPlayer)}
              captured={topPlayer === 'you' ? game.captured.you.length : game.captured.opp.length}
              timer={timers?.opp}
              connection={connections?.opp}
            />
          </div>

          <aside className="hidden lg:sticky lg:top-20 lg:flex lg:flex-col lg:gap-4">
            <div>
              <p className="rk-eyebrow mb-2">Opponent</p>
              <PlayerCard
                player={topPlayer}
                name={oppName}
                active={game.turn === topPlayer && !gameOver}
                piecesLeft={countPieces(game.board, topPlayer)}
                captured={topPlayer === 'you' ? game.captured.you.length : game.captured.opp.length}
                timer={timers?.opp}
                connection={connections?.opp}
              />
            </div>

            <div className="rk-rule" />

            <div>
              <p className="rk-eyebrow mb-2">Your side</p>
              <PlayerCard
                player={bottomPlayer}
                name={youName}
                active={game.turn === bottomPlayer && !gameOver}
                piecesLeft={countPieces(game.board, bottomPlayer)}
                captured={bottomPlayer === 'you' ? game.captured.you.length : game.captured.opp.length}
                timer={timers?.you}
                connection={connections?.you}
              />
            </div>

            <div className="border border-border bg-card/40 p-3 text-xs leading-5 text-muted-foreground">
              <p className="font-bold text-foreground">Board state</p>
              <p className="mt-1">Selected and legal destinations come directly from the Rek engine.</p>
            </div>
          </aside>

          <section className="min-w-0">
            <TurnIndicator
              turn={game.turn}
              youName={youName}
              oppName={oppName}
              rekAvailable={rekAvailable && !gameOver}
            />

            <div className="flex justify-center py-2.5 sm:py-3">
              <Board
                board={game.board}
                selected={selected}
                moveResults={moveResults}
                lastMove={game.lastMove}
                lastCaptured={game.lastCaptured}
                interactive={interactive}
                flipped={flipped}
                onSelect={select}
                threatened={threatened}
                winnerKing={gameOver ? winnerKing : null}
              />
            </div>

            <div className="mt-1 lg:hidden">
              <PlayerCard
                player={bottomPlayer}
                name={youName}
                active={game.turn === bottomPlayer && !gameOver}
                piecesLeft={countPieces(game.board, bottomPlayer)}
                captured={bottomPlayer === 'you' ? game.captured.you.length : game.captured.opp.length}
                timer={timers?.you}
                connection={connections?.you}
              />
            </div>

            <div className="mt-3 lg:hidden">
              <MobileUtilityBar
                show={showUtilityBar}
                canUndo={canUndo && !connections}
                onUndo={undo}
                onHistory={() => setHistoryOpen(true)}
                onRules={() => setInfoOpen(true)}
              />
              {showMatchControls && (
                <div className="mt-2">
                  <GameControls
                    onPause={() => setPauseOpen(true)}
                    onInfo={() => setInfoOpen(true)}
                    onRestart={perspective === 'neutral' || !connections ? handlePlayAgain : undefined}
                    onResign={() => setResignOpen(true)}
                  />
                </div>
              )}
            </div>
          </section>

          <aside className="hidden lg:sticky lg:top-20 lg:flex lg:flex-col lg:gap-4">
            {showUtilityBar && (
              <div className="border border-border bg-card/52 p-3">
                <p className="rk-eyebrow">Match tools</p>
                <div className="mt-3 grid gap-1">
                  {canUndo && !connections && (
                    <SideAction icon={RotateCcw} label="Undo last move" onClick={undo} />
                  )}
                  <SideAction icon={History} label="Move history" onClick={() => setHistoryOpen(true)} />
                  <SideAction icon={BookOpen} label="Rules" onClick={() => setInfoOpen(true)} />
                </div>
              </div>
            )}

            <div className="border border-border bg-card/38 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="rk-eyebrow">Recent moves</p>
                <span className="font-mono text-[10px] text-muted-foreground">{history.length}</span>
              </div>
              <HistoryPreview history={history} />
            </div>

            {showMatchControls && (
              <GameControls
                onPause={() => setPauseOpen(true)}
                onInfo={() => setInfoOpen(true)}
                onRestart={perspective === 'neutral' || !connections ? handlePlayAgain : undefined}
                onResign={() => setResignOpen(true)}
              />
            )}
          </aside>
        </div>
      </main>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)}>
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <History className="size-4 text-gold" />
            <h2 className="font-display text-xl font-semibold text-foreground">Move History</h2>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {history.length} moves
          </span>
        </div>

        <div className="mt-3 max-h-80 overflow-y-auto">
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No moves recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {history.map((move, index) => (
                <div key={`${move.from}-${move.to}-${index}`} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{move.pieceName}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {move.fromCoord} → {move.toCoord}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {move.rek && <TacticalTag label="REK" tone="gold" />}
                    {move.poat && <TacticalTag label="POAT" tone="opp" />}
                    {move.captures > 0 && <span className="font-mono text-[10px] text-muted-foreground">+{move.captures}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal open={pauseOpen} onClose={() => setPauseOpen(false)} className="text-center">
        <p className="rk-eyebrow">Match state</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">Game Paused</h2>
        <p className="mt-2 text-sm text-muted-foreground">The board is locked until the match resumes.</p>
        <button
          type="button"
          onClick={() => setPauseOpen(false)}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gold font-extrabold text-background outline-none transition-colors hover:bg-[#e3c783] focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <Play className="size-4" />
          <span>Resume Match</span>
        </button>
      </Modal>

      <Modal open={resignOpen} onClose={() => setResignOpen(false)}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 size-5 shrink-0 text-destructive" />
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Resign Match?</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              The resigning side loses immediately. The board itself will not be changed.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setResignOpen(false)}
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-card font-semibold text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <X className="size-4" />
            Keep Playing
          </button>
          <button
            type="button"
            onClick={() => {
              setResigned(perspective === 'neutral' ? game.turn : (perspective as Player))
              setResignOpen(false)
            }}
            className="flex h-11 items-center justify-center rounded-md border border-destructive/35 bg-destructive/10 font-bold text-destructive outline-none transition-colors hover:bg-destructive/16 focus-visible:ring-2 focus-visible:ring-destructive/60"
          >
            Resign
          </button>
        </div>
      </Modal>

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)}>
        <p className="rk-eyebrow">Quick rules</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">How Rek Works</h2>
        <div className="mt-4 divide-y divide-border border-y border-border">
          <RuleRow icon={Target} title="Rook-like slide">
            Move any number of empty squares horizontally or vertically. Pieces cannot jump or land on occupied squares.
          </RuleRow>
          <RuleRow icon={Sparkles} title="Rek">
            Land between an adjacent opposite-side enemy pair to capture that pair.
          </RuleRow>
          <RuleRow icon={ShieldAlert} title="Poat">
            After Rek resolves, connected enemy groups with zero orthogonal liberties are captured.
          </RuleRow>
        </div>
        <Link
          href="/how-to-play"
          className="mt-5 flex h-11 w-full items-center justify-center rounded-md border border-gold/30 bg-gold-soft font-bold text-gold outline-none transition-colors hover:bg-gold hover:text-background focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          View Full Guide
        </Link>
      </Modal>

      {showResultOverlay && (
        <ResultOverlay
          open={gameOver}
          winner={winner}
          reason={winReason}
          youName={youName}
          oppName={oppName}
          perspective={perspective}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  )
}

function SideAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-semibold text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
    >
      <Icon className="size-4 text-gold" />
      <span>{label}</span>
    </button>
  )
}

function MobileUtilityBar({
  show,
  canUndo,
  onUndo,
  onHistory,
  onRules,
}: {
  show: boolean
  canUndo: boolean
  onUndo: () => void
  onHistory: () => void
  onRules: () => void
}) {
  if (!show) return null

  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden border border-border bg-border">
      <UtilityButton icon={RotateCcw} label="Undo" onClick={onUndo} disabled={!canUndo} />
      <UtilityButton icon={History} label="History" onClick={onHistory} />
      <UtilityButton icon={BookOpen} label="Rules" onClick={onRules} />
    </div>
  )
}

function UtilityButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-11 items-center justify-center gap-1.5 bg-card px-2 text-[11px] font-bold text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/70"
    >
      <Icon className="size-3.5" />
      <span>{label}</span>
    </button>
  )
}

function HistoryPreview({ history }: { history: Engine['history'] }) {
  if (history.length === 0) {
    return <p className="mt-3 text-xs leading-5 text-muted-foreground">No moves yet.</p>
  }

  return (
    <div className="mt-3 divide-y divide-border">
      {history.slice(0, 5).map((move, index) => (
        <div key={`${move.from}-${move.to}-${index}`} className="flex items-center justify-between gap-2 py-2 text-[11px]">
          <span className="font-mono text-foreground">{move.fromCoord}→{move.toCoord}</span>
          <div className="flex items-center gap-1">
            {move.rek && <TacticalTag label="R" tone="gold" />}
            {move.poat && <TacticalTag label="P" tone="opp" />}
            {move.captures > 0 && <span className="text-muted-foreground">+{move.captures}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function TacticalTag({ label, tone }: { label: string; tone: 'gold' | 'opp' }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center border px-1 py-0.5 font-mono text-[8px] font-black',
        tone === 'gold'
          ? 'border-gold/35 bg-gold-soft text-gold'
          : 'border-opp/35 bg-opp-soft text-opp',
      )}
    >
      {label}
    </span>
  )
}

function RuleRow({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3 py-3.5 text-sm">
      <Icon className="mt-0.5 size-4 text-gold" />
      <div>
        <p className="font-bold text-foreground">{title}</p>
        <p className="mt-1 leading-5 text-muted-foreground">{children}</p>
      </div>
    </div>
  )
}
