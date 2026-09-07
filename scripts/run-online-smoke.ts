import { once } from 'node:events'
import { WebSocket, type RawData } from 'ws'
import { coordToIdx, deserializeGame } from '../lib/rek-engine'
import { createOnlineServer } from '../server/online-server'
import type { OnlineServerMessage } from '../shared/online-protocol'

function nextMessage(
  socket: WebSocket,
  predicate: (message: OnlineServerMessage) => boolean,
): Promise<OnlineServerMessage> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off('message', onMessage)
      reject(new Error('Timed out waiting for online smoke message'))
    }, 3000)

    const onMessage = (raw: RawData) => {
      const message = JSON.parse(raw.toString()) as OnlineServerMessage
      if (!predicate(message)) return
      clearTimeout(timer)
      socket.off('message', onMessage)
      resolve(message)
    }

    socket.on('message', onMessage)
  })
}

async function openSocket(url: string): Promise<WebSocket> {
  const socket = new WebSocket(url)
  await once(socket, 'open')
  return socket
}

async function main(): Promise<void> {
  const server = createOnlineServer({ port: 0, host: '127.0.0.1', resumeGraceMs: 1000 })
  await once(server, 'listening')

  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Unexpected WebSocket server address')
  const url = `ws://127.0.0.1:${address.port}`

  const white = await openSocket(url)
  white.send(JSON.stringify({ type: 'create', ruleset: 'REK_STANDARD' }))
  const created = await nextMessage(white, (message) => message.type === 'room')
  if (created.type !== 'room' || created.color !== 'you') throw new Error('Creator was not assigned White')
  if (!created.resumeToken || created.resumed) throw new Error('Creator did not receive a fresh resume token')

  let black = await openSocket(url)
  black.send(JSON.stringify({ type: 'join', roomId: created.roomId }))
  const joined = await nextMessage(black, (message) => message.type === 'room')
  if (joined.type !== 'room' || joined.color !== 'opp') throw new Error('Joiner was not assigned Black')
  if (!joined.resumeToken || joined.resumed) throw new Error('Joiner did not receive a fresh resume token')

  black.send(JSON.stringify({
    type: 'move',
    roomId: created.roomId,
    from: coordToIdx('a6'),
    to: coordToIdx('a5'),
  }))
  const rejected = await nextMessage(black, (message) => message.type === 'error')
  if (rejected.type !== 'error' || rejected.message !== 'Not your turn') {
    throw new Error('Server did not reject out-of-turn move')
  }

  const from = coordToIdx('a3')
  const to = coordToIdx('a4')
  white.send(JSON.stringify({ type: 'move', roomId: created.roomId, from, to }))
  const update = await nextMessage(black, (message) => message.type === 'state')
  if (update.type !== 'state') throw new Error('Missing authoritative state broadcast')

  const state = deserializeGame(update.snapshot).getState()
  if (state.moveCount !== 1 || state.turn !== 'opp') throw new Error('Authoritative state did not advance one ply')

  const peerLeft = nextMessage(white, (message) => message.type === 'peer' && message.status === 'left')
  black.close()
  await once(black, 'close')
  await peerLeft

  black = await openSocket(url)
  const peerRejoined = nextMessage(white, (message) => message.type === 'peer' && message.status === 'joined')
  black.send(JSON.stringify({
    type: 'resume',
    roomId: created.roomId,
    resumeToken: joined.resumeToken,
  }))
  const resumed = await nextMessage(black, (message) => message.type === 'room')
  await peerRejoined
  if (resumed.type !== 'room' || resumed.color !== 'opp' || !resumed.resumed) {
    throw new Error('Black seat did not resume correctly')
  }
  if (!resumed.peerConnected) throw new Error('Resumed Black seat did not see connected White peer')

  const resumedState = deserializeGame(resumed.snapshot).getState()
  if (resumedState.moveCount !== 1 || resumedState.turn !== 'opp') {
    throw new Error('Resumed seat did not receive the authoritative live snapshot')
  }

  black.send(JSON.stringify({
    type: 'move',
    roomId: created.roomId,
    from: coordToIdx('a6'),
    to: coordToIdx('a5'),
  }))
  const resumedUpdate = await nextMessage(white, (message) => message.type === 'state')
  if (resumedUpdate.type !== 'state') throw new Error('Missing state after resumed move')
  const afterResume = deserializeGame(resumedUpdate.snapshot).getState()
  if (afterResume.moveCount !== 2 || afterResume.turn !== 'you') {
    throw new Error('Resumed player could not continue the authoritative match')
  }

  white.close()
  black.close()
  await Promise.all([once(white, 'close'), once(black, 'close')])
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })

  console.log('Online smoke: create/join/turn-validation/move-sync/resume PASS')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
