// Pure TypeScript Engine for Rek Khmer (ល្បែងរែក)
// 100% independent from React / DOM / UI frameworks.
// Implements the technical contract from /SPEC_ENGINE_CO_REK_KHMER.md while
// keeping evidence confidence separate in /HUONG_DAN_LUAT_CO_REK_KHMER.md.

import {
  BOARD_SIZE,
  DEFAULT_LONE_KING_DRAW_LIMIT,
  DEFAULT_RULESET,
  Cell,
  PlayerColor,
  Piece,
  RuleSetInput,
  GameState,
  MoveResult,
  normalizeRuleSet,
} from './types'
import {
  DIRS,
  rc,
  idx,
  inBounds,
  opponent,
  checkRekCaptures,
  checkPoatCaptures,
} from './captures'

let pieceIdCounter = 0
export const makeId = () => `p_${pieceIdCounter++}`

export function coordToIdx(coord: string): number {
  const file = coord.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = parseInt(coord[1], 10)
  const row = 8 - rank
  const col = file
  return idx(row, col)
}

export function idxToCoord(index: number): string {
  const { row, col } = rc(index)
  const file = String.fromCharCode('a'.charCodeAt(0) + col)
  const rank = 8 - row
  return `${file}${rank}`
}

/**
 * A repetition position is defined by board occupancy/type, side to move and
 * canonical rule set. Compatibility inputs are normalized immediately so the
 * legacy `REK_POAT` alias never creates a second logical position namespace.
 */
export function createPositionKey(
  board: Cell[],
  turn: PlayerColor,
  mode: RuleSetInput
): string {
  const cells = board
    .map((piece) => {
      if (!piece) return '.'
      const side = piece.player === 'you' ? 'y' : 'o'
      return `${side}${piece.king ? 'K' : 'M'}`
    })
    .join(',')
  return `${normalizeRuleSet(mode)}|${turn}|${cells}`
}

export function hasLoneKing(board: Cell[]): boolean {
  return (['you', 'opp'] as const).some((player) => {
    const pieces = board.filter((piece) => piece?.player === player)
    return pieces.length === 1 && pieces[0]?.king === true
  })
}

export function createInitialBoard(mode: RuleSetInput = DEFAULT_RULESET): Cell[] {
  // Normalize for compatibility even though setup is currently shared by both
  // rule sets and does not otherwise branch on the value.
  normalizeRuleSet(mode)
  pieceIdCounter = 0
  const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)

  // Canonical Khmer setup, rotationally symmetric by 180 degrees:
  // Black/opp: seven rear men a8-g8, King h7, eight front men a6-h6.
  for (let col = 0; col < BOARD_SIZE - 1; col++) {
    board[idx(0, col)] = { player: 'opp', king: false, id: makeId() }
  }
  board[idx(1, BOARD_SIZE - 1)] = { player: 'opp', king: true, id: makeId() }
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[idx(2, col)] = { player: 'opp', king: false, id: makeId() }
  }

  // White/you: eight front men a3-h3, King a2, seven rear men b1-h1.
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[idx(5, col)] = { player: 'you', king: false, id: makeId() }
  }
  board[idx(6, 0)] = { player: 'you', king: true, id: makeId() }
  for (let col = 1; col < BOARD_SIZE; col++) {
    board[idx(7, col)] = { player: 'you', king: false, id: makeId() }
  }

  return board
}

export function createInitialState(mode: RuleSetInput = DEFAULT_RULESET): GameState {
  const ruleset = normalizeRuleSet(mode)
  const board = createInitialBoard(ruleset)
  const turn: PlayerColor = 'you'
  return {
    board,
    turn,
    status: 'playing',
    winner: null,
    winReason: null,
    mode: ruleset,
    lastMove: null,
    lastCaptured: [],
    lastRek: false,
    lastPoat: false,
    captured: { you: [], opp: [] },
    moveCount: 0,
    availableRekMovesCount: 0,
    positionCounts: { [createPositionKey(board, turn, ruleset)]: 1 },
    loneKingMoveCount: 0,
    drawMoveLimit: DEFAULT_LONE_KING_DRAW_LIMIT,
  }
}

function emptyMoveResult(from: number, to: number): MoveResult {
  return {
    from,
    to,
    rekCaptures: [],
    poatCaptures: [],
    captures: [],
    rek: false,
    poat: false,
  }
}

