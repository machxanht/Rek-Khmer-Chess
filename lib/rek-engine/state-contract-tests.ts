import {
  BOARD_SIZE,
  Cell,
  GameMode,
  GameState,
  PlayerColor,
  TestResult,
} from './types'
import {
  coordToIdx,
  createInitialState,
  executeMove,
  getAllRekOpportunities,
  idxToCoord,
} from './engine'
import {
  RekGame,
  deserializeGameState,
  serializeGameState,
} from './session'

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
  mode: GameMode = 'REK_POAT'
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
    availableRekMovesCount: getAllRekOpportunities(board, turn, mode).length,
  }
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function expectThrows(fn: () => unknown, label: string): void {
  let threw = false
  try {
    fn()
  } catch {
    threw = true
  }
  expect(threw, `${label} must throw`)
}

export function runStateContractTests(): {
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
        details: 'GameState transition contract assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('STATE-01', 'A normal move updates turn, move count, and last-move metadata atomically', () => {
    const state = createInitialState('REK_POAT')
    const from = coordToIdx('a3')
    const to = coordToIdx('a4')
    const next = executeMove(state, from, to)

    expect(next !== state, 'A legal move must produce a new state object')
    expect(next.turn === 'opp', 'Turn must pass to the opponent after a continuing move')
    expect(next.moveCount === state.moveCount + 1, 'Move count must increment exactly once')
    expect(next.lastMove?.from === from && next.lastMove?.to === to, 'lastMove must record the executed move')
    expect(next.lastCaptured.length === 0, 'A quiet move must record no captures')
    expect(next.lastRek === false && next.lastPoat === false, 'A quiet move must clear tactical flags')

    return 'Continuing state transitions update all basic move metadata together.'
  })

  run('STATE-02', 'Rek metadata and captured tray mirror the same capture result', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'd8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you', false, 'you_attacker')
    put(board, 'b4', 'opp', false, 'opp_b4')
    put(board, 'd4', 'opp', false, 'opp_d4')

    const from = coordToIdx('c1')
    const to = coordToIdx('c4')
    const next = executeMove(makeState(board), from, to)
    const expectedCaptured = new Set([coordToIdx('b4'), coordToIdx('d4')])

    expect(next.lastRek === true, 'Rek move must set lastRek')
    expect(next.lastPoat === false, 'Pure Rek fixture must not set lastPoat')
    expect(next.lastCaptured.length === 2, 'Rek fixture must record exactly two captured coordinates')
    for (const square of next.lastCaptured) {
      expect(expectedCaptured.has(square), `Unexpected captured coordinate ${square}`)
    }
    expect(next.captured.opp.length === 2, 'Opponent captured tray must receive both lost pieces')
    expect(next.captured.you.length === 0, 'Mover captured tray must remain unchanged')
    expect(next.captured.opp.every((piece) => piece.player === 'opp'), 'Captured tray must preserve captured piece ownership')

    return 'lastCaptured, lastRek, board removal, and captured tray stay synchronized for Rek.'
  })

  run('STATE-03', 'Poat metadata and captured tray mirror the same capture result', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'h8', 'opp', true, 'opp_king')
    put(board, 'a6', 'you', false, 'you_a6')
    put(board, 'b8', 'you', false, 'you_b8')
    put(board, 'a8', 'opp', false, 'opp_a8')

    const from = coordToIdx('a6')
    const to = coordToIdx('a7')
    const next = executeMove(makeState(board), from, to)

    expect(next.lastPoat === true, 'Poat move must set lastPoat')
    expect(next.lastRek === false, 'Pure Poat fixture must not set lastRek')
    expect(next.lastCaptured.length === 1 && next.lastCaptured[0] === coordToIdx('a8'), 'Poat fixture must record a8 as the captured coordinate')
    expect(next.captured.opp.length === 1 && next.captured.opp[0].id === 'opp_a8', 'Captured tray must contain the exact Poat-captured piece')

    return 'lastCaptured, lastPoat, and captured tray stay synchronized for Poat.'
  })

  run('STATE-04', 'availableRekMovesCount always describes the side whose turn is stored', () => {
    const state = createInitialState('REK_POAT')
    expect(
      state.availableRekMovesCount === getAllRekOpportunities(state.board, state.turn, state.mode).length,
      'Initial availableRekMovesCount must match current-turn engine discovery'
    )

    const next = executeMove(state, coordToIdx('a3'), coordToIdx('a4'))
    expect(next.status === 'playing', 'Fixture must remain a continuing game')
    expect(
      next.availableRekMovesCount === getAllRekOpportunities(next.board, next.turn, next.mode).length,
      'Post-move availableRekMovesCount must match the next player engine discovery'
    )

    return 'The cached Rek count is derived from the same board/turn/mode exposed by GameState.'
  })

  run('STATE-05', 'executeMove never mutates the input board or captured arrays', () => {
    const state = createInitialState('REK_POAT')
    const boardBefore = [...state.board]
    const youCapturedBefore = [...state.captured.you]
    const oppCapturedBefore = [...state.captured.opp]

    const next = executeMove(state, coordToIdx('a3'), coordToIdx('a4'))

    expect(next !== state, 'Fixture must execute a legal move')
    expect(state.board.length === boardBefore.length, 'Input board length must remain unchanged')
    for (let i = 0; i < boardBefore.length; i++) {
      expect(state.board[i] === boardBefore[i], `Input board cell ${i} was mutated`)
    }
    expect(state.captured.you.length === youCapturedBefore.length, 'Input you-captured tray was mutated')
    expect(state.captured.opp.length === oppCapturedBefore.length, 'Input opp-captured tray was mutated')
    expect(next.board !== state.board, 'Next state must own a new board array')
    expect(next.captured.you !== state.captured.you, 'Next state must own a new you-captured array')
    expect(next.captured.opp !== state.captured.opp, 'Next state must own a new opp-captured array')

    return 'State transitions remain immutable for React history/undo consumers.'
  })

  run('STATE-06', 'A rejected geometric move is a true no-op including metadata', () => {
    const state = createInitialState('REK_POAT')
    const next = executeMove(state, coordToIdx('b1'), coordToIdx('b4'))

    expect(next === state, 'Blocked b1 -> b4 attempt must return the exact same state object')
    expect(state.moveCount === 0, 'Rejected move must not increment move count')
    expect(state.lastMove === null, 'Rejected move must not create lastMove metadata')
    expect(state.lastCaptured.length === 0, 'Rejected move must not create capture metadata')

    return 'Invalid geometry cannot leak partial state updates into UI/history.'
  })

  run('STATE-07', 'Min Rek Chanh forfeit ends the game without pretending the ignored move happened', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'd8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you', false, 'you_rek')
    put(board, 'h1', 'you', false, 'you_quiet')
    put(board, 'b4', 'opp', false, 'opp_b4')
    put(board, 'd4', 'opp', false, 'opp_d4')

    const state = makeState(board, 'you', 'MIN_REK_CHANH')
    state.haoRekContext = {
      active: true,
      createdByMove: { from: coordToIdx('b3'), to: coordToIdx('b4') },
      allowedResponses: [{ from: coordToIdx('c1'), to: coordToIdx('c4') }],
    }
    const next = executeMove(state, coordToIdx('h1'), coordToIdx('h2'))

    expect(next !== state, 'Forfeit must produce a terminal state')
    expect(next.status === 'won' && next.winner === 'opp', 'Violating side must lose immediately')
    expect(next.moveCount === state.moveCount, 'Ignored illegal move must not increment move count')
    expect(next.lastMove === state.lastMove, 'Ignored illegal move must not overwrite lastMove')
    expect(next.lastCaptured === state.lastCaptured, 'Ignored illegal move must not invent capture metadata')
    expect(next.turn === state.turn, 'Forfeit adjudication must not pretend a legal turn switch occurred')
    expect(next.availableRekMovesCount === state.availableRekMovesCount, 'Forfeit must preserve pre-existing Rek metadata')
    expect(next.haoRekContext === state.haoRekContext, 'Forfeit must preserve the active Hao context')

    return 'Forfeit changes only terminal adjudication fields; the illegal move never becomes history.'
  })

  run('STATE-08', 'Terminal capture zeroes cached future Rek opportunities', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'a4', 'you', false, 'you_attacker')
    put(board, 'c3', 'opp', false, 'opp_c3')
    put(board, 'c5', 'opp', true, 'opp_king')

    const next = executeMove(makeState(board), coordToIdx('a4'), coordToIdx('c4'))

    expect(next.status === 'won' && next.winner === 'you', 'Fixture must end by Rek capture of the opponent King')
    expect(next.availableRekMovesCount === 0, 'Terminal state must expose zero future Rek opportunities')

    return 'No cached next-turn tactical opportunities survive a terminal result.'
  })

  run('STATE-09', 'coordToIdx accepts only canonical lowercase a1-h8 coordinates', () => {
    for (const coord of ['a1', 'h8', 'd4', 'a8', 'h1']) {
      const index = coordToIdx(coord)
      expect(index >= 0 && index < BOARD_SIZE * BOARD_SIZE, `${coord} must map inside the board`)
      expect(idxToCoord(index) === coord, `${coord} must round-trip through idxToCoord`)
    }

    for (const coord of ['', 'a0', 'a9', 'i1', 'A1', 'a10', '11', 'a', 'h8x']) {
      expectThrows(() => coordToIdx(coord), `Invalid coordinate ${JSON.stringify(coord)}`)
    }

    return 'Exported coordinate parsing now fails explicitly instead of returning NaN/out-of-range indexes.'
  })

  run('STATE-10', 'Persisted snapshots enforce semantic invariants without banning custom in-memory fixtures', () => {
    const canonical = JSON.parse(serializeGameState(createInitialState('REK_STANDARD'))) as {
      version: number
      state: GameState
    }

    const missingKing = JSON.parse(JSON.stringify(canonical)) as typeof canonical
    missingKing.state.board[coordToIdx('h7')] = null
    expectThrows(
      () => deserializeGameState(JSON.stringify(missingKing)),
      'Playing snapshot without both Kings'
    )

    const staleReason = JSON.parse(JSON.stringify(canonical)) as typeof canonical
    staleReason.state.winReason = 'stale terminal reason'
    expectThrows(
      () => deserializeGameState(JSON.stringify(staleReason)),
      'Playing snapshot with a winReason'
    )

    const staleRepetition = JSON.parse(JSON.stringify(canonical)) as typeof canonical
    staleRepetition.state.positionCounts = { bogus: 1 }
    expectThrows(
      () => deserializeGameState(JSON.stringify(staleRepetition)),
      'Snapshot missing its current repetition key'
    )

    const staleLoneKingClock = JSON.parse(JSON.stringify(canonical)) as typeof canonical
    staleLoneKingClock.state.loneKingMoveCount = 2
    expectThrows(
      () => deserializeGameState(JSON.stringify(staleLoneKingClock)),
      'Snapshot with lone-King clock but no lone King'
    )

    const invalidHao = JSON.parse(JSON.stringify(canonical)) as typeof canonical
    invalidHao.state.mode = 'MIN_REK_CHANH'
    invalidHao.state.positionCounts = undefined
    invalidHao.state.haoRekContext = {
      active: true,
      createdByMove: { from: coordToIdx('a6'), to: coordToIdx('a5') },
      allowedResponses: [{ from: coordToIdx('a3'), to: coordToIdx('a4') }],
    }
    expectThrows(
      () => deserializeGameState(JSON.stringify(invalidHao)),
      'Active Hao response that is not a Rek'
    )

    const customBoard = emptyBoard()
    put(customBoard, 'a2', 'you', true, 'custom_king')
    const customState = makeState(customBoard, 'you', 'REK_STANDARD')
    const customGame = new RekGame(customState)
    expect(customGame.getState().status === 'playing', 'Custom in-memory fixture must remain constructible')
    expectThrows(() => customGame.serialize(), 'Persisting custom playing fixture without both Kings')

    return 'Persistence is strict about rule-relevant state while custom/debug GameState construction remains available in memory.'
  })

  const passed = results.filter((result) => result.passed).length
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  }
}
