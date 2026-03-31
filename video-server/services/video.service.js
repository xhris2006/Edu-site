const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')
const ffprobePath = require('ffprobe-static').path
const { VIDEO_FPS, VIDEO_SIZE, IMAGE_DURATION_SECONDS } = require('../config')
const { log } = require('../logger')

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

function createVideoFromAssets({ imagePaths, outputPath, audioPath }) {
  log('video', 'Starting FFmpeg composition')

  return new Promise((resolve, reject) => {
    const command = ffmpeg()

    imagePaths.forEach(imagePath => {
      command.input(imagePath).inputOptions([`-loop 1`, `-t ${IMAGE_DURATION_SECONDS}`])
    })

    if (audioPath) {
      command.input(audioPath)
    }

    const filterParts = []

    imagePaths.forEach((_, index) => {
      filterParts.push(
        `[${index}:v]scale=${VIDEO_SIZE},zoompan=z='min(zoom+0.0008,1.12)':d=${Math.floor(VIDEO_FPS * IMAGE_DURATION_SECONDS)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',fps=${VIDEO_FPS},format=yuv420p[v${index}]`
      )
    })

    const concatInputs = imagePaths.map((_, index) => `[v${index}]`).join('')
    filterParts.push(`${concatInputs}concat=n=${imagePaths.length}:v=1:a=0[vout]`)

    command
      .complexFilter(filterParts, 'vout')
      .outputOptions([
        '-map [vout]',
        ...(audioPath ? [`-map ${imagePaths.length}:a`, '-shortest'] : []),
        '-c:v libx264',
        '-pix_fmt yuv420p',
        `-r ${VIDEO_FPS}`,
        '-movflags +faststart',
      ])
      .on('start', cmd => log('video', 'FFmpeg command started', cmd))
      .on('end', () => {
        log('video', 'FFmpeg composition finished')
        resolve(outputPath)
      })
      .on('error', err => {
        reject(err)
      })
      .save(outputPath)
  })
}

module.exports = {
  createVideoFromAssets,
}
