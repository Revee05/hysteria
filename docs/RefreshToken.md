# Refresh Token & Token Rotation System

## 📋 Overview

Sistem refresh token dengan automatic rotation telah diimplementasikan untuk menjaga keamanan autentikasi aplikasi. Sistem ini menggunakan kombinasi **access token** (JWT) dan **refresh token** (random token) dengan mekanisme rotation otomatis.

## 🔑 Token Types

### 1. Access Token (JWT)
- **Lifetime**: 1 menit (60 detik) - Sesuai config di `AUTH_CONFIG.accessToken.seconds`
- **Storage**: HTTP-only cookie dengan nama `accessToken`
- **Purpose**: Mengakses protected resources/endpoints
- **Format**: JWT (JSON Web Token) dengan payload berisi user info
- **Security**: Short-lived untuk meminimalkan risiko jika token dicuri

### 2. Refresh Token
- **Lifetime**: 7 hari - Sesuai config di `AUTH_CONFIG.refreshToken.seconds`
- **Storage**: HTTP-only cookie dengan nama `refreshToken`
- **Purpose**: Mendapatkan access token baru tanpa login ulang
- **Format**: Random 48-byte hex string (96 characters)
- **Security**: Disimpan sebagai hash di database dengan rotation mechanism

## 🔄 Token Rotation Flow

### Login Process
```
User Login
    ↓
Validate Credentials
    ↓
Generate Access Token (JWT)
    ↓
Generate Refresh Token (random)
    ↓
Hash & Save Refresh Token to DB
    ↓
Set Both Tokens in HTTP-only Cookies
    ↓
Return Success Response
```

### Token Refresh Process
```
Access Token Expired/Invalid
    ↓
Client/Middleware Calls /api/auth/refresh
    ↓
Validate Refresh Token:
  - Check exists in DB (by hash)
  - Check not revoked
  - Check not expired
  - Check user is active
    ↓
Generate NEW Access Token
    ↓
Generate NEW Refresh Token (rotation)
    ↓
Revoke OLD Refresh Token:
  - Set revokedAt = now
  - Set replacedByTokenHash = new token hash
    ↓
Save NEW Refresh Token to DB
    ↓
Set Both NEW Tokens in Cookies
    ↓
Return Success Response
```

### Logout Process
```
User Logout
    ↓
Revoke All User's Refresh Tokens
    ↓
Clear All Auth Cookies
    ↓
Return Success Response
```

## 🛡️ Security Features

### 1. Token Rotation
- Setiap kali refresh token digunakan, token lama di-revoke dan diganti dengan yang baru
- Mencegah replay attacks
- Token yang dicuri hanya bisa digunakan sekali

### 2. Token Hashing
- Refresh token disimpan sebagai hash (SHA-256) di database
- Jika database bocor, attacker tidak bisa menggunakan token

### 3. Revocation Tracking
- Field `revokedAt`: Timestamp kapan token di-revoke
- Field `replacedByTokenHash`: Hash dari token pengganti (untuk audit trail)
- Memungkinkan detection of token reuse attempts

### 4. HTTP-only Cookies
- Tokens tidak bisa diakses via JavaScript
- Mencegah XSS attacks

### 5. Expiration Checks
- Access token: 1 menit
- Refresh token: 7 hari
- Automatic cleanup expired tokens

## 🔧 Implementation Details

### Database Schema (Prisma)
```prisma
model RefreshToken {
  id                  Int       @id @default(autoincrement())
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId              Int
  tokenHash           String    @db.VarChar(255)
  replacedByTokenHash String?   @db.VarChar(255)
  expiresAt           DateTime
  revokedAt           DateTime?
  createdAt           DateTime  @default(now())

  @@index([userId])
}
```

### Key Files

#### 1. Middleware (`middleware/auth.middleware.js`)
**Purpose**: Server-side automatic token refresh

**Features**:
- Intercepts requests ke protected routes (`/admin/*`)
- Verifikasi access token
- Auto-refresh jika access token expired
- Redirect ke login jika refresh gagal

