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
import Link from "next/link";
import Image from "next/image";

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
		<div>
			{/* Main container: centers the login card vertically & horizontally */}
			<div className="flex min-h-screen items-center justify-center bg-zinc-50 py-12">
				<div className="w-full max-w-5xl mx-auto">
					{/* Background wrapper: card will sit inside this so it overlaps the bg */}
					<div 
					className="relative rounded-2xl bg-cover border border-zinc-300" 
					style={{ backgroundImage: "url('/image/ilustrasi-menu.png')", backgroundPosition: 'right center', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)' }} 
					>
						
						<div className="relative grid grid-cols-1 rounded-2xl sm:grid-cols-2">
							{/* container login area */}
							<div className="flex items-center">
								<div className="w-full h-full ">

									{/* bg glassy */}
									{/* <div className="w-full h-full bg-white/60 backdrop-blur-xl rounded-l-2xl p-6 sm:py-30 px-18 sm:max-w-md border border-transparent"> */}
									{/* bg white */}
									<div className="w-full h-full bg-white rounded-l-2xl p-6 sm:py-30 px-18 sm:max-w-md border border-gray-200">

										{/* todo: tambah logo */}
										<div className="items-center justify-center mb-6 flex">
											<Link href="/" className="flex items-center gap-3">
												<Image
												src="/svg/Logo-hysteria.svg"
												alt="Hysteria"
												width={90}
												height={15}
												className="filter brightness-0"
												priority
												/>
											</Link>
										</div>

										<h1 className="text-2xl font-bold text-zinc-800 text-center">Admin Login</h1>
										<h3 className="text-xs text-zinc-800 text-center">Masuk untuk mengelola konten dan sistem.</h3>

										<form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
											{/* Email field wrapper */}
											<div>
												<EmailField register={register} error={errors.email} 
												sx={{
													"& .MuiOutlinedInput-root": {
														"& fieldset": { borderColor: "#F472B6", borderRadius: "12px" },
														"&:hover fieldset": { borderColor: "#D946EF" },
														"&.Mui-focused fieldset": { borderColor: "#D946EF" },
													},
												}}
												/>
											</div>

											{/* Password field wrapper */}
											<div>
												<PasswordField register={register} error={errors.password} 
												sx={{
													"& .MuiOutlinedInput-root": {
													"& fieldset": { borderColor: "#F472B6", borderRadius: "12px" },
													"&:hover fieldset": { borderColor: "#D946EF" },
													"&.Mui-focused fieldset": { borderColor: "#F472B6" },
													},
												}}
												/>
											</div>

											{/* Inline error message */}
											{error && <p className="text-sm text-red-600">{error}</p>}

											<button
												type="submit"
												disabled={isSubmitting || !csrfToken || authLoading}
												className="w-full rounded-lg bg-[#43334C] px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
											>
												{isSubmitting ? "Memproses..." : "Masuk"}
											</button>
										</form>
									</div>
								</div>
							</div>

							{/* Right: empty column so bg image stays visible; keeps layout responsive */}
							<div className="hidden sm:block" />
						</div>
					</div>
				</div>
			</div>

			<Toast message={error} type="error" visible={!!error} onClose={() => setError("")} />
		</div>
	);
}
