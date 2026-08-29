// Core Types for Rek Khmer (ល្បែងរែក) Engine
// Conforming to /HUONG_DAN_LUAT_CO_REK_KHMER.md and /SPEC_ENGINE_CO_REK_KHMER.md

export const BOARD_SIZE = 8

export type PlayerColor = 'you' | 'opp' // you = White (bottom/rows 6-7), opp = Black (top/rows 0-1)

export interface Piece {
  player: PlayerColor
  king: boolean
  id: string
}

export type Cell = Piece | null

export type GameMode = 'REK_POAT' | 'MIN_REK_CHANH'

export interface MoveCoordinate {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}

export interface MoveResult {
  from: number
  to: number
  rekCaptures: number[]
  poatCaptures: number[]
  captures: number[]
  rek: boolean
  poat: boolean
  isHaoRekViolation?: boolean
  sanNotation?: string
}

export type GameStatus = 'playing' | 'won' | 'draw'

export interface GameState {
  board: Cell[]
  turn: PlayerColor
  status: GameStatus
  winner: PlayerColor | 'draw' | null
  winReason: string | null
  mode: GameMode
  lastMove: { from: number; to: number } | null
  lastCaptured: number[]
  lastRek: boolean
  lastPoat: boolean
  captured: { you: Piece[]; opp: Piece[] }
  moveCount: number
  availableRekMovesCount: number
}

export interface Direction {
  dr: number
  dc: number
}

export interface TacticalPuzzle {
  id: number
  titleKhmer: string
  titleEn: string
  desc: string
  difficulty: 'Beginner' | 'Intermediate' | 'Master'
  hint: string
  solution: { fromCoord: string; toCoord: string }
  setup: (board: Cell[]) => void
}

export interface TestResult {
  id: string
  title: string
  passed: boolean
  details: string
  error?: string
}
