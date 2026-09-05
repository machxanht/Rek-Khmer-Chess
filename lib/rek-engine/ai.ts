// AI Bot Engine for Rek Khmer (ល្បែងរែក)
// Heuristic evaluation + alpha-beta minimax. Move legality always comes from
// the core Rek engine; this module never re-implements movement/capture rules.

import {
  BOARD_SIZE,
  DEFAULT_RULESET,
  Cell,
  PlayerColor,
  RuleSet,
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
  getAllMoveResults,
  hasKing,
  countPieces,
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
  /** Exact capture squares produced by the core engine for this legal move. */
  captures: readonly number[]
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
 * Collects all rule-legal moves for a player with engine-produced tactical
 * metadata. The bulk engine result is the single legality boundary and computes
 * side-wide Min Rek Chanh obligations once per position.
 */
export function getAllLegalMoves(
  board: Cell[],
  player: PlayerColor,
  mode: RuleSet = DEFAULT_RULESET
): AiLegalMove[] {
  const moves: AiLegalMove[] = []

  for (const [from, legalResults] of getAllMoveResults(board, player, mode)) {
    for (const [to, result] of legalResults) {
      moves.push({
        from,
        to,
        captures: [...result.captures],
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

/** Count rule-legal moves from the same engine-backed move projection used by search. */
export function countRuleLegalMoves(
  board: Cell[],
  player: PlayerColor,
  mode: RuleSet = DEFAULT_RULESET
): number {
  return getAllLegalMoves(board, player, mode).length
}

interface KnownLegalMoves {
  player: PlayerColor
  moves: readonly AiLegalMove[]
}

function evaluateBoardInternal(
  board: Cell[],
  aiColor: PlayerColor,
  mode: RuleSet,
  known?: KnownLegalMoves
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

  const aiMoves = known?.player === aiColor
    ? known.moves
    : getAllLegalMoves(board, aiColor, mode)
  const oppMoves = known?.player === oppColor
    ? known.moves
    : getAllLegalMoves(board, oppColor, mode)

  score += (aiMoves.length - oppMoves.length) * 2

  const aiReks = aiMoves.reduce((count, move) => count + (move.rek ? 1 : 0), 0)
  const oppReks = oppMoves.reduce((count, move) => count + (move.rek ? 1 : 0), 0)
  score += (aiReks - oppReks) * 24

  return score
}

/**
 * Positional evaluation. Legality/capture resolution still belongs entirely to
 * engine.ts; this function only assigns strategic values to an already-valid
 * board position.
 */
export function evaluateBoard(
  board: Cell[],
  aiColor: PlayerColor,
  mode: RuleSet = DEFAULT_RULESET
): number {
  return evaluateBoardInternal(board, aiColor, mode)
}

/**
 * Applies an already engine-legal move using the exact capture squares returned
 * by the core engine. This avoids calling previewMove() a second time for every
 * searched edge and does not duplicate any capture rule in AI.
 */
function simulateMove(board: Cell[], move: AiLegalMove): Cell[] {
  const nextBoard = [...board]
  nextBoard[move.to] = nextBoard[move.from]
  nextBoard[move.from] = null
  for (const cap of move.captures) nextBoard[cap] = null
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
 * - Terminal immobilization is checked before the depth cutoff under the current
 *   engine contract.
 * - At the horizon, an immediate legal Royal capture receives a mate-like score.
 * - Nodes pruned by alpha-beta are bounds, not exact values, and are not cached.
 */
export function minimax(
  board: Cell[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PlayerColor,
  mode: RuleSet,
  cache: Map<string, number> = new Map(),
  stats?: AiSearchStats,
  knownMoves?: readonly AiLegalMove[]
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

  const moves = knownMoves ?? getAllLegalMoves(board, currentTurn, mode)
  if (stats && !knownMoves) stats.legalMoveGenerations++

  if (moves.length === 0) {
    if (stats) stats.leaves++
    const terminal = terminalNoMoveScore(currentTurn, aiColor, depth)
    cache.set(cacheKey, terminal)
    return terminal
  }

  if (depth === 0) {
    if (stats) stats.leaves++

    if (moves.some((move) => move.capturesKing)) {
      const tactical = royalHorizonScore(currentTurn, aiColor, depth)
      cache.set(cacheKey, tactical)
      return tactical
    }

    const evaluated = evaluateBoardInternal(board, aiColor, mode, {
      player: currentTurn,
      moves,
    })
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
        const nextBoard = simulateMove(board, move)
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

    if (!cutoff) cache.set(cacheKey, maxEval)
    return maxEval
  }

  let minEval = Infinity
  let cutoff = false
  for (const move of moves) {
    if (move.capturesKing) {
      minEval = Math.min(minEval, -100000 - depth)
    } else {
      const nextBoard = simulateMove(board, move)
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

function chooseSearchDepth(
  difficulty: AiDifficulty,
  rootMoves: number,
  totalPieces: number
): number {
  if (difficulty === 'easy') return 0
  if (difficulty === 'medium') return 2

  if (rootMoves <= 4 && totalPieces <= 10) return 5
  if (rootMoves <= 10 && totalPieces <= 18) return 4
  return 3
}

/**
 * Deterministic analysis entry point for Medium/Hard plus search diagnostics.
 * Easy intentionally remains random and therefore reports zero searched nodes.
 */
export function analyzeAiMove(
  board: Cell[],
  aiColor: PlayerColor,
  mode: RuleSet = DEFAULT_RULESET,
  difficulty: AiDifficulty = 'medium'
): AiAnalysis {
  const stats = createSearchStats()
  const moves = getAllLegalMoves(board, aiColor, mode)
  const totalPieces = countPieces(board, 'you') + countPieces(board, 'opp')
  const searchDepth = chooseSearchDepth(difficulty, moves.length, totalPieces)

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
    const nextBoard = simulateMove(board, move)
    const oppColor = opponent(aiColor)

    let searchScore: number
    if (!hasKing(nextBoard, oppColor)) {
      searchScore = 99000 + searchDepth
    } else {
      const opponentMoves = getAllLegalMoves(nextBoard, oppColor, mode)
      if (opponentMoves.length === 0) {
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
          stats,
          opponentMoves
        )
      }
    }

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
  mode: RuleSet = DEFAULT_RULESET,
  difficulty: AiDifficulty = 'medium'
): AiMove | null {
  return analyzeAiMove(board, aiColor, mode, difficulty).move
}
