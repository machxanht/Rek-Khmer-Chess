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

/** Canonical rule sets exposed by the engine. */
export type RuleSet = 'REK_STANDARD' | 'MIN_REK_CHANH'

/** Legacy identifier accepted only as compatibility input. */
export type LegacyRuleSet = 'REK_POAT'

/**
 * Input accepted at compatibility boundaries. New application code should use
 * the canonical `RuleSet` values; legacy callers may still submit `REK_POAT`.
 */
export type RuleSetInput = RuleSet | LegacyRuleSet

/** @deprecated Prefer `RuleSet` for canonical state and `RuleSetInput` for compatibility inputs. */
export type GameMode = RuleSetInput

export const DEFAULT_RULESET: RuleSet = 'REK_STANDARD'

export function normalizeRuleSet(mode: RuleSetInput = DEFAULT_RULESET): RuleSet {
  return mode === 'REK_POAT' ? 'REK_STANDARD' : mode
}

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

/**
 * Compatibility state shape accepted at load/custom-state boundaries.
 * Legacy serialized states may still contain `mode: 'REK_POAT'` before
 * normalization.
 */
export interface GameState {
  board: Cell[]
  turn: PlayerColor
  status: GameStatus
  winner: PlayerColor | 'draw' | null
  winReason: string | null
  mode: RuleSetInput
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
   * Project extension currently used by the engine. Traditional Rek evidence
   * for this exact limit remains unverified; see the evidence-based rule guide.
   */
  drawMoveLimit?: number
}

/**
 * State guaranteed by the public session facade after normalization. Public
 * callers never receive the legacy `REK_POAT` identifier in this shape.
 */
export type CanonicalGameState = Omit<GameState, 'mode'> & { mode: RuleSet }

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
