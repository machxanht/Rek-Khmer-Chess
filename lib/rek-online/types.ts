import type { GameMode, GameState, PlayerColor } from '@/lib/rek-engine'

export type OnlineRole = 'host' | 'guest'
export type OnlineRoomPhase = 'waiting' | 'playing' | 'finished'

export interface OnlineMoveRecord {
  ply: number
  from: number
  to: number
  player: PlayerColor
  pieceName: string
  fromCoord: string
  toCoord: string
  captures: number
  rek: boolean
  poat: boolean
  timestamp: string
}

export interface OnlineRoomSnapshot {
  code: string
  role: OnlineRole
  playerColor: PlayerColor
  mode: GameMode
  phase: OnlineRoomPhase
  state: GameState
  moves: OnlineMoveRecord[]
  hostName: string
  guestName: string | null
  opponentPresent: boolean
  opponentConnected: boolean
  rematchRequestedByYou: boolean
  rematchRequestedByOpponent: boolean
  updatedAt: number
}

export interface OnlineSession {
  code: string
  token: string
  role: OnlineRole
  playerColor: PlayerColor
}

export interface CreateOnlineRoomResponse {
  session: OnlineSession
  room: OnlineRoomSnapshot
  storage: 'memory-mvp'
}

export interface JoinOnlineRoomResponse {
  session: OnlineSession
  room: OnlineRoomSnapshot
  storage: 'memory-mvp'
}

export interface OnlineApiError {
  error: string
  code: string
}
