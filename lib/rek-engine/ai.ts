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

/** Deterministic counters for search-quality/performance regression tests. */
export interface AiSearchStats {
  nodes: number
  leaves: number
  cutoffs: number
  cacheHits: number
  legalMoveGenerations: number
}

export interface AiAnalysis {
  move: AiMove | null
  depth: number
  stats: AiSearchStats
}

function createSearchStats(): AiSearchStats {
  return {
    nodes: 0,
    leaves: 0,
    cutoffs: 0,
    cacheHits: 0,
    legalMoveGenerations: 0,
  }
}

/**
 * Count rule-legal moves rather than merely geometric sliding destinations.
 * This matters in MIN_REK_CHANH because a compulsory Rek can suppress every
 * otherwise-geometric quiet move for the side to move.
 */
export function countRuleLegalMoves(
  board: Cell[],
  player: PlayerColor,
  mode: GameMode = 'REK_POAT'
): number {
  let total = 0
  for (let from = 0; from < BOARD_SIZE * BOARD_SIZE; from++) {
    const piece = board[from]
    if (!piece || piece.player !== player) continue
    total += getMoveResults(board, from, mode).size
  }
  return total
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

  // Mobility must use the same rule-legal boundary as actual play. In
  // MIN_REK_CHANH this means quiet moves disappear while any Rek is compulsory.
  const aiMobility = countRuleLegalMoves(board, aiColor, mode)
  const oppMobility = countRuleLegalMoves(board, oppColor, mode)
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

function terminalNoMoveScore(
  currentTurn: PlayerColor,
  aiColor: PlayerColor,
  depth: number
): number {
  return currentTurn === aiColor ? -90000 - depth : 90000 + depth
}

function royalHorizonScore(
  currentTurn: PlayerColor,
  aiColor: PlayerColor,
  depth: number
): number {
  return currentTurn === aiColor ? 95000 + depth : -95000 - depth
}

/**
 * Alpha-Beta minimax with an exact-only transposition cache.
 *
 * Important correctness details:
 * - Terminal immobilization is checked before the depth cutoff, so a leaf that
 *   is already won/lost by zero legal moves is never mistaken for a heuristic
 *   position.
 * - At the horizon, an immediate legal Royal capture receives a mate-like score
 *   to avoid one-ply horizon blunders.
 * - Nodes pruned by alpha-beta are bounds, not exact values; they are therefore
 *   deliberately not written to the numeric transposition cache.
 */
export function minimax(
  board: Cell[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PlayerColor,
  mode: GameMode,
  cache: Map<string, number> = new Map(),
  stats?: AiSearchStats
): number {
  const oppColor = opponent(aiColor)
  const currentTurn = isMaximizing ? aiColor : oppColor
  if (stats) stats.nodes++

  if (!hasKing(board, aiColor) || !hasKing(board, oppColor)) {
    if (stats) stats.leaves++
    return evaluateBoard(board, aiColor, mode)
  }

  const cacheKey = `${depth}|${isMaximizing ? 'max' : 'min'}|${createPositionKey(board, currentTurn, mode)}`
  const cached = cache.get(cacheKey)
  if (cached !== undefined) {
    if (stats) stats.cacheHits++
    return cached
  }

  const moves = getAllLegalMoves(board, currentTurn, mode)
  if (stats) stats.legalMoveGenerations++

  // Engine rule: a side with zero legal moves is immediately immobilized and
  // loses. This remains terminal even when the search horizon has been reached.
  if (moves.length === 0) {
    if (stats) stats.leaves++
    const terminal = terminalNoMoveScore(currentTurn, aiColor, depth)
    cache.set(cacheKey, terminal)
    return terminal
  }

  if (depth === 0) {
    if (stats) stats.leaves++

    // One-ply tactical extension for the most important terminal event. Since
    // the current side is assumed optimal, an available Royal capture is a
    // forced choice at this leaf rather than a normal positional evaluation.
    if (moves.some((move) => move.capturesKing)) {
      const tactical = royalHorizonScore(currentTurn, aiColor, depth)
      cache.set(cacheKey, tactical)
      return tactical
    }

    const evaluated = evaluateBoard(board, aiColor, mode)
    cache.set(cacheKey, evaluated)
    return evaluated
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    let cutoff = false

    for (const move of moves) {
      if (move.capturesKing) {
        maxEval = Math.max(maxEval, 100000 + depth)
      } else {
        const nextBoard = simulateMove(board, move, aiColor, mode)
        maxEval = Math.max(
          maxEval,
          minimax(nextBoard, depth - 1, alpha, beta, false, aiColor, mode, cache, stats)
        )
      }
      alpha = Math.max(alpha, maxEval)
      if (beta <= alpha) {
        cutoff = true
        if (stats) stats.cutoffs++
        break
      }
    }

    // A cutoff returns a lower/upper bound, not an exact minimax value. Keep the
    // cache numeric and safe by storing only fully searched nodes.
    if (!cutoff) cache.set(cacheKey, maxEval)
    return maxEval
  }

  let minEval = Infinity
  let cutoff = false
  for (const move of moves) {
    if (move.capturesKing) {
      minEval = Math.min(minEval, -100000 - depth)
    } else {
      const nextBoard = simulateMove(board, move, oppColor, mode)
      minEval = Math.min(
        minEval,
        minimax(nextBoard, depth - 1, alpha, beta, true, aiColor, mode, cache, stats)
      )
    }
    beta = Math.min(beta, minEval)
    if (beta <= alpha) {
      cutoff = true
      if (stats) stats.cutoffs++
      break
    }
  }

  if (!cutoff) cache.set(cacheKey, minEval)
  return minEval
}

function chooseSearchDepth(difficulty: AiDifficulty, rootMoves: number): number {
  if (difficulty === 'easy') return 0
  if (difficulty === 'medium') return 2

  // Hard keeps the established depth-3 search in broad positions, but spends
  // the saved branching budget on deeper endgame/tactical calculation.
  if (rootMoves <= 4) return 5
  if (rootMoves <= 10) return 4
  return 3
}

/**
 * Deterministic analysis entry point for Medium/Hard plus search diagnostics.
 * Easy intentionally remains random and therefore reports zero searched nodes.
 */
export function analyzeAiMove(
  board: Cell[],
  aiColor: PlayerColor,
  mode: GameMode = 'REK_POAT',
  difficulty: AiDifficulty = 'medium'
): AiAnalysis {
  const stats = createSearchStats()
  const moves = getAllLegalMoves(board, aiColor, mode)
  const searchDepth = chooseSearchDepth(difficulty, moves.length)

  if (moves.length === 0) return { move: null, depth: searchDepth, stats }

  if (difficulty === 'easy') {
    const capturingMoves = moves.filter((move) => move.capturesCount > 0)
    if (capturingMoves.length > 0 && Math.random() < 0.65) {
      const move = capturingMoves[Math.floor(Math.random() * capturingMoves.length)]
      return { move: { from: move.from, to: move.to }, depth: 0, stats }
    }
    const move = moves[Math.floor(Math.random() * moves.length)]
    return { move: { from: move.from, to: move.to }, depth: 0, stats }
  }

  // Never overlook an immediate Royal capture at deterministic difficulties.
  const immediateRoyal = moves.find((move) => move.capturesKing)
  if (immediateRoyal) {
    return {
      move: { from: immediateRoyal.from, to: immediateRoyal.to, score: 100000 },
      depth: searchDepth,
      stats,
    }
  }

  const cache = new Map<string, number>()
  let bestMove: AiMove | null = null
  let bestScore = -Infinity

  for (const move of moves) {
    const nextBoard = simulateMove(board, move, aiColor, mode)
    const oppColor = opponent(aiColor)

    // A move that immediately immobilizes the opponent is already a win under
    // the engine rules; no deeper heuristic search should rank it below a quiet
    // positional alternative.
    let searchScore: number
    if (!hasKing(nextBoard, oppColor) || countRuleLegalMoves(nextBoard, oppColor, mode) === 0) {
      searchScore = 99000 + searchDepth
    } else {
      searchScore = minimax(
        nextBoard,
        searchDepth - 1,
        -Infinity,
        Infinity,
        false,
        aiColor,
        mode,
        cache,
        stats
      )
    }

    // Tiny tactical tie-break only; material/position and forced results still
    // dominate minimax. Stable move ordering makes equal scores deterministic.
    const score = searchScore + move.capturesCount * 3 + (move.poat ? 1 : 0)

    if (score > bestScore) {
      bestScore = score
      bestMove = { from: move.from, to: move.to, score }
    }
  }

  const fallback = moves[0]
  return {
    move: bestMove ?? { from: fallback.from, to: fallback.to },
    depth: searchDepth,
    stats,
  }
}

/** Chooses the best engine-legal AI move for the selected difficulty. */
export function chooseAiMove(
  board: Cell[],
  aiColor: PlayerColor,
  mode: GameMode = 'REK_POAT',
  difficulty: AiDifficulty = 'medium'
): AiMove | null {
  return analyzeAiMove(board, aiColor, mode, difficulty).move
}
