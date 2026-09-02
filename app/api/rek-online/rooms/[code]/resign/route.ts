import { resignRoom } from '@/lib/rek-online/room-store'
import { onlineError, onlineJson, readJsonBody } from '@/lib/rek-online/http'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params
    const body = await readJsonBody(request)
    const token = typeof body.token === 'string' ? body.token : ''
    return onlineJson(resignRoom(code, token))
  } catch (error) {
    return onlineError(error)
  }
}
