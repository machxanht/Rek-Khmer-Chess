import {
  DEFAULT_RULESET,
  RuleSet,
  RuleSetInput,
  normalizeRuleSet,
} from './types'

/** Stable identity for the single game represented by this package. */
export const REK_GAME = Object.freeze({
  id: 'REK_KHMER' as const,
  name: 'Rek Khmer',
  khmerName: 'ល្បែងរែក',
  defaultRuleSet: DEFAULT_RULESET,
})

export type RuleSetKind = 'standard' | 'variant'

/**
 * Documentation confidence for presentation/discovery only.
 * This metadata must never be used to decide move legality or captures.
 */
export type RuleSetResearchStatus =
  | 'EVIDENCE_BACKED_CORE'
  | 'PARTIALLY_UNVERIFIED_VARIANT'

export interface RuleSetMetadata {
  id: RuleSet
  displayName: string
  kind: RuleSetKind
  researchStatus: RuleSetResearchStatus
  summary: string
}

const STANDARD_METADATA: Readonly<RuleSetMetadata> = Object.freeze({
  id: 'REK_STANDARD',
  displayName: 'Rek Khmer — Standard',
  kind: 'standard',
  researchStatus: 'EVIDENCE_BACKED_CORE',
  summary:
    'Default project ruleset for the evidence-backed Rek core; project extensions remain documented separately.',
})

const MIN_REK_CHANH_METADATA: Readonly<RuleSetMetadata> = Object.freeze({
  id: 'MIN_REK_CHANH',
  displayName: 'Min Rek Chanh',
  kind: 'variant',
  researchStatus: 'PARTIALLY_UNVERIFIED_VARIANT',
  summary:
    'Variant using the current compulsory-Rek and stationary-King engine contract; exact historical Hao Rek semantics remain under research.',
})

/**
 * Canonical discoverable rule sets in stable UI/API order.
 * `REK_POAT` is intentionally absent because it is compatibility input only.
 */
export const RULE_SET_CATALOG: readonly Readonly<RuleSetMetadata>[] = Object.freeze([
  STANDARD_METADATA,
  MIN_REK_CHANH_METADATA,
])

const RULE_SET_METADATA_BY_ID: Readonly<Record<RuleSet, Readonly<RuleSetMetadata>>> =
  Object.freeze({
    REK_STANDARD: STANDARD_METADATA,
    MIN_REK_CHANH: MIN_REK_CHANH_METADATA,
  })

/** Returns presentation metadata after canonicalizing any legacy identifier. */
export function getRuleSetMetadata(mode: RuleSetInput = DEFAULT_RULESET): Readonly<RuleSetMetadata> {
  return RULE_SET_METADATA_BY_ID[normalizeRuleSet(mode)]
}

/** Returns the two canonical rulesets; consumers must not mutate the catalog. */
export function listRuleSets(): readonly Readonly<RuleSetMetadata>[] {
  return RULE_SET_CATALOG
}
