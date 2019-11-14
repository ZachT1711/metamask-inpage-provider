
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

/**
 * TODO:deprecate:2019-12-16
 * Adds hidden "then" and "catch" properties to the given object. If the given
 * object is returned from a function, it will behave like a plain object. If
 * the caller expects a Promise, it will behave like a Promise that resolves
 * to the value of the indicated property.
 *
 * @param {Object} obj - The object to make thenable.
 * @param {string} prop - The property whose value the object's then function resolves to.
 * @returns {Object} - The secretly thenable object.
 */
function makeThenable (obj, prop) {

  const defineOpts = {
    configurable: true, writable: true, enumerable: false,
  }

  // strange wrapping of Promise functions to fully emulate .then behavior,
  // specifically Promise chaining
  // there may be a simpler way of doing it, but this works
  const thenFunction = (consumerResolve, consumerCatch) => {
    return Promise.resolve().then(() => consumerResolve(obj[prop]), consumerCatch)
  }

  Object.defineProperty(obj, 'then', { ...defineOpts, value: thenFunction })

  // the Promise will never fail in our usage, so just make a no-op "catch"
  Object.defineProperty(obj, 'catch', { ...defineOpts, value: () => {} })

  return obj
}

module.exports = {
  createErrorMiddleware,
  logStreamDisconnectWarning,
  makeThenable,
}
