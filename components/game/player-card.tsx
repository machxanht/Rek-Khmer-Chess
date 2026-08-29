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
        'flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all duration-300 backdrop-blur-md shadow-md',
        active
          ? 'border-gold/60 bg-gold-soft/80 shadow-[0_0_16px_var(--gold-soft)] ring-1 ring-gold/50 scale-[1.02]'
          : 'border-border/80 bg-card/70 opacity-90',
        align === 'end' && 'flex-row-reverse text-right',
      )}
    >
      <div
        className={cn(
          'relative flex size-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-background shadow-md transition-transform duration-300',
          active && 'scale-105',
        )}
        style={{
          background: you
            ? 'linear-gradient(145deg, oklch(0.78 0.24 28), oklch(0.58 0.23 25))'
            : 'linear-gradient(145deg, oklch(0.86 0.18 175), oklch(0.68 0.16 178))',
          boxShadow: you
            ? '0 4px 12px oklch(0.66 0.23 28 / 0.4)'
            : '0 4px 12px oklch(0.76 0.16 175 / 0.4)',
        }}
      >
        {name.slice(0, 1).toUpperCase()}
        {active && (
          <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-gold ring-2 ring-card shadow-sm animate-pulse">
            <span className="size-1.5 rounded-full bg-background" />
          </span>
        )}
      </div>

      <div className={cn('flex min-w-0 flex-col', align === 'end' && 'items-end')}>
        <div className={cn('flex items-center gap-1.5', align === 'end' && 'flex-row-reverse')}>
          <span className="truncate text-sm font-bold text-foreground">{name}</span>
          {connection === 'connected' && <Wifi className="size-3.5 text-success" />}
          {connection === 'reconnecting' && <Wifi className="size-3.5 animate-pulse text-gold" />}
          {connection === 'disconnected' && <WifiOff className="size-3.5 text-destructive" />}
        </div>
        <div className={cn('flex items-center gap-2 text-xs font-medium text-muted-foreground', align === 'end' && 'flex-row-reverse')}>
          <span className="flex items-center gap-1 text-foreground/90">
            <Crown className={cn('size-3.5', you ? 'text-you' : 'text-opp')} />
            <strong>{piecesLeft}</strong> pieces
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-gold font-medium">+{captured} taken</span>
        </div>
      </div>

      {timer && (
        <div
          className={cn(
            'ml-auto rounded-xl px-2.5 py-1.5 font-mono text-sm font-bold tabular-nums shadow-sm transition-colors',
            align === 'end' && 'mr-auto ml-0',
            active ? 'bg-gold text-background ring-1 ring-gold shadow-[0_0_8px_var(--gold-soft)]' : 'bg-secondary/90 text-muted-foreground',
          )}
        >
          {timer}
        </div>
      )}
    </div>
  )
}
