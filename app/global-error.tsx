'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          display: 'grid',
          placeItems: 'center',
          background: '#241d14',
          color: '#f5efe3',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: 24,
        }}
      >
        <main style={{ width: 'min(100%, 420px)', textAlign: 'center' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>♜</div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Rek Khmer could not finish loading</h1>
          <p style={{ margin: '10px 0 20px', opacity: 0.75, lineHeight: 1.5 }}>
            The board hit a browser runtime error. Retry the app without losing any server data.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              width: '100%',
              minHeight: 48,
              border: 0,
              borderRadius: 14,
              background: '#e4b64a',
              color: '#241d14',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Retry Rek Khmer
          </button>
        </main>
      </body>
    </html>
  )
}
