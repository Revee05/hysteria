"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/context/auth-context";
import PasswordField from "../../../components/ui/PasswordField";
import EmailField from "../../../components/ui/EmailField";
import Toast from "../../../components/ui/Toast";

const schema = z.object({
	email: z.string().email("Email tidak valid"),
	password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function LoginPage() {
	const router = useRouter();
	const { setAuthenticated, refreshUser, csrfToken, isLoading: authLoading } = useAuth();
	const [error, setError] = useState(() => {
		try {
			const logoutMessage = sessionStorage.getItem('auth:logoutMessage');
			if (logoutMessage) {
				sessionStorage.removeItem('auth:logoutMessage');
				return logoutMessage;
			}
		} catch (e) {
			// Ignore storage errors
		}
		return "";
	});

	// initial error handled via useState initializer (reads sessionStorage)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({ resolver: zodResolver(schema) });

	const onSubmit = async (values) => {
		setError("");
		
		if (!csrfToken) {
			setError("CSRF token belum tersedia. Silakan refresh halaman.");
			return;
		}
		
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-csrf-token": csrfToken,
				},
				credentials: "include", 
				body: JSON.stringify(values),
			});

			let json = null;
			try {
				json = await res.json();
			} catch (e) {
				json = null;
			}

			if (!res.ok || !json?.success) {
				const msg = json?.error?.message || json?.message || "Login gagal";
				setError(msg);
				return;
			}
			
			// Login berhasil - update auth context with user data then redirect
			setAuthenticated(true);
			
			// Refresh user data to populate context
			await refreshUser();
			
			router.push("/admin");
		} catch (err) {
			console.error('Login error:', err);
			setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
		}
	};

	return (
		<>
			<div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
				<div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
					<h1 className="text-2xl font-semibold text-zinc-900">Masuk</h1>

					<form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<EmailField register={register} error={errors.email} />
						</div>

						<div>
							<PasswordField register={register} error={errors.password} />
						</div>

						{error && <p className="text-sm text-red-600">{error}</p>}

						<button
							type="submit"
							disabled={isSubmitting || !csrfToken || authLoading}
							className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting ? "Memproses..." : "Masuk"}
						</button>
					</form>
				</div>
			</div>
			<Toast message={error} type="error" visible={!!error} onClose={() => setError("")} />
		</>
	);
}
