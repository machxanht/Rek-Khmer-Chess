import { randomBytes } from 'node:crypto'
import { WebSocket, WebSocketServer, type RawData } from 'ws'
import { createGame, type RekGame, type RuleSet } from '../lib/rek-engine'
import type { OnlineClientMessage, OnlineServerMessage } from '../shared/online-protocol'

interface Room {
  id: string
  game: RekGame
  ruleset: RuleSet
  you: WebSocket | null
  opp: WebSocket | null
  youToken: string
  oppToken: string | null
  expiryTimer: ReturnType<typeof setTimeout> | null
  idleTimer: ReturnType<typeof setTimeout> | null
}

export interface OnlineServerOptions {
  port?: number
  host?: string
  resumeGraceMs?: number
  roomIdleMs?: number
}

function send(socket: WebSocket | null, message: OnlineServerMessage): void {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
  }
}

function isBoardIndex(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) < 64
}

function isRoomId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Z0-9]{6}$/.test(value)
}

function isResumeToken(value: unknown): value is string {
  return typeof value === 'string' && /^[A-F0-9]{32}$/.test(value)
}

function parseMessage(data: RawData): OnlineClientMessage | null {
  let value: unknown
  try {
    value = JSON.parse(data.toString())
  } catch {
    return null
  }

  if (!value || typeof value !== 'object') return null
  const message = value as Record<string, unknown>

  if (
    message.type === 'create' &&
    (message.ruleset === 'REK_STANDARD' || message.ruleset === 'MIN_REK_CHANH')
  ) {
    return { type: 'create', ruleset: message.ruleset }
  }

  if (message.type === 'join' && isRoomId(message.roomId)) {
    return { type: 'join', roomId: message.roomId }
  }

  if (
    message.type === 'resume' &&
    isRoomId(message.roomId) &&
    isResumeToken(message.resumeToken)
  ) {
    return {
      type: 'resume',
      roomId: message.roomId,
      resumeToken: message.resumeToken,
    }
  }

  if (
    message.type === 'move' &&
    isRoomId(message.roomId) &&
    isBoardIndex(message.from) &&
    isBoardIndex(message.to)
  ) {
    return {
      type: 'move',
      roomId: message.roomId,
      from: message.from,
      to: message.to,
    }
  }

  return null
}

function createRoomId(rooms: Map<string, Room>): string {
  for (;;) {
    const id = randomBytes(3).toString('hex').toUpperCase()
    if (!rooms.has(id)) return id
  }
}

function createResumeToken(): string {
  return randomBytes(16).toString('hex').toUpperCase()
}

