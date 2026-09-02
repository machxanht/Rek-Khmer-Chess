import { submitRoomMove } from '@/lib/rek-online/room-store'
import { onlineError, onlineJson, readJsonBody } from '@/lib/rek-online/http'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params
    const body = await readJsonBody(request)
    const room = submitRoomMove(code, {
      token: typeof body.token === 'string' ? body.token : '',
      from: typeof body.from === 'number' ? body.from : Number.NaN,
      to: typeof body.to === 'number' ? body.to : Number.NaN,
      expectedMoveCount:
        typeof body.expectedMoveCount === 'number' ? body.expectedMoveCount : Number.NaN,
    })
    return onlineJson(room)
  } catch (error) {
    return onlineError(error)
  }
}
