import { coordToIdx } from '../rek-engine'
import type { TestResult } from '../rek-engine'
import {
  __resetRoomStoreForTests,
  createRoom,
  getRoomSnapshot,
  joinRoom,
  RekRoomError,
  requestRematch,
  resignRoom,
  submitRoomMove,
} from './room-store'

function expect(condition: unknown, message: string): void {
  if (!condition) throw new Error(message)
}

function expectRoomError(code: string, fn: () => unknown): void {
  try {
    fn()
  } catch (error) {
    expect(error instanceof RekRoomError, `Expected RekRoomError ${code}`)
    expect((error as RekRoomError).code === code, `Expected ${code}, got ${(error as RekRoomError).code}`)
    return
  }
  throw new Error(`Expected room error ${code}`)
}

function pair(mode: 'REK_POAT' | 'MIN_REK_CHANH' = 'REK_POAT') {
  const host = createRoom({ mode, name: 'Host Player' })
  const guest = joinRoom(host.session.code, { name: 'Guest Player' })
  return { host, guest }
}

export function runOnlineRoomTests(): {
  total: number
  passed: number
  failed: number
  results: TestResult[]
} {
  const results: TestResult[] = []
  const run = (id: string, title: string, fn: () => string) => {
    __resetRoomStoreForTests()
    try {
      results.push({ id, title, passed: true, details: fn() })
    } catch (error) {
      results.push({
        id,
        title,
        passed: false,
        details: 'Online room protocol assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('ONLINE-01', 'Room creation returns a private host token without leaking it in shared state', () => {
    const created = createRoom({ name: '  Dara   Khmer  ', mode: 'REK_POAT' })
    expect(created.session.role === 'host', 'Creator must be host')
    expect(created.session.playerColor === 'you', 'Host must own engine color you')
    expect(created.room.phase === 'waiting', 'New room must wait for second player')
    expect(created.room.hostName === 'Dara Khmer', 'Display name should be normalized')
    expect(created.room.state.moveCount === 0, 'New room must start at engine move zero')
    expect(!JSON.stringify(created.room).includes(created.session.token), 'Bearer token must not appear in room snapshot')
    return 'Session secret is separated from shared room state.'
  })

  run('ONLINE-02', 'Room snapshots reject missing or forged bearer tokens', () => {
    const created = createRoom()
    expectRoomError('MISSING_TOKEN', () => getRoomSnapshot(created.session.code, ''))
    expectRoomError('UNAUTHORIZED_ROOM', () => getRoomSnapshot(created.session.code, 'forged-token'))
    return 'A room code alone is not sufficient to impersonate either player.'
  })

  run('ONLINE-03', 'Exactly two players can occupy a room with stable colors', () => {
    const { host, guest } = pair()
    const hostView = getRoomSnapshot(host.session.code, host.session.token)
    expect(hostView.phase === 'playing', 'Host should see playing after guest joins')
    expect(hostView.playerColor === 'you', 'Host color must remain you')
    expect(guest.session.playerColor === 'opp', 'Guest color must be opp')
    expect(guest.room.hostName === 'Host Player' && guest.room.guestName === 'Guest Player', 'Both names must be shared')
    expectRoomError('ROOM_FULL', () => joinRoom(host.session.code, { name: 'Third' }))
    return 'Room capacity and color assignment cannot be client-selected.'
  })

  run('ONLINE-04', 'Server rejects wrong-turn, wrong-piece, illegal and stale move submissions', () => {
    const { host, guest } = pair()
    const code = host.session.code

    expectRoomError('NOT_YOUR_TURN', () =>
      submitRoomMove(code, {
        token: guest.session.token,
        from: coordToIdx('a7'),
        to: coordToIdx('a6'),
        expectedMoveCount: 0,
      }),
    )

    expectRoomError('ILLEGAL_MOVE', () =>
      submitRoomMove(code, {
        token: host.session.token,
        from: coordToIdx('a7'),
        to: coordToIdx('a6'),
        expectedMoveCount: 0,
      }),
    )

    expectRoomError('ILLEGAL_MOVE', () =>
      submitRoomMove(code, {
        token: host.session.token,
        from: coordToIdx('a1'),
        to: coordToIdx('a3'),
        expectedMoveCount: 0,
      }),
    )

    const afterHost = submitRoomMove(code, {
      token: host.session.token,
      from: coordToIdx('a2'),
      to: coordToIdx('a3'),
      expectedMoveCount: 0,
    })
    expect(afterHost.state.moveCount === 1 && afterHost.state.turn === 'opp', 'Legal host move must advance canonical state')
    expect(afterHost.moves.length === 1, 'Only executed moves enter shared history')

    expectRoomError('STALE_STATE', () =>
      submitRoomMove(code, {
        token: guest.session.token,
        from: coordToIdx('a7'),
        to: coordToIdx('a6'),
        expectedMoveCount: 0,
      }),
    )

    return 'Client cannot bypass engine legality or race an outdated board version.'
  })

  run('ONLINE-05', 'Legal alternating moves produce one canonical history for both players', () => {
    const { host, guest } = pair()
    const code = host.session.code
    submitRoomMove(code, {
      token: host.session.token,
      from: coordToIdx('a2'),
      to: coordToIdx('a3'),
      expectedMoveCount: 0,
    })
    const guestResult = submitRoomMove(code, {
      token: guest.session.token,
      from: coordToIdx('a7'),
      to: coordToIdx('a6'),
      expectedMoveCount: 1,
    })
    const hostView = getRoomSnapshot(code, host.session.token)

    expect(guestResult.state.moveCount === 2, 'Two legal plies must be committed')
    expect(hostView.state.moveCount === guestResult.state.moveCount, 'Both players must read same moveCount')
    expect(JSON.stringify(hostView.state.board) === JSON.stringify(guestResult.state.board), 'Both players must read identical board')
    expect(hostView.moves.length === 2 && hostView.moves[0].player === 'you' && hostView.moves[1].player === 'opp', 'History must retain server turn order')
    return 'Polling clients converge on the same engine state and shared move log.'
  })

  run('ONLINE-06', 'Resignation is a synchronized server terminal result', () => {
    const { host, guest } = pair()
    const resigned = resignRoom(host.session.code, guest.session.token)
    const hostView = getRoomSnapshot(host.session.code, host.session.token)

    expect(resigned.state.status === 'won', 'Resign must end the game')
    expect(resigned.state.winner === 'you', 'Guest resignation must award host color')
    expect(hostView.state.winner === resigned.state.winner, 'Opponent must see identical winner')
    expect(hostView.phase === 'finished', 'Room phase must become finished')
    expect(hostView.state.availableRekMovesCount === 0, 'Terminal online state must expose no future Rek cache')
    return 'Resignation no longer exists only in one browser UI.'
  })

  run('ONLINE-07', 'Rematch requires both players and resets shared engine state atomically', () => {
    const { host, guest } = pair('MIN_REK_CHANH')
    const code = host.session.code
    resignRoom(code, guest.session.token)

    const first = requestRematch(code, host.session.token)
    expect(!first.restarted, 'First rematch request must wait')
    expect(first.room.rematchRequestedByYou, 'Requester flag must be visible')

    const guestView = getRoomSnapshot(code, guest.session.token)
    expect(guestView.rematchRequestedByOpponent, 'Opponent must see pending rematch request')

    const second = requestRematch(code, guest.session.token)
    expect(second.restarted, 'Second acceptance must restart')
    expect(second.room.state.status === 'playing', 'Rematch must create fresh playing state')
    expect(second.room.state.moveCount === 0 && second.room.moves.length === 0, 'Rematch must clear move state and history')
    expect(second.room.mode === 'MIN_REK_CHANH' && second.room.state.mode === 'MIN_REK_CHANH', 'Room rule mode must survive rematch')
    expect(!second.room.rematchRequestedByYou && !second.room.rematchRequestedByOpponent, 'Rematch flags must clear atomically')
    return 'Neither browser can unilaterally reset an online match.'
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
