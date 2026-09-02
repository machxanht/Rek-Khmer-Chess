// AI Bot Engine for Rek Khmer (ល្បែងរែក)
// Heuristic evaluation + alpha-beta minimax. Move legality always comes from
// the core Rek engine; this module never re-implements movement/capture rules.

import {
  BOARD_SIZE,
  Cell,
  PlayerColor,
  GameMode,
} from './types'
import {
  rc,
  idx,
  opponent,
  inBounds,
  DIRS,
} from './captures'
import {
  createPositionKey,
  getMoveResults,
  previewMove,
  hasKing,
  countPieces,
  countTotalLegalMoves,
  getAllRekOpportunities,
} from './engine'

export type AiDifficulty = 'easy' | 'medium' | 'hard'

export interface AiMove {
  from: number
  to: number
  score?: number
}

export interface AiLegalMove {
  from: number
  to: number
  capturesCount: number
  capturesKing: boolean
  rek: boolean
  poat: boolean
}

/**
 * Positional evaluation. Legality/capture resolution still belongs entirely to
 * engine.ts; this function only assigns strategic values to an already-valid
 * board position.
 */
export function evaluateBoard(
  board: Cell[],
  aiColor: PlayerColor,
  mode: GameMode = 'REK_POAT'
): number {
  const oppColor = opponent(aiColor)

  if (!hasKing(board, aiColor)) return -100000
  if (!hasKing(board, oppColor)) return 100000

  const aiPieces = countPieces(board, aiColor)
  const oppPieces = countPieces(board, oppColor)
  let score = (aiPieces - oppPieces) * 140

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const piece = board[i]
    if (!piece) continue

    const { row, col } = rc(i)
    const multiplier = piece.player === aiColor ? 1 : -1
    const distCenter = Math.abs(row - 3.5) + Math.abs(col - 3.5)

    // Center access is useful for both intervention Rek and escape routes.
    score += multiplier * Math.max(0, 6 - distCenter) * 7

    let liberties = 0
    for (const { dr, dc } of DIRS) {
      const nr = row + dr
      const nc = col + dc
      if (inBounds(nr, nc) && board[idx(nr, nc)] === null) liberties++
    }

    if (liberties === 0) {
      score -= multiplier * (piece.king ? 900 : 70)
    } else {
      score += multiplier * liberties * (piece.king ? 18 : 5)
    }

    if (piece.king && liberties === 1) {
      score -= multiplier * 320
    }
  }

  // Mobility and immediate Rek pressure are useful secondary signals. These
  // helpers are core-engine calculations, not AI-specific rule copies.
  const aiMobility = countTotalLegalMoves(board, aiColor, mode)
  const oppMobility = countTotalLegalMoves(board, oppColor, mode)
  score += (aiMobility - oppMobility) * 2

  const aiReks = getAllRekOpportunities(board, aiColor, mode).length
  const oppReks = getAllRekOpportunities(board, oppColor, mode).length
  score += (aiReks - oppReks) * 24

  return score
}

/**
 * Collects all rule-legal moves for a player with engine-produced tactical
 * metadata. getMoveResults() is the single legality boundary.
 */
export function getAllLegalMoves(
  board: Cell[],
  player: PlayerColor,
  mode: GameMode = 'REK_POAT'
): AiLegalMove[] {
  const moves: AiLegalMove[] = []

  for (let from = 0; from < BOARD_SIZE * BOARD_SIZE; from++) {
    const piece = board[from]
    if (!piece || piece.player !== player) continue

    const legalResults = getMoveResults(board, from, mode)
    for (const [to, result] of legalResults) {
      moves.push({
        from,
        to,
        capturesCount: result.captures.length,
        capturesKing: result.captures.some((square) => board[square]?.king === true),
        rek: result.rek,
        poat: result.poat,
      })
    }
  }

  return moves.sort((a, b) => {
    if (a.capturesKing !== b.capturesKing) return a.capturesKing ? -1 : 1
    if (a.capturesCount !== b.capturesCount) return b.capturesCount - a.capturesCount
    if (a.poat !== b.poat) return a.poat ? -1 : 1
    if (a.rek !== b.rek) return a.rek ? -1 : 1
    if (a.from !== b.from) return a.from - b.from
    return a.to - b.to
  })
}

