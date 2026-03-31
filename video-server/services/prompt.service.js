const { IMAGE_COUNT_MAX, IMAGE_COUNT_MIN } = require('../config')

function clampImageCount(value) {
  if (!value || Number.isNaN(value)) return 4
  return Math.max(IMAGE_COUNT_MIN, Math.min(IMAGE_COUNT_MAX, value))
}

function buildSceneBlueprints(prompt) {
  return [
    `Opening scene for "${prompt}", cinematic establishing shot, golden hour, ultra detailed, storytelling, dramatic lighting, 16:9`,
    `Character or subject introduced for "${prompt}", cinematic medium shot, emotional depth, rich colors, sharp focus, storytelling, 16:9`,
    `Key action moment inspired by "${prompt}", dynamic composition, motion energy, cinematic framing, volumetric lighting, 16:9`,
    `Climactic emotional payoff for "${prompt}", epic cinematic scene, high contrast, immersive atmosphere, storytelling, 16:9`,
    `Ending frame for "${prompt}", hopeful closing shot, cinematic wide angle, polished details, memorable storytelling, 16:9`,
  ]
}

function generateImagePrompts(prompt, preferredCount) {
  const count = clampImageCount(Number(preferredCount))
  return buildSceneBlueprints(prompt).slice(0, count)
}

module.exports = {
  generateImagePrompts,
}
