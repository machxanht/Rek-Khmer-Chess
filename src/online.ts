import type { RuleSet } from '../lib/rek-engine'
import type { OnlineServerMessage } from '../shared/online-protocol'

export interface OnlineClientHandlers {
  onOpen?: () => void
  onMessage: (message: OnlineServerMessage) => void
  onClose?: () => void
}

export class RekOnlineClient {
  private readonly socket: WebSocket

  constructor(url: string, handlers: OnlineClientHandlers) {
    this.socket = new WebSocket(url)
    this.socket.addEventListener('open', () => handlers.onOpen?.())
    this.socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(String(event.data)) as OnlineServerMessage
        handlers.onMessage(message)
      } catch {
        handlers.onMessage({ type: 'error', message: 'Invalid server message' })
      }
    })
    this.socket.addEventListener('close', () => handlers.onClose?.())
    this.socket.addEventListener('error', () => {
      handlers.onMessage({ type: 'error', message: 'WebSocket connection error' })
    })
  }

  create(ruleset: RuleSet): void {
    this.send({ type: 'create', ruleset })
  }

  join(roomId: string): void {
    this.send({ type: 'join', roomId: roomId.trim().toUpperCase() })
  }

  move(roomId: string, from: number, to: number): void {
    this.send({ type: 'move', roomId, from, to })
  }

  close(): void {
    this.socket.close()
  }

  private send(message: object): void {
    if (this.socket.readyState !== WebSocket.OPEN) return
    this.socket.send(JSON.stringify(message))
  }
}
