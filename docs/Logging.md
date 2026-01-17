# Logging System

Logger telah diimplementasikan di seluruh aplikasi menggunakan **Winston**.

## Lokasi File Log

Log disimpan di folder `logs/`:
- `logs/app.log` - Semua log (info, warn, error)
- `logs/error.log` - Hanya error log

File log **tidak** di-commit ke git (sudah ada di `.gitignore`).

## Penggunaan

### Import Logger

```javascript
// CommonJS (untuk seed files, scripts)
const logger = require('../lib/logger')

// ES Modules (untuk API routes, services)
import logger from '../lib/logger.js'
```

### Level Logging

```javascript
// Info - untuk operasi normal
logger.info('User logged in', { userId: 123, email: 'user@example.com' })

// Warning - untuk kondisi yang perlu perhatian tapi tidak kritis
logger.warn('Invalid login attempt', { email: 'test@example.com' })

// Error - untuk error yang harus ditangani
logger.error('Database connection failed', { error: err.message, stack: err.stack })
```

### Helper Functions (API Routes)

```javascript
import { logInfo, logWarning, logError } from '../lib/api-logger.js'

// Logging dengan context
logInfo('Processing request', { userId: 123 })
logWarning('Rate limit approaching', { ip: '127.0.0.1' })
logError('Payment failed', error, { orderId: 456 })
```

### Auto-Logging di API Routes

Gunakan `withApiLogging` untuk logging otomatis request/response:

```javascript
import { withApiLogging } from '../../../../lib/api-logger.js'

export const POST = withApiLogging(async (request) => {
  // Your handler code
  return NextResponse.json({ success: true })
}, 'CreateUser')
```

## File yang Sudah Menggunakan Logger

### API Routes
- ✅ `app/api/auth/login/route.js`
- ✅ `app/api/auth/logout/route.js`
- ✅ `app/api/auth/refresh/route.js`

### Services
- ✅ `modules/auth/services/auth.service.js`
- ✅ `modules/auth/services/refresh-token.service.js`

### Utilities
- ✅ `EXP/db.js`
- ✅ `lib/response.js` (auto-logging untuk semua error responses)

### Seed Files
- ✅ `prisma/seed/001-create-test-pg.js`
- ✅ `prisma/seed/002-test-pg.js`
- ✅ `prisma/seed/003-create-more-test-pg.js`
- ✅ `prisma/seed/004-seed-roles.js`
- ✅ `prisma/seed/005-seed-statuses.js`
- ✅ `prisma/seed/006-create-admin-user.js`
- ✅ `prisma/seed/index.js`

## Konfigurasi

Edit `lib/logger.js` untuk mengubah:
- Log level (default: `info`)
- Format log
- Lokasi file output
- Transports tambahan (email, Slack, dll)

### Environment Variable

Set log level via environment:
```bash
LOG_LEVEL=debug npm run dev
```

Level yang tersedia: `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`

## Contoh Log Output

**Console:**
```
info: User logged in successfully {"email":"admin@example.com","userId":1}
```

**File (logs/app.log):**
```
2026-01-17 14:43:02 info: User logged in successfully {"email":"admin@example.com","userId":1}
2026-01-17 14:43:35 warn: Login attempt with invalid password {"email":"hacker@example.com"}
2026-01-17 14:44:12 error: Database connection failed {"error":"Connection timeout","stack":"..."}
```

## Best Practices

1. **Jangan log data sensitif** (password, token lengkap)
2. **Gunakan metadata object** untuk structured logging
3. **Log semua error** dengan stack trace
4. **Log operasi penting** (login, logout, perubahan data)
5. **Gunakan level yang tepat**:
   - `info` untuk operasi normal
   - `warn` untuk kondisi tidak biasa tapi tidak fatal
   - `error` untuk error yang harus diinvestigasi

## Monitoring

Cek log secara berkala:

```bash
# Lihat log terbaru
Get-Content .\logs\app.log -Tail 50

# Monitor log secara real-time
Get-Content .\logs\app.log -Wait -Tail 10

# Cari error tertentu
Select-String -Path .\logs\error.log -Pattern "Database"
```
