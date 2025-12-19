import startServer from './dist/server/server.js'
import { createApp, serve } from 'h3-v2/node'

const port = Number(process.env.PORT ?? 3000)
const hostname = process.env.HOST ?? '0.0.0.0'

const app = createApp()

// `dist/server/server.js` is a TanStack Start "fetch" entry (it does not listen on a port by itself).
// Mount it into an HTTP server for Node/Docker.
app.mount('/', typeof startServer?.fetch === 'function' ? startServer.fetch : startServer)

console.log(`Server listening on http://${hostname}:${port}`)
serve(app, { port, hostname })

