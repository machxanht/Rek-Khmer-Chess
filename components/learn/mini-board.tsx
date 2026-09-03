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
      className={cn('grid overflow-hidden border border-black/30', className)}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {cells.map((cell, index) => {
        const row = Math.floor(index / n)
        const col = index % n
        const isDark = (row + col) % 2 === 1
        const marker = markers?.[index]

        return (
          <div
            key={index}
            className={cn(
              'relative flex aspect-square items-center justify-center',
              isDark ? 'bg-board-dark' : 'bg-board-light',
            )}
          >
            {marker === 'select' && (
              <span className="absolute inset-0 border-2 border-gold bg-gold/12" aria-hidden="true" />
            )}
            {marker === 'rek' && (
              <span className="absolute inset-1 border-x-2 border-gold bg-gold/8" aria-hidden="true" />
            )}
            {marker === 'capture' && (
              <span className="absolute inset-1 border-2 border-destructive/75" aria-hidden="true" />
            )}
            {cell && <PieceToken piece={{ ...cell, king: !!cell.king, id: `m${index}` }} />}
            {marker === 'move' && !cell && (
              <span className="size-[24%] rounded-full border-2 border-gold/80 bg-background/35" aria-hidden="true" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function buildCells(
  n: number,
  entries: { at: number; player: Player; king?: boolean }[],
): MiniCell[] {
  const cells: MiniCell[] = Array(n * n).fill(null)
  for (const entry of entries) cells[entry.at] = { player: entry.player, king: entry.king }
  return cells
}