**Flow**:
```javascript
Request to /admin/*
    ↓
Check Access Token
    ↓
If Valid → Allow Request
    ↓
If Invalid/Expired:
    ↓
    Check Refresh Token
        ↓
    If Valid:
        ↓
        Attempt Token Refresh
            ↓
        If Success → Set New Tokens → Allow Request
            ↓
        If Fail → Redirect to Login
    ↓
    If No Refresh Token → Redirect to Login
```

**Key Code**:
```javascript
export async function middleware(request) {
  const accessToken = request.cookies.get(COOKIE_NAMES.access)?.value
  const refreshToken = request.cookies.get(COOKIE_NAMES.refresh)?.value

  if (!accessToken) {
    if (refreshToken) {
      const refreshResult = await attemptTokenRefresh(refreshToken)
      if (refreshResult.success) {
        return createResponseWithNewTokens(request, refreshResult.tokens)
      }
    }
    return redirectToLogin(request)
  }

  try {
    verifyAccessToken(accessToken)
    return NextResponse.next()
  } catch (err) {
    if (refreshToken) {
      const refreshResult = await attemptTokenRefresh(refreshToken)
      if (refreshResult.success) {
        return createResponseWithNewTokens(request, refreshResult.tokens)
      }
    }
    return redirectToLogin(request)
  }
}
```

#### 2. Auth Context (`lib/context/auth-context.jsx`)
**Purpose**: Client-side proactive token refresh

**Features**:
- Auto-refresh access token 10 detik sebelum expired
- Prevents token expiration during user activity
- Handles refresh failures with redirect to login

**Configuration**:
```javascript
const ACCESS_TOKEN_LIFETIME = 60 * 1; // 1 menit
const REFRESH_BEFORE_EXPIRY = 10; // Refresh 10 detik sebelum expired
const REFRESH_INTERVAL = (ACCESS_TOKEN_LIFETIME - REFRESH_BEFORE_EXPIRY) * 1000;
```

**Flow**:
```javascript
User Authenticated
    ↓
Start Refresh Timer (50 seconds)
    ↓
Timer Expires
    ↓
Call /api/auth/refresh
    ↓
If Success:
    ↓
    Schedule Next Refresh
    ↓
If Fail:
    ↓
    Redirect to Login
```

**Key Code**:
```javascript
useEffect(() => {
  if (!isAuthenticated || !csrfToken) {
    return;
  }

  const refreshAccessToken = async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
      });

      if (res.ok) {
        scheduleNextRefresh();
      } else {
        window.location.href = "/auth/login";
      }
    } finally {
      isRefreshingRef.current = false;
    }
  };

  const scheduleNextRefresh = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      refreshAccessToken();
    }, REFRESH_INTERVAL);
  };

  scheduleNextRefresh();

  return () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
  };
}, [isAuthenticated, csrfToken]);
```

#### 3. API Client (`lib/api-client.js`)
**Purpose**: Automatic retry on 401 errors

**Features**:
- Detects 401 (Unauthorized) responses
- Automatically calls refresh endpoint
- Retries original request with new token
- Request queuing during refresh (prevents duplicate refresh calls)

**Flow**:
```javascript
API Request
    ↓
First Attempt
    ↓
Response 401?
    ↓
Yes:
    ↓
    If Already Refreshing:
        ↓
        Queue Request
        ↓
        Wait for Refresh
    ↓
    If Not Refreshing:
        ↓
        Call /api/auth/refresh
        ↓
        If Success:
            ↓
            Process Queued Requests
            ↓
            Retry Original Request
        ↓
        If Fail:
            ↓
            Redirect to Login
No:
    ↓
    Return Response
```

**Key Code**:
```javascript
export async function apiFetch(url, options = {}, csrfToken = '') {
  const fetchOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  if (csrfToken && fetchOptions.method && fetchOptions.method !== 'GET') {
    fetchOptions.headers['x-csrf-token'] = csrfToken
  }

  let response = await fetch(url, fetchOptions)

  // Auto-refresh on 401
  if (response.status === 401 && !url.includes('/api/auth/')) {
    try {
      await refreshAccessToken(csrfToken)
      response = await fetch(url, fetchOptions)
    } catch (refreshError) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      throw refreshError
    }
  }

  return response
}
```

