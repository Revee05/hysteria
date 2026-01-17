import { COOKIE_NAMES, COOKIE_OPTIONS } from '../config/cookie.config.js'

export function setAuthCookies(response, { accessToken, refreshToken }) {
	response.cookies.set(COOKIE_NAMES.access, accessToken, COOKIE_OPTIONS.access)
	response.cookies.set(COOKIE_NAMES.refresh, refreshToken, COOKIE_OPTIONS.refresh)
	return response
}

export function clearAuthCookies(response) {
	response.cookies.set(COOKIE_NAMES.access, '', { ...COOKIE_OPTIONS.access, maxAge: 0 })
	response.cookies.set(COOKIE_NAMES.refresh, '', { ...COOKIE_OPTIONS.refresh, maxAge: 0 })
	return response
}

export function setCsrfCookie(response, token) {
	response.cookies.set(COOKIE_NAMES.csrf, token, COOKIE_OPTIONS.csrf)
	return response
}

export function getCookie(request, name) {
	return request.cookies.get(name)?.value
}

export function getCsrfFromRequest(request) {
	const csrfCookie = request.cookies.get(COOKIE_NAMES.csrf)?.value
	const csrfHeader = request.headers.get('x-csrf-token')
	return { csrfCookie, csrfHeader }
}
