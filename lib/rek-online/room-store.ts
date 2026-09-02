import { randomBytes, randomUUID } from 'node:crypto'
import {
  createInitialState,
  executeMove,
  idxToCoord,
  opponent,
  type GameMode,
  type GameState,
  type PlayerColor,
} from '../rek-engine'
import type {
  OnlineMoveRecord,
  OnlineRole,
  OnlineRoomPhase,
  OnlineRoomSnapshot,
  OnlineSession,
} from './types'

const ROOM_TTL_MS = 6 * 60 * 60 * 1000
const CONNECTED_WINDOW_MS = 15_000
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

interface RoomPlayer {
  token: string
  name: string
  lastSeen: number
}

interface RekRoomRecord {
  code: string
  mode: GameMode
  state: GameState
  host: RoomPlayer
  guest: RoomPlayer | null
  moves: OnlineMoveRecord[]
  rematchRequests: Set<PlayerColor>
  createdAt: number
  updatedAt: number
}

export class RekRoomError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message)
    this.name = 'RekRoomError'
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __rekOnlineRooms: Map<string, RekRoomRecord> | undefined
}

const rooms = globalThis.__rekOnlineRooms ?? new Map<string, RekRoomRecord>()
globalThis.__rekOnlineRooms = rooms

function normalizeName(name: unknown, fallback: string): string {
  if (typeof name !== 'string') return fallback
  const trimmed = name.trim().replace(/\s+/g, ' ')
  return trimmed.slice(0, 24) || fallback
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

function generateCode(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const bytes = randomBytes(6)
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
    }
    if (!rooms.has(code)) return code
  }
  throw new RekRoomError('ROOM_CODE_EXHAUSTED', 'Could not allocate a room code', 503)
}

function pruneExpiredRooms(now = Date.now()): void {
  for (const [code, room] of rooms) {
    if (now - room.updatedAt > ROOM_TTL_MS) rooms.delete(code)
  }
}

function getRoom(code: string): RekRoomRecord {
  pruneExpiredRooms()
  const normalized = normalizeCode(code)
  const room = rooms.get(normalized)
  if (!room) throw new RekRoomError('ROOM_NOT_FOUND', 'Room not found or expired', 404)
  return room
}

function identify(room: RekRoomRecord, token: string): {
  role: OnlineRole
  color: PlayerColor
  player: RoomPlayer
  opponent: RoomPlayer | null
} {
  if (room.host.token === token) {
    return { role: 'host', color: 'you', player: room.host, opponent: room.guest }
  }
  if (room.guest?.token === token) {
    return { role: 'guest', color: 'opp', player: room.guest, opponent: room.host }
  }
  throw new RekRoomError('UNAUTHORIZED_ROOM', 'Invalid room session token', 401)
}

function phaseFor(room: RekRoomRecord): OnlineRoomPhase {
  if (!room.guest) return 'waiting'
  if (room.state.status === 'playing') return 'playing'
  return 'finished'
}

function snapshot(room: RekRoomRecord, token: string, touch = true): OnlineRoomSnapshot {
  const now = Date.now()
  const identity = identify(room, token)
  if (touch) {
    identity.player.lastSeen = now
    room.updatedAt = now
  }

  return {
    code: room.code,
    role: identity.role,
    playerColor: identity.color,
    mode: room.mode,
    phase: phaseFor(room),
    state: room.state,
    moves: room.moves,
    hostName: room.host.name,
    guestName: room.guest?.name ?? null,
    opponentPresent: identity.opponent !== null,
    opponentConnected:
      identity.opponent !== null && now - identity.opponent.lastSeen <= CONNECTED_WINDOW_MS,
    rematchRequestedByYou: room.rematchRequests.has(identity.color),
    rematchRequestedByOpponent: room.rematchRequests.has(opponent(identity.color)),
    updatedAt: room.updatedAt,
  }
}

function sessionFor(room: RekRoomRecord, token: string): OnlineSession {
  const identity = identify(room, token)
  return {
    code: room.code,
    token,
    role: identity.role,
    playerColor: identity.color,
  }
}

export function createRoom(input?: {
  mode?: GameMode
  name?: string
}): { session: OnlineSession; room: OnlineRoomSnapshot } {
  pruneExpiredRooms()
  const mode: GameMode = input?.mode === 'MIN_REK_CHANH' ? 'MIN_REK_CHANH' : 'REK_POAT'
  const now = Date.now()
  const code = generateCode()
  const token = randomUUID()
  const record: RekRoomRecord = {
    code,
    mode,
    state: createInitialState(mode),
    host: {
      token,
      name: normalizeName(input?.name, 'Host'),
      lastSeen: now,
    },
    guest: null,
    moves: [],
    rematchRequests: new Set(),
    createdAt: now,
    updatedAt: now,
  }
  rooms.set(code, record)
  return { session: sessionFor(record, token), room: snapshot(record, token, false) }
}

