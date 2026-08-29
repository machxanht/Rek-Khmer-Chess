import { Sparkles, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Player } from '@/lib/rek/engine'

export function TurnIndicator({
  turn,
  youName,
  oppName,
  rekAvailable,
}: {
  turn: Player
  youName: string
  oppName: string
  rekAvailable?: boolean
}) {
  const you = turn === 'you'
  return (
    <div className="flex items-center justify-center gap-3">
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-full border px-5 py-2 text-sm font-bold shadow-lg transition-all duration-300',
          you
            ? 'border-you/60 bg-you-soft text-foreground shadow-[0_0_12px_var(--you-soft)]'
            : 'border-opp/60 bg-opp-soft text-foreground shadow-[0_0_12px_var(--opp-soft)]',
        )}
      >
        <span
          className="size-3 rounded-full animate-ping"
          style={{ background: you ? 'var(--you)' : 'var(--opp)' }}
        />
        <span className="text-foreground">{you ? youName : oppName}</span>
        <span className="text-xs font-normal text-muted-foreground">turn</span>
      </div>
      {rekAvailable && (
        <span className="animate-fade-rise flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-extrabold text-background shadow-lg shadow-gold/30 ring-2 ring-gold/60 animate-bounce">
          <Sparkles className="size-3.5" />
          <span>REK READY!</span>
        </span>
      )}
    </div>
  )
}

