"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "../../components/ui/Toast";
import { useAuth } from "../../lib/context/auth-context";
import Card, { CardHeader, CardBody, CardFooter, CardTitle, CardDescription, CardBadge, CardStats } from "../../components/ui/Card";


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
		<div className="space-y-6">
			{/* Header Card */}
			<Card variant="elevated">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold text-zinc-900">Card Component Showcase</h2>
						<p className="mt-1 text-sm text-zinc-500">Berbagai contoh penggunaan komponen Card yang dinamis</p>
					</div>
					<button
						onClick={handleLogout}
						disabled={loading || !authCsrf}
						className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 "
					>
						{loading ? "Keluar..." : "Keluar"}
					</button>
				</div>
			</Card>

			{/* Stats Cards Row */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card size="sm" variant="elevated" hoverable>
					<CardStats 
						label="Total Users"
						value="2,543"
						trend="+12.5%"
						trendDirection="up"
					/>
				</Card>
				<Card size="sm" variant="elevated" hoverable>
					<CardStats 
						label="Revenue"
						value="$45,231"
						trend="+8.2%"
						trendDirection="up"
					/>
				</Card>
				<Card size="sm" variant="elevated" hoverable>
					<CardStats 
						label="Active Sessions"
						value="142"
						trend="-3.1%"
						trendDirection="down"
					/>
				</Card>
			</div>

			{/* Color Variants */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<Card 
					color="success" 
					title="Success Card"
					subtitle="This is a success variant"
					badge={<CardBadge variant="success">Active</CardBadge>}
				>
					<p className="text-sm text-zinc-600">Card dengan warna success untuk status positif.</p>
				</Card>

				<Card 
					color="warning" 
					title="Warning Card"
					subtitle="This is a warning variant"
					badge={<CardBadge variant="warning">Pending</CardBadge>}
				>
					<p className="text-sm text-zinc-600">Card dengan warna warning untuk perhatian.</p>
				</Card>

				<Card 
					color="error" 
					title="Error Card"
					subtitle="This is an error variant"
					badge={<CardBadge variant="error">Failed</CardBadge>}
				>
					<p className="text-sm text-zinc-600">Card dengan warna error untuk masalah.</p>
				</Card>
			</div>

			{/* Variants Row */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card variant="default" title="Default" size="sm">
					<p className="text-sm text-zinc-600">Default variant</p>
				</Card>
				<Card variant="outlined" title="Outlined" size="sm">
					<p className="text-sm text-zinc-600">Outlined variant</p>
				</Card>
				<Card variant="elevated" title="Elevated" size="sm">
					<p className="text-sm text-zinc-600">Elevated variant</p>
				</Card>
				<Card variant="filled" title="Filled" size="sm">
					<p className="text-sm text-zinc-600">Filled variant</p>
				</Card>
			</div>

			{/* Card with Actions */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card 
					title="User Profile"
					subtitle="Administrator Account"
					icon={
						<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<span className="text-blue-600 font-semibold">AD</span>
						</div>
					}
					actions={
						<>
							<button className="px-3 py-1 text-sm border border-zinc-200 rounded hover:bg-zinc-50">Edit</button>
							<button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
						</>
					}
					footer={
						<div className="flex items-center justify-between text-sm text-zinc-500">
							<span>Last login: 2 hours ago</span>
							<span>Role: Administrator</span>
						</div>
					}
				>
					<div className="space-y-2">
						<p className="text-sm"><strong>Email:</strong> admin@example.com</p>
						<p className="text-sm"><strong>Phone:</strong> +62 812 3456 7890</p>
						<p className="text-sm"><strong>Status:</strong> <CardBadge variant="success">Active</CardBadge></p>
					</div>
				</Card>

				<Card 
					title="Recent Activity"
					collapsible
					defaultCollapsed={false}
					variant="elevated"
				>
					<div className="space-y-3">
						<div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm font-medium">User login detected</p>
								<p className="text-xs text-zinc-500">2 minutes ago</p>
							</div>
						</div>
						<div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
							<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm font-medium">Settings updated</p>
								<p className="text-xs text-zinc-500">1 hour ago</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm font-medium">New user registered</p>
								<p className="text-xs text-zinc-500">3 hours ago</p>
							</div>
						</div>
					</div>
				</Card>
			</div>

			{/* Clickable Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card 
					hoverable
					onClick={() => alert('Card 1 clicked!')}
					title="Clickable Card"
				>
					<p className="text-sm text-zinc-600">Click me untuk melihat alert!</p>
				</Card>

				<Card 
					hoverable
					variant="outlined"
					title="Documentation"
				>
					<p className="text-sm text-zinc-600">Hover untuk melihat efek shadow.</p>
				</Card>

				<Card 
					loading={false}
					title="Loading Example"
				>
					<p className="text-sm text-zinc-600">Ubah loading prop menjadi true untuk lihat spinner.</p>
				</Card>
			</div>

			{/* Dynamic Social Media Cards */}
			<div>
				<h3 className="text-lg font-semibold text-zinc-900 mb-4">Social Media Links (Dynamic Data)</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{[
						{
							id: 1,
							platform: 'Instagram',
							handle: '@catid.hysteria',
							icon: (
								<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.509-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z"/>
								</svg>
							),
							color: '#E1306C'
						},
						{
							id: 2,
							platform: 'Facebook',
							handle: 'Catid.Hysteria',
							icon: (
								<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
								</svg>
							),
							color: '#1877F2'
						},
						{
							id: 3,
							platform: 'Twitter/X',
							handle: '@globalhysteria',
							icon: (
								<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
									<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
								</svg>
							),
							color: '#000000'
						}
					].map((social) => (
						<Card 
							key={social.id}
							variant="elevated" 
							hoverable
							onClick={() => alert(`Opening ${social.platform}...`)}
						>
							<div className="flex items-center gap-4">
								<div 
									className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
									style={{ backgroundColor: `${social.color}15` }}
								>
									<div style={{ color: social.color }}>
										{social.icon}
									</div>
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-base">{social.platform}</h4>
									<p className="text-sm text-zinc-500">{social.handle}</p>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>

			{/* Glassmorphism Cards */}
		<div className="relative p-8 rounded-3xl overflow-hidden">
			{/* Background gradient untuk effect glassy - lebih kuat dan vibrant */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-70"></div>
			<div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 opacity-50 blur-2xl"></div>
			
			{/* Animated gradient orbs */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
			<div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
			<div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
			
			<div className="relative">
				<h3 className="text-lg font-semibold text-white mb-6 drop-shadow-lg">Glassmorphism Cards</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[
						{
							id: 1,
							title: 'Premium Plan',
							price: '$29',
							period: '/month',
							features: ['Unlimited projects', 'Priority support', '100GB storage', 'Advanced analytics'],
							gradient: 'from-blue-500/20 to-cyan-500/20'
						},
						{
							id: 2,
							title: 'Business Plan',
							price: '$79',
							period: '/month',
							features: ['Everything in Premium', 'Custom domain', '500GB storage', 'API access'],
							gradient: 'from-purple-500/20 to-pink-500/20'
						},
						{
							id: 3,
							title: 'Enterprise',
							price: '$199',
							period: '/month',
							features: ['Everything in Business', 'Dedicated support', 'Unlimited storage', 'SLA guarantee'],
							gradient: 'from-orange-500/20 to-red-500/20'
						}
					].map((plan) => (
						<Card
							key={plan.id}
							className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-white/20`}
							hoverable
						>
							<div className="space-y-4">
								<div>
									<h3 className="text-xl font-bold text-white drop-shadow-md">{plan.title}</h3>
									<div className="mt-2">
										<span className="text-4xl font-bold text-white drop-shadow-md">{plan.price}</span>
										<span className="text-white/70">{plan.period}</span>
									</div>
								</div>
								<ul className="space-y-2">
									{plan.features.map((feature, idx) => (
										<li key={idx} className="flex items-center gap-2 text-sm text-white/90">
											<svg className="w-5 h-5 text-emerald-300 flex-shrink-0 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span className="drop-shadow">{feature}</span>
										</li>
									))}
								</ul>
								<button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg font-medium transition-all border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl">
									</button>
								</div>
							</Card>
						))}
					</div>
				</div>
			</div>

			{/* Custom Composition */}
			<Card variant="elevated">
				<CardHeader>
					<CardTitle>Custom Composition Card</CardTitle>
					<CardDescription>Menggunakan sub-components untuk kontrol penuh</CardDescription>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="font-medium text-zinc-900 mb-2">Features</h4>
							<ul className="space-y-1 text-sm text-zinc-600">
								<li>✓ 6 Color variants</li>
								<li>✓ 4 Style variants</li>
								<li>✓ 3 Size options</li>
								<li>✓ Image support</li>
								<li>✓ Collapsible</li>
							</ul>
						</div>
						<div>
							<h4 className="font-medium text-zinc-900 mb-2">Usage</h4>
							<ul className="space-y-1 text-sm text-zinc-600">
								<li>✓ Dashboard stats</li>
								<li>✓ User profiles</li>
								<li>✓ Product cards</li>
								<li>✓ Settings panels</li>
								<li>✓ Notification lists</li>
							</ul>
						</div>
					</div>
				</CardBody>
				<CardFooter>
					<div className="flex items-center justify-between">
						<span className="text-sm text-zinc-500">Komponen Card v1.0</span>
						<button className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800">
							View Documentation
						</button>
					</div>
				</CardFooter>
			</Card>

			{/* <Toast message={toastMessage} type="info" visible={toastVisible} onClose={() => setToastVisible(false)} /> */}
		</div>
	);
}
