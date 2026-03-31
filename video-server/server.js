const express = require('express')
const path = require('path')
const { HOST, PORT, PUBLIC_VIDEO_ROOT, TEMP_ROOT } = require('./config')
const { ensureDir } = require('./utils/fs-utils')
const { log } = require('./logger')
const generateVideoRoute = require('./routes/generate-video.route')

async function bootstrap() {
  await ensureDir(TEMP_ROOT)
  await ensureDir(PUBLIC_VIDEO_ROOT)

  const app = express()

  app.use(express.json({ limit: '2mb' }))
  app.use('/generated-videos', express.static(PUBLIC_VIDEO_ROOT, { maxAge: '10m' }))

  app.get('/health', (_req, res) => {
    res.json({ success: true, status: 'ok' })
  })

  app.use(generateVideoRoute)

  app.use((err, _req, res, _next) => {
    log('server', 'Unhandled middleware error', err instanceof Error ? err.message : err)
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected server error',
    })
  })

  app.listen(PORT, HOST, () => {
    log('server', `Express video server listening on http://${HOST}:${PORT}`)
    log('server', `POST /generate-video is ready`)
  })
}

bootstrap().catch(error => {
  log('server', 'Failed to bootstrap video server', error instanceof Error ? error.stack : error)
  process.exit(1)
})
