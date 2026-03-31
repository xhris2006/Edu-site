const express = require('express')
const path = require('path')
const crypto = require('crypto')
const { z } = require('zod')
const { generateImagePrompts } = require('../services/prompt.service')
const { downloadPromptImages } = require('../services/image.service')
const { synthesizeVoiceover } = require('../services/audio.service')
const { createVideoFromAssets } = require('../services/video.service')
const { log } = require('../logger')
const { BASE_URL, ENABLE_VOICEOVER, OUTPUT_RETENTION_MS, PUBLIC_VIDEO_ROOT, TEMP_ROOT } = require('../config')
const { cleanupPath, ensureDir, moveFile } = require('../utils/fs-utils')

const router = express.Router()

const requestSchema = z.object({
  prompt: z.string().min(10).max(1000),
  imageCount: z.number().int().min(3).max(5).optional(),
  voiceover: z.boolean().optional(),
  responseType: z.enum(['json', 'download']).optional(),
})

function scheduleCleanup(filePath) {
  setTimeout(() => {
    cleanupPath(filePath).catch(() => null)
  }, OUTPUT_RETENTION_MS)
}

router.post('/generate-video', async (req, res) => {
  let jobDir = ''

  try {
    const payload = requestSchema.parse(req.body)
    const jobId = crypto.randomUUID()
    jobDir = path.join(TEMP_ROOT, jobId)
    const assetsDir = path.join(jobDir, 'assets')
    const outputDir = path.join(jobDir, 'output')

    await ensureDir(assetsDir)
    await ensureDir(outputDir)
    await ensureDir(PUBLIC_VIDEO_ROOT)

    log('route', `Video generation requested for job ${jobId}`)

    const imagePrompts = generateImagePrompts(payload.prompt, payload.imageCount)
    log('prompts', `Generated ${imagePrompts.length} cinematic image prompts`)

    const images = await downloadPromptImages(imagePrompts, assetsDir)
    const imagePaths = images.map(item => item.filePath)

    let audioPath = null
    const shouldGenerateVoiceover = typeof payload.voiceover === 'boolean' ? payload.voiceover : ENABLE_VOICEOVER
    if (shouldGenerateVoiceover) {
      audioPath = await synthesizeVoiceover(payload.prompt, assetsDir)
    }

    const tempVideoPath = path.join(outputDir, 'final-video.mp4')
    await createVideoFromAssets({
      imagePaths,
      outputPath: tempVideoPath,
      audioPath,
    })

    const publicFilename = `${jobId}.mp4`
    const publicVideoPath = path.join(PUBLIC_VIDEO_ROOT, publicFilename)
    await moveFile(tempVideoPath, publicVideoPath)
    await cleanupPath(jobDir)
    scheduleCleanup(publicVideoPath)

    const videoUrl = `${BASE_URL}/generated-videos/${publicFilename}`
    log('route', `Video generation completed for job ${jobId}`)

    if (payload.responseType === 'download') {
      res.download(publicVideoPath, publicFilename, async () => {
        await cleanupPath(publicVideoPath).catch(() => null)
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Video generated successfully',
      data: {
        id: jobId,
        prompt: payload.prompt,
        imagePrompts,
        imageCount: imagePrompts.length,
        voiceoverIncluded: Boolean(audioPath),
        videoUrl,
        expiresInMs: OUTPUT_RETENTION_MS,
      },
    })
  } catch (error) {
    await cleanupPath(jobDir).catch(() => null)
    log('route', 'Video generation failed', error instanceof Error ? error.message : error)

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Invalid request payload',
      })
      return
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during video generation',
    })
  }
})

module.exports = router
