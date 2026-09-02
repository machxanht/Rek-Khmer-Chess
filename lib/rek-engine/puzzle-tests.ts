import { BOARD_SIZE, Cell, GameState, TestResult } from './types'
import {
  coordToIdx,
  createPositionKey,
  executeMove,
  getMoveResults,
} from './engine'
import { KHMER_PUZZLES } from './puzzles'

function stateFor(board: Cell[]): GameState {
  return {
    board,
    turn: 'you',
    status: 'playing',
    winner: null,
    winReason: null,
    mode: 'REK_POAT',
    lastMove: null,
    lastCaptured: [],
    lastRek: false,
    lastPoat: false,
    captured: { you: [], opp: [] },
    moveCount: 0,
    availableRekMovesCount: 0,
    positionCounts: { [createPositionKey(board, 'you', 'REK_POAT')]: 1 },
    loneKingMoveCount: 0,
    drawMoveLimit: 32,
  }
}

function setupPuzzle(index: number): { board: Cell[]; from: number; to: number } {
  const puzzle = KHMER_PUZZLES[index]
  const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
  puzzle.setup(board)
  return {
    board,
    from: coordToIdx(puzzle.solution.fromCoord),
    to: coordToIdx(puzzle.solution.toCoord),
  }
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export function runPuzzleTests(): {
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
        details: 'Puzzle integration assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('PZ-01', 'Every published puzzle solution is an engine-legal move', () => {
    expect(KHMER_PUZZLES.length === 7, 'Expected seven published puzzles')
    for (let i = 0; i < KHMER_PUZZLES.length; i++) {
      const { board, from, to } = setupPuzzle(i)
      const result = getMoveResults(board, from, 'REK_POAT').get(to)
      expect(result, `Level ${KHMER_PUZZLES[i].id} solution is not legal`)
    }
    return 'All hints/solutions respect rook-like path blocking and engine capture geometry.'
  })

  run('PZ-02', 'Level 3 performs the intended two-piece horizontal Rek', () => {
    const { board, from, to } = setupPuzzle(2)
    const next = executeMove(stateFor(board), from, to)
    const expected = new Set([coordToIdx('b4'), coordToIdx('d4')])
    expect(next.lastRek, 'Level 3 must be a Rek')
    expect(next.lastCaptured.length === 2, 'Level 3 must capture exactly two pieces')
    for (const square of next.lastCaptured) {
      expect(expected.has(square), `Unexpected Level 3 capture square ${square}`)
    }
    return 'Central Rek fixture matches the adjacent horizontal algorithm.'
  })

  run('PZ-03', 'Level 4 legally Rek-captures the adjacent King', () => {
    const { board, from, to } = setupPuzzle(3)
    const next = executeMove(stateFor(board), from, to)
    expect(next.lastRek, 'Level 4 must resolve as Rek')
    expect(next.lastCaptured.includes(coordToIdx('d3')), 'King on d3 must be captured')
    expect(next.lastCaptured.includes(coordToIdx('d5')), 'Man on d5 must be captured')
    expect(next.status === 'won' && next.winner === 'you', 'Level 4 must end in a win')
    return 'The old non-adjacent d2/d6 example is no longer published as executable gameplay.'
  })

  run('PZ-04', 'Level 5 performs corner Poat', () => {
    const { board, from, to } = setupPuzzle(4)
    const next = executeMove(stateFor(board), from, to)
    expect(next.lastPoat, 'Level 5 must trigger Poat')
    expect(next.lastCaptured.includes(coordToIdx('a8')), 'Corner piece a8 must be captured')
    return 'Corner edge acts as a wall and the final liberty is closed by a7.'
  })

  run('PZ-05', 'Level 6 removes the entire connected Poat group', () => {
    const { board, from, to } = setupPuzzle(5)
    const next = executeMove(stateFor(board), from, to)
    const expected = new Set([coordToIdx('a8'), coordToIdx('a7'), coordToIdx('b8')])
    expect(next.lastPoat, 'Level 6 must trigger Poat')
    expect(next.lastCaptured.length === 3, 'Level 6 must capture all three group members')
    for (const square of next.lastCaptured) {
      expect(expected.has(square), `Unexpected Level 6 capture square ${square}`)
    }
    return 'Connected-component liberties remove the whole trapped phalanx together.'
  })

  run('PZ-06', 'Level 7 demonstrates legal Rek-first then Poat King capture', () => {
    const { board, from, to } = setupPuzzle(6)
    const next = executeMove(stateFor(board), from, to)
    expect(next.lastRek, 'Level 7 must include Rek')
    expect(next.lastPoat, 'Level 7 must include Poat')
    expect(next.lastCaptured.includes(coordToIdx('b4')), 'Rek victim b4 must be captured')
    expect(next.lastCaptured.includes(coordToIdx('d4')), 'Rek victim d4 must be captured')
    expect(next.lastCaptured.includes(coordToIdx('c5')), 'Poat must capture the King on c5')
    expect(next.status === 'won' && next.winner === 'you', 'Level 7 must be a Royal win')
    return 'Master puzzle now proves the documented Rek → Poat execution pipeline without illegal jumping.'
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
