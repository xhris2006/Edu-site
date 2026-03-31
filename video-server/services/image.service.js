const path = require('path')
const fsp = require('fs/promises')
const axios = require('axios')
const { log } = require('../logger')
const { ensureDir } = require('../utils/fs-utils')

function buildPollinationsUrl(prompt, index) {
  const search = new URLSearchParams({
    width: '1280',
    height: '720',
    model: 'flux',
    seed: String(Date.now() + index),
    nologo: 'true',
    enhance: 'true',
  })

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${search.toString()}`
}

async function downloadImage(imageUrl, outputPath) {
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 60000,
  })

  await fsp.writeFile(outputPath, response.data)
  return outputPath
}

async function downloadPromptImages(prompts, outputDir) {
  await ensureDir(outputDir)

  const images = []
  for (const [index, prompt] of prompts.entries()) {
    const imageUrl = buildPollinationsUrl(prompt, index)
    const outputPath = path.join(outputDir, `scene-${String(index + 1).padStart(2, '0')}.png`)

    log('images', `Downloading image ${index + 1}/${prompts.length}`)
    await downloadImage(imageUrl, outputPath)

    images.push({
      prompt,
      imageUrl,
      filePath: outputPath,
    })
  }

  return images
}

module.exports = {
  downloadImage,
  downloadPromptImages,
}
