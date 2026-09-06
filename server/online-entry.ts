import { createOnlineServer } from './online-server'

const port = Number(process.env.REK_WS_PORT ?? 8787)
const host = process.env.REK_WS_HOST || undefined
const server = createOnlineServer({ port, host })

server.on('listening', () => {
  console.log(`Rek online server listening on ws://${host ?? 'localhost'}:${port}`)
})
