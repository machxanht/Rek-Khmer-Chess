const LOCAL_ONLINE_URL = 'ws://localhost:8787'

export function getDefaultOnlineServerUrl(): string {
  const configured = import.meta.env.VITE_REK_WS_URL?.trim()
  return configured || LOCAL_ONLINE_URL
}