/**
 * Computes geometrically legal sliding destinations for a piece at `from`.
 * Pieces slide like Rooks across empty orthogonal squares.
 *
 * This function deliberately does not apply the current project interpretation
 * of compulsory Rek; callers that need rule-legal moves use getMoveResults().
 */
export function getLegalMoves(
  board: Cell[],
  from: number,
  mode: RuleSetInput = DEFAULT_RULESET
): number[] {
  const piece = board[from]
  if (!piece) return []

  const ruleset = normalizeRuleSet(mode)

  // Current MIN_REK_CHANH engine contract: King is stationary. Exact historical
  // semantics remain under research and are not duplicated outside the engine.
  if (ruleset === 'MIN_REK_CHANH' && piece.king) {
    return []
  }

  const { row, col } = rc(from)
  const moves: number[] = []

  for (const { dr, dc } of DIRS) {
    let step = 1
    while (true) {
      const nr = row + dr * step
      const nc = col + dc * step
      if (!inBounds(nr, nc)) break
      const targetIdx = idx(nr, nc)
      if (board[targetIdx] !== null) break
      moves.push(targetIdx)
      step++
    }
  }

  return moves
}

/** Returns all geometrically legal moves for a player that trigger Rek. */
export function getAllRekOpportunities(
  board: Cell[],
  player: PlayerColor,
  mode: RuleSetInput = DEFAULT_RULESET
): { from: number; to: number; captures: number[] }[] {
  const ruleset = normalizeRuleSet(mode)
  const opportunities: { from: number; to: number; captures: number[] }[] = []

  for (let from = 0; from < BOARD_SIZE * BOARD_SIZE; from++) {
    const piece = board[from]
    if (!piece || piece.player !== player) continue

    const legal = getLegalMoves(board, from, ruleset)
    for (const to of legal) {
      const tempBoard = [...board]
      tempBoard[to] = piece
      tempBoard[from] = null

      const rekVictims = checkRekCaptures(tempBoard, to, player)
      if (rekVictims.length > 0) {
        opportunities.push({ from, to, captures: rekVictims })
      }
    }
  }

  return opportunities
}

/**
 * Resolves Rek then Poat for a move whose geometry and current rule obligation
 * have already been validated by this module. Keeping this helper in engine.ts
 * lets bulk generation reuse the same capture pipeline without duplicating rule
 * logic in AI or other consumers.
 */
function resolveValidatedMove(
  board: Cell[],
  from: number,
  to: number,
  mover: PlayerColor
): MoveResult {
  const piece = board[from]
  if (!piece || piece.player !== mover) return emptyMoveResult(from, to)

  const tempBoard = [...board]
  tempBoard[to] = piece
  tempBoard[from] = null

  const rekCaptures = checkRekCaptures(tempBoard, to, mover)
  for (const victim of rekCaptures) tempBoard[victim] = null

  const poatCaptures = checkPoatCaptures(tempBoard, opponent(mover))
  const captures = Array.from(new Set([...rekCaptures, ...poatCaptures]))

  let notation = `${idxToCoord(from)} → ${idxToCoord(to)}`
  if (rekCaptures.length > 0 && poatCaptures.length > 0) {
    notation += ` [រែក ${rekCaptures.length} & ព័ទ្ធ ${poatCaptures.length}]`
  } else if (rekCaptures.length > 0) {
    notation += ` [រែក ${rekCaptures.length}]`
  } else if (poatCaptures.length > 0) {
    notation += ` [ព័ទ្ធ ${poatCaptures.length}]`
  }

  return {
    from,
    to,
    rekCaptures,
    poatCaptures,
    captures,
    rek: rekCaptures.length > 0,
    poat: poatCaptures.length > 0,
    sanNotation: notation,
  }
}

/**
 * Predicts the full outcome of a legal move without modifying the board.
 * Invalid geometry, occupied destinations, blocked paths and color mismatches
 * return an empty result instead of simulating an impossible board state.
 */
