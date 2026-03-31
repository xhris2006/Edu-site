const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '..')
const TEMP_ROOT = path.join(ROOT_DIR, 'tmp', 'video-generation')
const PUBLIC_VIDEO_ROOT = path.join(ROOT_DIR, 'tmp', 'generated-videos')
const PORT = Number(process.env.VIDEO_SERVER_PORT || process.env.PORT || 4000)
const HOST = process.env.VIDEO_SERVER_HOST || '0.0.0.0'
const BASE_URL = process.env.VIDEO_SERVER_BASE_URL || `http://localhost:${PORT}`
const IMAGE_COUNT_MIN = 3
const IMAGE_COUNT_MAX = 5
const IMAGE_DURATION_SECONDS = Number(process.env.VIDEO_IMAGE_DURATION_SECONDS || 2.5)
const VIDEO_SIZE = process.env.VIDEO_SIZE || '1280x720'
const VIDEO_FPS = Number(process.env.VIDEO_FPS || 25)
const OUTPUT_RETENTION_MS = Number(process.env.VIDEO_OUTPUT_RETENTION_MS || 1000 * 60 * 15)
const ENABLE_VOICEOVER = String(process.env.VIDEO_ENABLE_VOICEOVER || 'true').toLowerCase() !== 'false'

module.exports = {
  ROOT_DIR,
  TEMP_ROOT,
  PUBLIC_VIDEO_ROOT,
  PORT,
  HOST,
  BASE_URL,
  IMAGE_COUNT_MIN,
  IMAGE_COUNT_MAX,
  IMAGE_DURATION_SECONDS,
  VIDEO_SIZE,
  VIDEO_FPS,
  OUTPUT_RETENTION_MS,
  ENABLE_VOICEOVER,
}
