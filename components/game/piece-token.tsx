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
  const seal = piece.king ? '/rek-assets/king-seal.svg' : '/rek-assets/warrior-seal.svg'

  return (
    <span
      className={cn(
        'rek-piece relative flex items-center justify-center select-none',
        you ? 'rek-piece-you' : 'rek-piece-opp',
        piece.king && 'rek-piece-king',
        size === 'board' ? 'size-[82%]' : 'size-full',
        dimmed && 'opacity-35 saturate-50 scale-90',
        selected && 'rek-piece-selected',
        className,
      )}
      aria-label={`${you ? 'Your' : 'Opponent'} ${piece.king ? 'King' : 'Warrior'}`}
    >
      <span className="rek-piece-floor-shadow" aria-hidden="true" />

      <span className="rek-piece-disc" aria-hidden="true">
        <span className="rek-piece-inner-ring" />
        <span className="rek-piece-glaze" />
        <span
          className="rek-piece-seal"
          style={{
            WebkitMaskImage: `url(${seal})`,
            maskImage: `url(${seal})`,
          }}
        />
        {piece.king && <span className="rek-piece-royal-dot" />}
      </span>
    </span>
  )
}
