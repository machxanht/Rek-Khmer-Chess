'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  Copy,
  Flag,
  Globe,
  History,
  Loader2,
  LogIn,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  X,
} from 'lucide-react'
import { Board } from './board'
import { PlayerCard, type ConnectionState } from './player-card'
import { TurnIndicator } from './turn-indicator'
import { ResultOverlay } from './result-overlay'
import { Modal } from '@/components/ui/modal'
import { useOnlineRekEngine } from '@/hooks/use-online-rek-engine'
import {
  countPieces,
  kingIndex,
  opponent,
  type GameMode,
} from '@/lib/rek/engine'
import type {
  CreateOnlineRoomResponse,
  JoinOnlineRoomResponse,
  OnlineApiError,
  OnlineRoomSnapshot,
  OnlineSession,
} from '@/lib/rek-online/types'
import { cn } from '@/lib/utils'

const SESSION_KEY = 'rek-online-session-v1'
const POLL_MS = 1200

class OnlineRequestError extends Error {
  constructor(
    message: string,
    public readonly code = 'REQUEST_FAILED',
  ) {
    super(message)
    this.name = 'OnlineRequestError'
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const data = (await response.json()) as T | OnlineApiError
  if (!response.ok) {
    const apiError = data as OnlineApiError
    throw new OnlineRequestError(apiError.error || 'Online request failed', apiError.code)
  }
  return data as T
}

function saveSession(session: OnlineSession | null): void {
  if (typeof window === 'undefined') return
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else sessionStorage.removeItem(SESSION_KEY)
}

export function OnlineFlow() {
  const [restoring, setRestoring] = useState(true)
  const [busy, setBusy] = useState(false)
  const [session, setSession] = useState<OnlineSession | null>(null)
  const [room, setRoom] = useState<OnlineRoomSnapshot | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const clearSession = useCallback(() => {
    saveSession(null)
    setSession(null)
    setRoom(null)
    setNotice(null)
  }, [])

  const refreshRoom = useCallback(async (activeSession: OnlineSession) => {
    const next = await requestJson<OnlineRoomSnapshot>(
      `/api/rek-online/rooms/${encodeURIComponent(activeSession.code)}?token=${encodeURIComponent(activeSession.token)}`,
    )
    setRoom(next)
    return next
  }, [])

  useEffect(() => {
    let cancelled = false
    const restore = async () => {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY)
        if (!raw) return
        const stored = JSON.parse(raw) as OnlineSession
        if (!stored?.code || !stored?.token) return
        const next = await requestJson<OnlineRoomSnapshot>(
          `/api/rek-online/rooms/${encodeURIComponent(stored.code)}?token=${encodeURIComponent(stored.token)}`,
        )
        if (!cancelled) {
          setSession(stored)
          setRoom(next)
        }
      } catch {
        saveSession(null)
      } finally {
        if (!cancelled) setRestoring(false)
      }
    }
    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const poll = async () => {
      try {
        const next = await refreshRoom(session)
        if (!cancelled) {
          setNotice(null)
          setRoom(next)
        }
      } catch (error) {
        if (cancelled) return
        if (
          error instanceof OnlineRequestError &&
          (error.code === 'ROOM_NOT_FOUND' || error.code === 'UNAUTHORIZED_ROOM')
        ) {
          clearSession()
          setNotice('Room expired or this session is no longer valid.')
          return
        }
        setNotice('Connection interrupted. Retrying room sync…')
      }
      if (!cancelled) timer = setTimeout(poll, POLL_MS)
    }

    timer = setTimeout(poll, POLL_MS)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [clearSession, refreshRoom, session])

  const createRoom = useCallback(async (name: string, mode: GameMode) => {
    setBusy(true)
    setNotice(null)
    try {
      const created = await requestJson<CreateOnlineRoomResponse>('/api/rek-online/rooms', {
        method: 'POST',
        body: JSON.stringify({ name, mode }),
      })
      saveSession(created.session)
      setSession(created.session)
      setRoom(created.room)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not create room')
    } finally {
      setBusy(false)
    }
  }, [])

  const joinRoom = useCallback(async (code: string, name: string) => {
    setBusy(true)
    setNotice(null)
    try {
      const joined = await requestJson<JoinOnlineRoomResponse>(
        `/api/rek-online/rooms/${encodeURIComponent(code.trim().toUpperCase())}/join`,
        {
          method: 'POST',
          body: JSON.stringify({ name }),
        },
      )
      saveSession(joined.session)
      setSession(joined.session)
      setRoom(joined.room)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not join room')
    } finally {
      setBusy(false)
    }
  }, [])