export function joinRoom(
  code: string,
  input?: { name?: string },
): { session: OnlineSession; room: OnlineRoomSnapshot } {
  const room = getRoom(code)
  if (room.guest) {
    throw new RekRoomError('ROOM_FULL', 'Room already has two players', 409)
  }
  if (room.state.moveCount > 0 || room.state.status !== 'playing') {
    throw new RekRoomError('ROOM_ALREADY_STARTED', 'Room already started', 409)
  }

  const now = Date.now()
  const token = randomUUID()
  room.guest = {
    token,
    name: normalizeName(input?.name, 'Guest'),
    lastSeen: now,
  }
  room.updatedAt = now

  return { session: sessionFor(room, token), room: snapshot(room, token, false) }
}

export function getRoomSnapshot(code: string, token: string): OnlineRoomSnapshot {
  if (!token) throw new RekRoomError('MISSING_TOKEN', 'Room token is required', 401)
  return snapshot(getRoom(code), token)
}

export function submitRoomMove(
  code: string,
  input: {
    token: string
    from: number
    to: number
    expectedMoveCount: number
  },
): OnlineRoomSnapshot {
  const room = getRoom(code)
  const identity = identify(room, input.token)
  if (!room.guest) throw new RekRoomError('WAITING_FOR_OPPONENT', 'Opponent has not joined yet', 409)
  if (room.state.status !== 'playing') throw new RekRoomError('GAME_FINISHED', 'Game is already finished', 409)
  if (room.state.turn !== identity.color) throw new RekRoomError('NOT_YOUR_TURN', 'It is not your turn', 409)
  if (!Number.isInteger(input.from) || !Number.isInteger(input.to)) {
    throw new RekRoomError('INVALID_MOVE_PAYLOAD', 'Move coordinates must be board indexes')
  }
  if (input.expectedMoveCount !== room.state.moveCount) {
    throw new RekRoomError('STALE_STATE', 'Room state changed; refresh before moving', 409)
  }

  const before = room.state
  const movingPiece = before.board[input.from]
  const next = executeMove(before, input.from, input.to)
  if (next === before) throw new RekRoomError('ILLEGAL_MOVE', 'Core engine rejected this move', 422)

  const moveExecuted =
    next.moveCount === before.moveCount + 1 &&
    next.lastMove?.from === input.from &&
    next.lastMove?.to === input.to

  if (moveExecuted && movingPiece) {
    const record: OnlineMoveRecord = {
      ply: next.moveCount,
      from: input.from,
      to: input.to,
      player: identity.color,
      pieceName: movingPiece.king ? 'Sdech (King)' : 'Pol (Man)',
      fromCoord: idxToCoord(input.from),
      toCoord: idxToCoord(input.to),
      captures: next.lastCaptured.length,
      rek: next.lastRek,
      poat: next.lastPoat,
      timestamp: new Date().toISOString(),
    }
    room.moves.push(record)
  }

  room.state = next
  room.rematchRequests.clear()
  room.updatedAt = Date.now()
  return snapshot(room, input.token)
}

export function resignRoom(code: string, token: string): OnlineRoomSnapshot {
  const room = getRoom(code)
  const identity = identify(room, token)
  if (!room.guest) throw new RekRoomError('WAITING_FOR_OPPONENT', 'Opponent has not joined yet', 409)
  if (room.state.status !== 'playing') throw new RekRoomError('GAME_FINISHED', 'Game is already finished', 409)

  room.state = {
    ...room.state,
    status: 'won',
    winner: opponent(identity.color),
    winReason: `${identity.player.name} resigned`,
    availableRekMovesCount: 0,
  }
  room.rematchRequests.clear()
  room.updatedAt = Date.now()
  return snapshot(room, token)
}

export function requestRematch(code: string, token: string): {
  room: OnlineRoomSnapshot
  restarted: boolean
} {
  const room = getRoom(code)
  const identity = identify(room, token)
  if (!room.guest) throw new RekRoomError('WAITING_FOR_OPPONENT', 'Opponent has not joined yet', 409)
  if (room.state.status === 'playing') {
    throw new RekRoomError('GAME_STILL_PLAYING', 'Rematch can be requested only after the game ends', 409)
  }

  room.rematchRequests.add(identity.color)
  let restarted = false
  if (room.rematchRequests.size === 2) {
    room.state = createInitialState(room.mode)
    room.moves = []
    room.rematchRequests.clear()
    restarted = true
  }
  room.updatedAt = Date.now()
  return { room: snapshot(room, token), restarted }
}

/** Test-only helper used by the protocol regression suite. */
export function __resetRoomStoreForTests(): void {
  rooms.clear()
}
