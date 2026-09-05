import {
  BOARD_SIZE,
  DEFAULT_LONE_KING_DRAW_LIMIT,
  DEFAULT_RULESET,
  CanonicalGameState,
  Cell,
  GameState,
  MoveResult,
  Piece,
  PlayerColor,
  RuleSetInput,
  normalizeRuleSet,
} from './types'
import {
  createInitialState,
  createPositionKey,
  executeMove,
  getAllRekOpportunities,
  getMoveResults,
  getStateMoveResults,
  hasLoneKing,
  normalizePositionCounts,
} from './engine'

export const REK_GAME_SNAPSHOT_VERSION = 1 as const

interface RekGameSnapshotV1 {
  version: typeof REK_GAME_SNAPSHOT_VERSION
  state: CanonicalGameState
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPlayerColor(value: unknown): value is PlayerColor {
  return value === 'you' || value === 'opp'
}

function isRuleSetInput(value: unknown): value is RuleSetInput {
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

export function cloneGameState(state: CanonicalGameState): CanonicalGameState
export function cloneGameState(state: GameState): GameState
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
    haoRekContext: state.haoRekContext
      ? {
          active: state.haoRekContext.active,
          createdByMove: state.haoRekContext.createdByMove
            ? { ...state.haoRekContext.createdByMove }
            : null,
          allowedResponses: state.haoRekContext.allowedResponses.map((move) => ({ ...move })),
        }
      : null,
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
  if (!isRuleSetInput(value.mode)) throw new Error('snapshot.state.mode is invalid')
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

  if (value.haoRekContext !== undefined && value.haoRekContext !== null) {
    if (!isRecord(value.haoRekContext)) throw new Error('snapshot.state.haoRekContext must be an object or null')
    if (typeof value.haoRekContext.active !== 'boolean') {
      throw new Error('snapshot.state.haoRekContext.active must be boolean')
    }
    if (value.haoRekContext.createdByMove !== null) {
      if (
        !isRecord(value.haoRekContext.createdByMove) ||
        !isBoardIndex(value.haoRekContext.createdByMove.from) ||
        !isBoardIndex(value.haoRekContext.createdByMove.to)
      ) {
        throw new Error('snapshot.state.haoRekContext.createdByMove is invalid')
      }
    }
    if (!Array.isArray(value.haoRekContext.allowedResponses)) {
      throw new Error('snapshot.state.haoRekContext.allowedResponses must be an array')
    }
    for (const response of value.haoRekContext.allowedResponses) {
      if (!isRecord(response) || !isBoardIndex(response.from) || !isBoardIndex(response.to)) {
        throw new Error('snapshot.state.haoRekContext.allowedResponses contains an invalid move')
      }
    }
    if (value.haoRekContext.active && value.haoRekContext.allowedResponses.length === 0) {
      throw new Error('active Hao Rek context must contain at least one response')
    }
  }
}

/**
 * Persisted snapshots are stricter than arbitrary in-memory custom/training
 * states. The loader rejects combinations that the canonical engine cannot
 * produce, while RekGame(GameState) remains available for controlled fixtures.
 */
function assertPersistedGameStateSemantics(state: CanonicalGameState): void {
  const countKings = (player: PlayerColor) =>
    state.board.filter((piece) => piece?.player === player && piece.king).length
  const youKings = countKings('you')
  const oppKings = countKings('opp')

  if (state.status === 'playing' || state.status === 'draw') {
    if (youKings !== 1 || oppKings !== 1) {
      throw new Error(`${state.status} snapshot must contain exactly one King per side`)
    }
  } else if (state.status === 'won') {
    const winnerKings = state.winner === 'you' ? youKings : oppKings
    if (winnerKings !== 1) throw new Error('won snapshot must retain the winner King')
  }

  if (state.status === 'playing') {
    if (state.winReason !== null) throw new Error('playing snapshot cannot have a winReason')
  } else if (typeof state.winReason !== 'string' || state.winReason.trim().length === 0) {
    throw new Error('finished snapshot must contain a non-empty winReason')
  }

  const context = state.haoRekContext
  if (context?.active) {
    if (state.mode !== 'MIN_REK_CHANH' || state.status !== 'playing') {
      throw new Error('active Hao Rek context requires a playing MIN_REK_CHANH snapshot')
    }

    const seenResponses = new Set<string>()
    for (const response of context.allowedResponses) {
      const key = `${response.from}:${response.to}`
      if (seenResponses.has(key)) throw new Error('active Hao Rek responses must be unique')
      seenResponses.add(key)

      const piece = state.board[response.from]
      const result = getMoveResults(state.board, response.from, state.mode).get(response.to)
      if (!piece || piece.player !== state.turn || !result?.rek) {
        throw new Error('active Hao Rek response must be a legal Rek for the side to move')
      }
    }
  }

  if (state.positionCounts) {
    const currentKey = createPositionKey(
      state.board,
      state.turn,
      state.mode,
      state.haoRekContext
    )
    if ((state.positionCounts[currentKey] ?? 0) < 1) {
      throw new Error('snapshot.positionCounts must contain the current rule-relevant position')
    }
  }

  const loneKing = hasLoneKing(state.board)
  const loneKingMoveCount = state.loneKingMoveCount ?? 0
  const drawMoveLimit = state.drawMoveLimit ?? DEFAULT_LONE_KING_DRAW_LIMIT
  if (!loneKing && loneKingMoveCount !== 0) {
    throw new Error('snapshot loneKingMoveCount must be zero when no side has a lone King')
  }
  if (state.status === 'playing' && loneKing && loneKingMoveCount >= drawMoveLimit) {
    throw new Error('playing snapshot cannot already satisfy the lone-King draw threshold')
  }
}

/**
 * Canonicalize all public/session state. Legacy `REK_POAT` snapshots remain
 * readable but are rewritten in memory as `REK_STANDARD`; repetition keys are
 * migrated into the same canonical namespace so draw bookkeeping is preserved.
 */
function normalizeState(state: GameState): CanonicalGameState {
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
  normalized.haoRekContext =
    normalized.mode === 'MIN_REK_CHANH' &&
    normalized.status === 'playing' &&
    normalized.haoRekContext?.active
      ? normalized.haoRekContext
      : null
  return normalized as CanonicalGameState
}

export function serializeGameState(state: GameState): string {
  const normalized = normalizeState(state)
  assertPersistedGameStateSemantics(normalized)
  const snapshot: RekGameSnapshotV1 = {
    version: REK_GAME_SNAPSHOT_VERSION,
    state: normalized,
  }
  return JSON.stringify(snapshot)
}

export function deserializeGameState(serialized: string): CanonicalGameState {
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
  if (
    decoded.state.haoRekContext?.active &&
    (normalizeRuleSet(decoded.state.mode) !== 'MIN_REK_CHANH' || decoded.state.status !== 'playing')
  ) {
    throw new Error('active Hao Rek context requires a playing MIN_REK_CHANH snapshot')
  }

  const normalized = normalizeState(decoded.state)
  assertPersistedGameStateSemantics(normalized)
  return normalized
}

/**
 * Stable stateful facade for UI, server, CLI, and replay consumers.
 *
 * Rule decisions are delegated to the pure engine functions. This class owns
 * only session concerns: current state, undo history, and persistence.
 */
export class RekGame {
  private state: CanonicalGameState
  private history: CanonicalGameState[] = []

