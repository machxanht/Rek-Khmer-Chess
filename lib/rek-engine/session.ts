import {
  BOARD_SIZE,
  DEFAULT_RULESET,
  Cell,
  GameMode,
  GameState,
  MoveResult,
  Piece,
  PlayerColor,
  normalizeRuleSet,
} from './types'
import {
  createInitialState,
  executeMove,
  getAllRekOpportunities,
  getMoveResults,
  normalizePositionCounts,
} from './engine'

export const REK_GAME_SNAPSHOT_VERSION = 1 as const

interface RekGameSnapshotV1 {
  version: typeof REK_GAME_SNAPSHOT_VERSION
  state: GameState
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPlayerColor(value: unknown): value is PlayerColor {
  return value === 'you' || value === 'opp'
}

function isGameMode(value: unknown): value is GameMode {
  return value === 'REK_STANDARD' || value === 'REK_POAT' || value === 'MIN_REK_CHANH'
}

function isBoardIndex(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < BOARD_SIZE * BOARD_SIZE
  )
}

function clonePiece(piece: Piece): Piece {
  return { ...piece }
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    board: state.board.map((piece) => (piece ? clonePiece(piece) : null)),
    lastMove: state.lastMove ? { ...state.lastMove } : null,
    lastCaptured: [...state.lastCaptured],
    captured: {
      you: state.captured.you.map(clonePiece),
      opp: state.captured.opp.map(clonePiece),
    },
    positionCounts: state.positionCounts ? { ...state.positionCounts } : undefined,
  }
}

function assertPiece(value: unknown, label: string, expectedPlayer?: PlayerColor): asserts value is Piece {
  if (!isRecord(value)) throw new Error(`${label} must be a piece object`)
  if (!isPlayerColor(value.player)) throw new Error(`${label}.player is invalid`)
  if (expectedPlayer && value.player !== expectedPlayer) {
    throw new Error(`${label}.player must be ${expectedPlayer}`)
  }
  if (typeof value.king !== 'boolean') throw new Error(`${label}.king must be boolean`)
  if (typeof value.id !== 'string' || value.id.length === 0) {
    throw new Error(`${label}.id must be a non-empty string`)
  }
}