  if (restoring) return <Restoring />

  if (!session || !room) {
    return (
      <Lobby
        busy={busy}
        notice={notice}
        onCreate={createRoom}
        onJoin={joinRoom}
      />
    )
  }

  if (room.phase === 'waiting') {
    return (
      <WaitingRoom
        room={room}
        notice={notice}
        onLeave={clearSession}
      />
    )
  }

  return (
    <OnlineMatch
      session={session}
      room={room}
      setRoom={setRoom}
      notice={notice}
      setNotice={setNotice}
      onLeave={clearSession}
    />
  )
}

function Restoring() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-temple">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="size-9 animate-spin text-gold" />
        <p className="text-sm font-semibold text-muted-foreground">Restoring Rek room session…</p>
      </div>
    </div>
  )
}

function Lobby({
  busy,
  notice,
  onCreate,
  onJoin,
}: {
  busy: boolean
  notice: string | null
  onCreate: (name: string, mode: GameMode) => Promise<void>
  onJoin: (code: string, name: string) => Promise<void>
}) {
  const [name, setName] = useState('Player')
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<GameMode>('REK_POAT')

  return (
    <div className="flex min-h-dvh flex-col bg-temple">
      <header className="flex items-center border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl">
        <Link
          href="/play"
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4.5" />
          <span>Back</span>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5 px-4 py-8 animate-fade-rise">
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-3xl bg-opp-soft text-opp ring-1 ring-opp/40 shadow-lg shadow-opp/10">
            <Globe className="size-8" />
          </div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/40">
            <ShieldCheck className="size-3.5" />
            <span>Server-validated moves</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Play Online
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Create a room, share the six-character code, and play another browser in real time.
          </p>
        </div>

        {notice && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {notice}
          </div>
        )}

        <div className="rounded-3xl border border-border/80 bg-card/80 p-4 shadow-lg backdrop-blur-md">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 24))}
            className="mt-2 h-11 w-full rounded-xl border border-input bg-background/80 px-3 text-sm font-semibold outline-none transition-colors focus:border-gold"
            placeholder="Player"
          />

          <div className="mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rule mode</span>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-background/50 p-1.5">
              <button
                type="button"
                onClick={() => setMode('REK_POAT')}
                className={cn(
                  'rounded-xl px-3 py-2 text-xs font-bold transition-all',
                  mode === 'REK_POAT' ? 'bg-gold text-background shadow' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Rek Poat
              </button>
              <button
                type="button"
                onClick={() => setMode('MIN_REK_CHANH')}
                className={cn(
                  'rounded-xl px-3 py-2 text-xs font-bold transition-all',
                  mode === 'MIN_REK_CHANH' ? 'bg-gold text-background shadow' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Min Rek Chanh
              </button>
            </div>
          </div>

          <button
            disabled={busy}
            onClick={() => void onCreate(name, mode)}
            className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gold font-bold text-background shadow-lg shadow-gold/25 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
            <span>Create Room</span>
          </button>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/80 p-4 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2">
            <LogIn className="size-4.5 text-gold" />
            <h2 className="font-display font-bold text-foreground">Join a friend</h2>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={joinCode}
              onChange={(event) =>
                setJoinCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
              }
              placeholder="ROOM CODE"
              className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background/80 px-3 font-mono text-sm font-bold tracking-widest outline-none focus:border-gold"
            />
            <button
              disabled={busy || joinCode.length !== 6}
              onClick={() => void onJoin(joinCode, name)}
              className="rounded-xl bg-gold px-4 text-sm font-bold text-background disabled:opacity-40"
            >
              Join
            </button>
          </div>
        </div>

        <MemoryMvpNotice />
      </main>
    </div>
  )
}

function WaitingRoom({
  room,
  notice,
  onLeave,
}: {
  room: OnlineRoomSnapshot
  notice: string | null
  onLeave: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(room.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-temple px-5 text-center">
      <div className="w-full max-w-md rounded-[2rem] border border-gold/30 bg-card/85 p-6 shadow-2xl backdrop-blur-xl animate-fade-rise">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-gold/15 text-gold ring-1 ring-gold/40">
          <Wifi className="size-8 animate-pulse" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-foreground">Waiting for Opponent</h1>
        <p className="mt-2 text-sm text-muted-foreground">Share this room code with the second player.</p>

        <div className="mt-5 rounded-2xl border border-gold/40 bg-gold-soft p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Room code</p>
          <div className="mt-1 flex items-center justify-center gap-3">
            <span className="font-mono text-3xl font-black tracking-[0.22em] text-gold">{room.code}</span>
            <button
              type="button"
              onClick={() => void copyCode()}
              className="flex size-9 items-center justify-center rounded-xl border border-border bg-card"
              title="Copy room code"
            >
              {copied ? <Check className="size-4 text-gold" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-gold" />
          <span>Polling room state…</span>
        </div>

        {notice && <p className="mt-3 text-sm font-semibold text-gold">{notice}</p>}

        <button
          type="button"
          onClick={onLeave}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/60 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
          Leave room
        </button>

        <div className="mt-4"><MemoryMvpNotice compact /></div>
      </div>
    </div>
  )
}

function OnlineMatch({
  session,
  room,
  setRoom,
  notice,
  setNotice,
  onLeave,
}: {
  session: OnlineSession
  room: OnlineRoomSnapshot
  setRoom: (room: OnlineRoomSnapshot) => void
  notice: string | null
  setNotice: (notice: string | null) => void
  onLeave: () => void
}) {
  const [resignOpen, setResignOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [rematchBusy, setRematchBusy] = useState(false)

  const submitMove = useCallback(
    async (from: number, to: number, expectedMoveCount: number) => {
      const next = await requestJson<OnlineRoomSnapshot>(
        `/api/rek-online/rooms/${encodeURIComponent(session.code)}/move`,
        {
          method: 'POST',
          body: JSON.stringify({
            token: session.token,
            from,
            to,
            expectedMoveCount,
          }),
        },
      )
      setRoom(next)
      setNotice(null)
    },
    [session, setNotice, setRoom],
  )

  const controller = useOnlineRekEngine({
    room,
    submitMove,
    onError: setNotice,
  })

  const game = room.state
  const { playerColor } = room
  const opponentColor = opponent(playerColor)
  const ownName = playerColor === 'you' ? room.hostName : room.guestName ?? 'Guest'
  const opponentName = opponentColor === 'you' ? room.hostName : room.guestName ?? 'Opponent'
  const hostName = room.hostName
  const guestName = room.guestName ?? 'Guest'

  const opponentConnection: ConnectionState = !room.opponentPresent
    ? 'disconnected'
    : room.opponentConnected
      ? 'connected'
      : 'reconnecting'

  const canControl =
    game.status === 'playing' &&
    game.turn === playerColor &&
    room.opponentConnected &&
    !controller.pending

  const winnerKing =
    game.winner && game.winner !== 'draw' ? kingIndex(game.board, game.winner) : null

  const resign = async () => {
    try {
      const next = await requestJson<OnlineRoomSnapshot>(
        `/api/rek-online/rooms/${encodeURIComponent(session.code)}/resign`,
        {
          method: 'POST',
          body: JSON.stringify({ token: session.token }),
        },
      )
      setRoom(next)
      setResignOpen(false)
      setNotice(null)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not resign')
    }
  }

  const requestRematch = async () => {
    setRematchBusy(true)
    try {
      const response = await requestJson<{ room: OnlineRoomSnapshot; restarted: boolean }>(
        `/api/rek-online/rooms/${encodeURIComponent(session.code)}/rematch`,
        {
          method: 'POST',
          body: JSON.stringify({ token: session.token }),
        },
      )
      setRoom(response.room)
      setNotice(
        response.restarted ? null : 'Rematch requested. Waiting for opponent to accept…',
      )
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not request rematch')
    } finally {
      setRematchBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-temple selection:bg-gold/30">
      {controller.bannerAlert && (
        <div className="pointer-events-none fixed left-1/2 top-18 z-50 -translate-x-1/2 animate-bounce">
          <div className="rounded-full border border-gold bg-background/95 px-5 py-2.5 text-sm font-black text-gold shadow-2xl shadow-gold/30 ring-4 ring-gold/30 backdrop-blur-xl">
            {controller.bannerAlert}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl shadow-md">
        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4.5" /> Exit
        </button>
        <div className="text-center">
          <p className="font-display text-sm font-bold uppercase tracking-wider text-gold">Online · {room.code}</p>
          <p className="text-[10px] font-semibold text-muted-foreground">{room.mode === 'REK_POAT' ? 'Rek Poat' : 'Min Rek Chanh'}</p>
        </div>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-gold"
          title="Move history"
        >
          <History className="size-4" />
        </button>
      </header>

      {(notice || opponentConnection !== 'connected' || room.rematchRequestedByOpponent) && (
        <div className="flex flex-col gap-1 border-b border-gold/20 bg-gold/10 px-4 py-2 text-center text-xs font-semibold text-gold">
          {opponentConnection !== 'connected' && game.status === 'playing' && (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="size-3.5 animate-spin" /> Opponent connection is stale — board locked until heartbeat returns.
            </span>
          )}
          {room.rematchRequestedByOpponent && game.status !== 'playing' && (
            <span>Opponent requested a rematch. Tap Play Again to accept.</span>
          )}
          {notice && <span>{notice}</span>}
        </div>
      )}

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-4 pb-8 pt-3 animate-fade-rise">
        <PlayerCard
          player={opponentColor}
          name={opponentName}
          active={game.turn === opponentColor && game.status === 'playing'}
          piecesLeft={countPieces(game.board, opponentColor)}
          captured={game.captured[playerColor].length}
          connection={opponentConnection}
        />

        <TurnIndicator
          turn={game.turn}
          youName={hostName}
          oppName={guestName}
          rekAvailable={controller.rekAvailable && game.status === 'playing'}
        />

        <div className="flex justify-center py-1">
          <Board
            board={game.board}
            selected={controller.selected}
            moveResults={controller.moveResults}
            lastMove={game.lastMove}
            lastCaptured={game.lastCaptured}
            interactive={canControl}
            flipped={playerColor === 'opp'}
            onSelect={controller.select}
            threatened={controller.threatened}
            winnerKing={game.status !== 'playing' ? winnerKing : null}
          />
        </div>

        <PlayerCard
          player={playerColor}
          name={`${ownName} (You)`}
          active={game.turn === playerColor && game.status === 'playing'}
          piecesLeft={countPieces(game.board, playerColor)}
          captured={game.captured[opponentColor].length}
          connection="connected"
        />

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/how-to-play"
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card/80 text-xs font-bold text-foreground hover:border-gold/50 hover:text-gold"
          >
            <ShieldCheck className="size-4" /> Rules
          </Link>
          <button
            type="button"
            disabled={game.status !== 'playing'}
            onClick={() => setResignOpen(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 text-xs font-bold text-destructive hover:bg-destructive/15 disabled:opacity-40"
          >
            <Flag className="size-4" /> Resign
          </button>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="font-bold text-foreground">Server authority:</span> every submitted move is revalidated by the core Rek engine before this shared room state changes.
        </div>
      </main>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)}>
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <History className="size-5 text-gold" />
          <h2 className="font-display text-xl font-bold">Shared Move History</h2>
        </div>
        <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
          {controller.history.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No executed moves yet.</p>
          ) : (
            controller.history.map((move, index) => (
              <div key={`${move.timestamp}-${index}`} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-2.5 text-xs">
                <div>
                  <span className="font-bold">{move.player === 'you' ? hostName : guestName}</span>
                  <span className="ml-2 font-mono text-gold">{move.fromCoord} → {move.toCoord}</span>
                </div>
                <div className="flex gap-1">
                  {move.rek && <span className="rounded bg-gold px-1.5 py-0.5 font-bold text-background">REK</span>}
                  {move.poat && <span className="rounded bg-cyan-400 px-1.5 py-0.5 font-bold text-background">POAT</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      <Modal open={resignOpen} onClose={() => setResignOpen(false)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          <h2 className="font-display text-2xl font-bold">Resign this room?</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">The server will award the opponent victory and both players will see the same result.</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setResignOpen(false)}
            className="h-11 flex-1 rounded-xl border border-border bg-card font-bold"
          >
            Keep playing
          </button>
          <button
            type="button"
            onClick={() => void resign()}
            className="h-11 flex-1 rounded-xl bg-destructive/20 font-bold text-destructive ring-1 ring-destructive/40"
          >
            Resign
          </button>
        </div>
      </Modal>

      <ResultOverlay
        open={game.status !== 'playing'}
        winner={game.winner}
        reason={game.winReason}
        youName={hostName}
        oppName={guestName}
        perspective={playerColor}
        onPlayAgain={() => {
          if (!rematchBusy) void requestRematch()
        }}
      />
    </div>
  )
}

function MemoryMvpNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn(
      'flex gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-left text-amber-300',
      compact ? 'p-2.5 text-[10px]' : 'p-3 text-xs',
    )}>
      <Server className="mt-0.5 size-4 shrink-0" />
      <p>
        <strong>Online MVP storage:</strong> rooms live in one server process and expire after inactivity. A production multi-instance deploy must swap this store for Redis/KV or another durable shared database.
      </p>
    </div>
  )
}
