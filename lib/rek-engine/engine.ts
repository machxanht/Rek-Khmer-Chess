// Pure TypeScript Engine for Rek Khmer (ល្បែងរែក)
// 100% independent from React / DOM / UI frameworks.
// Implements all specifications from /SPEC_ENGINE_CO_REK_KHMER.md and /HUONG_DAN_LUAT_CO_REK_KHMER.md.

import {
  BOARD_SIZE,
  DEFAULT_LONE_KING_DRAW_LIMIT,
  Cell,
  PlayerColor,
  Piece,
  GameMode,
  GameState,
  MoveResult,
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
 * game mode. Piece IDs, move counters and UI metadata do not affect legality.
 */
export function createPositionKey(
  board: Cell[],
  turn: PlayerColor,
  mode: GameMode
): string {
  const cells = board
    .map((piece) => {
      if (!piece) return '.'
      const side = piece.player === 'you' ? 'y' : 'o'
      return `${side}${piece.king ? 'K' : 'M'}`
    })
    .join(',')
  return `${mode}|${turn}|${cells}`
}

export function hasLoneKing(board: Cell[]): boolean {
  return (['you', 'opp'] as const).some((player) => {
    const pieces = board.filter((piece) => piece?.player === player)
    return pieces.length === 1 && pieces[0]?.king === true
  })
}

export function createInitialBoard(mode: GameMode = 'REK_POAT'): Cell[] {
  pieceIdCounter = 0
  const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)

  // Black (opp) pieces on top ranks (rows 0 and 1)
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[idx(0, col)] = { player: 'opp', king: col === 3, id: makeId() }
    board[idx(1, col)] = { player: 'opp', king: false, id: makeId() }
  }

  // White (you) pieces on bottom ranks (rows 6 and 7)
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[idx(6, col)] = { player: 'you', king: false, id: makeId() }
    board[idx(7, col)] = { player: 'you', king: col === 3, id: makeId() }
  }

  return board
}

