"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "../../components/ui/Toast";
import { useAuth } from "../../lib/context/auth-context";

export default function AdminPage() {
	const router = useRouter();
	// use csrfToken from AuthProvider
	const [toastVisible, setToastVisible] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const { csrfToken: authCsrf, isLoading: authLoading, apiCall } = useAuth();

	useEffect(() => {
		if (authCsrf) {
			const t = setTimeout(() => {
				setToastMessage("Selamat datang di area admin.");
				setToastVisible(true);
			}, 0);
			return () => clearTimeout(t);
		}
	}, [authCsrf]);

	const handleLogout = async () => {
		if (!authCsrf) return;
		setLoading(true);
		await apiCall('/api/auth/logout', { method: 'POST' })
		setLoading(false);
		router.push("/auth/login");
	};

	return (
		<>
			<div className="rounded-2xl bg-white p-8 shadow">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-zinc-900">Dashboard</h2>
					<p className="mt-1 text-sm text-zinc-500">Selamat datang di area admin.</p>
				</div>
				<button
					onClick={handleLogout}
					disabled={loading || !authCsrf}
					className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{loading ? "Keluar..." : "Keluar"}
				</button>
			</div>
			</div>
			{/* <Toast message={toastMessage} type="info" visible={toastVisible} onClose={() => setToastVisible(false)} /> */}
		</>
	);
}
