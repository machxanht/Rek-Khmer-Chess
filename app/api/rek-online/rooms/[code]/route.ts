import { getRoomSnapshot } from '@/lib/rek-online/room-store'
import { onlineError, onlineJson } from '@/lib/rek-online/http'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params
    const token = new URL(request.url).searchParams.get('token') ?? ''
    return onlineJson(getRoomSnapshot(code, token))
  } catch (error) {
    return onlineError(error)
  }
}
