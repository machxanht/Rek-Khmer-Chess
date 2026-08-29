import { cn } from '@/lib/utils'
import { PieceToken } from '@/components/game/piece-token'
import type { Player } from '@/lib/rek/engine'

export type MiniCell = { player: Player; king?: boolean } | null
export type Marker = 'move' | 'capture' | 'rek' | 'select'

export function MiniBoard({
  n,
  cells,
  markers,
  className,
}: {
  n: number
  cells: MiniCell[]
  markers?: Record<number, Marker>
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid overflow-hidden rounded-xl ring-1 ring-gold/20',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {cells.map((cell, i) => {
        const row = Math.floor(i / n)
        const col = i % n
        const isDark = (row + col) % 2 === 1
        const marker = markers?.[i]
        return (
          <div
            key={i}
            className={cn(
              'relative flex aspect-square items-center justify-center',
              isDark ? 'bg-board-dark' : 'bg-board-light',
            )}
          >
            {marker === 'select' && (
              <span className="absolute inset-0 bg-gold/30 ring-2 ring-gold ring-inset" />
            )}
            {marker === 'rek' && (
              <span className="absolute inset-1 rounded-md ring-2 ring-gold animate-rek-pulse" />
            )}
            {marker === 'capture' && (
              <span className="absolute inset-1 rounded-md ring-2 ring-destructive/80" />
            )}
            {cell && (
              <PieceToken piece={{ ...cell, king: !!cell.king, id: `m${i}` }} />
            )}
            {marker === 'move' && !cell && (
              <span className="size-[26%] rounded-full bg-gold/70" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// helper to build a cells array
export function buildCells(
  n: number,
  entries: { at: number; player: Player; king?: boolean }[],
): MiniCell[] {
  const cells: MiniCell[] = Array(n * n).fill(null)
  for (const e of entries) cells[e.at] = { player: e.player, king: e.king }
  return cells
}