function assertPieceArray(
  value: unknown,
  label: string,
  expectedPlayer: PlayerColor
): asserts value is Piece[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`)
  value.forEach((piece, index) => assertPiece(piece, `${label}[${index}]`, expectedPlayer))
}

function assertGameState(value: unknown): asserts value is GameState {
  if (!isRecord(value)) throw new Error('snapshot.state must be an object')

  if (!Array.isArray(value.board) || value.board.length !== BOARD_SIZE * BOARD_SIZE) {
    throw new Error(`snapshot.state.board must contain exactly ${BOARD_SIZE * BOARD_SIZE} cells`)
  }

  const allIds = new Set<string>()
  let youKings = 0
  let oppKings = 0
  for (let index = 0; index < value.board.length; index++) {
    const cell = value.board[index]
    if (cell === null) continue
    assertPiece(cell, `snapshot.state.board[${index}]`)
    if (allIds.has(cell.id)) throw new Error(`duplicate piece id: ${cell.id}`)
    allIds.add(cell.id)
    if (cell.king) {
      if (cell.player === 'you') youKings++
      else oppKings++
    }
  }

  if (youKings > 1 || oppKings > 1) {
    throw new Error('snapshot.state.board may contain at most one King per side')
  }

  if (!isPlayerColor(value.turn)) throw new Error('snapshot.state.turn is invalid')
  if (!isGameMode(value.mode)) throw new Error('snapshot.state.mode is invalid')
  if (value.status !== 'playing' && value.status !== 'won' && value.status !== 'draw') {
    throw new Error('snapshot.state.status is invalid')
  }

  if (value.status === 'playing' && value.winner !== null) {
    throw new Error('playing snapshot cannot have a winner')
  }
  if (value.status === 'won' && !isPlayerColor(value.winner)) {
    throw new Error('won snapshot must name a player winner')
  }
  if (value.status === 'draw' && value.winner !== 'draw') {
    throw new Error('draw snapshot must use winner="draw"')
  }

  if (value.winReason !== null && typeof value.winReason !== 'string') {
    throw new Error('snapshot.state.winReason must be string or null')
  }

  if (value.lastMove !== null) {
    if (!isRecord(value.lastMove) || !isBoardIndex(value.lastMove.from) || !isBoardIndex(value.lastMove.to)) {
      throw new Error('snapshot.state.lastMove is invalid')
    }
  }

  if (!Array.isArray(value.lastCaptured) || !value.lastCaptured.every(isBoardIndex)) {
    throw new Error('snapshot.state.lastCaptured must contain board indexes')
  }
  if (typeof value.lastRek !== 'boolean' || typeof value.lastPoat !== 'boolean') {
    throw new Error('snapshot tactical flags must be boolean')
  }

  if (!isRecord(value.captured)) throw new Error('snapshot.state.captured must be an object')
  assertPieceArray(value.captured.you, 'snapshot.state.captured.you', 'you')
  assertPieceArray(value.captured.opp, 'snapshot.state.captured.opp', 'opp')

  for (const piece of [...value.captured.you, ...value.captured.opp]) {
    if (allIds.has(piece.id)) throw new Error(`duplicate piece id: ${piece.id}`)
    allIds.add(piece.id)
  }

  if (typeof value.moveCount !== 'number' || !Number.isInteger(value.moveCount) || value.moveCount < 0) {
    throw new Error('snapshot.state.moveCount must be a non-negative integer')
  }
  if (
    typeof value.availableRekMovesCount !== 'number' ||
    !Number.isInteger(value.availableRekMovesCount) ||
    value.availableRekMovesCount < 0
  ) {
    throw new Error('snapshot.state.availableRekMovesCount must be a non-negative integer')
  }

  if (value.positionCounts !== undefined) {
    if (!isRecord(value.positionCounts)) throw new Error('snapshot.state.positionCounts must be an object')
    for (const count of Object.values(value.positionCounts)) {
      if (typeof count !== 'number' || !Number.isInteger(count) || count <= 0) {
        throw new Error('snapshot.state.positionCounts values must be positive integers')
      }
    }
  }

  if (
    value.loneKingMoveCount !== undefined &&
    (typeof value.loneKingMoveCount !== 'number' ||
      !Number.isInteger(value.loneKingMoveCount) ||
      value.loneKingMoveCount < 0)
  ) {
    throw new Error('snapshot.state.loneKingMoveCount must be a non-negative integer')
  }

  if (
    value.drawMoveLimit !== undefined &&
    (typeof value.drawMoveLimit !== 'number' ||
      !Number.isInteger(value.drawMoveLimit) ||
      value.drawMoveLimit <= 0)
  ) {
    throw new Error('snapshot.state.drawMoveLimit must be a positive integer')
  }
}

/**
 * Canonicalize all public/session state. Legacy `REK_POAT` snapshots remain
 * readable but are rewritten in memory as `REK_STANDARD`; repetition keys are
 * migrated into the same canonical namespace so draw bookkeeping is preserved.
 */
function normalizeState(state: GameState): GameState {
  assertGameState(state)
  const normalized = cloneGameState(state)
  normalized.mode = normalizeRuleSet(normalized.mode)
  normalized.positionCounts = normalized.positionCounts
    ? normalizePositionCounts(normalized.positionCounts)
    : normalized.positionCounts
  normalized.availableRekMovesCount =
    normalized.status === 'playing'
      ? getAllRekOpportunities(normalized.board, normalized.turn, normalized.mode).length
      : 0
  return normalized
}

export function serializeGameState(state: GameState): string {
  const snapshot: RekGameSnapshotV1 = {
    version: REK_GAME_SNAPSHOT_VERSION,
    state: normalizeState(state),
  }
  return JSON.stringify(snapshot)
}

export function deserializeGameState(serialized: string): GameState {
  let decoded: unknown
  try {
    decoded = JSON.parse(serialized)
  } catch {
    throw new Error('Invalid Rek game snapshot JSON')
  }

  if (!isRecord(decoded) || decoded.version !== REK_GAME_SNAPSHOT_VERSION) {
    throw new Error(`Unsupported Rek game snapshot version; expected ${REK_GAME_SNAPSHOT_VERSION}`)
  }

  assertGameState(decoded.state)
  return normalizeState(decoded.state)
}

/**
 * Stable stateful facade for UI, server, CLI, and replay consumers.
 *
 * Rule decisions are delegated to the pure engine functions. This class owns
 * only session concerns: current state, undo history, and persistence.
 */
export class RekGame {
  private state: GameState
  private history: GameState[] = []

  constructor(initial: GameMode | GameState = DEFAULT_RULESET) {
    this.state = typeof initial === 'string'
      ? createInitialState(normalizeRuleSet(initial))
      : normalizeState(initial)
  }

  public static deserialize(serialized: string): RekGame {
    return new RekGame(deserializeGameState(serialized))
  }

  public getState(): GameState {
    return cloneGameState(this.state)
  }

  public getLegalMoves(from: number): number[] {
    if (this.state.status !== 'playing' || !isBoardIndex(from)) return []
    const piece = this.state.board[from]
    if (!piece || piece.player !== this.state.turn) return []
    return Array.from(getMoveResults(this.state.board, from, this.state.mode).keys())
  }

  public previewMove(from: number, to: number): MoveResult | null {
    if (!isBoardIndex(from) || !isBoardIndex(to)) return null
    return getMoveResults(this.state.board, from, this.state.mode).get(to) ?? null
  }

  public makeMove(from: number, to: number): boolean {
    if (!isBoardIndex(from) || !isBoardIndex(to) || this.state.status !== 'playing') return false

    const before = this.state
    const next = executeMove(before, from, to)
    if (next === before) return false

    this.history.push(before)
    this.state = normalizeState(next)
    return true
  }

  public undo(): boolean {
    const previous = this.history.pop()
    if (!previous) return false
    this.state = normalizeState(previous)
    return true
  }

  public canUndo(): boolean {
    return this.history.length > 0
  }

  public reset(mode: GameMode = this.state.mode): void {
    this.state = createInitialState(normalizeRuleSet(mode))
    this.history = []
  }

  public serialize(): string {
    return serializeGameState(this.state)
  }
}

export function createGame(mode: GameMode = DEFAULT_RULESET): RekGame {
  return new RekGame(mode)
}

export function deserializeGame(serialized: string): RekGame {
  return RekGame.deserialize(serialized)
}
