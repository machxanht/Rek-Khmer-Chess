import { Sparkles } from 'lucide-react'
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
    <div className="flex min-h-9 items-center justify-between gap-3 border-y border-border/80 py-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn('size-2.5 shrink-0 rounded-full', you ? 'bg-you' : 'bg-opp')}
          aria-hidden="true"
        />
        <span className="truncate text-xs font-black uppercase tracking-[0.11em] text-muted-foreground">
          {you ? youName : oppName}
        </span>
        <span className="shrink-0 text-xs text-foreground">to move</span>
      </div>

      {rekAvailable && (
        <span className="inline-flex shrink-0 items-center gap-1.5 border border-gold/35 bg-gold-soft px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-gold">
          <Sparkles className="size-3" />
          Rek available
        </span>
      )}
    </div>
  )
}
