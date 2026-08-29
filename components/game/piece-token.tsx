import { Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Piece } from '@/lib/rek/engine'

export function PieceToken({
  piece,
  size = 'board',
  className,
  dimmed,
  selected,
}: {
  piece: Piece
  size?: 'board' | 'sm'
  className?: string
  dimmed?: boolean
  selected?: boolean
}) {
  const you = piece.player === 'you'
  return (
    <span
      className={cn(
        'relative flex items-center justify-center rounded-full transition-all duration-300 select-none group',
        size === 'board' ? 'size-[82%]' : 'size-full',
        dimmed && 'opacity-35 saturate-50 scale-90',
        selected && 'scale-110 -translate-y-1',
        className,
      )}
      style={{
        background: you
          ? 'radial-gradient(circle at 35% 25%, oklch(0.78 0.24 28), oklch(0.58 0.23 25) 55%, oklch(0.42 0.18 24))'
          : 'radial-gradient(circle at 35% 25%, oklch(0.86 0.18 175), oklch(0.68 0.16 178) 55%, oklch(0.48 0.14 182))',
        boxShadow: piece.king
          ? selected
            ? '0 10px 20px oklch(0 0 0 / 0.6), inset 0 2px 2px oklch(1 0 0 / 0.6), 0 0 0 3px var(--gold), 0 0 16px var(--gold-glow)'
            : '0 4px 10px oklch(0 0 0 / 0.5), inset 0 2px 2px oklch(1 0 0 / 0.5), 0 0 0 2.5px var(--gold)'
          : selected
            ? you
              ? '0 10px 20px oklch(0 0 0 / 0.6), inset 0 2px 2px oklch(1 0 0 / 0.6), 0 0 0 3px oklch(0.78 0.24 28), 0 0 16px oklch(0.78 0.24 28 / 0.4)'
              : '0 10px 20px oklch(0 0 0 / 0.6), inset 0 2px 2px oklch(1 0 0 / 0.6), 0 0 0 3px oklch(0.86 0.18 175), 0 0 16px oklch(0.86 0.18 175 / 0.4)'
            : '0 4px 8px oklch(0 0 0 / 0.45), inset 0 1.5px 2px oklch(1 0 0 / 0.45)',
      }}
    >
      {/* Glossy top reflective highlight */}
      <span
        className="absolute top-1 left-1.5 right-1.5 h-1/3 rounded-full opacity-60 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, oklch(1 0 0 / 0.7) 0%, transparent 100%)',
        }}
      />

      {piece.king ? (
        <div className="relative flex items-center justify-center">
          <Crown
            className="size-1/2 min-w-5 min-h-5 text-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter transition-transform group-hover:scale-110"
            strokeWidth={2.6}
            aria-hidden="true"
          />
        </div>
      ) : (
        <span
          className="size-[34%] rounded-full ring-1 ring-white/30"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, oklch(1 0 0 / 0.7), oklch(1 0 0 / 0.1) 70%, transparent)',
          }}
          aria-hidden="true"
        />
      )}
    </span>
  )
}

