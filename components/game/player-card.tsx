import { Crown, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Player } from '@/lib/rek/engine'

export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected'

export function PlayerCard({
  player,
  name,
  active,
  piecesLeft,
  captured,
  timer,
  connection,
  align = 'start',
}: {
  player: Player
  name: string
  active: boolean
  piecesLeft: number
  captured: number
  timer?: string
  connection?: ConnectionState
  align?: 'start' | 'end'
}) {
  const you = player === 'you'

  return (
    <div
      className={cn(
        'relative flex min-h-[70px] items-center gap-3 border border-border bg-card/72 px-3 py-2.5 transition-colors sm:px-4',
        active && 'border-gold/35 bg-card',
        align === 'end' && 'flex-row-reverse text-right',
      )}
    >
      <span
        className={cn(
          'absolute inset-y-0 w-0.5',
          align === 'end' ? 'right-0' : 'left-0',
          active ? (you ? 'bg-you' : 'bg-opp') : 'bg-transparent',
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-black',
          you ? 'border-you/45 text-you' : 'border-opp/45 text-opp',
        )}
        aria-hidden="true"
      >
        {name.slice(0, 1).toUpperCase()}
        {active && (
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card',
              you ? 'bg-you' : 'bg-opp',
            )}
          />
        )}
      </div>

      <div className={cn('min-w-0 flex-1', align === 'end' && 'flex flex-col items-end')}>
        <div className={cn('flex min-w-0 items-center gap-1.5', align === 'end' && 'flex-row-reverse')}>
          <span className="truncate text-sm font-extrabold text-foreground">{name}</span>
          {connection === 'connected' && <Wifi className="size-3 text-success" />}
          {connection === 'reconnecting' && <Wifi className="size-3 text-gold" />}
          {connection === 'disconnected' && <WifiOff className="size-3 text-destructive" />}
        </div>

        <div className={cn('mt-1 flex items-center gap-2 text-[11px] text-muted-foreground', align === 'end' && 'flex-row-reverse')}>
          <span className="inline-flex items-center gap-1">
            <Crown className={cn('size-3', you ? 'text-you' : 'text-opp')} />
            <strong className="text-foreground">{piecesLeft}</strong>
            <span>left</span>
          </span>
          <span aria-hidden="true">/</span>
          <span>
            <strong className="text-foreground">{captured}</strong> captured
          </span>
        </div>
      </div>

      {timer && (
        <div
          className={cn(
            'shrink-0 border border-border bg-background/65 px-2 py-1 font-mono text-xs font-bold tabular-nums',
            active && 'border-gold/30 text-gold',
          )}
        >
          {timer}
        </div>
      )}
    </div>
  )
}
