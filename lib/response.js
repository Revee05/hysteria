import { NextResponse } from 'next/server'
import logger from './logger.js'

export class AppError extends Error {
	constructor(message, status = 400, code = 'BAD_REQUEST') {
		super(message)
		this.status = status
		this.code = code
	}
}

export function respondSuccess(data = null, status = 200) {
	return NextResponse.json({ success: true, data }, { status })
}

export function respondError(error) {
	const status = error?.status || 500
	const code = error?.code || 'INTERNAL_ERROR'
	const message = error?.message || 'Internal server error'
	
	// Log error otomatis untuk semua error responses
	if (status >= 500) {
		logger.error('Server error occurred', {
			code,
			message,
			status,
			stack: error?.stack,
		})
	} else if (status >= 400) {
		logger.warn('Client error occurred', {
			code,
			message,
			status,
		})
	}
	
	return NextResponse.json({ success: false, error: { code, message } }, { status })
}
