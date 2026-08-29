import { cn } from '@/lib/utils'

export function Emblem({ className }: { className?: string }) {
  // Geometric prasat (temple tower) mark — the product signature with glowing gradients.
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('text-gold drop-shadow-[0_2px_10px_var(--gold-glow)] transition-transform hover:scale-105 duration-300', className)}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        className="fill-gold/15 stroke-gold/60"
        strokeWidth="1.75"
      />
      <path
        d="M24 7.5l3.5 5.5-3.5 2-3.5-2 3.5-5.5Z"
        className="fill-gold"
      />
      <path
        d="M24 16l6.5 4.5v3l-6.5-3.5-6.5 3.5v-3l6.5-4.5Z"
        className="fill-gold/90"
      />
      <path
        d="M24 23.5l8.5 5v3.5l-8.5-4-8.5 4v-3.5l8.5-5Z"
        className="fill-gold/75"
      />
      <path
        d="M13.5 33.5h21v4.5a2 2 0 0 1-2 2h-17a2 2 0 0 1-2-2v-4.5Z"
        className="fill-gold/60"
      />
    </svg>
  )
}

export function Wordmark({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'text-base tracking-tight',
    md: 'text-xl tracking-tight',
    lg: 'text-2xl tracking-tight',
  }
  return (
    <div className={cn('flex flex-col select-none', className)}>
      <span
        className={cn(
          'font-display font-black leading-tight',
          sizes[size],
        )}
      >
        <span className="text-gold font-bold mr-1.5">រែកខ្មែរ</span>
        <span className="text-foreground/90 font-medium text-xs sm:text-sm font-sans tracking-widest uppercase">
          Rek Khmer
        </span>
      </span>
    </div>
  )
}

export function Logo({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const emblem = {
    sm: 'size-7',
    md: 'size-9',
    lg: 'size-11',
  }
  return (
    <span className={cn('inline-flex items-center gap-3 group', className)}>
      <Emblem className={emblem[size]} />
      <Wordmark size={size} />
    </span>
  )
}
