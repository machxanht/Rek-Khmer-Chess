'use client'

import { useEffect } from 'react'

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Rek Khmer route error', error)
  }, [error])

  return (
    <main className="grid min-h-dvh place-items-center bg-temple px-6 text-center text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="text-4xl" aria-hidden="true">♜</div>
        <h1 className="mt-3 font-display text-2xl font-extrabold">This Rek screen hit an error</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Retry the screen. If the issue repeats, the browser console will keep the actual runtime error for debugging.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 min-h-12 w-full rounded-2xl bg-gold px-4 font-bold text-background transition-opacity hover:opacity-90"
        >
          Retry Screen
        </button>
      </div>
    </main>
  )
}
