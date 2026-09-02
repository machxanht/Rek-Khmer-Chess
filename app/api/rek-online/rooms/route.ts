import { createRoom } from '@/lib/rek-online/room-store'
import { onlineError, onlineJson, readJsonBody } from '@/lib/rek-online/http'
import type { CreateOnlineRoomResponse } from '@/lib/rek-online/types'
import type { GameMode } from '@/lib/rek-engine'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request)
    const mode: GameMode = body.mode === 'MIN_REK_CHANH' ? 'MIN_REK_CHANH' : 'REK_POAT'
    const created = createRoom({
      mode,
      name: typeof body.name === 'string' ? body.name : undefined,
    })

    return onlineJson<CreateOnlineRoomResponse>(
      {
        ...created,
        storage: 'memory-mvp',
      },
      201,
    )
  } catch (error) {
    return onlineError(error)
  }
}
