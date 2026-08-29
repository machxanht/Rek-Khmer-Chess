// Pure TypeScript Engine for Rek Khmer (ល្បែងរែក)
// 100% independent from React / DOM / UI frameworks.
// Implements all specifications from /SPEC_ENGINE_CO_REK_KHMER.md and /HUONG_DAN_LUAT_CO_REK_KHMER.md.

import {
  BOARD_SIZE,
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
  return {
    board,
    turn: 'you',
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
  }
}

/**
 * Computes legal sliding destinations for a piece at `from`.
 * Pieces slide like Rooks across empty orthogonal squares.
 */
export function getLegalMoves(
  board: Cell[],
  from: number,
  mode: GameMode = 'REK_POAT'
): number[] {
  const piece = board[from]
  if (!piece) return []

  // In Min Rek Chanh mode, Palace King is stationary on the throne (d1 / d8)
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
 * Returns all possible moves for a player that trigger a Rek (Gánh) capture.
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
      // Simulate move
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
 * Predicts the full outcome of a move without modifying the board.
 */
export function previewMove(
  board: Cell[],
  from: number,
  to: number,
  moverPlayer: PlayerColor,
  mode: GameMode = 'REK_POAT'
): MoveResult {
  const piece = board[from]
  if (!piece) {
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

  // Check Hao Rek obligation in Min Rek Chanh mode
  if (mode === 'MIN_REK_CHANH') {
    const rekMoves = getAllRekOpportunities(board, moverPlayer, mode)
    if (rekMoves.length > 0) {
      const isRekMove = rekMoves.some((m) => m.from === from && m.to === to)
      if (!isRekMove) {
        return {
          from,
          to,
          rekCaptures: [],
          poatCaptures: [],
          captures: [],
          rek: false,
          poat: false,
          isHaoRekViolation: true,
        }
      }
    }
  }

  // 1. Move piece
  const tempBoard = [...board]
  tempBoard[to] = piece
  tempBoard[from] = null

  // 2. Step 1 of capture: Rek (Gánh)
  const rekCaptures = checkRekCaptures(tempBoard, to, moverPlayer)
  for (const v of rekCaptures) {
    tempBoard[v] = null
  }

  // 3. Step 2 of capture: Poat (Bao Vây Flood-Fill)
  const opp = opponent(moverPlayer)
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
 * Executes a move and produces a new game state.
 */
export function executeMove(
  state: GameState,
  from: number,
  to: number
): GameState {
  const mover = state.turn
  const piece = state.board[from]
  if (!piece || piece.player !== mover) return state

  const result = previewMove(state.board, from, to, mover, state.mode)
  if (result.isHaoRekViolation) return state

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
    you: [...state.captured.you, ...(mover === 'opp' ? lostPieces : [])],
    opp: [...state.captured.opp, ...(mover === 'you' ? lostPieces : [])],
  }

  // Check victory conditions:
  // 1. King captured
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
    // 2. Total piece annihilation or zero legal moves (Stalemate = Loss in Rek)
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

  // Available Rek count for the upcoming turn
  const availableReks = getAllRekOpportunities(newBoard, nextTurn, state.mode).length

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

  public getLegalMoves(from: number): number[] {
    return getLegalMoves(this.state.board, from, this.state.mode)
  }

  public previewMove(from: number, to: number): MoveResult {
    return previewMove(this.state.board, from, to, this.state.turn, this.state.mode)
  }

  public makeMove(from: number, to: number): boolean {
    if (this.state.status !== 'playing') return false
    const legal = this.getLegalMoves(from)
    if (!legal.includes(to)) return false

    const result = this.previewMove(from, to)
    if (result.isHaoRekViolation) return false

    this.history.push(this.state)
    this.state = executeMove(this.state, from, to)
    return true
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
    this.state = {
      board,
      turn: 'you',
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
      availableRekMovesCount: getAllRekOpportunities(board, 'you', this.state.mode).length,
    }
    this.history = []
  }
}

// Convenient function aliases for hooks & UI
export const applyMove = executeMove
export const evaluateMove = previewMove
export const getAvailableRekMoves = getAllRekOpportunities

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
    map.set(to, res)
  }
  return map
}

