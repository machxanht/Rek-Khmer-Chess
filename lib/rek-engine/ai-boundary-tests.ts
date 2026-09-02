import {
  BOARD_SIZE,
  Cell,
  GameMode,
  PlayerColor,
  TestResult,
} from './types'
import {
  coordToIdx,
  getMoveResults,
} from './engine'
import {
  chooseAiMove,
  getAllLegalMoves,
  type AiDifficulty,
} from './ai'

function emptyBoard(): Cell[] {
  return Array(BOARD_SIZE * BOARD_SIZE).fill(null)
}

function put(
  board: Cell[],
  coord: string,
  player: PlayerColor,
  king = false,
  id = `${player}_${coord}`
): void {
  board[coordToIdx(coord)] = { player, king, id }
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function engineMoveKeys(board: Cell[], player: PlayerColor, mode: GameMode): Set<string> {
  const keys = new Set<string>()
  for (let from = 0; from < board.length; from++) {
    const piece = board[from]
    if (!piece || piece.player !== player) continue
    for (const to of getMoveResults(board, from, mode).keys()) {
      keys.add(`${from}-${to}`)
    }
  }
  return keys
}

function aiMoveKeys(board: Cell[], player: PlayerColor, mode: GameMode): Set<string> {
  return new Set(getAllLegalMoves(board, player, mode).map((move) => `${move.from}-${move.to}`))
}

export function runAiBoundaryTests(): {
  total: number
  passed: number
  failed: number
  results: TestResult[]
} {
  const results: TestResult[] = []

  const run = (id: string, title: string, fn: () => string) => {
    try {
      const details = fn()
      results.push({ id, title, passed: true, details })
    } catch (error) {
      results.push({
        id,
        title,
        passed: false,
        details: 'AI legality boundary assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('AI-BOUNDARY-01', 'AI legal set exactly matches engine in REK_POAT', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true)
    put(board, 'd8', 'opp', true)
    put(board, 'c1', 'you')
    put(board, 'h4', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')
    put(board, 'f3', 'opp')
    put(board, 'f5', 'opp')

    const expected = engineMoveKeys(board, 'you', 'REK_POAT')
    const actual = aiMoveKeys(board, 'you', 'REK_POAT')

    expect(actual.size === expected.size, 'AI and engine move counts must match in REK_POAT')
    for (const key of expected) expect(actual.has(key), `AI is missing engine-legal move ${key}`)
    for (const key of actual) expect(expected.has(key), `AI exposed non-engine move ${key}`)

    return 'AI move generation is a projection of engine move results in standard mode.'
  })

  run('AI-BOUNDARY-02', 'AI legal set exactly matches engine in MIN_REK_CHANH', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true)
    put(board, 'd8', 'opp', true)
    put(board, 'c1', 'you')
    put(board, 'h1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const expected = engineMoveKeys(board, 'you', 'MIN_REK_CHANH')
    const actual = aiMoveKeys(board, 'you', 'MIN_REK_CHANH')

    expect(actual.size === expected.size, 'AI and engine move counts must match in MIN_REK_CHANH')
    for (const key of expected) expect(actual.has(key), `AI is missing compulsory Rek move ${key}`)
    for (const key of actual) expect(expected.has(key), `AI exposed a forbidden non-Rek move ${key}`)
    expect(actual.has(`${coordToIdx('c1')}-${coordToIdx('c4')}`), 'Compulsory c1 -> c4 Rek must remain available')
    expect(!Array.from(actual).some((key) => key.startsWith(`${coordToIdx('h1')}-`)), 'Ordinary h1 moves must disappear while a Rek exists elsewhere')

    return 'AI inherits the engine-wide compulsory Rek rule without re-implementing it.'
  })

  run('AI-BOUNDARY-03', 'AI never moves the Palace King in MIN_REK_CHANH', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true)
    put(board, 'd8', 'opp', true)
    put(board, 'a2', 'you')

    const moves = getAllLegalMoves(board, 'you', 'MIN_REK_CHANH')
    expect(!moves.some((move) => move.from === coordToIdx('d1')), 'Stationary d1 King must never appear in AI legal moves')
    expect(moves.some((move) => move.from === coordToIdx('a2')), 'Other movable pieces should remain available')

    return 'Palace King immobility comes from engine legal results and is preserved by AI.'
  })

  run('AI-BOUNDARY-04', 'Every AI difficulty returns only an engine-legal move', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true)
    put(board, 'd8', 'opp', true)
    put(board, 'c8', 'opp')
    put(board, 'b5', 'you')
    put(board, 'd5', 'you')

    const legal = engineMoveKeys(board, 'opp', 'REK_POAT')
    expect(legal.size > 0, 'Fixture must expose at least one legal opponent move')

    for (const difficulty of ['easy', 'medium', 'hard'] as AiDifficulty[]) {
      const move = chooseAiMove(board, 'opp', 'REK_POAT', difficulty)
      expect(move !== null, `${difficulty} AI must return a move when legal moves exist`)
      expect(legal.has(`${move.from}-${move.to}`), `${difficulty} AI returned a move outside the engine legal set`)
    }

    return 'Easy, medium, and hard selection layers are all bounded by the engine move set.'
  })

  run('AI-BOUNDARY-05', 'AI returns null when the engine exposes zero legal moves', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true)
    put(board, 'd8', 'opp', true)

    const moves = getAllLegalMoves(board, 'opp', 'MIN_REK_CHANH')
    expect(moves.length === 0, 'A side with only its stationary Palace King has zero legal moves')

    for (const difficulty of ['easy', 'medium', 'hard'] as AiDifficulty[]) {
      expect(chooseAiMove(board, 'opp', 'MIN_REK_CHANH', difficulty) === null, `${difficulty} AI must return null at zero legal moves`)
    }

    return 'AI does not synthesize fallback moves when the engine reports immobilization.'
  })

  run('AI-BOUNDARY-06', 'AI capture metadata comes from engine MoveResult captures', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true)
    put(board, 'd8', 'opp', true)
    put(board, 'a6', 'you')
    put(board, 'b8', 'you')
    put(board, 'a8', 'opp')

    const targetFrom = coordToIdx('a6')
    const targetTo = coordToIdx('a7')
    const engineResult = getMoveResults(board, targetFrom, 'REK_POAT').get(targetTo)
    expect(engineResult?.poat === true, 'Fixture must be a Poat capture in the engine')

    const aiMove = getAllLegalMoves(board, 'you', 'REK_POAT').find(
      (move) => move.from === targetFrom && move.to === targetTo
    )
    expect(aiMove !== undefined, 'AI legal list must include the engine Poat move')
    expect(aiMove.capturesCount === engineResult.captures.length, 'AI capture count must exactly mirror MoveResult.captures')

    return 'AI tactical metadata is derived from the engine result rather than separate capture logic.'
  })

  const passed = results.filter((result) => result.passed).length
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  }
}
