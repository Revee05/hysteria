export const AUTH_CONFIG = {
	issuer: 'hysteria',
	audience: 'hysteria-users',
	accessToken: {
		expiresIn: '1m', // Harus sama dengan seconds
		seconds: 60 * 1, // 1 menit
	},
	refreshToken: {
		days: 7,
		seconds: 60 * 60 * 24 * 7, // 7 hari
	},
}

export const AUTH_ENV = {
	accessTokenSecret: process.env.JWT_SECRET,
	refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
}