#### 4. Refresh Endpoint (`app/api/auth/refresh/route.js`)
**Purpose**: Token refresh API endpoint

**Security Checks**:
- CSRF token validation
- Refresh token existence
- Token not revoked
- Token not expired
- User is active

**Response**:
```javascript
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "roles": ["ADMIN"],
      "status": "ACTIVE"
    }
  }
}
```

#### 5. Services

**Token Service** (`modules/auth/services/token.service.js`):
- `createAccessToken(payload)`: Generate JWT
- `parseAccessToken(token)`: Verify & decode JWT

**Refresh Token Service** (`modules/auth/services/refresh-token.service.js`):
- `generateRefreshToken()`: Create random token
- `createRefreshToken(userId)`: Save to DB
- `rotateRefreshToken(currentToken)`: Rotation mechanism
- `revokeUserRefreshTokens(userId)`: Revoke all user tokens

**Repository** (`modules/auth/repositories/refresh-token.repository.js`):
- `createRefreshToken(data)`: DB create
- `findRefreshTokenByHash(tokenHash)`: DB find
- `revokeRefreshToken(tokenHash, replacedByTokenHash)`: DB update
- `revokeAllRefreshTokens(userId)`: DB bulk update

## 📊 Token Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER LOGIN                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
            ┌────────────────────────┐
            │  Access Token: 1 min   │
            │  Refresh Token: 7 days │
            └────────────┬───────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
         ↓                                ↓
┌─────────────────┐            ┌──────────────────┐
│ Access Expired  │            │  User Active     │
│ (after ~1 min)  │            │  (within 1 min)  │
└────────┬────────┘            └──────────────────┘
         │                                │
         ↓                                ↓
┌──────────────────────────┐     ┌───────────────┐
│ Auto Refresh Triggered   │     │  Continue     │
│ (Middleware/Context/API) │     │  Using App    │
└────────┬─────────────────┘     └───────────────┘
         │
         ↓
┌──────────────────────────┐
│  Validate Refresh Token  │
│  - Not revoked           │
│  - Not expired           │
│  - User active           │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │         │
Valid?    Invalid?
    │         │
    ↓         ↓
┌───────┐  ┌────────────┐
│Refresh│  │Redirect to │
│Success│  │   Login    │
└───┬───┘  └────────────┘
    │
    ↓
┌─────────────────────────┐
│ Generate New Tokens     │
│ - New Access Token      │
│ - New Refresh Token     │
│ - Revoke Old Token      │
│ - Save replacedByHash   │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Update Cookies          │
│ Continue User Session   │
└─────────────────────────┘
```

## 🎯 Usage Examples

### 1. Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Cookies automatically set:
// - accessToken (1 min)
// - refreshToken (7 days)
```

### 2. Making Authenticated Requests
```javascript
// Using auth context
const { apiCall } = useAuth();

const data = await apiCall('/api/admin/users', {
  method: 'GET'
});

// Automatically:
// - Includes cookies
// - Adds CSRF token
// - Handles 401 with refresh
// - Retries on success
```

### 3. Manual Refresh
```javascript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  credentials: 'include',
});

// New tokens set automatically in cookies
```

### 4. Logout
```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'x-csrf-token': csrfToken,
  },
  credentials: 'include',
});

// All refresh tokens revoked
// All cookies cleared
```

## ⚙️ Configuration

### Environment Variables
```env
# JWT Secret untuk Access Token
JWT_SECRET=your-super-secret-key-here

# Optional: Separate secret for refresh tokens
JWT_REFRESH_SECRET=your-refresh-secret-here
```

### Auth Config (`config/auth.config.js`)
```javascript
export const AUTH_CONFIG = {
  issuer: 'hysteria',
  audience: 'hysteria-users',
  accessToken: {
    expiresIn: '15m',      // JWT expiry string
    seconds: 60 * 1,       // Cookie maxAge (1 menit untuk testing)
  },
  refreshToken: {
    days: 7,               // Refresh token lifetime
    seconds: 60 * 60 * 24 * 7, // Cookie maxAge (7 hari)
  },
}
```

