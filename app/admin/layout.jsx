import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "../../lib/jwt.js";
import { COOKIE_NAMES, COOKIE_OPTIONS } from "../../config/cookie.config.js";
import { ROLE_KEYS } from "../../modules/auth/domain/role.constants.js";
import { STATUS_KEYS } from "../../modules/auth/domain/status.constants.js";
import logger from "../../lib/logger.js";
import AdminShell from "./_partial/AdminShell.jsx";

export default async function AdminLayout({ children }) {
	// `cookies()` can be async in some Next versions / runtimes
	const cookieStore = await cookies();
	let token = cookieStore.get(COOKIE_NAMES.access)?.value;

	// Try verify access token; if missing/expired, attempt server-side refresh using refresh token
	if (!token) {
		logger.warn('AdminLayout: missing access token, attempting server-side refresh if refresh token present')
		const hasRefresh = !!cookieStore.get(COOKIE_NAMES.refresh)?.value;
		if (hasRefresh) {
			return redirect('/auth/refresh?next=/admin');
		}
		logger.warn('AdminLayout: no refresh token, redirecting to login')
		return redirect('/auth/login');
	}

	try {
		const payload = verifyAccessToken(token);
		const roles = payload.roles || [];
		const status = payload.status;
		const permissions = payload.permissions || [];
		
		// Allow access if:
		// 1. User is SUPERADMIN (full access), OR
		// 2. User has at least one permission (limited access based on permissions)
		const hasAdminRole = roles.includes(ROLE_KEYS.SUPERADMIN);
		const hasAnyPermission = permissions.length > 0;
		const canAccessAdmin = hasAdminRole || hasAnyPermission;

		if (!canAccessAdmin || status !== STATUS_KEYS.ACTIVE) {
			logger.warn('AdminLayout: unauthorized access attempt', { 
				userId: payload.sub, 
				roles, 
				permissions: permissions.length,
				status 
			})
			redirect("/auth/login");
		}
	} catch (error) {
		logger.error('AdminLayout: token verification failed', { error: error.message })
		// Try server-side refresh when verification fails (likely expired)
		const hasRefreshOnError = !!cookieStore.get(COOKIE_NAMES.refresh)?.value;
		if (hasRefreshOnError) {
			return redirect('/auth/refresh?next=/admin');
		}
		return redirect('/auth/login');
	}

	return (
		<AdminShell>
			{children}
		</AdminShell>
	);
}
