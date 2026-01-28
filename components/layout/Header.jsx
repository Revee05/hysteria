"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchButton from "../ui/SearchButton";

export default function Header({ onMenuToggle }) {
  const pathname = usePathname() || "";
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
              src="/svg/Logo-hysteria.svg"
              alt="Logo"
              width={70}
              height={15}
              // className="filter invert w-[90px] h-auto"
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
                className="h-5 w-5 cursor-pointer"
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
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            className="p-2 rounded-md text-zinc-700 dark:text-zinc-50 cursor-pointer"
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
    </header>
  );
}
