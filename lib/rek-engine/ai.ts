// AI Bot Engine for Rek Khmer (ល្បែងរែក)
// Features heuristic positional evaluation and Alpha-Beta minimax search.

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
  getMoveResults,
  previewMove,
  hasKing,
  countPieces,
} from './engine'

export type AiDifficulty = 'easy' | 'medium' | 'hard'

export interface AiMove {
  from: number
  to: number
  score?: number
}

/**
 * Heuristic Evaluation Function for Rek Khmer:
 * - King Value: 10000 points
 * - Piece Value: 100 points
 * - Center Control (d4, d5, e4, e5): 15 points
 * - Liberty / Escape potential: 5 points per liberty
 * - Rek Potential Threat / Vulnerability
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

  let score = (aiPieces - oppPieces) * 120

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const piece = board[i]
    if (!piece) continue

    const { row, col } = rc(i)
    const multiplier = piece.player === aiColor ? 1 : -1

    const distCenter = Math.abs(row - 3.5) + Math.abs(col - 3.5)
    score += multiplier * Math.max(0, 6 - distCenter) * 8

    let liberties = 0
    for (const { dr, dc } of DIRS) {
      const nr = row + dr
      const nc = col + dc
      if (inBounds(nr, nc) && board[idx(nr, nc)] === null) {
        liberties++
      }
    }

    if (liberties === 0) {
      score -= multiplier * 45
    } else {
      score += multiplier * liberties * 4
    }

    if (piece.king && liberties <= 1) {
      score -= multiplier * 250
    }
  }

  return score
}

/**
 * Collects all rule-legal moves for a player with tactical metadata.
 *
 * The engine's getMoveResults() is the single legality boundary here. AI must
 * not re-implement compulsory Rek, King immobility, path blocking, or other
 * move rules on its own.
 */
export function getAllLegalMoves(
  board: Cell[],
  player: PlayerColor,
  mode: GameMode = 'REK_POAT'
): { from: number; to: number; capturesCount: number }[] {
  const moves: { from: number; to: number; capturesCount: number }[] = []

  for (let from = 0; from < BOARD_SIZE * BOARD_SIZE; from++) {
    const piece = board[from]
    if (!piece || piece.player !== player) continue

    const legalResults = getMoveResults(board, from, mode)
    for (const [to, result] of legalResults) {
      moves.push({
        from,
        to,
        capturesCount: result.captures.length,
      })
    }
  }

  return moves.sort((a, b) => b.capturesCount - a.capturesCount)
}

/**
 * Alpha-Beta Minimax Search for Rek Engine.
 */
export function minimax(
  board: Cell[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PlayerColor,
  mode: GameMode
): number {
  const oppColor = opponent(aiColor)
  const currentTurn = isMaximizing ? aiColor : oppColor

  if (depth === 0 || !hasKing(board, aiColor) || !hasKing(board, oppColor)) {
    return evaluateBoard(board, aiColor, mode)
  }

  const moves = getAllLegalMoves(board, currentTurn, mode)
  if (moves.length === 0) {
    return isMaximizing ? -50000 : 50000
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const res = previewMove(board, move.from, move.to, aiColor, mode)
      const nextBoard = [...board]
      nextBoard[move.to] = nextBoard[move.from]
      nextBoard[move.from] = null
      for (const cap of res.captures) {
        nextBoard[cap] = null
      }

      const evaluation = minimax(nextBoard, depth - 1, alpha, beta, false, aiColor, mode)
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  }

  let minEval = Infinity
  for (const move of moves) {
    const res = previewMove(board, move.from, move.to, oppColor, mode)
    const nextBoard = [...board]
    nextBoard[move.to] = nextBoard[move.from]
    nextBoard[move.from] = null
    for (const cap of res.captures) {
      nextBoard[cap] = null
    }

    const evaluation = minimax(nextBoard, depth - 1, alpha, beta, true, aiColor, mode)
    minEval = Math.min(minEval, evaluation)
    beta = Math.min(beta, evaluation)
    if (beta <= alpha) break
  }
  return minEval
}

/**
 * Chooses the best AI move based on selected difficulty.
 */
export function chooseAiMove(
  board: Cell[],
  aiColor: PlayerColor,
  mode: GameMode = 'REK_POAT',
  difficulty: AiDifficulty = 'medium'
): AiMove | null {
  const moves = getAllLegalMoves(board, aiColor, mode)
  if (moves.length === 0) return null

  if (difficulty === 'easy') {
    const capturingMoves = moves.filter((m) => m.capturesCount > 0)
    if (capturingMoves.length > 0 && Math.random() < 0.65) {
      return capturingMoves[Math.floor(Math.random() * capturingMoves.length)]
    }
    return moves[Math.floor(Math.random() * moves.length)]
  }

  const searchDepth = difficulty === 'medium' ? 2 : 3

  let bestMove: AiMove | null = null
  let bestScore = -Infinity

  for (const move of moves) {
    const res = previewMove(board, move.from, move.to, aiColor, mode)
    const nextBoard = [...board]
    nextBoard[move.to] = nextBoard[move.from]
    nextBoard[move.from] = null
    for (const cap of res.captures) {
      nextBoard[cap] = null
    }

    const score = minimax(
      nextBoard,
      searchDepth - 1,
      -Infinity,
      Infinity,
      false,
      aiColor,
      mode
    )

    if (score > bestScore) {
      bestScore = score
      bestMove = { from: move.from, to: move.to, score }
    }
  }

  return bestMove || moves[0]
}
