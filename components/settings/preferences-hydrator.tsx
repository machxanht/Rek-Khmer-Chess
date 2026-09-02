'use client'

import { useEffect } from 'react'
import { applyOfflinePreferences, readOfflinePreferences } from '@/lib/offline-preferences'

export function PreferencesHydrator() {
  useEffect(() => {
    applyOfflinePreferences(readOfflinePreferences())
  }, [])

  return null
}
