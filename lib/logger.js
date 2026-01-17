const fs = require('fs')
const path = require('path')
const { createLogger, format, transports } = require('winston')

const logDir = path.join(process.cwd(), 'logs')
try {
  fs.mkdirSync(logDir, { recursive: true })
} catch (e) {
  // ignore
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
      return `${timestamp} ${level}: ${message}${rest}`
    })
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'app.log') }),
    new transports.Console({ format: format.combine(format.colorize(), format.simple()) }),
  ],
})

module.exports = logger
