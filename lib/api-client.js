/**
 * API Client with automatic token refresh
 * 
 * Utility untuk melakukan API calls dengan automatic retry jika access token expired.
 * Akan otomatis memanggil endpoint refresh dan retry request yang gagal.
 * 
 * Features:
 * - Automatic token refresh on 401 errors
 * - Request queuing during token refresh (prevents multiple refresh calls)
 * - CSRF token injection for non-GET requests
 * - Automatic redirect to login if refresh fails
 */

let isRefreshing = false
let refreshPromise = null
let failedRequestsQueue = []

/**
 * Process queued requests after successful token refresh
 */
function processQueue(error, token = null) {
  failedRequestsQueue.forEach(prom => {
    error ? prom.reject(error) : prom.resolve()
  })
  failedRequestsQueue = []
}

/**
 * Dispatch custom event dengan error handling
 */
function dispatchEvent(eventName, detail = {}) {
  if (typeof window === 'undefined') return
  
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  } catch (e) {
    // Ignore dispatch errors
  }
}

/**
 * Set session storage dengan error handling
 */
function setSessionMessage(key, message) {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.setItem(key, message)
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Redirect dengan delay untuk force logout
 */
function forceLogout(message) {
  setSessionMessage('auth:logoutMessage', message)
  dispatchEvent('force-logout', { message })
  
  setTimeout(() => {
    window.location.href = '/api/auth/logout'
  }, 2500)
}

/**
 * Redirect ke halaman login
 */
function redirectToLogin(message) {
  setSessionMessage('auth:logoutMessage', message)
  dispatchEvent('session-expired', { message })
  window.location.href = '/auth/login'
}

/**
 * Refresh access token menggunakan refresh token yang ada di cookie
 */
async function refreshAccessToken(csrfToken) {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      processQueue(null, data)
      dispatchEvent('token-refreshed')
      
      return data
    } catch (error) {
      processQueue(error, null)
      throw error
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Wrapper untuk fetch API dengan automatic token refresh
 * 
 * @param {string} url - URL endpoint
 * @param {object} options - Fetch options
 * @param {string} csrfToken - CSRF token untuk request
 * @returns {Promise<Response>}
 */
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

  if (response.status === 401 && !url.includes('/api/auth/')) {
    const errorData = await response.clone().json().catch(() => null)
    
    if (errorData?.code === 'INVALID_TOKEN_VERSION') {
      const message = 'Terjadi kesalahan. Silakan login kembali.'
      const error = new Error(message)
      error.code = 'INVALID_TOKEN_VERSION'
      
      if (typeof window !== 'undefined') {
        forceLogout(message)
      }
      
      throw error
    }
    
    try {
      await refreshAccessToken(csrfToken)
      response = await fetch(url, fetchOptions)
    } catch (refreshError) {
      if (typeof window !== 'undefined') {
        redirectToLogin('Terjadi kesalahan. Silakan login kembali.')
      }
      throw refreshError
    }
  }

  return response
}

/**
 * Helper untuk GET request
 */
export async function apiGet(url, csrfToken = '') {
  const response = await apiFetch(url, { method: 'GET' }, csrfToken)
  return response.json()
}

/**
 * Helper untuk POST request
 */
export async function apiPost(url, data, csrfToken = '') {
  const response = await apiFetch(
    url,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    csrfToken
  )
  return response.json()
}

/**
 * Helper untuk PUT request
 */
export async function apiPut(url, data, csrfToken = '') {
  const response = await apiFetch(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    csrfToken
  )
  return response.json()
}

/**
 * Helper untuk DELETE request
 */
export async function apiDelete(url, csrfToken = '') {
  const response = await apiFetch(
    url,
    {
      method: 'DELETE',
    },
    csrfToken
  )
  return response.json()
}
