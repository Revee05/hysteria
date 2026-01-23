"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchButton from "../ui/SearchButton";
import Sheet from "../ui/Sheet";

export default function Header() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide header for admin routes
  if (pathname.startsWith("/admin")) return null;

  const showBg = !isHome || !isAtTop;
  const headerPositionClass = isHome ? "fixed top-0 left-0 right-0 z-50" : "relative z-10";

  return (
    <header
      style={{
        backgroundColor: showBg ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
        borderBottom: showBg ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent'
      }}
      className={`${headerPositionClass} transition-all duration-200`}
    >
      <div className="mx-auto w-full max-w-[1920px] px-6 h-[100px] grid grid-cols-3 items-center">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/next.svg"
              alt="Logo"
              width={120}
              height={28}
              className="dark:invert"
              priority
            />
          </Link>
        </div>

        {/* Center */}
        <div />

        {/* Right */}
        <div className="flex items-center justify-end gap-4">
          {/* Search */}
          <SearchButton
            onSearch={(q) => console.log("search", q)}
            buttonClassName="p-2 rounded-md text-zinc-700 dark:text-zinc-50"
            openWrapperClassName="min-w-[220px]"
            inputClassName="min-w-[180px]"
            closeButtonClassName="p-1"
            renderIcon={() => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="6" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            )}
          />

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="p-2 rounded-md text-zinc-700 dark:text-zinc-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu (fullscreen sheet from right) */}
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        anchor="right"
        title={null}
        // make backdrop darker + blur to match Figma overlay
        backdropSx={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        // make the Drawer full viewport so we can render a fullscreen split layout
        paperSx={{
          width: '100vw',
          maxWidth: '100vw',
          height: '100vh',
          bgcolor: 'transparent',
          boxShadow: 'none',
          p: 0,
        }}
      >
        <div className="h-full min-h-[100vh] flex w-full">
          {/* Left: illustration / hero area (hidden on small screens) */}
          <div
            className="hidden md:block flex-1 h-full bg-center bg-cover"
            style={{ backgroundImage: "url('/illustration-hero.jpg')", minHeight: '100vh' }}
          />

          {/* Right: pink menu panel */}
          <div className="w-full md:w-[36vw] lg:w-[420px] h-full flex items-center">
            <div className="w-full h-full bg-[#ff2b87] md:rounded-l-[48px] px-6 py-8 md:px-10 md:py-12 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/90">Close</div>
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-6 items-start justify-center flex-1">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 text-white text-xl font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Beranda
                </Link>

                <Link href="/about" onClick={() => setOpen(false)} className="flex items-center gap-3 text-white text-xl font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Tentang Kami
                </Link>

                <Link href="/program" onClick={() => setOpen(false)} className="flex items-center gap-3 text-white text-xl font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Program Hysteria
                </Link>

                <Link href="/artikel" onClick={() => setOpen(false)} className="flex items-center gap-3 text-white text-xl font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Artikel
                </Link>

                <Link href="/contact" onClick={() => setOpen(false)} className="flex items-center gap-3 text-white text-xl font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Kontak Kami
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </Sheet>
    </header>
  );
}
