import {
  BOARD_SIZE,
  Cell,
  GameState,
  HaoRekContext,
  PlayerColor,
  RuleSet,
  TestResult,
} from './types'
import {
  coordToIdx,
  executeMove,
  getStateMoveResults,
} from './engine'

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

function makeState(
  board: Cell[],
  turn: PlayerColor = 'you',
  mode: RuleSet = 'MIN_REK_CHANH',
  haoRekContext: HaoRekContext | null = null
): GameState {
  return {
    board,
    turn,
    status: 'playing',
    winner: null,
    winReason: null,
    mode,
    lastMove: null,
    lastCaptured: [],
    lastRek: false,
    lastPoat: false,
    captured: { you: [], opp: [] },
    moveCount: 0,
    availableRekMovesCount: 0,
    haoRekContext,
  }
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function moveKey(from: string, to: string): string {
  return `${coordToIdx(from)}-${coordToIdx(to)}`
}

function contextKeys(context: HaoRekContext | null | undefined): Set<string> {
  return new Set((context?.allowedResponses ?? []).map((move) => `${move.from}-${move.to}`))
}

export function runHaoRekTests(): {
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
        details: 'Hao Rek transition assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('HAO-01', 'A pre-existing Rek does not create a board-global obligation by itself', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true)
    put(board, 'h7', 'opp', true)
    put(board, 'c1', 'you')
    put(board, 'h1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const state = makeState(board)
    const next = executeMove(state, coordToIdx('h1'), coordToIdx('h2'))

    expect(next !== state, 'Quiet move must execute when no active Hao context exists')
    expect(next.status === 'playing', 'Pre-existing Rek alone must not cause a forfeit')
    expect(next.board[coordToIdx('h2')]?.player === 'you', 'Quiet piece must actually move')
    return 'MIN_REK_CHANH no longer derives obligation from any Rek already present on the current board.'
  })

  run('HAO-02', 'Blocker-leaves transition creates exactly the newly opened response', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true)
    put(board, 'h7', 'opp', true)
    put(board, 'd3', 'you')
    put(board, 'd4', 'you')
    put(board, 'd5', 'you')
    put(board, 'h4', 'opp')
    put(board, 'g6', 'opp')

    const next = executeMove(makeState(board), coordToIdx('d4'), coordToIdx('c4'))
    const keys = contextKeys(next.haoRekContext)

    expect(next.turn === 'opp' && next.status === 'playing', 'Opening move must hand turn to opponent')
    expect(next.haoRekContext?.active === true, 'Opening move must activate Hao context')
    expect(keys.size === 1, `Expected one newly-created response, got ${keys.size}`)
    expect(keys.has(moveKey('h4', 'd4')), 'h4→d4 must be the newly opened Hao response')
    expect(
      getStateMoveResults(next, coordToIdx('h4')).has(coordToIdx('d4')),
      'State-aware legality must expose the called response'
    )
    return 'A vacated middle square is recognized from BEFORE/AFTER transition, not from a global current-board scan.'
  })

  run('HAO-03', 'Pre-existing Rek stays distinct from the newly-called response', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true)
    put(board, 'h7', 'opp', true)
    put(board, 'd3', 'you')
    put(board, 'd4', 'you')
    put(board, 'd5', 'you')
    put(board, 'b7', 'you')
    put(board, 'd7', 'you')
    put(board, 'h4', 'opp')
    put(board, 'c8', 'opp')
    put(board, 'g6', 'opp')

    const opened = executeMove(makeState(board), coordToIdx('d4'), coordToIdx('c4'))
    const keys = contextKeys(opened.haoRekContext)

    expect(keys.has(moveKey('h4', 'd4')), 'New h4→d4 response must be called')
    expect(!keys.has(moveKey('c8', 'c7')), 'Pre-existing c8→c7 Rek must not become part of the new call')
    expect(
      getStateMoveResults(opened, coordToIdx('c8')).size === 0,
      'Old Rek must be suppressed while the newly-created Hao response is active'
    )

    const forfeited = executeMove(opened, coordToIdx('c8'), coordToIdx('c7'))
    expect(forfeited.status === 'won' && forfeited.winner === 'you', 'Answering an old Rek must forfeit the active call')
    expect(forfeited.board[coordToIdx('c8')]?.player === 'opp', 'Forfeiting move must not alter the board')
    return 'The engine distinguishes pre-existing Rek from the response created by the immediately previous move.'
  })

  run('HAO-04', 'A Hao response can create a counter-Hao and the chain ends when no new response remains', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true)
    put(board, 'h7', 'opp', true)
    put(board, 'd3', 'you')
    put(board, 'd4', 'you')
    put(board, 'd5', 'you')
    put(board, 'a5', 'you')
    put(board, 'h4', 'opp')
    put(board, 'd6', 'opp')
    put(board, 'g6', 'opp')

    const opened = executeMove(makeState(board), coordToIdx('d4'), coordToIdx('c4'))
    const response = executeMove(opened, coordToIdx('h4'), coordToIdx('d4'))

    expect(response.lastRek === true, 'First Hao response must execute a Rek')
    expect(response.turn === 'you' && response.haoRekContext?.active === true, 'Response must create counter-Hao')
    expect(
      contextKeys(response.haoRekContext).has(moveKey('a5', 'd5')),
      'Counter-Hao must expose a5→d5'
    )

    const counter = executeMove(response, coordToIdx('a5'), coordToIdx('d5'))
    expect(counter.lastRek === true, 'Counter-response must execute a Rek')
    expect(counter.status === 'playing', 'Fixture must remain nonterminal')
    expect(!counter.haoRekContext?.active, 'Chain must stop when the counter-response creates no new Hao')
    return 'Hao context is re-derived after every response, allowing deterministic call chains.'
  })

  run('HAO-05', 'Technical policy exposes all newly-created responses when one move creates multiple targets', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true)
    put(board, 'h7', 'opp', true)
    put(board, 'b4', 'you')
    put(board, 'f4', 'you')
    put(board, 'd7', 'you')
    put(board, 'c1', 'opp')
    put(board, 'e1', 'opp')
    put(board, 'g6', 'opp')

    const opened = executeMove(makeState(board), coordToIdx('d7'), coordToIdx('d4'))
    const keys = contextKeys(opened.haoRekContext)

    expect(keys.size === 2, `Technical policy fixture must create two NEW responses, got ${keys.size}`)
    expect(keys.has(moveKey('c1', 'c4')), 'First newly-created response c1→c4 must be allowed')
    expect(keys.has(moveKey('e1', 'e4')), 'Second newly-created response e1→e4 must be allowed')
    expect(getStateMoveResults(opened, coordToIdx('c1')).has(coordToIdx('c4')), 'Responder may choose first new target')
    expect(getStateMoveResults(opened, coordToIdx('e1')).has(coordToIdx('e4')), 'Responder may choose second new target')

    const chosen = executeMove(opened, coordToIdx('e1'), coordToIdx('e4'))
    expect(chosen.status === 'playing' || chosen.status === 'won', 'Choosing either NEW response must not be a Hao forfeit')
    expect(chosen.winReason !== 'Min Rek Chanh violation: active Hao Rek response was ignored', 'Chosen NEW response must be accepted')
    return 'Multiple-target choice is an explicit technical policy: responder may choose any newly-created response.'
  })

  return {
    total: results.length,
    passed: results.filter((result) => result.passed).length,
    failed: results.filter((result) => !result.passed).length,
    results,
  }
}
