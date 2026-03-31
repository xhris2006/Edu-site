const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true })
}

async function cleanupPath(targetPath) {
  if (!targetPath) return
  await fsp.rm(targetPath, { recursive: true, force: true })
}

async function moveFile(sourcePath, destinationPath) {
  await ensureDir(path.dirname(destinationPath))
  await fsp.copyFile(sourcePath, destinationPath)
  await cleanupPath(sourcePath)
}

async function fileExists(filePath) {
  try {
    await fsp.access(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

module.exports = {
  ensureDir,
  cleanupPath,
  moveFile,
  fileExists,
}
