'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Modal({
  open,
  onClose,
  children,
  className,
  dismissable = true,
  labelledBy,
}: {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  className?: string
  dismissable?: boolean
  labelledBy?: string
}) {
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissable) onClose?.()
    }

    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, dismissable, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5">
      <div
        className="absolute inset-0 bg-[#0d0b08]/82 backdrop-blur-[2px]"
        onClick={() => dismissable && onClose?.()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          'animate-fade-rise relative w-full max-w-md border border-border bg-card p-5 shadow-[0_28px_70px_rgba(0,0,0,0.58)] sm:p-6',
          className,
        )}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" aria-hidden="true" />
        {dismissable && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <X className="size-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
