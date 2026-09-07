import type { RuleSet } from '../lib/rek-engine'
import type { OnlineServerMessage } from '../shared/online-protocol'

export interface OnlineClientHandlers {
  onOpen?: () => void
  onMessage: (message: OnlineServerMessage) => void
  onClose?: () => void
}

export class RekOnlineClient {
  private readonly socket: WebSocket
  private suppressClose = false

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
    this.socket.addEventListener('close', () => {
      if (!this.suppressClose) handlers.onClose?.()
    })
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

  resume(roomId: string, resumeToken: string): void {
    this.send({
      type: 'resume',
      roomId: roomId.trim().toUpperCase(),
      resumeToken: resumeToken.trim().toUpperCase(),
    })
  }

  move(roomId: string, from: number, to: number): void {
    this.send({ type: 'move', roomId, from, to })
  }

  close(silent = false): void {
    this.suppressClose = silent
    this.socket.close()
  }

  private send(message: object): void {
    if (this.socket.readyState !== WebSocket.OPEN) return
    this.socket.send(JSON.stringify(message))
  }
}
