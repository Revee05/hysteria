"use client";

import Image from "next/image";
import Link from "next/link";
import Sheet from "../ui/Sheet";

export default function MobileMenu({ open, onClose }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      anchor="right"
      title={null}
      hideClose={true}
      backdropSx={{
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      paperSx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '100%',
        maxWidth: '100%',
        height: '100vh',
        bgcolor: 'transparent',
        overflow: 'hidden',
        boxShadow: 'none',
        p: 0,
        zIndex: 100,
      }}
    >
      <div className="relative h-full min-h-[100vh] flex w-full min-w-0 overflow-hidden">
        {/* Left: illustration / hero area (hidden on small screens) */}
        <div
          className="hidden md:block absolute left-0 top-0 w-full min-w-[600px] bg-center bg-cover min-h-[100vh] z-0 pointer-events-none"
          style={{ backgroundImage: "url('/image/ilustrasi-menu.png')", backgroundPosition: 'left center' }}
        />

        {/* Right: pink menu panel (overlay) wrapper */}
        <div className="absolute right-0 top-0 h-full w-full md:w-[36vw] lg:w-[300px] flex-shrink-0 pointer-events-auto">
          
          {/* menu panel container */}
          <div className="w-full h-full bg-[#E83C91] md:rounded-l-[25px] px-6 py-8 md:px-10 md:py-12 flex flex-col relative z-30 ">
            
            {/* close btn */}
            <div className="flex items-center justify-end">
              <button onClick={onClose} aria-label="Close menu" className="p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white/90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* navigation links */}
            <nav className="flex flex-col gap-1 items-end justify-start pt-6 md:pt-4 flex-1">
              <Link href="/" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right">
                
                Beranda
              </Link>

              <Link href="/about" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right">
                
                Tentang Kami
              </Link>

              <Link href="/program" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right">
                <Image src="/svg/left_arrow.svg" alt="" width={16} height={16} className="h-4 w-4" />
                Program Hysteria
              </Link>

              <Link href="/platform" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right">
                <Image src="/svg/left_arrow.svg" alt="" width={16} height={16} className="h-4 w-4" />
                Platform
              </Link>

              <Link href="/event" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right">
                <Image src="/svg/left_arrow.svg" alt="" width={16} height={16} className="h-4 w-4" />
                Event
              </Link>

              <Link href="/artikel" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right">
                
                Artikel
              </Link>

              <Link href="/contact" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right">
                
                Kontak Kami
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
