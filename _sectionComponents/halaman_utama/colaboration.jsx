"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Colaboration() {
	const [collaborationFormUrl, setCollaborationFormUrl] = useState(
		process.env.NEXT_PUBLIC_COLLABORATION_FORM_URL || "/contact"
	);

	useEffect(() => {
		let isMounted = true;

		async function loadCollaborationContent() {
			try {
				const res = await fetch("/api/collaboration-content", { cache: "no-store" });
				const json = await res.json().catch(() => null);
				const googleFormUrl = json?.data?.googleFormUrl || json?.data?.googleformurl;

				if (isMounted && googleFormUrl) {
					setCollaborationFormUrl(googleFormUrl);
				}
			} catch {
				// Keep fallback URL when API fails.
			}
		}

		loadCollaborationContent();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<section className="w-full bg-[#E83C91] min-h-90 md:min-h-100 lg:min-h-106.25 flex items-center py-10 md:py-12">
			<div className="max-w-7xl mx-auto w-full px-5 sm:px-6 text-center text-white">
				<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">Mari Berkolaborasi</h2>
				<p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-white/95">
					Punya ide menarik? atau ingin bikin sesuatu yang unik? <br /> 
                    Mari wujudkan lewat
					eksplorasi ide dan eksperimen bersama kami.
				</p>

				<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto">
					<a
						href={collaborationFormUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#43334C] rounded-md text-sm font-medium shadow-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:bg-white hover:text-[#E83C91] focus:outline-none focus:ring-2 focus:ring-white/25"
					>
						Ajukan Kolaborasi
					</a>

					<Link
						href="/kolaborasi"
						className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#43334C] rounded-md text-sm font-medium shadow-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:bg-white hover:text-[#E83C91] focus:outline-none focus:ring-2 focus:ring-white/25"
					>
						Cek Kolaborasi
					</Link>
				</div>

			</div>
		</section>
	);
}

