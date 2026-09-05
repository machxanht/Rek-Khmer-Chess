// Core Types for Rek Khmer (ល្បែងរែក) Engine
// Conforming to /HUONG_DAN_LUAT_CO_REK_KHMER.md and /SPEC_ENGINE_CO_REK_KHMER.md

export const BOARD_SIZE = 8
export const DEFAULT_LONE_KING_DRAW_LIMIT = 32

export type PlayerColor = 'you' | 'opp' // you = White (bottom formation rows 5-7), opp = Black (top formation rows 0-2)

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

  /**
   * Threefold repetition bookkeeping. Optional for compatibility with older
   * serialized/custom states; executeMove() reconstructs the current position
   * count when it is absent.
   */
  positionCounts?: Record<string, number>

  /**
   * Number of completed plies after a side had already entered a lone-King
   * state. The capture/move that first creates the lone-King state starts the
   * clock at zero; subsequent legal plies increment it.
   */
  loneKingMoveCount?: number

  /**
   * Regional rules vary (the research guide records 24/32/44). The technical
   * SPEC selects 32, so 32 is the engine default while remaining configurable.
   */
  drawMoveLimit?: number
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
