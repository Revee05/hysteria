import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "../../lib/jwt.js";
import { COOKIE_NAMES } from "../../config/cookie.config.js";
import { ROLE_KEYS } from "../../modules/auth/domain/role.constants.js";
import { STATUS_KEYS } from "../../modules/auth/domain/status.constants.js";
import logger from "../../lib/logger.js";

export default async function AdminLayout({ children }) {
	// `cookies()` can be async in some Next versions / runtimes
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_NAMES.access)?.value;
	if (!token) {
		logger.warn('AdminLayout: missing access token, redirecting to login')
		redirect("/auth/login");
	}

	try {
		const payload = verifyAccessToken(token);
		const roles = payload.roles || [];
		const status = payload.status;
		const hasRole = roles.includes(ROLE_KEYS.SUPERADMIN) || roles.includes(ROLE_KEYS.ADMIN);

		if (!hasRole || status !== STATUS_KEYS.ACTIVE) {
			logger.warn('AdminLayout: unauthorized access attempt', { userId: payload.sub, roles, status })
			redirect("/auth/login");
		}
	} catch (error) {
		logger.error('AdminLayout: token verification failed', { error: error.message })
		redirect("/auth/login");
	}

	return (
		<div className="min-h-screen bg-zinc-50">
			<header className="border-b border-zinc-200 bg-white">
				<div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
					<h1 className="text-lg font-semibold text-zinc-900">Admin Area</h1>
				</div>
			</header>
			<main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
		</div>
	);
}
