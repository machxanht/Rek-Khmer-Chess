'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Globe,
  Loader2,
  Radar,
  Plus,
  LogIn,
  Wifi,
  X,
  RefreshCw,
  Sparkles,
  Zap,
  Copy,
  Check,
} from 'lucide-react'
import { useRekEngine } from '@/hooks/use-rek-engine'
import { RekGameView } from '@/components/game/rek-game-view'
import { chooseAiMove } from '@/lib/rek/engine'
import type { ConnectionState } from '@/components/game/player-card'
import { cn } from '@/lib/utils'

type Phase = 'lobby' | 'connecting' | 'searching' | 'found' | 'playing' | 'failed'

const OPP_NAME = 'Sokha'
const YOU_NAME = 'You'

export function OnlineFlow() {
  const engine = useRekEngine('REK_POAT', (player) => player === 'you')
  const { game, applyExternal } = engine

  const [phase, setPhase] = useState<Phase>('lobby')
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [oppConn, setOppConn] = useState<ConnectionState>('connected')
  const reconnectDone = useRef(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
  }

  useEffect(() => () => clearTimers(), [])

  const startFlow = useCallback((code?: string) => {
    clearTimers()
    reconnectDone.current = false
    setRoomCode(code ?? null)
    setOppConn('connected')
    engine.reset()
    setPhase('connecting')
    later(() => setPhase('searching'), 1100)
    later(() => setPhase('found'), 3300)
    later(() => setPhase('playing'), 4700)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cancel = () => {
    clearTimers()
    setPhase('lobby')
  }

  // Simulated opponent moves
  useEffect(() => {
    if (phase !== 'playing') return
    if (game.status !== 'playing') return
    if (game.turn !== 'opp') return
    if (oppConn !== 'connected') return
    const t = setTimeout(() => {
      const move = chooseAiMove(game.board, 'opp')
      if (move) applyExternal(move.from, move.to)
    }, 850)
    return () => clearTimeout(t)
  }, [phase, game.turn, game.status, game.board, oppConn, applyExternal])

  // One scripted reconnection blip to surface the reconnecting state
  useEffect(() => {
    if (phase !== 'playing') return
    if (reconnectDone.current) return
    if (game.moveCount === 3) {
      reconnectDone.current = true
      setOppConn('reconnecting')
      later(() => setOppConn('connected'), 2200)
    }
  }, [phase, game.moveCount])

  if (phase === 'lobby') {
    return <Lobby onQuickMatch={() => startFlow()} onCreate={startFlow} onJoin={startFlow} />
  }

  if (phase === 'connecting' || phase === 'searching' || phase === 'found') {
    return <Matchmaking phase={phase} roomCode={roomCode} oppName={OPP_NAME} onCancel={cancel} />
  }

  return (
    <RekGameView
      engine={engine}
      title="Online Match"
      youName={YOU_NAME}
      oppName={OPP_NAME}
      perspective="you"
      canControlTurn={game.turn === 'you' && oppConn === 'connected'}
      connections={{ you: 'connected', opp: oppConn }}
      exitHref="/play"
      banner={
        oppConn === 'reconnecting' ? (
          <div className="flex items-center justify-center gap-2 bg-gold/20 py-2.5 text-sm font-bold text-gold ring-1 ring-gold/40 backdrop-blur-md">
            <RefreshCw className="size-4 animate-spin" />
            {OPP_NAME} lost connection — attempting to reconnect…
          </div>
        ) : null
      }
    />
  )
}

/* ---------- Lobby ---------- */

function Lobby({
  onQuickMatch,
  onCreate,
  onJoin,
}: {
  onQuickMatch: () => void
  onCreate: (code: string) => void
  onJoin: (code: string) => void
}) {
  const [joinCode, setJoinCode] = useState('')
  const genCode = () =>
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    Math.random().toString(36).slice(2, 4).toUpperCase()

  return (
    <div className="flex min-h-dvh flex-col bg-temple">
      <header className="flex items-center px-4 py-3 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <Link
          href="/play"
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4.5" />
          <span>Back</span>
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 pb-10 animate-fade-rise">
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-3xl bg-opp-soft text-opp ring-1 ring-opp/40 shadow-lg shadow-opp/10">
            <Globe className="size-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/40 mb-2">
            <Zap className="size-3.5" />
            <span>Global Matchmaking</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Play Online</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Find an opponent worldwide instantly or battle with a friend by code.
          </p>
        </div>

        <button
          onClick={onQuickMatch}
          className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-gold text-base font-bold text-background shadow-xl shadow-gold/30 ring-2 ring-gold/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold/50 active:translate-y-0"
        >
          <Radar className="size-5.5 animate-pulse" />
          <span>Quick Match</span>
        </button>

        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={() => onCreate(genCode())}
            className="group flex flex-col items-center gap-2 rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg shadow-sm"
          >
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gold/15 text-gold group-hover:scale-110 transition-transform">
              <Plus className="size-6" />
            </div>
            <span className="text-sm font-bold text-foreground">Create Room</span>
            <span className="text-xs text-muted-foreground">Generate invite</span>
          </button>
          <div className="flex flex-col gap-2 rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <LogIn className="size-4" />
              </div>
              <span className="text-sm font-bold text-foreground">Join Room</span>
            </div>
            <div className="flex gap-1.5 mt-1">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="CODE"
                className="w-full rounded-xl border border-input bg-background/80 px-2.5 py-1.5 text-xs font-mono font-bold tracking-wider outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
              <button
                disabled={joinCode.length < 4}
                onClick={() => onJoin(joinCode)}
                className="rounded-xl bg-gold px-3 text-xs font-bold text-background disabled:opacity-40 transition-opacity"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Matchmaking / connecting / found ---------- */

function Matchmaking({
  phase,
  roomCode,
  oppName,
  onCancel,
}: {
  phase: 'connecting' | 'searching' | 'found'
  roomCode: string | null
  oppName: string
  onCancel: () => void
}) {
  const [copied, setCopied] = useState(false)
  const copy: Record<typeof phase, { title: string; sub: string }> = {
    connecting: { title: 'Connecting to Server', sub: 'Establishing secure cryptographic connection…' },
    searching: {
      title: roomCode ? 'Waiting for Friend' : 'Searching for Challenger',
      sub: roomCode ? `Share code ${roomCode} with your opponent` : 'Finding a worthy strategic opponent…',
    },
    found: { title: 'Opponent Discovered!', sub: 'Deploying Angkor battlefield…' },
  }
  const { title, sub } = copy[phase]

  const handleCopy = async () => {
    if (!roomCode) return

    try {
      if (!navigator.clipboard?.writeText) return
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-temple px-6 text-center animate-fade-rise">
      {phase === 'found' ? (
        <div className="flex items-center gap-6 animate-fade-rise">
          <Avatar name="You" tone="you" />
          <div className="flex flex-col items-center">
            <span className="font-display text-2xl font-extrabold text-gold drop-shadow-md">VS</span>
            <Sparkles className="size-4 text-gold animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <Avatar name={oppName} tone="opp" />
        </div>
      ) : (
        <div className="relative flex size-32 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-gold/20" />
          <span className="absolute -inset-3 animate-ping rounded-full border-2 border-gold/30" />
          <span className="absolute -inset-6 animate-pulse rounded-full border border-gold/15" />
          <div className="flex size-20 items-center justify-center rounded-3xl bg-gold/15 text-gold ring-2 ring-gold/40 shadow-xl shadow-gold/20">
            {phase === 'connecting' ? (
              <Wifi className="size-10" />
            ) : (
              <Radar className="size-10 animate-spin" style={{ animationDuration: '8s' }} />
            )}
          </div>
        </div>
      )}

      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-gold" />
          {sub}
        </p>
      </div>

      {roomCode && phase === 'searching' && (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-gold/40 bg-gold-soft/80 px-8 py-4 backdrop-blur-md shadow-lg shadow-gold/10">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Room Access Code</span>
          <div className="flex items-center gap-3">
            <p className="font-mono text-3xl font-extrabold tracking-[0.25em] text-gold">{roomCode}</p>
            <button
              onClick={handleCopy}
              className="flex size-9 items-center justify-center rounded-xl bg-card border border-border text-foreground hover:border-gold/50 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="size-4.5 text-gold" /> : <Copy className="size-4.5" />}
            </button>
          </div>
        </div>
      )}

      {phase !== 'found' && (
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-6 py-2.5 text-sm font-semibold text-muted-foreground backdrop-blur-sm transition-all hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
          <span>Cancel Search</span>
        </button>
      )}
    </div>
  )
}

function Avatar({ name, tone }: { name: string; tone: 'you' | 'opp' }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn('flex size-18 items-center justify-center rounded-3xl text-2xl font-extrabold text-background shadow-xl ring-2')}
        style={{
          background:
            tone === 'you'
              ? 'linear-gradient(135deg, oklch(0.85 0.22 85), oklch(0.66 0.23 28))'
              : 'linear-gradient(135deg, oklch(0.86 0.18 175), oklch(0.65 0.18 180))',
          borderColor: tone === 'you' ? 'var(--you)' : 'var(--opp)',
        }}
      >
        {name.slice(0, 1)}
      </div>
      <span className="text-sm font-bold text-foreground">{name}</span>
    </div>
  )
}
