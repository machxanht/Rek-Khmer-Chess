'use client'

import { Pause, RotateCcw, Flag, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

type ControlAction = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  tone?: 'default' | 'danger'
}

export function GameControls({
  onPause,
  onRestart,
  onResign,
  onInfo,
}: {
  onPause?: () => void
  onRestart?: () => void
  onResign?: () => void
  onInfo?: () => void
}) {
  const actions: ControlAction[] = []
  if (onPause) actions.push({ key: 'pause', label: 'Pause', icon: Pause, onClick: onPause })
  if (onInfo) actions.push({ key: 'info', label: 'Rules', icon: BookOpen, onClick: onInfo })
  if (onRestart) actions.push({ key: 'restart', label: 'Restart', icon: RotateCcw, onClick: onRestart })
  if (onResign)
    actions.push({ key: 'resign', label: 'Resign', icon: Flag, onClick: onResign, tone: 'danger' })

  return (
    <div className="flex items-center justify-center gap-2.5 w-full max-w-md mx-auto">
      {actions.map((a) => (
        <button
          key={a.key}
          onClick={a.onClick}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-2xl border border-border/80 bg-card/80 px-3 py-2.5 text-xs font-semibold text-foreground/90 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
            a.tone === 'danger'
              ? 'hover:border-destructive/60 hover:bg-destructive/15 hover:text-destructive'
              : 'hover:border-gold/50 hover:bg-accent hover:text-gold',
          )}
        >
          <a.icon className="size-4.5" />
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  )
}

