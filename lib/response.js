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
	
	// Log error otomatis, kecuali untuk 401 (expected untuk user yang belum login)
	if (status >= 500) {
		logger.error('Server error occurred', {
			code,
			message,
			status,
			stack: error?.stack,
		})
	} else if (status >= 400 && status !== 401) {
		// Don't log 401 as warning (normal untuk unauthenticated users)
		logger.warn('Client error occurred', {
			code,
			message,
			status,
		})
	}
	
	return NextResponse.json({ success: false, error: { code, message } }, { status })
}
