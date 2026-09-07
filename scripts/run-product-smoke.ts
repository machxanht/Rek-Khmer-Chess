import {
  chooseAiMove,
  coordToIdx,
  createGame,
} from '../lib/rek-engine'
import { sameReplayState } from '../src/replay'

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function runLocalSmoke(): void {
  const game = createGame('REK_STANDARD')
  const start = game.getState()
  expect(start.turn === 'you', 'Local smoke must start with White/you to move')

  expect(game.makeMove(coordToIdx('a3'), coordToIdx('a4')), 'White opening move a3→a4 must be accepted')
  expect(game.getState().turn === 'opp', 'Local smoke must hand turn to Black/opp')

  expect(game.makeMove(coordToIdx('a6'), coordToIdx('a5')), 'Black reply a6→a5 must be accepted')
  const state = game.getState()
  expect(state.turn === 'you', 'Local smoke must return turn to White/you')
  expect(state.moveCount === 2, 'Local smoke must advance exactly two plies')
}

function runVsAiSmoke(): void {
  const game = createGame('REK_STANDARD')
  expect(game.makeMove(coordToIdx('a3'), coordToIdx('a4')), 'Human opening move must be accepted')

  const beforeAi = game.getState()
  expect(beforeAi.turn === 'opp', 'AI smoke must reach Black/opp turn')

  const move = chooseAiMove(beforeAi.board, 'opp', beforeAi.mode, 'medium')
  expect(move !== null, 'Medium AI must return a live legal move')
  expect(game.getLegalMoves(move.from).includes(move.to), 'AI move must be exposed by live session legality')
  expect(game.makeMove(move.from, move.to), 'AI move must be accepted by RekGame')

  const afterAi = game.getState()
  expect(afterAi.turn === 'you', 'AI smoke must hand turn back to White/you')
  expect(afterAi.moveCount === 2, 'AI smoke must advance exactly two plies')
}

function runReplayStateSmoke(): void {
  const original = createGame('REK_STANDARD').getState()
  const movedGame = createGame('REK_STANDARD')
  expect(
    movedGame.makeMove(coordToIdx('a3'), coordToIdx('a4')),
    'Replay smoke setup move must be accepted',
  )
  const moved = movedGame.getState()

  expect(
    !sameReplayState(original, moved),
    'Replay validation must distinguish different rule-relevant states',
  )
}

runLocalSmoke()
runVsAiSmoke()
runReplayStateSmoke()
console.log('Product smoke: Local + vs AI + replay state PASS')
