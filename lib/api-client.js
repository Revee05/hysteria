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
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  
  failedRequestsQueue = []
}

/**
 * Refresh access token menggunakan refresh token yang ada di cookie
 */
async function refreshAccessToken(csrfToken) {
  // Jika sudah ada proses refresh yang berjalan, tunggu prosesnya selesai
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
        credentials: 'include', // Penting: kirim cookies
      })

      if (!response.ok) {
        const error = new Error('Token refresh failed')
        processQueue(error, null)
        throw error
      }

      const data = await response.json()
      processQueue(null, data)
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
  // Tambahkan credentials dan headers default
  const fetchOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  // Tambahkan CSRF token jika ada dan method bukan GET
  if (csrfToken && fetchOptions.method && fetchOptions.method !== 'GET') {
    fetchOptions.headers['x-csrf-token'] = csrfToken
  }

  // First attempt
  let response = await fetch(url, fetchOptions)

  // Jika 401 dan bukan endpoint auth, coba refresh token
  if (response.status === 401 && !url.includes('/api/auth/')) {
    try {
      // Coba refresh token
      await refreshAccessToken(csrfToken)

      // Retry request dengan token baru
      response = await fetch(url, fetchOptions)
    } catch (refreshError) {
      // Jika refresh gagal, redirect ke login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
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
