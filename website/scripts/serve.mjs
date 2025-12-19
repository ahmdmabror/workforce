import http from 'node:http'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createReadStream } from 'node:fs'
import * as fs from 'node:fs/promises'

const distClientDir = path.resolve(process.cwd(), 'dist/client')

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'application/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.gif':
      return 'image/gif'
    case '.webp':
      return 'image/webp'
    case '.ico':
      return 'image/x-icon'
    case '.webmanifest':
      return 'application/manifest+json; charset=utf-8'
    case '.woff2':
      return 'font/woff2'
    case '.woff':
      return 'font/woff'
    case '.ttf':
      return 'font/ttf'
    default:
      return undefined
  }
}

async function tryServeStatic(req, res) {
  const url = new URL(req.url || '/', 'http://localhost')
  const pathname = decodeURIComponent(url.pathname)

  const isLikelyAsset =
    pathname.startsWith('/assets/') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webmanifest') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.ttf')

  if (!isLikelyAsset) return false

  const fsPath = path.resolve(distClientDir, '.' + pathname)
  if (!fsPath.startsWith(distClientDir + path.sep) && fsPath !== distClientDir) return false

  try {
    const stat = await fs.stat(fsPath)
    if (!stat.isFile()) return false

    const contentType = getContentType(fsPath)
    if (contentType) res.setHeader('content-type', contentType)
    res.setHeader('cache-control', 'public, max-age=31536000, immutable')
    res.statusCode = 200
    createReadStream(fsPath).pipe(res)
    return true
  } catch {
    return false
  }
}

async function readBody(req) {
  const method = (req.method || 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD') return undefined
  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

async function toFetchRequest(req) {
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
  const url = new URL(req.url || '/', `${proto}://${host}`)

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'undefined') continue
    headers.set(key, Array.isArray(value) ? value.join(',') : value)
  }

  const body = await readBody(req)
  return new Request(url, { method: req.method, headers, body: body ?? undefined })
}

async function sendResponse(res, response) {
  res.statusCode = response.status
  res.statusMessage = response.statusText
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'transfer-encoding') return
    res.setHeader(key, value)
  })
  const buf = Buffer.from(await response.arrayBuffer())
  res.end(buf)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const serverPath = path.resolve(here, '../dist/server/server.js')
const { default: serverEntry } = await import(pathToFileURL(serverPath).href)

const port = Number.parseInt(process.env.PORT || '3000', 10)

http
  .createServer(async (req, res) => {
    try {
      if (await tryServeStatic(req, res)) return
      const request = await toFetchRequest(req)
      const response = await serverEntry.fetch(request, { context: {} })
      await sendResponse(res, response)
    } catch (err) {
      res.statusCode = 500
      res.setHeader('content-type', 'text/plain; charset=utf-8')
      res.end(String(err?.stack || err))
    }
  })
  .listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
  })