### Cookie Config (`config/cookie.config.js`)
```javascript
export const COOKIE_OPTIONS = {
  access: {
    httpOnly: true,        // Prevent XSS
    secure: isProd,        // HTTPS only in production
    sameSite: 'strict',    // CSRF protection
    path: '/',
    maxAge: AUTH_CONFIG.accessToken.seconds,
  },
  refresh: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: AUTH_CONFIG.refreshToken.seconds,
  },
}
```

## 🚨 Error Handling

### Common Errors

1. **INVALID_REFRESH_TOKEN**
   - Token tidak ditemukan di database
   - Action: Redirect to login

2. **REVOKED_REFRESH_TOKEN**
   - Token sudah di-revoke (digunakan sebelumnya)
   - Possible attack: Token reuse attempt
   - Action: Revoke semua user tokens, redirect to login

3. **EXPIRED_REFRESH_TOKEN**
   - Token sudah expired (> 7 hari)
   - Action: Redirect to login

4. **USER_INACTIVE**
   - User status bukan ACTIVE (bisa SUSPENDED, BANNED, dll)
   - Action: Return 403 Forbidden

5. **CSRF_INVALID**
   - CSRF token tidak valid
   - Action: Return 403 Forbidden

## 🔍 Monitoring & Logging

### Logged Events
- User login success/failure
- Token refresh success/failure
- Token rotation
- Token revocation
- Suspicious activity (token reuse)

### Example Log Entries
```javascript
// Success
logger.info('Token refreshed successfully', { userId: 123 })

// Warning
logger.warn('Refresh token rotation failed: token revoked', { 
  userId: 123,
  tokenHash: 'abc...' 
})

// Error
logger.error('Token refresh failed', { 
  error: 'Token not found',
  userId: 123 
})
```

## 🛠️ Maintenance

### Database Cleanup
Periodically clean up expired/revoked tokens:

```sql
-- Delete expired refresh tokens older than 30 days
DELETE FROM "RefreshToken"
WHERE "expiresAt" < NOW() - INTERVAL '30 days';

-- Delete revoked tokens older than 30 days
DELETE FROM "RefreshToken"
WHERE "revokedAt" IS NOT NULL 
  AND "revokedAt" < NOW() - INTERVAL '30 days';
```

### Audit Trail
Check token replacement chain:

```sql
-- Find token replacement history
SELECT 
  id,
  "userId",
  "tokenHash",
  "replacedByTokenHash",
  "revokedAt",
  "expiresAt",
  "createdAt"
FROM "RefreshToken"
WHERE "userId" = 123
ORDER BY "createdAt" DESC;
```

## 📝 Best Practices

1. **Never log actual tokens** - Only log hashes or IDs
2. **Use HTTPS in production** - Secure cookies require it
3. **Monitor for suspicious patterns** - Multiple rapid refreshes
4. **Implement rate limiting** - Prevent brute force on refresh endpoint
5. **Regular token cleanup** - Remove old expired tokens
6. **Keep secrets secure** - Use environment variables
7. **Rotate JWT secrets periodically** - Update JWT_SECRET every few months
8. **Test token expiration** - Verify auto-refresh works correctly

## 🔐 Security Considerations

### Potential Attacks & Mitigations

1. **Token Theft (XSS)**
   - ✅ HTTP-only cookies prevent JavaScript access
   - ✅ SameSite=strict prevents CSRF

2. **Token Replay**
   - ✅ Token rotation - each token usable once
   - ✅ Revocation tracking

3. **Man-in-the-Middle (MITM)**
   - ✅ Secure cookies (HTTPS only in production)
   - ⚠️ Ensure HTTPS enabled in production

4. **Brute Force**
   - ⚠️ Implement rate limiting on refresh endpoint
   - ⚠️ Monitor failed refresh attempts

5. **Token Reuse Detection**
   - ✅ Check revokedAt before use
   - ✅ Store replacedByTokenHash for audit
   - 🔄 Consider: Revoke all user tokens on detected reuse

## 📚 References

- [OAuth 2.0 Token Rotation](https://oauth.net/2/grant-types/refresh-token/)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## 📞 Support

Untuk pertanyaan atau issues terkait refresh token system, silakan buat issue di repository atau hubungi tim development.

---

**Last Updated**: January 18, 2026
**Version**: 1.0.0
