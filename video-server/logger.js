function timestamp() {
  return new Date().toISOString()
}

function log(scope, message, extra) {
  const prefix = `[video-server][${timestamp()}][${scope}]`
  if (typeof extra === 'undefined') {
    console.log(`${prefix} ${message}`)
    return
  }

  console.log(`${prefix} ${message}`, extra)
}

module.exports = {
  log,
}