export function createInitialState(mode: GameMode = 'REK_POAT'): GameState {
  const board = createInitialBoard(mode)
  const turn: PlayerColor = 'you'
  return {
    board,
    turn,
    status: 'playing',
    winner: null,
    winReason: null,
    mode,
    lastMove: null,
    lastCaptured: [],
    lastRek: false,
    lastPoat: false,
    captured: { you: [], opp: [] },
    moveCount: 0,
    availableRekMovesCount: 0,
    positionCounts: { [createPositionKey(board, turn, mode)]: 1 },
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
 * This function deliberately does not apply the global compulsory-Rek rule;
 * callers that need rule-legal moves should use getMoveResults().
 */
export function getLegalMoves(
  board: Cell[],
  from: number,
  mode: GameMode = 'REK_POAT'
): number[] {
  const piece = board[from]
  if (!piece) return []

  // In Min Rek Chanh mode, Palace King is stationary on the throne.
  if (mode === 'MIN_REK_CHANH' && piece.king) {
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

/**
 * Returns all geometrically legal moves for a player that trigger Rek.
 */
export function getAllRekOpportunities(
  board: Cell[],
  player: PlayerColor,
  mode: GameMode = 'REK_POAT'
): { from: number; to: number; captures: number[] }[] {
  const opportunities: { from: number; to: number; captures: number[] }[] = []

  for (let from = 0; from < BOARD_SIZE * BOARD_SIZE; from++) {
    const piece = board[from]
    if (!piece || piece.player !== player) continue

    const legal = getLegalMoves(board, from, mode)
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
 * Predicts the full outcome of a legal move without modifying the board.
 * Invalid geometry, occupied destinations, blocked paths and color mismatches
 * return an empty result instead of simulating an impossible board state.
 */
export function previewMove(
  board: Cell[],
  from: number,
  to: number,
  moverPlayer?: PlayerColor,
  mode: GameMode = 'REK_POAT'
): MoveResult {
  const piece = board[from]
  if (!piece) return emptyMoveResult(from, to)

  // Backward compatibility: callers from the pre-refactor UI passed only
  // (board, from, to). The piece itself is the authoritative mover color.
  const mover = moverPlayer ?? piece.player

  if (piece.player !== mover) return emptyMoveResult(from, to)

  // A preview is still an engine operation: never simulate jumping, diagonal
  // motion, landing on occupied cells, or a stationary Min Rek Chanh King.
  const legal = getLegalMoves(board, from, mode)
  if (!legal.includes(to)) return emptyMoveResult(from, to)

  // Check Hao Rek obligation in Min Rek Chanh mode.
  if (mode === 'MIN_REK_CHANH') {
    const rekMoves = getAllRekOpportunities(board, mover, mode)
    if (rekMoves.length > 0) {
      const isRekMove = rekMoves.some((m) => m.from === from && m.to === to)
      if (!isRekMove) {
        return {
          ...emptyMoveResult(from, to),
          isHaoRekViolation: true,
        }
      }
    }
  }

  // 1. Move piece.
  const tempBoard = [...board]
  tempBoard[to] = piece
  tempBoard[from] = null

  // 2. Rek first.
  const rekCaptures = checkRekCaptures(tempBoard, to, mover)
  for (const v of rekCaptures) {
    tempBoard[v] = null
  }

  // 3. Poat second on the post-Rek board.
  const opp = opponent(mover)
  const poatCaptures = checkPoatCaptures(tempBoard, opp)

  const allCaptures = Array.from(new Set([...rekCaptures, ...poatCaptures]))

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
    captures: allCaptures,
    rek: rekCaptures.length > 0,
    poat: poatCaptures.length > 0,
    sanNotation: notation,
  }
}

/**
 * Executes a move and produces a new immutable game state.
 */
export function executeMove(
  state: GameState,
  from: number,
  to: number
): GameState {
  if (state.status !== 'playing') return state

  const mover = state.turn
  const piece = state.board[from]
  if (!piece || piece.player !== mover) return state

  // Core validation is mandatory; UI previews are not a security boundary.
  const legal = getLegalMoves(state.board, from, state.mode)
  if (!legal.includes(to)) return state

  const result = previewMove(state.board, from, to, mover, state.mode)

  // Min Rek Chanh is a forfeit rule, not merely a disabled UI action.
  // The board is left untouched because the illegal move never occurs.
  if (result.isHaoRekViolation) {
    return {
      ...state,
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
      const oppLegalCount = countTotalLegalMoves(newBoard, opp, state.mode)
      if (oppLegalCount === 0) {
        status = 'won'
        winner = mover
        winReason = 'Opponent completely immobilized (Zero liberties)'
      }
    }
  }

  // Draw bookkeeping is evaluated only after decisive win/forfeit conditions.
  // Old/custom states may not carry these fields, so reconstruct a safe base.
  const currentPositionKey = createPositionKey(state.board, state.turn, state.mode)
  const positionCounts: Record<string, number> = state.positionCounts
    ? { ...state.positionCounts }
    : { [currentPositionKey]: 1 }
  const nextPositionKey = createPositionKey(newBoard, nextTurn, state.mode)
  positionCounts[nextPositionKey] = (positionCounts[nextPositionKey] ?? 0) + 1

  const hadLoneKing = hasLoneKing(state.board)
  const hasLoneKingNow = hasLoneKing(newBoard)
  let loneKingMoveCount = state.loneKingMoveCount ?? 0
  if (!hasLoneKingNow) {
    loneKingMoveCount = 0
  } else if (!hadLoneKing) {
    // The move that creates a lone-King position starts the count; it is not
    // itself counted as one of the survival plies.
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
    status === 'playing' ? getAllRekOpportunities(newBoard, nextTurn, state.mode).length : 0

  return {
    board: newBoard,
    turn: nextTurn,
    status,
    winner,
    winReason,
    mode: state.mode,
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
  mode: GameMode = 'REK_POAT'
): number {
  let total = 0
  for (let i = 0; i < board.length; i++) {
    const c = board[i]
    if (c && c.player === player) {
      total += getLegalMoves(board, i, mode).length
    }
  }
  return total
}

/**
 * Complete RekEngine class wrapping pure engine functions.
 */
export class RekEngine {
  private state: GameState
  private history: GameState[] = []

  constructor(mode: GameMode = 'REK_POAT') {
    this.state = createInitialState(mode)
  }

  public getState(): GameState {
    return this.state
  }

  public reset(mode?: GameMode): void {
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

    // Use geometric legality here so a compulsory-Rek violation can be
    // adjudicated by executeMove as a forfeit instead of silently disappearing.
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
    this.state = {
      board,
      turn,
      status: 'playing',
      winner: null,
      winReason: null,
      mode: this.state.mode,
      lastMove: null,
      lastCaptured: [],
      lastRek: false,
      lastPoat: false,
      captured: { you: [], opp: [] },
      moveCount: 0,
      availableRekMovesCount: getAllRekOpportunities(board, turn, this.state.mode).length,
      positionCounts: { [createPositionKey(board, turn, this.state.mode)]: 1 },
      loneKingMoveCount: 0,
      drawMoveLimit: this.state.drawMoveLimit ?? DEFAULT_LONE_KING_DRAW_LIMIT,
    }
    this.history = []
  }
}

export const applyMove = executeMove
export const evaluateMove = previewMove
export const getAvailableRekMoves = getAllRekOpportunities

/**
 * Returns actual rule-legal destinations for a selected piece.
 * In Min Rek Chanh, ordinary moves disappear while any Rek is compulsory.
 */
export function getMoveResults(
  board: Cell[],
  from: number,
  mode: GameMode = 'REK_POAT'
): Map<number, MoveResult> {
  const map = new Map<number, MoveResult>()
  const piece = board[from]
  if (!piece) return map

  const destinations = getLegalMoves(board, from, mode)
  for (const to of destinations) {
    const res = previewMove(board, from, to, piece.player, mode)
    if (res.isHaoRekViolation) continue
    map.set(to, res)
  }
  return map
}
