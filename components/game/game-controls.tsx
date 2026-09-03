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
  if (onResign) actions.push({ key: 'resign', label: 'Resign', icon: Flag, onClick: onResign, tone: 'danger' })

  return (
    <div className="grid w-full grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={action.onClick}
          className={cn(
            'flex min-h-12 items-center justify-center gap-2 bg-card px-3 text-xs font-bold text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/70',
            action.tone === 'danger' && 'hover:bg-destructive/10 hover:text-destructive',
          )}
        >
          <action.icon className="size-4" />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}
