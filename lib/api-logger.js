import logger from './logger.js'

/**
 * Wrapper untuk logging request dan response di API routes
 * Gunakan di awal handler untuk logging otomatis
 */
export function withApiLogging(handler, routeName) {
  return async (request, ...args) => {
    const startTime = Date.now()
    const method = request.method
    const url = request.url || request.nextUrl?.pathname || 'unknown'
    
    logger.info(`${routeName} - Request started`, {
      method,
      url,
      route: routeName,
    })

    try {
      const response = await handler(request, ...args)
      const duration = Date.now() - startTime
      
      logger.info(`${routeName} - Request completed`, {
        method,
        url,
        route: routeName,
        status: response.status,
        duration: `${duration}ms`,
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      logger.error(`${routeName} - Request failed`, {
        method,
        url,
        route: routeName,
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`,
      })

      throw error
    }
  }
}

/**
 * Helper untuk logging error dengan context
 */
export function logError(context, error, metadata = {}) {
  logger.error(context, {
    error: error.message,
    stack: error.stack,
    code: error.code,
    ...metadata,
  })
}

/**
 * Helper untuk logging info dengan context
 */
export function logInfo(message, metadata = {}) {
  logger.info(message, metadata)
}

/**
 * Helper untuk logging warning dengan context
 */
export function logWarning(message, metadata = {}) {
  logger.warn(message, metadata)
}
