"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
	const router = useRouter();
	const [csrfToken, setCsrfToken] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function loadCsrf() {
			const res = await fetch("/api/auth/csrf", { cache: "no-store" });
			const json = await res.json();
			if (json?.data?.csrfToken) {
				setCsrfToken(json.data.csrfToken);
			}
		}
		loadCsrf();
	}, []);

	const handleLogout = async () => {
		if (!csrfToken) return;
		setLoading(true);
		await fetch("/api/auth/logout", {
			method: "POST",
			headers: {
				"x-csrf-token": csrfToken,
			},
		});
		setLoading(false);
		router.push("/auth/login");
	};

	return (
		<div className="rounded-2xl bg-white p-8 shadow">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-zinc-900">Dashboard</h2>
					<p className="mt-1 text-sm text-zinc-500">Selamat datang di area admin.</p>
				</div>
				<button
					onClick={handleLogout}
					disabled={loading || !csrfToken}
					className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{loading ? "Keluar..." : "Keluar"}
				</button>
			</div>
		</div>
	);
}
