import { TestResult } from './types'
import { runTournamentSeries } from './ai-tournament'

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

  const sampleOptions = { maxPlies: 64, openingPlies: 4 }
  const samples = [
    runTournamentSeries('REK_POAT', 2, sampleOptions),
    runTournamentSeries('MIN_REK_CHANH', 2, sampleOptions),
  ]

  run('AIT-01', 'Tournament AI never submits a move outside the core engine legal set', () => {
    expect(samples.every((summary) => summary.illegalMoves === 0), 'Tournament recorded an illegal AI move')
    return 'Both rulesets completed the CI sample with illegalMoves=0.'
  })

  run('AIT-02', 'Tournament sample is deterministic across repeated runs', () => {
    const repeated = [
      runTournamentSeries('REK_POAT', 2, sampleOptions),
      runTournamentSeries('MIN_REK_CHANH', 2, sampleOptions),
    ]
    expect(JSON.stringify(samples) === JSON.stringify(repeated), 'Same tournament seeds must reproduce the same summaries')
    return 'Seeded openings plus Medium/Hard search reproduce exactly across runs.'
  })

  run('AIT-03', 'Hard and Medium are evaluated with balanced colors in both rulesets', () => {
    for (const summary of samples) {
      expect(summary.games === 2, `${summary.mode} sample must contain two games`)
      expect(
        summary.hardWins + summary.mediumWins + summary.draws + summary.capped === summary.games,
        `${summary.mode} outcomes must account for every game`
      )
    }
    return 'Two-game samples swap Hard between you/opp, removing one-sided color assignment.'
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

  run('AIT-05', 'Tournament reports game-length and unresolved-cap baselines', () => {
    for (const summary of samples) {
      expect(summary.averagePlies > 0, `${summary.mode} average plies must be positive`)
      expect(summary.maxGamePlies <= 64, `${summary.mode} must respect the CI max-ply cap`)
      expect(summary.capped <= summary.games, `${summary.mode} capped count is invalid`)
    }
    return samples
      .map(
        (summary) =>
          `${summary.mode}: H ${summary.hardWins}-${summary.mediumWins} M, draws=${summary.draws}, capped=${summary.capped}, avg=${summary.averagePlies.toFixed(1)} ply`
      )
      .join('; ')
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
