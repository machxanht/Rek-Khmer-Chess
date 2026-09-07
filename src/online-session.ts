export interface StoredOnlineSession {
  version: 1
  url: string
  roomId: string
  resumeToken: string
}

const STORAGE_KEY = 'rek-online-session-v1'

export function saveOnlineSession(session: StoredOnlineSession): void {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function loadOnlineSession(): StoredOnlineSession | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const value = parsed as Record<string, unknown>

    if (
      value.version !== 1 ||
      typeof value.url !== 'string' ||
      !/^wss?:\/\//i.test(value.url) ||
      typeof value.roomId !== 'string' ||
      !/^[A-Z0-9]{6}$/.test(value.roomId) ||
      typeof value.resumeToken !== 'string' ||
      !/^[A-F0-9]{32}$/.test(value.resumeToken)
    ) {
      return null
    }

    return {
      version: 1,
      url: value.url,
      roomId: value.roomId,
      resumeToken: value.resumeToken,
    }
  } catch {
    return null
  }
}

export function clearOnlineSession(): void {
  window.sessionStorage.removeItem(STORAGE_KEY)
}