export function createOnlineServer(options: OnlineServerOptions = {}): WebSocketServer {
  const rooms = new Map<string, Room>()
  const socketRooms = new Map<WebSocket, string>()
  const resumeGraceMs = options.resumeGraceMs ?? 120_000
  const roomIdleMs = options.roomIdleMs ?? 30 * 60_000
  const wss = new WebSocketServer({
    port: options.port ?? 8787,
    host: options.host,
    maxPayload: 4096,
  })

  const clearExpiry = (room: Room) => {
    if (!room.expiryTimer) return
    clearTimeout(room.expiryTimer)
    room.expiryTimer = null
  }

  const clearIdle = (room: Room) => {
    if (!room.idleTimer) return
    clearTimeout(room.idleTimer)
    room.idleTimer = null
  }

  const expireRoom = (room: Room, message: string) => {
    clearExpiry(room)
    clearIdle(room)
    rooms.delete(room.id)
    for (const socket of [room.you, room.opp]) {
      if (!socket) continue
      socketRooms.delete(socket)
      send(socket, { type: 'error', message })
      socket.close(1000, message)
    }
  }

  const touchRoom = (room: Room) => {
    clearIdle(room)
    room.idleTimer = setTimeout(() => expireRoom(room, 'Room expired'), roomIdleMs)
    room.idleTimer.unref?.()
  }

  const scheduleExpiryIfEmpty = (room: Room) => {
    if (room.you || room.opp || room.expiryTimer) return
    clearIdle(room)
    room.expiryTimer = setTimeout(() => {
      rooms.delete(room.id)
    }, resumeGraceMs)
    room.expiryTimer.unref?.()
  }

  const sendRoom = (
    socket: WebSocket,
    room: Room,
    color: 'you' | 'opp',
    resumeToken: string,
    resumed: boolean,
  ) => {
    send(socket, {
      type: 'room',
      roomId: room.id,
      color,
      snapshot: room.game.serialize(),
      resumeToken,
      peerConnected: color === 'you' ? room.opp !== null : room.you !== null,
      resumed,
    })
  }

  wss.on('connection', (socket) => {
    socket.on('message', (raw) => {
      const message = parseMessage(raw)
      if (!message) {
        send(socket, { type: 'error', message: 'Invalid message' })
        return
      }

      if (message.type === 'create') {
        if (socketRooms.has(socket)) {
          send(socket, { type: 'error', message: 'Socket already belongs to a room' })
          return
        }

        const id = createRoomId(rooms)
        const game = createGame(message.ruleset)
        const room: Room = {
          id,
          game,
          ruleset: message.ruleset,
          you: socket,
          opp: null,
          youToken: createResumeToken(),
          oppToken: null,
          expiryTimer: null,
          idleTimer: null,
        }
        rooms.set(id, room)
        touchRoom(room)
        socketRooms.set(socket, id)
        sendRoom(socket, room, 'you', room.youToken, false)
        return
      }

      if (message.type === 'join') {
        if (socketRooms.has(socket)) {
          send(socket, { type: 'error', message: 'Socket already belongs to a room' })
          return
        }

        const room = rooms.get(message.roomId)
        if (!room) {
          send(socket, { type: 'error', message: 'Room not found' })
          return
        }
        if (room.oppToken) {
          send(socket, { type: 'error', message: 'Room is full' })
          return
        }

        clearExpiry(room)
        room.opp = socket
        room.oppToken = createResumeToken()
        socketRooms.set(socket, room.id)
        touchRoom(room)
        sendRoom(socket, room, 'opp', room.oppToken, false)
        send(room.you, { type: 'peer', roomId: room.id, status: 'joined' })
        return
      }

      if (message.type === 'resume') {
        if (socketRooms.has(socket)) {
          send(socket, { type: 'error', message: 'Socket already belongs to a room' })
          return
        }

        const room = rooms.get(message.roomId)
        if (!room) {
          send(socket, { type: 'error', message: 'Room not found' })
          return
        }

        let color: 'you' | 'opp'
        if (message.resumeToken === room.youToken) {
          if (room.you) {
            send(socket, { type: 'error', message: 'Seat already connected' })
            return
          }
          color = 'you'
          room.you = socket
        } else if (room.oppToken && message.resumeToken === room.oppToken) {
          if (room.opp) {
            send(socket, { type: 'error', message: 'Seat already connected' })
            return
          }
          color = 'opp'
          room.opp = socket
        } else {
          send(socket, { type: 'error', message: 'Invalid resume token' })
          return
        }

        clearExpiry(room)
        socketRooms.set(socket, room.id)
        touchRoom(room)
        sendRoom(socket, room, color, message.resumeToken, true)
        const peer = color === 'you' ? room.opp : room.you
        send(peer, { type: 'peer', roomId: room.id, status: 'joined' })
        return
      }

      const room = rooms.get(message.roomId)
      if (!room || socketRooms.get(socket) !== room.id) {
        send(socket, { type: 'error', message: 'Not joined to this room' })
        return
      }
      if (!room.you || !room.opp) {
        send(socket, { type: 'error', message: 'Waiting for opponent' })
        return
      }

      const state = room.game.getState()
      const expectedSocket = state.turn === 'you' ? room.you : room.opp
      if (socket !== expectedSocket) {
        send(socket, { type: 'error', message: 'Not your turn' })
        return
      }

      if (!room.game.makeMove(message.from, message.to)) {
        send(socket, { type: 'error', message: 'Move rejected by Rek engine' })
        return
      }

      touchRoom(room)

      const update: OnlineServerMessage = {
        type: 'state',
        roomId: room.id,
        snapshot: room.game.serialize(),
        move: { from: message.from, to: message.to },
      }
      send(room.you, update)
      send(room.opp, update)
    })

    socket.on('close', () => {
      const roomId = socketRooms.get(socket)
      socketRooms.delete(socket)
      if (!roomId) return

      const room = rooms.get(roomId)
      if (!room) return

      if (room.you === socket) {
        room.you = null
        send(room.opp, { type: 'peer', roomId, status: 'left' })
      } else if (room.opp === socket) {
        room.opp = null
        send(room.you, { type: 'peer', roomId, status: 'left' })
      }

      if (room.you || room.opp) touchRoom(room)
      else scheduleExpiryIfEmpty(room)
    })
  })

  return wss
}
