const path = require('path')
const GTTS = require('gtts')
const { log } = require('../logger')

function synthesizeVoiceover(text, outputDir) {
  const outputPath = path.join(outputDir, 'voiceover.mp3')

  log('audio', 'Generating voice-over audio')

  return new Promise((resolve, reject) => {
    const gtts = new GTTS(text, 'fr')
    gtts.save(outputPath, err => {
      if (err) {
        reject(err)
        return
      }
      resolve(outputPath)
    })
  })
}

module.exports = {
  synthesizeVoiceover,
}
