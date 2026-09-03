import { cn } from '@/lib/utils'

export function Emblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('text-gold', className)}
      fill="none"
      aria-hidden="true"
    >
      <path d="M24 5 28 11 24 14 20 11 24 5Z" fill="currentColor" />
      <path d="M24 14 31 19 29 22 24 19 19 22 17 19 24 14Z" fill="currentColor" opacity="0.9" />
      <path d="M24 22 34 29 31.5 32 24 27.5 16.5 32 14 29 24 22Z" fill="currentColor" opacity="0.72" />
      <path d="M11 34H37V38H11V34Z" fill="currentColor" opacity="0.56" />
      <path d="M8 42H40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" opacity="0.72" />
      <path d="M7 6H15M33 6H41M7 6V14M41 6V14M7 34V42M41 34V42" stroke="currentColor" strokeWidth="1" opacity="0.22" />
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
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <span className={cn('flex min-w-0 items-baseline gap-2 select-none', className)}>
      <span className={cn('font-display font-semibold leading-none text-gold', sizes[size])}>រែកខ្មែរ</span>
      <span className="hidden text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground sm:inline">
        Rek Khmer
      </span>
    </span>
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
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-10',
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Emblem className={emblem[size]} />
      <Wordmark size={size} />
    </span>
  )
}
