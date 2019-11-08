
const log = require('loglevel')
const { serializeError } = require('eth-json-rpc-errors')
const EventEmitter = require('events')
const SafeEventEmitter = require('safe-event-emitter')

/**
 * Middleware configuration object
 *
 * @typedef {Object} MiddlewareConfig
 */

/**
 * json-rpc-engine middleware that both logs standard and non-standard error
 * messages and ends middleware stack traversal if an error is encountered
 *
 * @returns {Function} json-rpc-engine middleware function
 */
function createErrorMiddleware () {
  return (req, res, next) => {
    next(done => {
      const { error } = res
      if (!error) {
        return done()
      // legacy eth_accounts behavior
      } else if (req.method === 'eth_accounts' && error.code === 4100) {
        log.warn(`MetaMask - Ignored RPC Error: ${error.message}`, error)
        delete res.error
        res.result = []
        return done()
      }
      serializeError(error)
      log.error(`MetaMask - RPC Error: ${error.message}`, error)
      done()
    })
  }
}

/**
 * Logs a stream disconnection error. Emits an 'error' if bound to an
 * EventEmitter that has listeners for the 'error' event.
 * 
 * @param {string} remoteLabel - The label of the disconnected stream.
 * @param {Error} err - The associated error to log.
 */
function logStreamDisconnectWarning (remoteLabel, err) {
  let warningMsg = `MetamaskInpageProvider - lost connection to ${remoteLabel}`
  if (err) warningMsg += '\n' + err.stack
  console.warn(warningMsg)
  if (this instanceof EventEmitter || this instanceof SafeEventEmitter) {
    if (this.listenerCount('error') > 0) {
      this.emit('error', warningMsg)
    }
  }
}

module.exports = {
  createErrorMiddleware,
  logStreamDisconnectWarning,
}
