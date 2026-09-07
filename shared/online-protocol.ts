import type { PlayerColor, RuleSet } from '../lib/rek-engine'

export interface OnlineMove {
  from: number
  to: number
}

export type OnlineClientMessage =
  | { type: 'create'; ruleset: RuleSet }
  | { type: 'join'; roomId: string }
  | { type: 'resume'; roomId: string; resumeToken: string }
  | { type: 'move'; roomId: string; from: number; to: number }

export type OnlineServerMessage =
  | {
      type: 'room'
      roomId: string
      color: PlayerColor
      snapshot: string
      resumeToken: string
      peerConnected: boolean
      resumed: boolean
    }
  | {
      type: 'state'
      roomId: string
      snapshot: string
      move: OnlineMove
    }
  | {
      type: 'peer'
      roomId: string
      status: 'joined' | 'left'
    }
  | {
      type: 'error'
      message: string
    }
