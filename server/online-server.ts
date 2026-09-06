import { randomBytes } from 'node:crypto'
import { WebSocket, WebSocketServer, type RawData } from 'ws'
import { createGame, type RekGame, type RuleSet } from '../lib/rek-engine'
import type { OnlineClientMessage, OnlineServerMessage } from '../shared/online-protocol'

interface Room {
  id: string
  game: RekGame
  ruleset: RuleSet
  you: WebSocket
  opp: WebSocket | null
}

export interface OnlineServerOptions {
  port?: number
  host?: string
}

function send(socket: WebSocket, message: OnlineServerMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
  }
}

function isBoardIndex(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) < 64
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

  if (
    message.type === 'join' &&
    typeof message.roomId === 'string' &&
    /^[A-Z0-9]{6}$/.test(message.roomId)
  ) {
    return { type: 'join', roomId: message.roomId }
  }

  if (
    message.type === 'move' &&
    typeof message.roomId === 'string' &&
    /^[A-Z0-9]{6}$/.test(message.roomId) &&
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

export function createOnlineServer(options: OnlineServerOptions = {}): WebSocketServer {
  const rooms = new Map<string, Room>()
  const socketRooms = new Map<WebSocket, string>()
  const wss = new WebSocketServer({
    port: options.port ?? 8787,
    host: options.host,
    maxPayload: 4096,
  })

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
        }
        rooms.set(id, room)
        socketRooms.set(socket, id)
        send(socket, {
          type: 'room',
          roomId: id,
          color: 'you',
          snapshot: game.serialize(),
        })
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
        if (room.opp) {
          send(socket, { type: 'error', message: 'Room is full' })
          return
        }

        room.opp = socket
        socketRooms.set(socket, room.id)
        send(socket, {
          type: 'room',
          roomId: room.id,
          color: 'opp',
          snapshot: room.game.serialize(),
        })
        send(room.you, { type: 'peer', roomId: room.id, status: 'joined' })
        return
      }

      const room = rooms.get(message.roomId)
      if (!room || socketRooms.get(socket) !== room.id) {
        send(socket, { type: 'error', message: 'Not joined to this room' })
        return
      }
      if (!room.opp) {
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
        if (room.opp) {
          send(room.opp, { type: 'peer', roomId, status: 'left' })
          socketRooms.delete(room.opp)
        }
        rooms.delete(roomId)
        return
      }

      if (room.opp === socket) {
        room.opp = null
        send(room.you, { type: 'peer', roomId, status: 'left' })
      }
    })
  })

  return wss
}
