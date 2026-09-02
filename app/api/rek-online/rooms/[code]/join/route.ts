import { joinRoom } from '@/lib/rek-online/room-store'
import { onlineError, onlineJson, readJsonBody } from '@/lib/rek-online/http'
import type { JoinOnlineRoomResponse } from '@/lib/rek-online/types'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params
    const body = await readJsonBody(request)
    const joined = joinRoom(code, {
      name: typeof body.name === 'string' ? body.name : undefined,
    })

    return onlineJson<JoinOnlineRoomResponse>(
      {
        ...joined,
        storage: 'memory-mvp',
      },
      201,
    )
  } catch (error) {
    return onlineError(error)
  }
}
