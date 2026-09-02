import { BOARD_SIZE, GameMode, GameState, TestResult } from './types'
import {
  createInitialState,
  createPositionKey,
  executeMove,
  getAllRekOpportunities,
  getMoveResults,
} from './engine'

interface LegalChoice {
  from: number
  to: number
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function collectLegal(state: GameState): LegalChoice[] {
  const choices: LegalChoice[] = []
  for (let from = 0; from < BOARD_SIZE * BOARD_SIZE; from++) {
    const piece = state.board[from]
    if (!piece || piece.player !== state.turn) continue
    for (const to of getMoveResults(state.board, from, state.mode).keys()) {
      choices.push({ from, to })
    }
  }
  return choices
}

function makeRng(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    return value >>> 0
  }
}

function assertIntegrity(state: GameState): void {
  const onBoard = state.board.filter((piece) => piece !== null)
  const captured = [...state.captured.you, ...state.captured.opp]
  const allPieces = [...onBoard, ...captured]
  const ids = allPieces.map((piece) => piece.id)

  expect(allPieces.length === 32, `Piece conservation failed: board + captured = ${allPieces.length}`)
  expect(new Set(ids).size === ids.length, 'Piece IDs must remain unique across board and captured trays')

  for (const piece of state.captured.you) {
    expect(piece.player === 'you', 'you captured tray may contain only lost you pieces')
  }
  for (const piece of state.captured.opp) {
    expect(piece.player === 'opp', 'opp captured tray may contain only lost opp pieces')
  }

  if (state.status === 'playing') {
    const expectedReks = getAllRekOpportunities(state.board, state.turn, state.mode).length
    expect(
      state.availableRekMovesCount === expectedReks,
      `availableRekMovesCount mismatch: ${state.availableRekMovesCount} vs ${expectedReks}`
    )
  } else {
    expect(state.availableRekMovesCount === 0, 'Terminal state must not expose future Rek opportunities')
  }

  const key = createPositionKey(state.board, state.turn, state.mode)
  expect((state.positionCounts?.[key] ?? 0) >= 1, 'Current position must be represented in repetition bookkeeping')
}

function stressMode(mode: GameMode, targetPlies: number, seed: number): string {
  const rng = makeRng(seed)
  let state = createInitialState(mode)
  let completed = 0
  let games = 1

  while (completed < targetPlies) {
    if (state.status !== 'playing') {
      state = createInitialState(mode)
      games++
    }

    assertIntegrity(state)
    const choices = collectLegal(state)
    expect(choices.length > 0, `Playing ${mode} state exposed zero rule-legal moves`)

    const choice = choices[rng() % choices.length]
    const beforeKey = createPositionKey(state.board, state.turn, state.mode)
    const beforeCells = [...state.board]
    const next = executeMove(state, choice.from, choice.to)

    expect(next !== state, 'Rule-legal move must produce a new state')
    expect(next.moveCount === state.moveCount + 1, 'Rule-legal simulation move must increment moveCount exactly once')
    expect(
      createPositionKey(state.board, state.turn, state.mode) === beforeKey,
      'executeMove mutated the prior board position'
    )
    for (let i = 0; i < beforeCells.length; i++) {
      expect(state.board[i] === beforeCells[i], `Prior board cell ${i} was mutated`)
    }

    assertIntegrity(next)
    state = next
    completed++
  }

  return `${mode}: ${completed} deterministic legal plies across ${games} game(s), all invariants preserved.`
}

export function runSimulationTests(): {
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
        details: 'Long-run simulation assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('SIM-01', 'REK_POAT survives deterministic long-run legal play', () =>
    stressMode('REK_POAT', 160, 0x52454b01))

  run('SIM-02', 'MIN_REK_CHANH survives deterministic compulsory-Rek play', () =>
    stressMode('MIN_REK_CHANH', 100, 0x52454b02))

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