function simulateMove(
  board: Cell[],
  move: AiLegalMove,
  mover: PlayerColor,
  mode: GameMode
): Cell[] {
  const result = previewMove(board, move.from, move.to, mover, mode)
  const nextBoard = [...board]
  nextBoard[move.to] = nextBoard[move.from]
  nextBoard[move.from] = null
  for (const cap of result.captures) nextBoard[cap] = null
  return nextBoard
}

/**
 * Alpha-Beta minimax with a small transposition cache. The cache key uses the
 * same rule-relevant position identity as draw detection.
 */
export function minimax(
  board: Cell[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PlayerColor,
  mode: GameMode,
  cache: Map<string, number> = new Map()
): number {
  const oppColor = opponent(aiColor)
  const currentTurn = isMaximizing ? aiColor : oppColor

  if (depth === 0 || !hasKing(board, aiColor) || !hasKing(board, oppColor)) {
    return evaluateBoard(board, aiColor, mode)
  }

  const cacheKey = `${depth}|${isMaximizing ? 'max' : 'min'}|${createPositionKey(board, currentTurn, mode)}`
  const cached = cache.get(cacheKey)
  if (cached !== undefined) return cached

  const moves = getAllLegalMoves(board, currentTurn, mode)
  if (moves.length === 0) {
    const terminal = isMaximizing ? -90000 - depth : 90000 + depth
    cache.set(cacheKey, terminal)
    return terminal
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      if (move.capturesKing) {
        maxEval = Math.max(maxEval, 100000 + depth)
      } else {
        const nextBoard = simulateMove(board, move, aiColor, mode)
        maxEval = Math.max(
          maxEval,
          minimax(nextBoard, depth - 1, alpha, beta, false, aiColor, mode, cache)
        )
      }
      alpha = Math.max(alpha, maxEval)
      if (beta <= alpha) break
    }
    cache.set(cacheKey, maxEval)
    return maxEval
  }

  let minEval = Infinity
  for (const move of moves) {
    if (move.capturesKing) {
      minEval = Math.min(minEval, -100000 - depth)
    } else {
      const nextBoard = simulateMove(board, move, oppColor, mode)
      minEval = Math.min(
        minEval,
        minimax(nextBoard, depth - 1, alpha, beta, true, aiColor, mode, cache)
      )
    }
    beta = Math.min(beta, minEval)
    if (beta <= alpha) break
  }
  cache.set(cacheKey, minEval)
  return minEval
}

/**
 * Chooses the best engine-legal AI move for the selected difficulty.
 */
export function chooseAiMove(
  board: Cell[],
  aiColor: PlayerColor,
  mode: GameMode = 'REK_POAT',
  difficulty: AiDifficulty = 'medium'
): AiMove | null {
  const moves = getAllLegalMoves(board, aiColor, mode)
  if (moves.length === 0) return null

  // Never overlook an immediate Royal capture at any non-random difficulty.
  const immediateRoyal = moves.find((move) => move.capturesKing)
  if (immediateRoyal && difficulty !== 'easy') {
    return { from: immediateRoyal.from, to: immediateRoyal.to, score: 100000 }
  }

  if (difficulty === 'easy') {
    const capturingMoves = moves.filter((m) => m.capturesCount > 0)
    if (capturingMoves.length > 0 && Math.random() < 0.65) {
      const move = capturingMoves[Math.floor(Math.random() * capturingMoves.length)]
      return { from: move.from, to: move.to }
    }
    const move = moves[Math.floor(Math.random() * moves.length)]
    return { from: move.from, to: move.to }
  }

  const searchDepth = difficulty === 'medium' ? 2 : 3
  const cache = new Map<string, number>()
  let bestMove: AiMove | null = null
  let bestScore = -Infinity

  for (const move of moves) {
    const nextBoard = simulateMove(board, move, aiColor, mode)
    const searchScore = minimax(
      nextBoard,
      searchDepth - 1,
      -Infinity,
      Infinity,
      false,
      aiColor,
      mode,
      cache
    )
    // Tiny tactical tie-break only; material/position still dominate minimax.
    const score = searchScore + move.capturesCount * 3 + (move.poat ? 1 : 0)

    if (score > bestScore) {
      bestScore = score
      bestMove = { from: move.from, to: move.to, score }
    }
  }

  const fallback = moves[0]
  return bestMove ?? { from: fallback.from, to: fallback.to }
}