export function previewMove(
  board: Cell[],
  from: number,
  to: number,
  moverPlayer?: PlayerColor,
  mode: RuleSetInput = DEFAULT_RULESET
): MoveResult {
  const piece = board[from]
  if (!piece) return emptyMoveResult(from, to)

  const ruleset = normalizeRuleSet(mode)

  // Backward compatibility: callers from the pre-refactor UI passed only
  // (board, from, to). The piece itself is the authoritative mover color.
  const mover = moverPlayer ?? piece.player

  if (piece.player !== mover) return emptyMoveResult(from, to)

  const legal = getLegalMoves(board, from, ruleset)
  if (!legal.includes(to)) return emptyMoveResult(from, to)

  // Current project interpretation for MIN_REK_CHANH: if any Rek opportunity
  // exists, a submitted quiet move is a forfeit. The exact traditional trigger
  // is still UNVERIFIED in the evidence guide and may be refined later.
  if (ruleset === 'MIN_REK_CHANH') {
    const rekMoves = getAllRekOpportunities(board, mover, ruleset)
    if (rekMoves.length > 0) {
      const isRekMove = rekMoves.some((move) => move.from === from && move.to === to)
      if (!isRekMove) {
        return {
          ...emptyMoveResult(from, to),
          isHaoRekViolation: true,
        }
      }
    }
  }

  return resolveValidatedMove(board, from, to, mover)
}

function compulsoryRekDestinations(
  board: Cell[],
  player: PlayerColor,
  mode: RuleSetInput
): Map<number, Set<number>> | null {
  const ruleset = normalizeRuleSet(mode)
  if (ruleset !== 'MIN_REK_CHANH') return null

  const opportunities = getAllRekOpportunities(board, player, ruleset)
  if (opportunities.length === 0) return null

  const byFrom = new Map<number, Set<number>>()
  for (const opportunity of opportunities) {
    let destinations = byFrom.get(opportunity.from)
    if (!destinations) {
      destinations = new Set<number>()
      byFrom.set(opportunity.from, destinations)
    }
    destinations.add(opportunity.to)
  }
  return byFrom
}

/**
 * Returns actual rule-legal destinations for one selected piece.
 * In MIN_REK_CHANH the current contract computes the side-wide Rek obligation
 * once for this query, then resolves only the allowed destinations.
 */
export function getMoveResults(
  board: Cell[],
  from: number,
  mode: RuleSetInput = DEFAULT_RULESET
): Map<number, MoveResult> {
  const ruleset = normalizeRuleSet(mode)
  const results = new Map<number, MoveResult>()
  const piece = board[from]
  if (!piece) return results

  const allowedReks = compulsoryRekDestinations(board, piece.player, ruleset)
  const destinations = getLegalMoves(board, from, ruleset)

  for (const to of destinations) {
    if (allowedReks && !allowedReks.get(from)?.has(to)) continue
    results.set(to, resolveValidatedMove(board, from, to, piece.player))
  }
  return results
}

/**
 * Bulk rule-legal move results for a whole side. This is the preferred search
 * boundary: the current Min Rek Chanh side-wide obligation is computed once,
 * then every legal destination uses the same engine-owned capture resolver.
 */
export function getAllMoveResults(
  board: Cell[],
  player: PlayerColor,
  mode: RuleSetInput = DEFAULT_RULESET
): Map<number, Map<number, MoveResult>> {
  const ruleset = normalizeRuleSet(mode)
  const results = new Map<number, Map<number, MoveResult>>()
  const allowedReks = compulsoryRekDestinations(board, player, ruleset)

  for (let from = 0; from < BOARD_SIZE * BOARD_SIZE; from++) {
    const piece = board[from]
    if (!piece || piece.player !== player) continue

    const perPiece = new Map<number, MoveResult>()
    const destinations = getLegalMoves(board, from, ruleset)
    for (const to of destinations) {
      if (allowedReks && !allowedReks.get(from)?.has(to)) continue
      perPiece.set(to, resolveValidatedMove(board, from, to, player))
    }
    results.set(from, perPiece)
  }

  return results
}

/**
 * Applies a MoveResult that was already produced by this engine's legal-move
 * pipeline. This is a trusted fast path for search/internal consumers that
 * already called getMoveResults()/getAllMoveResults(); it intentionally avoids
 * repeating geometry, compulsory-Rek, and capture preview work.
 *
 * @internal Do not construct MoveResult manually for this function.
 */
