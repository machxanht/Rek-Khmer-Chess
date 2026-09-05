import {
  BOARD_SIZE,
  Cell,
  GameMode,
  GameState,
  PlayerColor,
  TestResult,
} from './types'
import {
  REK_GAME,
  RULE_SET_CATALOG,
  getRuleSetMetadata,
  listRuleSets,
} from './catalog'
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
  mode: GameMode = 'REK_STANDARD'
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

  run('API-01', 'createGame exposes REK_STANDARD as the canonical default rule set', () => {
    const game = createGame()
    const state = game.getState()
    const moves = new Set(game.getLegalMoves(coordToIdx('a3')))

    expect(state.mode === 'REK_STANDARD', 'Default public session must expose REK_STANDARD')
    expect(state.turn === 'you' && state.status === 'playing', 'New session must start with White/you to move')
    for (const coord of ['a4', 'a5']) {
      expect(moves.has(coordToIdx(coord)), `Initial public API must expose ${coord}`)
    }
    expect(moves.size === 2, 'a3 must have exactly two public rule-legal moves initially')
    expect(state.board[coordToIdx('a2')]?.king === true, 'Public initial state must expose White King on a2')
    expect(state.board[coordToIdx('h7')]?.king === true, 'Public initial state must expose Black King on h7')

    return 'New callers see the canonical setup under the canonical REK_STANDARD ruleset.'
  })

  run('API-02', 'makeMove and undo update session state atomically', () => {
    const game = new RekGame('REK_STANDARD')
    const before = game.getState()
    const from = coordToIdx('a3')
    const to = coordToIdx('a4')

    expect(game.makeMove(from, to), 'Legal a3 -> a4 must execute')
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
      'Undo must restore the exact prior board/turn/ruleset position'
    )
    expect(restored.moveCount === before.moveCount, 'Undo must restore move count')

    return 'Session history is isolated from the pure engine and restores complete prior states.'
  })

  run('API-03', 'getState returns a defensive copy that callers cannot mutate behind the engine', () => {
    const game = createGame()
    const external = game.getState()
    const a2 = coordToIdx('a2')
    const originalId = external.board[a2]?.id
    expect(typeof originalId === 'string', 'Fixture must contain the a2 King')

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

  run('API-04', 'serialize and deserialize round-trip a live canonical rule-set state', () => {
    const game = createGame('REK_STANDARD')
    expect(game.makeMove(coordToIdx('a3'), coordToIdx('a4')), 'First fixture move must execute')
    expect(game.makeMove(coordToIdx('a6'), coordToIdx('a5')), 'Second fixture move must execute')

    const serialized = game.serialize()
    const envelope = JSON.parse(serialized) as { version?: unknown; state?: { mode?: unknown } }
    expect(envelope.version === REK_GAME_SNAPSHOT_VERSION, 'Snapshot must carry the current schema version')
    expect(envelope.state?.mode === 'REK_STANDARD', 'New snapshots must emit canonical REK_STANDARD')

    const loaded = deserializeGame(serialized)
    expect(
      JSON.stringify(loaded.getState()) === JSON.stringify(game.getState()),
      'Loaded state must round-trip exactly'
    )
    expect(!loaded.canUndo(), 'Persistence stores game state, not process-local undo history')

    return 'Save/load preserves canonical ruleset, board, turn, captures, counters, and draw bookkeeping.'
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

  run('API-06', 'public legal moves honor current Min Rek Chanh engine contract', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'd8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you', false, 'you_rek')
    put(board, 'h1', 'you', false, 'you_quiet')
    put(board, 'b4', 'opp', false, 'opp_b4')
    put(board, 'd4', 'opp', false, 'opp_d4')

    const game = new RekGame(makeState(board, 'you', 'MIN_REK_CHANH'))
    expect(game.getLegalMoves(coordToIdx('h1')).length === 0, 'Quiet piece must expose no legal moves under current compulsory-Rek contract')
    expect(
      game.getLegalMoves(coordToIdx('c1')).includes(coordToIdx('c4')),
      'Actual Rek move must remain exposed'
    )

    expect(game.makeMove(coordToIdx('h1'), coordToIdx('h2')), 'Submitted Hao Rek violation must be adjudicated as a state change')
    const terminal = game.getState()
    expect(terminal.status === 'won' && terminal.winner === 'opp', 'Core engine must award the violation to opponent')
    expect(terminal.board[coordToIdx('h1')]?.id === 'you_quiet', 'Illegal quiet move must not alter board')

    return 'Current Min variant remains behaviorally unchanged while its exact historical trigger stays under research.'
  })

  run('API-07', 'legacy REK_POAT callers and snapshots migrate to REK_STANDARD', () => {
    const legacyCaller = createGame('REK_POAT')
    expect(legacyCaller.getState().mode === 'REK_STANDARD', 'Legacy createGame alias must canonicalize to REK_STANDARD')

    const canonicalEnvelope = JSON.parse(legacyCaller.serialize()) as {
      version: number
      state: GameState
    }
    canonicalEnvelope.state.mode = 'REK_POAT'
    if (canonicalEnvelope.state.positionCounts) {
      canonicalEnvelope.state.positionCounts = Object.fromEntries(
        Object.entries(canonicalEnvelope.state.positionCounts).map(([key, value]) => [
          key.replace(/^REK_STANDARD\|/, 'REK_POAT|'),
          value,
        ])
      )
    }

    const migrated = deserializeGameState(JSON.stringify(canonicalEnvelope))
    expect(migrated.mode === 'REK_STANDARD', 'Legacy snapshot mode must migrate to REK_STANDARD')
    expect(
      Object.keys(migrated.positionCounts ?? {}).every((key) => !key.startsWith('REK_POAT|')),
      'Legacy repetition keys must migrate to canonical namespace'
    )
    expect(
      JSON.parse(serializeGameState(migrated)).state.mode === 'REK_STANDARD',
      'Re-serialized migrated snapshot must contain only canonical ruleset name'
    )

    return 'REK_POAT remains a compatibility alias only; public state and new snapshots are canonical.'
  })

  run('API-08', 'ruleset catalog exposes one game and exactly two canonical rulesets', () => {
    const rulesets = listRuleSets()
    const ids = rulesets.map((entry) => entry.id)

    expect(REK_GAME.id === 'REK_KHMER', 'Package game identity must be REK_KHMER')
    expect(REK_GAME.defaultRuleSet === 'REK_STANDARD', 'Game metadata must point at REK_STANDARD by default')
    expect(rulesets === RULE_SET_CATALOG, 'Catalog accessor must return the stable exported catalog')
    expect(rulesets.length === 2, 'Only two canonical rulesets may be discoverable')
    expect(ids[0] === 'REK_STANDARD' && ids[1] === 'MIN_REK_CHANH', 'Catalog order must be Standard then Min Rek Chanh')
    expect(!ids.some((id) => String(id) === 'REK_POAT'), 'Legacy REK_POAT must never appear as a discoverable ruleset')
    expect(new Set(ids).size === ids.length, 'Catalog ruleset IDs must be unique')
    expect(Object.isFrozen(RULE_SET_CATALOG), 'Exported catalog array must be frozen')
    expect(rulesets.every((entry) => Object.isFrozen(entry)), 'Catalog entries must be frozen')

    return 'Consumers can render one Rek Khmer game with two canonical rulesets without hard-coding legacy mode names.'
  })

  run('API-09', 'ruleset metadata canonicalizes legacy aliases without duplicating rule logic', () => {
    const standard = getRuleSetMetadata('REK_STANDARD')
    const legacy = getRuleSetMetadata('REK_POAT')
    const min = getRuleSetMetadata('MIN_REK_CHANH')

    expect(legacy === standard, 'Legacy metadata lookup must resolve to the exact REK_STANDARD metadata object')
    expect(legacy.id === 'REK_STANDARD', 'Legacy metadata must expose canonical REK_STANDARD identity')
    expect(standard.kind === 'standard', 'REK_STANDARD metadata must be classified as standard')
    expect(standard.researchStatus === 'EVIDENCE_BACKED_CORE', 'Standard metadata must reflect the evidence-backed core')
    expect(min.kind === 'variant', 'MIN_REK_CHANH metadata must be classified as a variant')
    expect(
      min.researchStatus === 'PARTIALLY_UNVERIFIED_VARIANT',
      'Min metadata must preserve its partially-unverified research status'
    )

    return 'Catalog metadata is presentation-only: aliases normalize to canonical IDs while legality remains owned by the engine.'
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
