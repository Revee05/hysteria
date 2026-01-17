"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
	email: z.string().email("Email tidak valid"),
	password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function LoginPage() {
	const router = useRouter();
	const [csrfToken, setCsrfToken] = useState("");
	const [error, setError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({ resolver: zodResolver(schema) });

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

	const onSubmit = async (values) => {
		setError("");
		const res = await fetch("/api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-csrf-token": csrfToken,
			},
			body: JSON.stringify(values),
		});

		const json = await res.json();
		if (!res.ok || !json.success) {
			setError(json?.error?.message || "Login gagal");
			return;
		}

		router.push("/admin");
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
				<h1 className="text-2xl font-semibold text-zinc-900">Masuk</h1>
				<p className="mt-2 text-sm text-zinc-500">
					Gunakan akun yang sudah dibuat admin.
				</p>

				<form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
					<div>
						<label className="text-sm font-medium text-zinc-700">Email</label>
						<input
							type="email"
							className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
							placeholder="nama@domain.com"
							{...register("email")}
						/>
						{errors.email && (
							<p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
						)}
					</div>

					<div>
						<label className="text-sm font-medium text-zinc-700">Password</label>
						<input
							type="password"
							className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
							placeholder="••••••••"
							{...register("password")}
						/>
						{errors.password && (
							<p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
						)}
					</div>

					{error && <p className="text-sm text-red-600">{error}</p>}

					<button
						type="submit"
						disabled={isSubmitting || !csrfToken}
						className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? "Memproses..." : "Masuk"}
					</button>
				</form>
			</div>
		</div>
	);
}