export function executeMoveResult(state: GameState, result: MoveResult): GameState {
  if (state.status !== 'playing') return state

  const ruleset = normalizeRuleSet(state.mode)
  const mover = state.turn
  const from = result.from
  const to = result.to
  const piece = state.board[from]

  if (
    !piece ||
    piece.player !== mover ||
    !Number.isInteger(to) ||
    to < 0 ||
    to >= BOARD_SIZE * BOARD_SIZE ||
    state.board[to] !== null
  ) {
    return state
  }

  if (result.isHaoRekViolation) {
    return {
      ...state,
      mode: ruleset,
      status: 'won',
      winner: opponent(mover),
      winReason: 'Min Rek Chanh violation: compulsory Rek was ignored',
    }
  }

  const newBoard = [...state.board]
  newBoard[to] = piece
  newBoard[from] = null

  const lostPieces: Piece[] = []
  for (const c of result.captures) {
    const capPiece = newBoard[c]
    if (capPiece) lostPieces.push(capPiece)
    newBoard[c] = null
  }

  const opp = opponent(mover)
  const nextTurn = opp

  const newCaptured = {
    you: [...state.captured.you, ...lostPieces.filter((p) => p.player === 'you')],
    opp: [...state.captured.opp, ...lostPieces.filter((p) => p.player === 'opp')],
  }

  const oppKingAlive = hasKing(newBoard, opp)
  const moverKingAlive = hasKing(newBoard, mover)

  let status: GameState['status'] = 'playing'
  let winner: GameState['winner'] = null
  let winReason: string | null = null

  if (!oppKingAlive) {
    status = 'won'
    winner = mover
    winReason = 'Royal King Captured'
  } else if (!moverKingAlive) {
    status = 'won'
    winner = opp
    winReason = 'Self King Lost'
  } else {
    const oppPieces = countPieces(newBoard, opp)
    if (oppPieces === 0) {
      status = 'won'
      winner = mover
      winReason = 'All enemy pieces wiped out'
    } else {
      const oppLegalCount = countTotalLegalMoves(newBoard, opp, ruleset)
      if (oppLegalCount === 0) {
        status = 'won'
        winner = mover
        winReason = 'Opponent completely immobilized (Zero liberties)'
      }
    }
  }

  const currentPositionKey = createPositionKey(state.board, state.turn, ruleset)
  const positionCounts: Record<string, number> = state.positionCounts
    ? normalizePositionCounts(state.positionCounts)
    : { [currentPositionKey]: 1 }
  const nextPositionKey = createPositionKey(newBoard, nextTurn, ruleset)
  positionCounts[nextPositionKey] = (positionCounts[nextPositionKey] ?? 0) + 1

  const hadLoneKing = hasLoneKing(state.board)
  const hasLoneKingNow = hasLoneKing(newBoard)
  let loneKingMoveCount = state.loneKingMoveCount ?? 0
  if (!hasLoneKingNow) {
    loneKingMoveCount = 0
  } else if (!hadLoneKing) {
    loneKingMoveCount = 0
  } else {
    loneKingMoveCount += 1
  }

  const drawMoveLimit = state.drawMoveLimit ?? DEFAULT_LONE_KING_DRAW_LIMIT

  if (status === 'playing' && positionCounts[nextPositionKey] >= 3) {
    status = 'draw'
    winner = 'draw'
    winReason = 'Threefold Repetition'
  } else if (
    status === 'playing' &&
    hasLoneKingNow &&
    loneKingMoveCount >= drawMoveLimit
  ) {
    status = 'draw'
    winner = 'draw'
    winReason = `Lone King survived ${drawMoveLimit} counted moves`
  }

  const availableReks =
    status === 'playing' ? getAllRekOpportunities(newBoard, nextTurn, ruleset).length : 0

  return {
    board: newBoard,
    turn: nextTurn,
    status,
    winner,
    winReason,
    mode: ruleset,
    lastMove: { from, to },
    lastCaptured: result.captures,
    lastRek: result.rek,
    lastPoat: result.poat,
    captured: newCaptured,
    moveCount: state.moveCount + 1,
    availableRekMovesCount: availableReks,
    positionCounts,
    loneKingMoveCount,
    drawMoveLimit,
  }
}

/** Executes a move and produces a new immutable game state. */
export function executeMove(
  state: GameState,
  from: number,
  to: number
): GameState {
  if (state.status !== 'playing') return state

  const ruleset = normalizeRuleSet(state.mode)
  const mover = state.turn
  const piece = state.board[from]
  if (!piece || piece.player !== mover) return state

  const legal = getLegalMoves(state.board, from, ruleset)
  if (!legal.includes(to)) return state

  const result = previewMove(state.board, from, to, mover, ruleset)
  return executeMoveResult(state, result)
}

