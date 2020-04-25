var isDebug = true

function log(key, value) {
  if (isDebug) {
    console.log(key, value)
  }
}
function error(key, value) {
  if (isDebug) {
    console.error(key, value)
  }
}

module.exports = {
  log: log,
  error: error
}