  constructor(initial: RuleSetInput | GameState = DEFAULT_RULESET) {
    this.state = typeof initial === 'string'
      ? normalizeState(createInitialState(normalizeRuleSet(initial)))
      : normalizeState(initial)
  }

  public static deserialize(serialized: string): RekGame {
    return new RekGame(deserializeGameState(serialized))
  }

  public getState(): CanonicalGameState {
    return cloneGameState(this.state)
  }

  public getLegalMoves(from: number): number[] {
    if (this.state.status !== 'playing' || !isBoardIndex(from)) return []
    const piece = this.state.board[from]
    if (!piece || piece.player !== this.state.turn) return []
    return Array.from(getStateMoveResults(this.state, from).keys())
  }

  public previewMove(from: number, to: number): MoveResult | null {
    if (!isBoardIndex(from) || !isBoardIndex(to)) return null
    return getStateMoveResults(this.state, from).get(to) ?? null
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
    this.state = previous
    return true
  }

  public canUndo(): boolean {
    return this.history.length > 0
  }

  public reset(mode: RuleSetInput = this.state.mode): void {
    this.state = normalizeState(createInitialState(normalizeRuleSet(mode)))
    this.history = []
  }

  public serialize(): string {
    return serializeGameState(this.state)
  }
}

export function createGame(mode: RuleSetInput = DEFAULT_RULESET): RekGame {
  return new RekGame(mode)
}

export function deserializeGame(serialized: string): RekGame {
  return RekGame.deserialize(serialized)
}
