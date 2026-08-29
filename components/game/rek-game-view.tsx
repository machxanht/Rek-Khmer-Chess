'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Play,
  X,
  Sparkles,
  Target,
  ShieldAlert,
  BookOpen,
  AlertTriangle,
  History,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  Crown,
  Swords,
  Shield,
  Zap,
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

const EMOTES = [
  { id: 'fire', icon: Flame, label: 'Angkor Fire', color: 'text-amber-500' },
  { id: 'crown', icon: Crown, label: 'Royal King', color: 'text-gold' },
  { id: 'swords', icon: Swords, label: 'Battle Strike', color: 'text-red-400' },
  { id: 'shield', icon: Shield, label: 'Fortress Guard', color: 'text-emerald-400' },
  { id: 'sparkles', icon: Sparkles, label: 'Glorious Rek', color: 'text-cyan-400' },
  { id: 'zap', icon: Zap, label: 'Blitz Shock', color: 'text-yellow-400' },
]

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
  const [activeEmote, setActiveEmote] = useState<{
    icon: React.ElementType
    color: string
    id: number
  } | null>(null)

  const interactive = game.status === 'playing' && canControlTurn && !resigned

  const winner = resigned ? (resigned === 'you' ? 'opp' : 'you') : game.winner
  const winReason = resigned ? 'Opponent resigned' : game.winReason
  const gameOver = game.status === 'won' || resigned !== null
  const winnerKing = winner && winner !== 'draw' ? kingIndex(game.board, winner) : null

  const handlePlayAgain = () => {
    reset()
    setResigned(null)
    setResignOpen(false)
    setPauseOpen(false)
  }

  const handleToggleSound = () => {
    const muted = sounds.toggleMute()
    setIsMuted(muted)
  }

  const sendEmote = (emote: (typeof EMOTES)[0]) => {
    sounds.playSelect()
    setActiveEmote({ icon: emote.icon, color: emote.color, id: Date.now() })
    setTimeout(() => {
      setActiveEmote(null)
    }, 2200)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-temple selection:bg-gold/30 relative overflow-x-hidden">
      {/* Floating alert banner for Hao Rek */}
      {bannerAlert && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="flex items-center gap-2 rounded-full border border-gold bg-background/95 px-5 py-2.5 shadow-2xl shadow-gold/40 backdrop-blur-xl ring-4 ring-gold/40">
            <Sparkles className="size-5 text-gold animate-spin" style={{ animationDuration: '3s' }} />
            <span className="font-display text-sm font-black text-gold tracking-wider uppercase">
              {bannerAlert}
            </span>
          </div>
        </div>
      )}

      {/* Floating emote effect */}
      {activeEmote && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="flex items-center gap-2 rounded-full border border-gold/50 bg-background/95 px-4 py-2 shadow-2xl backdrop-blur-xl ring-2 ring-gold/40">
            <activeEmote.icon
              className={cn('size-6 animate-spin', activeEmote.color)}
              style={{ animationDuration: '3s' }}
            />
            <span className="font-display text-sm font-bold text-foreground">Bravo!</span>
          </div>
        </div>
      )}

      {/* Top action header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl shadow-md">
        <Link
          href={exitHref}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground active:scale-95"
        >
          <ChevronLeft className="size-4.5" />
          <span>Exit</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold tracking-wider text-gold uppercase drop-shadow-[0_0_8px_var(--gold-soft)]">
            {title}
          </span>
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-bold text-gold ring-1 ring-gold/30 font-mono">
            Turn {game.moveCount + 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-gold active:scale-95"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="size-4 text-destructive" />
            ) : (
              <Volume2 className="size-4 text-gold" />
            )}
          </button>
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-gold active:scale-95"
            title="Move History"
          >
            <History className="size-4" />
          </button>
          <button
            onClick={() => setInfoOpen(true)}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-gold active:scale-95"
          >
            <BookOpen className="size-4" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </header>

      {banner}

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-4 pt-2 pb-8 animate-fade-rise">
        {/* Opponent */}
        <PlayerCard
          player={perspective === 'opp' ? 'you' : 'opp'}
          name={oppName}
          active={game.turn === (perspective === 'opp' ? 'you' : 'opp') && !gameOver}
          piecesLeft={countPieces(game.board, perspective === 'opp' ? 'you' : 'opp')}
          captured={
            perspective === 'opp' ? game.captured.opp.length : game.captured.you.length
          }
          timer={timers?.opp}
          connection={connections?.opp}
        />

        {/* Turn indicator */}
        <TurnIndicator
          turn={game.turn}
          youName={youName}
          oppName={oppName}
          rekAvailable={rekAvailable && !gameOver}
        />

        {/* Board */}
        <div className="flex justify-center py-1">
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

        {/* You */}
        <PlayerCard
          player={perspective === 'opp' ? 'opp' : 'you'}
          name={youName}
          active={game.turn === (perspective === 'opp' ? 'opp' : 'you') && !gameOver}
          piecesLeft={countPieces(game.board, perspective === 'opp' ? 'opp' : 'you')}
          captured={
            perspective === 'opp' ? game.captured.you.length : game.captured.opp.length
          }
          timer={timers?.you}
          connection={connections?.you}
        />

        {/* Quick Reactions & Undo */}
        <div className="flex items-center justify-between gap-1.5 rounded-2xl border border-border/80 bg-card/60 px-3 py-2 backdrop-blur-md">
          <div className="flex items-center gap-1">
            {EMOTES.map((em) => (
              <button
                key={em.id}
                onClick={() => sendEmote(em)}
                className="flex size-8 items-center justify-center rounded-xl bg-background/60 hover:bg-gold/20 hover:scale-110 active:scale-95 transition-all text-foreground"
                title={em.label}
              >
                <em.icon className={cn('size-4', em.color)} />
              </button>
            ))}
          </div>
          {canUndo && !connections && (
            <button
              onClick={undo}
              className="flex items-center gap-1.5 rounded-xl bg-secondary/90 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-gold hover:text-background transition-all active:scale-95 shadow-sm ring-1 ring-border"
              title="Undo last move"
            >
              <RotateCcw className="size-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="mt-0.5">
          <GameControls
            onPause={() => setPauseOpen(true)}
            onInfo={() => setInfoOpen(true)}
            onRestart={perspective === 'neutral' || !connections ? handlePlayAgain : undefined}
            onResign={() => setResignOpen(true)}
          />
        </div>
      </div>

      {/* Move History */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)}>
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <History className="size-5 text-gold" />
            <h2 className="font-display text-xl font-bold text-foreground">Tactical History</h2>
          </div>
          <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold font-mono">
            {history.length} moves
          </span>
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto pr-1 flex flex-col gap-2 divide-y divide-border/40">
          {history.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              No moves recorded yet. Slide your first piece!
            </p>
          ) : (
            history.map((m, i) => (
              <div key={i} className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground w-6 font-bold">
                    #{history.length - i}
                  </span>
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      m.player === 'you' ? 'bg-you' : 'bg-opp',
                    )}
                  />
                  <span className="font-bold text-foreground">{m.pieceName}</span>
                  <span className="font-mono text-gold bg-gold/10 px-1.5 py-0.5 rounded border border-gold/30 font-semibold">
                    {m.fromCoord} → {m.toCoord}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {m.rek && (
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-extrabold text-background shadow-sm">
                      REK!
                    </span>
                  )}
                  {m.poat && (
                    <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-[10px] font-extrabold text-background shadow-sm">
                      POAT!
                    </span>
                  )}
                  {m.captures > 0 && !m.rek && !m.poat && (
                    <span className="rounded-full bg-destructive/20 text-destructive px-2 py-0.5 text-[10px] font-bold">
                      +{m.captures} captured
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono">{m.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Pause */}
      <Modal open={pauseOpen} onClose={() => setPauseOpen(false)} className="text-center">
        <h2 className="font-display text-2xl font-bold">Game Paused</h2>
        <p className="mt-1 text-sm text-muted-foreground">Match paused. Ready when you are.</p>
        <button
          onClick={() => setPauseOpen(false)}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gold font-bold text-background shadow-lg shadow-gold/30 ring-1 ring-gold transition-all duration-200 hover:opacity-90"
        >
          <Play className="size-4.5" />
          <span>Resume Match</span>
        </button>
      </Modal>

      {/* Resign */}
      <Modal open={resignOpen} onClose={() => setResignOpen(false)}>
        <div className="flex items-center gap-2 text-destructive mb-1">
          <AlertTriangle className="size-5" />
          <h2 className="font-display text-2xl font-bold">Resign Match?</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Your opponent will immediately be awarded victory.
        </p>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={() => setResignOpen(false)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card font-semibold transition-colors hover:bg-accent"
          >
            <X className="size-4" />
            <span>Keep Playing</span>
          </button>
          <button
            onClick={() => {
              setResigned(perspective === 'neutral' ? 'you' : (perspective as Player))
              setResignOpen(false)
            }}
            className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-destructive/20 font-bold text-destructive ring-1 ring-destructive/40 transition-colors hover:bg-destructive/30"
          >
            <span>Resign</span>
          </button>
        </div>
      </Modal>

      {/* Rules Quick Reference */}
      <Modal open={infoOpen} onClose={() => setInfoOpen(false)}>
        <h2 className="font-display text-2xl font-bold text-foreground">How Rek Works</h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm">
          <li className="flex gap-3 items-start bg-card/60 p-3 rounded-xl border border-border/60">
            <Target className="mt-0.5 size-5 shrink-0 text-gold" />
            <span>
              <strong className="text-foreground">Rook Slide:</strong> Move any number of empty squares horizontally or vertically.
            </span>
          </li>
          <li className="flex gap-3 items-start bg-card/60 p-3 rounded-xl border border-border/60">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-gold" />
            <span>
              <strong className="text-foreground">Rek (Gánh):</strong> Step between 2 enemy pieces horizontally or vertically to capture them!
            </span>
          </li>
          <li className="flex gap-3 items-start bg-card/60 p-3 rounded-xl border border-border/60">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-cyan-400" />
            <span>
              <strong className="text-foreground">Poat (Bao Vây):</strong> Fully enclose an enemy cluster with 0 open squares to capture all of them!
            </span>
          </li>
        </ul>
        <Link
          href="/how-to-play"
          className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-gold border border-gold/30 transition-all duration-200 hover:bg-gold hover:text-background"
        >
          View Full Interactive Guide
        </Link>
      </Modal>

      {/* Result */}
      <ResultOverlay
        open={gameOver}
        winner={winner}
        reason={winReason}
        youName={youName}
        oppName={oppName}
        perspective={perspective}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  )
}
