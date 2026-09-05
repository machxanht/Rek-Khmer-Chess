import { TestResult } from './types'
import { playTournamentGame, runTournamentSeries } from './ai-tournament'

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export function runAiTournamentTests(): {
  total: number
  passed: number
  failed: number
  results: TestResult[]
} {
  const results: TestResult[] = []
  const run = (id: string, title: string, fn: () => string) => {
    try {
      results.push({ id, title, passed: true, details: fn() })
    } catch (error) {
      results.push({
        id,
        title,
        passed: false,
        details: 'AI tournament regression failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // CI is deliberately a tournament smoke gate, not the 200-game benchmark.
  // Eight opening plies create deterministic diversity, then each color gets an
  // actual searched AI turn before the tiny CI cap is reached.
  const sampleOptions = { maxPlies: 10, openingPlies: 8 }
  const samples = [
    runTournamentSeries('REK_POAT', 2, sampleOptions),
    runTournamentSeries('MIN_REK_CHANH', 2, sampleOptions),
  ]

  run('AIT-01', 'Tournament AI never submits a move outside the core engine legal set', () => {
    expect(samples.every((summary) => summary.illegalMoves === 0), 'Tournament recorded an illegal AI move')
    return 'Both rulesets completed the balanced CI smoke with illegalMoves=0.'
  })

  run('AIT-02', 'Seeded tournament games are deterministic in both rulesets', () => {
    const configs = [
      { mode: 'REK_POAT' as const, seed: 101, youDifficulty: 'hard' as const, oppDifficulty: 'medium' as const },
      { mode: 'MIN_REK_CHANH' as const, seed: 202, youDifficulty: 'medium' as const, oppDifficulty: 'hard' as const },
    ]
    for (const config of configs) {
      const first = playTournamentGame({ ...config, openingPlies: 8, maxPlies: 10 })
      const second = playTournamentGame({ ...config, openingPlies: 8, maxPlies: 10 })
      expect(JSON.stringify(first) === JSON.stringify(second), `${config.mode} seeded game must reproduce exactly`)
    }
    return 'Seeded openings plus deterministic Medium/Hard search reproduce exactly across runs.'
  })

  run('AIT-03', 'Hard and Medium are evaluated with balanced colors in both rulesets', () => {
    for (const summary of samples) {
      expect(summary.games === 2, `${summary.mode} sample must contain two games`)
      expect(
        summary.hardWins + summary.mediumWins + summary.draws + summary.capped === summary.games,
        `${summary.mode} outcomes must account for every game`
      )
      expect(summary.hardSearchNodes > 0, `${summary.mode} must execute Hard search`)
      expect(summary.mediumSearchNodes > 0, `${summary.mode} must execute Medium search`)
    }
    return 'Two-game samples swap Hard between you/opp and execute both difficulty searches.'
  })

  run('AIT-04', 'Tournament search remains inside a deterministic per-move node budget', () => {
    for (const summary of samples) {
      expect(summary.maxSearchNodes <= 250000, `${summary.mode} exceeded 250k search nodes on one move`)
      expect(summary.totalSearchNodes > 0, `${summary.mode} must perform deterministic AI search`)
    }
    return samples
      .map((summary) => `${summary.mode}: max=${summary.maxSearchNodes}, total=${summary.totalSearchNodes}`)
      .join('; ')
  })

  run('AIT-05', 'Tournament smoke reports bounded cap and aggregate metrics', () => {
    for (const summary of samples) {
      expect(summary.averagePlies > 0, `${summary.mode} average plies must be positive`)
      expect(summary.maxGamePlies <= 10, `${summary.mode} must respect the CI max-ply cap`)
      expect(summary.capped <= summary.games, `${summary.mode} capped count is invalid`)
    }
    return samples
      .map(
        (summary) =>
          `${summary.mode}: capped=${summary.capped}/${summary.games}, avg=${summary.averagePlies.toFixed(1)} ply, nodes=${summary.totalSearchNodes}`
      )
      .join('; ')
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
