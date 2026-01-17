import { AUTH_CONFIG } from './auth.config.js'

export const COOKIE_NAMES = {
	access: 'accessToken',
	refresh: 'refreshToken',
	csrf: 'csrfToken',
}

const isProd = process.env.NODE_ENV === 'production'

export const COOKIE_OPTIONS = {
	access: {
		httpOnly: true,
		secure: isProd,
		sameSite: 'strict',
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
	csrf: {
		httpOnly: false,
		secure: isProd,
		sameSite: 'strict',
		path: '/',
		maxAge: 60 * 60,
	},
}
