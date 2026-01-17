export const AUTH_CONFIG = {
	issuer: 'hysteria',
	audience: 'hysteria-users',
	accessToken: {
		expiresIn: '15m',
		seconds: 60 * 15,
	},
	refreshToken: {
		days: 7,
		seconds: 60 * 60 * 24 * 7,
	},
}

export const AUTH_ENV = {
	accessTokenSecret: process.env.JWT_SECRET,
	refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
}
