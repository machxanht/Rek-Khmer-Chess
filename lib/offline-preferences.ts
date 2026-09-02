export type RekBoardTheme = 'temple' | 'ivory' | 'slate' | 'jade'

export type OfflinePreferences = {
  boardTheme: RekBoardTheme
  animations: boolean
  hints: boolean
}

const STORAGE_KEY = 'rek_offline_preferences_v1'

export const DEFAULT_OFFLINE_PREFERENCES: OfflinePreferences = {
  boardTheme: 'temple',
  animations: true,
  hints: true,
}

function isTheme(value: unknown): value is RekBoardTheme {
  return value === 'temple' || value === 'ivory' || value === 'slate' || value === 'jade'
}

export function readOfflinePreferences(): OfflinePreferences {
  if (typeof window === 'undefined') return DEFAULT_OFFLINE_PREFERENCES

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_OFFLINE_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<OfflinePreferences>
    return {
      boardTheme: isTheme(parsed.boardTheme)
        ? parsed.boardTheme
        : DEFAULT_OFFLINE_PREFERENCES.boardTheme,
      animations:
        typeof parsed.animations === 'boolean'
          ? parsed.animations
          : DEFAULT_OFFLINE_PREFERENCES.animations,
      hints:
        typeof parsed.hints === 'boolean'
          ? parsed.hints
          : DEFAULT_OFFLINE_PREFERENCES.hints,
    }
  } catch {
    return DEFAULT_OFFLINE_PREFERENCES
  }
}

export function applyOfflinePreferences(preferences: OfflinePreferences): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.rekBoardTheme = preferences.boardTheme
  root.dataset.rekMotion = preferences.animations ? 'on' : 'off'
  root.dataset.rekHints = preferences.hints ? 'on' : 'off'
}

export function saveOfflinePreferences(preferences: OfflinePreferences): void {
  applyOfflinePreferences(preferences)
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {}
}
