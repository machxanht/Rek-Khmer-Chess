import {
  BOARD_SIZE,
  Cell,
  GameMode,
  GameState,
  PlayerColor,
  TestResult,
} from './types'
import { coordToIdx, createPositionKey, getAllRekOpportunities } from './engine'
import {
  REK_GAME_SNAPSHOT_VERSION,
  RekGame,
  createGame,
  deserializeGame,
  deserializeGameState,
  serializeGameState,
} from './session'

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

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

function expectThrows(fn: () => unknown, label: string): void {
  let threw = false
  try {
    fn()
  } catch {
    threw = true
  }
  expect(threw, `${label} must throw`)
}

export function runPublicApiTests(): {
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
        details: 'Public session API assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('API-01', 'createGame exposes a rule-legal initial session without UI dependencies', () => {
    const game = createGame('REK_POAT')
    const state = game.getState()
    const moves = new Set(game.getLegalMoves(coordToIdx('a2')))

    expect(state.mode === 'REK_POAT', 'createGame must preserve requested mode')
    expect(state.turn === 'you' && state.status === 'playing', 'New session must start with White/you to move')
    for (const coord of ['a3', 'a4', 'a5', 'a6']) {
      expect(moves.has(coordToIdx(coord)), `Initial public API must expose ${coord}`)
    }
    expect(moves.size === 4, 'a2 must have exactly four public rule-legal moves initially')

    return 'New callers can create a game and query legal moves through one stable facade.'
  })

  run('API-02', 'makeMove and undo update session state atomically', () => {
    const game = new RekGame('REK_POAT')
    const before = game.getState()
    const from = coordToIdx('a2')
    const to = coordToIdx('a3')

    expect(game.makeMove(from, to), 'Legal a2 -> a3 must execute')
    expect(game.canUndo(), 'Successful move must create undo history')
    const after = game.getState()
    expect(after.board[from] === null, 'Source must be empty after move')
    expect(after.board[to]?.player === 'you', 'Destination must contain mover after move')
    expect(after.turn === 'opp' && after.moveCount === 1, 'Move must switch turn and increment count')

    expect(game.undo(), 'Undo must succeed after one move')
    expect(!game.canUndo(), 'Undo history must be empty after reverting the only move')
    const restored = game.getState()
    expect(
      createPositionKey(restored.board, restored.turn, restored.mode) ===
        createPositionKey(before.board, before.turn, before.mode),
      'Undo must restore the exact prior board/turn/mode position'
    )
    expect(restored.moveCount === before.moveCount, 'Undo must restore move count')

    return 'Session history is isolated from the pure engine and restores complete prior states.'
  })

  run('API-03', 'getState returns a defensive copy that callers cannot mutate behind the engine', () => {
    const game = createGame()
    const external = game.getState()
    const a2 = coordToIdx('a2')
    const originalId = external.board[a2]?.id
    expect(typeof originalId === 'string', 'Fixture must contain a2 piece')

    external.board[a2] = null
    external.lastCaptured.push(coordToIdx('h8'))
    external.captured.you.push({ player: 'you', king: false, id: 'external_fake' })
    if (external.positionCounts) external.positionCounts.external = 999

    const internalAgain = game.getState()
    expect(internalAgain.board[a2]?.id === originalId, 'External board mutation must not reach session state')
    expect(internalAgain.lastCaptured.length === 0, 'External metadata mutation must not reach session state')
    expect(internalAgain.captured.you.length === 0, 'External captured-tray mutation must not reach session state')
    expect(internalAgain.positionCounts?.external === undefined, 'External repetition mutation must not reach session state')

    return 'Consumers receive a deep-enough snapshot instead of mutable engine-owned arrays/objects.'
  })

  run('API-04', 'serialize and deserialize round-trip a live game state with versioned snapshots', () => {
    const game = createGame('REK_POAT')
    expect(game.makeMove(coordToIdx('a2'), coordToIdx('a3')), 'First fixture move must execute')
    expect(game.makeMove(coordToIdx('a7'), coordToIdx('a6')), 'Second fixture move must execute')

    const serialized = game.serialize()
    const envelope = JSON.parse(serialized) as { version?: unknown }
    expect(envelope.version === REK_GAME_SNAPSHOT_VERSION, 'Snapshot must carry the current schema version')

    const loaded = deserializeGame(serialized)
    expect(
      JSON.stringify(loaded.getState()) === JSON.stringify(game.getState()),
      'Loaded state must round-trip exactly'
    )
    expect(!loaded.canUndo(), 'Persistence stores game state, not process-local undo history')

    return 'Save/load preserves board, turn, captures, counters, and draw bookkeeping in schema v1.'
  })

  run('API-05', 'snapshot loader rejects malformed, unsupported, or structurally unsafe state', () => {
    expectThrows(() => deserializeGameState('{not-json'), 'Malformed JSON')
    expectThrows(
      () => deserializeGameState(JSON.stringify({ version: 999, state: {} })),
      'Unsupported snapshot version'
    )

    const valid = JSON.parse(serializeGameState(createGame().getState())) as {
      version: number
      state: GameState
    }
    valid.state.board = valid.state.board.slice(0, 63)
    expectThrows(() => deserializeGameState(JSON.stringify(valid)), '63-cell board')

    const duplicate = JSON.parse(serializeGameState(createGame().getState())) as {
      version: number
      state: GameState
    }
    const firstPiece = duplicate.state.board.find((piece) => piece !== null)
    const secondPiece = duplicate.state.board.find(
      (piece) => piece !== null && piece.id !== firstPiece?.id
    )
    expect(firstPiece !== null && firstPiece !== undefined, 'Fixture needs first piece')
    expect(secondPiece !== null && secondPiece !== undefined, 'Fixture needs second piece')
    secondPiece.id = firstPiece.id
    expectThrows(() => deserializeGameState(JSON.stringify(duplicate)), 'Duplicate piece IDs')

    return 'Persistence boundary rejects corrupt JSON, schema mismatch, malformed board size, and duplicate identities.'
  })

  run('API-06', 'public legal moves honor Min Rek Chanh while submitted violations are adjudicated by core engine', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'd8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you', false, 'you_rek')
    put(board, 'h1', 'you', false, 'you_quiet')
    put(board, 'b4', 'opp', false, 'opp_b4')
    put(board, 'd4', 'opp', false, 'opp_d4')

    const game = new RekGame(makeState(board, 'you', 'MIN_REK_CHANH'))
    expect(game.getLegalMoves(coordToIdx('h1')).length === 0, 'Quiet piece must expose no legal moves under compulsory Rek')
    expect(
      game.getLegalMoves(coordToIdx('c1')).includes(coordToIdx('c4')),
      'Actual Rek move must remain exposed'
    )

    expect(game.makeMove(coordToIdx('h1'), coordToIdx('h2')), 'Submitted Hao Rek violation must be adjudicated as a state change')
    const terminal = game.getState()
    expect(terminal.status === 'won' && terminal.winner === 'opp', 'Core engine must award the violation to opponent')
    expect(terminal.board[coordToIdx('h1')]?.id === 'you_quiet', 'Illegal quiet move must not alter board')

    return 'UI/server can display only legal moves while the engine still adjudicates illegal submitted moves safely.'
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
