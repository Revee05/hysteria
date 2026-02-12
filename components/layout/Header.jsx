"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchButton from "../ui/SearchButton";

// Recursive component untuk render category items dalam mega menu
function MegaMenuItems({ items, onClose, depth = 0 }) {
  if (!items || items.length === 0) return null;
  
  return (
    <ul className={`${depth === 0 ? 'grid grid-cols-2 gap-x-8 gap-y-2' : 'space-y-1 ml-4'}`}>
      {items.map(item => (
        <li key={item.id}>
          <div>
            <Link 
              href={item.url || '#'} 
              onClick={onClose} 
              className={`block ${depth === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'} hover:text-pink-600 transition-colors py-1`}
            >
              {item.title}
            </Link>
            {item.children && item.children.length > 0 && (
              <div className="mt-1">
                <MegaMenuItems 
                  items={item.children} 
                  onClose={onClose} 
                  depth={depth + 1} 
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Header({ onMenuToggle }) {
  const pathname = usePathname() || "";
  const [isAtTop, setIsAtTop] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categoryCache, setCategoryCache] = useState({});
  const [loading, setLoading] = useState(false);

  const isHome = pathname === "/";

  // Load category data
  async function loadCategory(slug) {
    if (categoryCache[slug]) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setCategoryCache(prev => ({ 
        ...prev, 
        [slug]: {
          title: data.data.title,
          items: data.data.items
        }
      }));
    } catch (err) {
      console.error('Error loading category:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleMouseLeave() {
    // Delay untuk smooth UX
    setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  }

  function closeDropdown() {
    setActiveDropdown(null);
  }

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
      <div className="mx-auto w-full max-w-[1920px] px-4 md:px-6 h-[72px] md:h-[70px] flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/svg/Logo-hysteria.svg"
              alt="Hysteria"
              width={63}
              height={12}
              priority
            />
          </Link>
        </div>
        

        {/* Center placeholder (desktop only) — keeps layout spacing for large screens */}
        <div className="hidden lg:block flex-1" />

        {/* Right */}
        <div className="flex items-center justify-end gap-3 md:gap-4">
          {/* Search */}
          <SearchButton
            onSearch={(q) => console.log("search", q)}
            buttonClassName="p-2 rounded-md text-zinc-700 dark:text-zinc-50 flex items-center"
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
            className="p-2 rounded-md text-zinc-700 dark:text-zinc-50 cursor-pointer flex items-center"
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

      {/* Mega Menu Dropdown - positioned absolutely */}
      {activeDropdown && (
        <div 
          className="absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-200 z-40"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="mx-auto max-w-7xl px-6 py-8">
            {categoryCache[activeDropdown] ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {categoryCache[activeDropdown].title}
                </h3>
                <MegaMenuItems 
                  items={categoryCache[activeDropdown].items}
                  onClose={closeDropdown}
                  depth={0}
                />
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Memuat...</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
