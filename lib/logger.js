const fs = require('fs')
const path = require('path')
const { createLogger, format, transports } = require('winston')

const logDir = path.join(process.cwd(), 'logs')
try { fs.mkdirSync(logDir, { recursive: true }) } catch (e) { /* ignore */ }

const getWeekStartDate = () => {
  const d = new Date()
  // treat Monday as start of week
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

const cleanupOldLogs = () => {
  const files = fs.readdirSync(logDir)
  const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000 // 1 tahun
  files.forEach(f => {
    const m = f.match(/^app-(\d{4}-\d{2}-\d{2})\.log(?:\.gz)?$/)
    if (!m) return
    const fileDate = new Date(m[1] + 'T00:00:00').getTime()
    if (fileDate < cutoff) {
      try { fs.unlinkSync(path.join(logDir, f)) } catch (e) { /* ignore */ }
    }
  })
}

let currentWeekStart = getWeekStartDate()
let fileTransport = new transports.File({ filename: path.join(logDir, `${currentWeekStart}-weekly.log`) })
const consoleTransport = new transports.Console({ format: format.combine(format.colorize(), format.simple()) })

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
      return `${timestamp} ${level}: ${message}${rest}`
    })
  ),
  transports: [fileTransport, consoleTransport],
})

const rotateIfNeeded = () => {
  const ws = getWeekStartDate()
  if (ws !== currentWeekStart) {
    try { logger.remove(fileTransport) } catch (e) { /* ignore */ }
    currentWeekStart = ws
    fileTransport = new transports.File({ filename: path.join(logDir, `app-${currentWeekStart}.log`) })
    logger.add(fileTransport)
    cleanupOldLogs()
  }
}

// check tiap jam; cukup ringan dan memastikan rotasi saat minggu berganti
setInterval(rotateIfNeeded, 60 * 60 * 1000)
rotateIfNeeded()

module.exports = logger
