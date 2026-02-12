"use client";

import Link from "next/link";

export default function Colaboration() {
	return (
		<section className="w-full bg-[#E83C91] h-[425px] flex items-center">
			<div className="max-w-7xl mx-auto px-6 text-center text-white">
				<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Mari Berkolaborasi</h2>
				<p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/95">
					Punya ide menarik? atau ingin bikin sesuatu yang unik? <br /> 
                    Mari wujudkan lewat
					eksplorasi ide dan eksperimen bersama kami.
				</p>

				<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
					<Link
						href="/contact"
						className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#43334C] rounded-md text-sm font-medium shadow-sm transition-transform transition-colors duration-200 transform hover:scale-105 hover:shadow-lg hover:-translate-y-1 hover:bg-[#FCEAF3] focus:outline-none focus:ring-2 focus:ring-white/40"
					>
						Ajukan Kolaborasi
					</Link>

					<Link
						href="/discussion"
						className="inline-flex items-center justify-center px-5 py-2.5 bg-white/90 text-[#43334C] rounded-md text-sm font-medium shadow-sm transition-transform transition-colors duration-200 transform hover:scale-105 hover:shadow-lg hover:bg-white hover:text-[#E83C91] focus:outline-none focus:ring-2 focus:ring-white/25"
					>
						Mulai Diskusi
					</Link>
				</div>

			</div>
		</section>
	);
}

