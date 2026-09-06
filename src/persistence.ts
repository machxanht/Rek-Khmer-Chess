import type { AiDifficulty, RuleSet } from '../lib/rek-engine'
import type { UiLanguage } from './i18n'

export type StoredMatchType = 'LOCAL' | 'VS_AI'

export interface StoredMove {
  from: number
  to: number
}

export interface StoredMatch {
  version: 1
  snapshot: string
  ruleset: RuleSet
  matchType: StoredMatchType
  difficulty: AiDifficulty
  language: UiLanguage
  moves: StoredMove[]
}

const STORAGE_KEY = 'rek-khmer-match-v1'

function isStoredMove(value: unknown): value is StoredMove {
  if (!value || typeof value !== 'object') return false
  const move = value as Record<string, unknown>
  return Number.isInteger(move.from) && Number.isInteger(move.to)
}

function isStoredMatch(value: unknown): value is StoredMatch {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return (
    data.version === 1 &&
    typeof data.snapshot === 'string' &&
    (data.ruleset === 'REK_STANDARD' || data.ruleset === 'MIN_REK_CHANH') &&
    (data.matchType === 'LOCAL' || data.matchType === 'VS_AI') &&
    (data.difficulty === 'easy' || data.difficulty === 'medium' || data.difficulty === 'hard') &&
    (data.language === 'km' || data.language === 'vi' || data.language === 'en') &&
    Array.isArray(data.moves) &&
    data.moves.every(isStoredMove)
  )
}

export function saveStoredMatch(match: StoredMatch): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(match))
}

export function loadStoredMatch(): StoredMatch | null {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  const parsed: unknown = JSON.parse(raw)
  if (!isStoredMatch(parsed)) throw new Error('Invalid saved Rek match metadata')
  return parsed
}