/** Merge legacy REK_POAT repetition keys into the canonical REK_STANDARD namespace. */
export function normalizePositionCounts(counts: Record<string, number>): Record<string, number> {
  const normalized: Record<string, number> = {}
  for (const [key, count] of Object.entries(counts)) {
    const canonicalKey = key.startsWith('REK_POAT|')
      ? `REK_STANDARD|${key.slice('REK_POAT|'.length)}`
      : key
    normalized[canonicalKey] = (normalized[canonicalKey] ?? 0) + count
  }
  return normalized
}

export function hasKing(board: Cell[], player: PlayerColor): boolean {
  return board.some((c) => c && c.player === player && c.king)
}

export function kingIndex(board: Cell[], player: PlayerColor): number | null {
  for (let i = 0; i < board.length; i++) {
    const c = board[i]
    if (c && c.player === player && c.king) return i
  }
  return null
}

export function countPieces(board: Cell[], player: PlayerColor): number {
  return board.reduce((acc, c) => (c && c.player === player ? acc + 1 : acc), 0)
}

export function countTotalLegalMoves(
  board: Cell[],
  player: PlayerColor,
  mode: RuleSetInput = DEFAULT_RULESET
): number {
  const ruleset = normalizeRuleSet(mode)
  let total = 0
  for (let i = 0; i < board.length; i++) {
    const c = board[i]
    if (c && c.player === player) {
      total += getLegalMoves(board, i, ruleset).length
    }
  }
  return total
}

/** Complete RekEngine class wrapping pure engine functions. */
export class RekEngine {
  private state: GameState
  private history: GameState[] = []

  constructor(mode: RuleSetInput = DEFAULT_RULESET) {
    this.state = createInitialState(mode)
  }

  public getState(): GameState {
    return this.state
  }

  public reset(mode?: RuleSetInput): void {
    this.state = createInitialState(mode || this.state.mode)
    this.history = []
  }

  /** Returns rule-legal moves for the side whose turn it is. */
  public getLegalMoves(from: number): number[] {
    if (this.state.status !== 'playing') return []
    const piece = this.state.board[from]
    if (!piece || piece.player !== this.state.turn) return []
    return Array.from(getMoveResults(this.state.board, from, this.state.mode).keys())
  }

  public previewMove(from: number, to: number): MoveResult {
    return previewMove(this.state.board, from, to, this.state.turn, this.state.mode)
  }

  public makeMove(from: number, to: number): boolean {
    if (this.state.status !== 'playing') return false

    const piece = this.state.board[from]
    if (!piece || piece.player !== this.state.turn) return false

    const geometric = getLegalMoves(this.state.board, from, this.state.mode)
    if (!geometric.includes(to)) return false

    const before = this.state
    const preview = previewMove(before.board, from, to, before.turn, before.mode)

    this.history.push(before)
    this.state = executeMove(before, from, to)

    return !preview.isHaoRekViolation && this.state !== before
  }

  public undo(): boolean {
    if (this.history.length === 0) return false
    const prev = this.history.pop()
    if (prev) {
      this.state = prev
      return true
    }
    return false
  }

  public canUndo(): boolean {
    return this.history.length > 0
  }

  public loadCustomSetup(setupFn: (board: Cell[]) => void): void {
    const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
    setupFn(board)
    const turn: PlayerColor = 'you'
    const ruleset = normalizeRuleSet(this.state.mode)
    this.state = {
      board,
      turn,
      status: 'playing',
      winner: null,
      winReason: null,
      mode: ruleset,
      lastMove: null,
      lastCaptured: [],
      lastRek: false,
      lastPoat: false,
      captured: { you: [], opp: [] },
      moveCount: 0,
      availableRekMovesCount: getAllRekOpportunities(board, turn, ruleset).length,
      positionCounts: { [createPositionKey(board, turn, ruleset)]: 1 },
      loneKingMoveCount: 0,
      drawMoveLimit: this.state.drawMoveLimit ?? DEFAULT_LONE_KING_DRAW_LIMIT,
    }
    this.history = []
  }
}

export const applyMove = executeMove
export const evaluateMove = previewMove
export const getAvailableRekMoves = getAllRekOpportunities
