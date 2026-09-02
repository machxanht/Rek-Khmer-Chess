import 'server-only'

import { NextResponse } from 'next/server'
import { RekRoomError } from './room-store'
import type { OnlineApiError } from './types'

export function onlineJson<T>(body: T, status = 200): NextResponse<T> {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export function onlineError(error: unknown): NextResponse<OnlineApiError> {
  if (error instanceof RekRoomError) {
    return onlineJson(
      {
        error: error.message,
        code: error.code,
      },
      error.status,
    )
  }

  console.error('Rek online API error', error)
  return onlineJson(
    {
      error: 'Unexpected online room error',
      code: 'INTERNAL_ERROR',
    },
    500,
  )
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = await request.json()
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}
