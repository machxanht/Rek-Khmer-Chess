import { PlayerColor, RuleSet, RuleSetInput, normalizeRuleSet } from './types'
import { analyzeAiState, getAllLegalMovesForState, AiDifficulty } from './ai'
import { createGame } from './session'

export interface TournamentGameConfig {
  mode: RuleSetInput
  seed: number
  youDifficulty: Exclude<AiDifficulty, 'easy'>
  oppDifficulty: Exclude<AiDifficulty, 'easy'>
  openingPlies?: number
  maxPlies?: number
}

export interface TournamentSeriesOptions {
  baseSeed?: number
  openingPlies?: number
  maxPlies?: number
}

export interface TournamentGameResult {
  mode: RuleSet
  seed: number
  winner: PlayerColor | 'draw' | null
  winReason: string | null
  plies: number
  capped: boolean
  illegalMoves: number
  maxSearchNodes: number
  totalSearchNodes: number
  hardSearchNodes: number
  mediumSearchNodes: number
}

export interface TournamentSummary {
  mode: RuleSet
  games: number
  hardWins: number
  mediumWins: number
  draws: number
  capped: number
  illegalMoves: number
  averagePlies: number
  maxGamePlies: number
  maxSearchNodes: number
  totalSearchNodes: number
  hardSearchNodes: number
  mediumSearchNodes: number
}

function nextSeed(value: number): number {
  return (Math.imul(value >>> 0, 1664525) + 1013904223) >>> 0
}

/**
 * Runs one deterministic engine-owned AI game.
 * Opening diversity chooses only from core-engine legal moves.
 */
export function playTournamentGame(config: TournamentGameConfig): TournamentGameResult {
  const mode = normalizeRuleSet(config.mode)
  const openingPlies = config.openingPlies ?? 4
  const maxPlies = config.maxPlies ?? 160
  const game = createGame(mode)
  let seed = config.seed >>> 0
  let illegalMoves = 0
  let maxSearchNodes = 0
  let totalSearchNodes = 0
  let hardSearchNodes = 0
  let mediumSearchNodes = 0
  let completedPlies = 0

  while (completedPlies < maxPlies) {
    const state = game.getState()
    if (state.status !== 'playing') break

    if (completedPlies < openingPlies) {
      const legal = getAllLegalMovesForState(state)
      if (legal.length === 0) break
      seed = nextSeed(seed + completedPlies + 1)
      const move = legal[seed % legal.length]
      if (!game.makeMove(move.from, move.to)) {
        illegalMoves++
        break
      }
      completedPlies++
      continue
    }

    const difficulty = state.turn === 'you' ? config.youDifficulty : config.oppDifficulty
    const analysis = analyzeAiState(state, difficulty)
    const move = analysis.move
    const nodes = analysis.stats.nodes

    maxSearchNodes = Math.max(maxSearchNodes, nodes)
    totalSearchNodes += nodes
    if (difficulty === 'hard') hardSearchNodes += nodes
    else mediumSearchNodes += nodes

    if (!move) {
      const legal = getAllLegalMovesForState(state)
      if (legal.length !== 0) illegalMoves++
      break
    }

    const legal = getAllLegalMovesForState(state)
    if (!legal.some((candidate) => candidate.from === move.from && candidate.to === move.to)) {
      illegalMoves++
      break
    }

    if (!game.makeMove(move.from, move.to)) {
      illegalMoves++
      break
    }
    completedPlies++
  }

  const finalState = game.getState()
  return {
    mode,
    seed: config.seed,
    winner: finalState.winner,
    winReason: finalState.winReason,
    plies: completedPlies,
    capped: finalState.status === 'playing' && completedPlies >= maxPlies,
    illegalMoves,
    maxSearchNodes,
    totalSearchNodes,
    hardSearchNodes,
    mediumSearchNodes,
  }
}

/** Runs Hard-vs-Medium with colors swapped every game to remove side bias. */
export function runTournamentSeries(
  mode: RuleSetInput,
  games: number,
  options: TournamentSeriesOptions = {}
): TournamentSummary {
  const ruleset = normalizeRuleSet(mode)
  const results: TournamentGameResult[] = []
  const baseSeed = options.baseSeed ?? (ruleset === 'REK_STANDARD' ? 0x52454b : 0x4d494e)

  for (let gameIndex = 0; gameIndex < games; gameIndex++) {
    const hardIsYou = gameIndex % 2 === 0
    results.push(
      playTournamentGame({
        mode: ruleset,
        seed: nextSeed(baseSeed + gameIndex * 7919),
        youDifficulty: hardIsYou ? 'hard' : 'medium',
        oppDifficulty: hardIsYou ? 'medium' : 'hard',
        openingPlies: options.openingPlies,
        maxPlies: options.maxPlies,
      })
    )
  }

  let hardWins = 0
  let mediumWins = 0
  let draws = 0
  let capped = 0
  let illegalMoves = 0
  let totalPlies = 0
  let maxGamePlies = 0
  let maxSearchNodes = 0
  let totalSearchNodes = 0
  let hardSearchNodes = 0
  let mediumSearchNodes = 0

  results.forEach((result, gameIndex) => {
    const hardIsYou = gameIndex % 2 === 0
    const hardColor: PlayerColor = hardIsYou ? 'you' : 'opp'
    if (result.winner === 'draw') draws++
    else if (result.winner === hardColor) hardWins++
    else if (result.winner !== null) mediumWins++

    if (result.capped) capped++
    illegalMoves += result.illegalMoves
    totalPlies += result.plies
    maxGamePlies = Math.max(maxGamePlies, result.plies)
    maxSearchNodes = Math.max(maxSearchNodes, result.maxSearchNodes)
    totalSearchNodes += result.totalSearchNodes
    hardSearchNodes += result.hardSearchNodes
    mediumSearchNodes += result.mediumSearchNodes
  })

  return {
    mode: ruleset,
    games,
    hardWins,
    mediumWins,
    draws,
    capped,
    illegalMoves,
    averagePlies: games === 0 ? 0 : totalPlies / games,
    maxGamePlies,
    maxSearchNodes,
    totalSearchNodes,
    hardSearchNodes,
    mediumSearchNodes,
  }
}

/** Runs the same deterministic Hard-vs-Medium series in both canonical rule sets. */
export function runAiTournamentBaseline(
  gamesPerMode: number,
  options: TournamentSeriesOptions = {}
): TournamentSummary[] {
  return [
    runTournamentSeries('REK_STANDARD', gamesPerMode, options),
    runTournamentSeries('MIN_REK_CHANH', gamesPerMode, options),
  ]
}
