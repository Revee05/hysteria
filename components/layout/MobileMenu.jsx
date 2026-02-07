"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Sheet from "../ui/Sheet";

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_MAPPING = {
  'program': 'program-hysteria',
  'platform': 'platform',
  'artikel': 'artikel'
};

const ABOUT_MENU_ITEMS = [
  { href: '/about#visi', label: 'Visi dan Misi' },
  { href: '/about#sejarah', label: 'Sejarah Hysteria' },
  { href: '/about#panduan-visual', label: 'Panduan Visual' }
];

const COLUMN_STYLES = {
  columnCount: 4,
  columnGap: '32px',
  columnRule: '3px solid rgba(0, 0, 0, 0.06)',
  WebkitColumnRule: '3px solid rgba(0, 0, 0, 0.06)',
  maxHeight: 'calc(100vh - 140px)',
  direction: 'rtl'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function svgDataUrl(color = '#ffffff') {
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M25.0833 13.4167H1.74998M1.74998 13.4167L13.4166 1.75M1.74998 13.4167L13.4166 25.0833" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ArrowIcon({ active = false, rotate = false }) {
  const [hover, setHover] = React.useState(false);
  const color = active || hover ? '#43334C' : '#ffffff';
  const src = svgDataUrl(color);
  
  return (
    <div 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)} 
      style={{ display: 'inline-flex' }}
    >
      <Image 
        src={src} 
        alt="" 
        width={18} 
        height={18} 
        unoptimized 
        className="h-4 w-4" 
        style={{ 
          transform: rotate ? 'rotate(180deg)' : 'none', 
          transformOrigin: 'center', 
          transition: 'transform 200ms ease' 
        }} 
      />
    </div>
  );
}

/**
 * Render categories into 4 columns for nested desktop panel
 */
function RenderCategoryColumns({ items, onClose }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="text-right" style={COLUMN_STYLES}>
      <div style={{ direction: 'ltr' }}>
        <ul className="space-y-1">
          {items.map(item => (
            <li key={item.id} style={{ breakInside: 'avoid', marginBottom: '0.5rem' }}>
              <div>
                <Link 
                  href={item.url || '#'} 
                  onClick={onClose} 
                  className="block text-[#E83C91] font-bold text-lg px-2 py-1 rounded hover:bg-gray-50 text-right leading-tight"
                >
                  {item.title}
                </Link>
                
                {item.children && item.children.length > 0 && (
                  <ul className="mt-2 mb-4 space-y-1 text-right">
                    {item.children.map(child => (
                      <li key={child.id} style={{ breakInside: 'avoid' }}>
                        <Link
                          href={child.url || '#'}
                          onClick={onClose}
                          className="block text-[#2D2D37] text-base px-1.5 py-0.5 rounded hover:bg-gray-50 text-right leading-tight"
                        >
                          {child.title}
                        </Link>
                        
                        {child.children && child.children.length > 0 && (
                          <ul className="mt-1 mb-4 space-y-0 mr-1.5">
                            {child.children.map(subChild => (
                              <li key={subChild.id} style={{ breakInside: 'avoid' }}>
                                <Link
                                  href={subChild.url || '#'}
                                  onClick={onClose}
                                  className="block text-[#7D1E41] text-xs px-1.5 py-0.5 rounded hover:bg-gray-50 text-right leading-tight"
                                >
                                  {subChild.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Render only top-level parents (used for mobile nested view)
 */
function RenderParentOnly({ items, onClose }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className="space-y-1 md:space-y-3 text-right">
      {items.map(item => (
        <li key={item.id}>
          <Link 
            href={item.url || '#'} 
            onClick={onClose} 
            className="block text-white font-bold text-base md:text-[#E83C91] md:text-xl px-3 py-2 rounded hover:bg-black/10 hover:backdrop-blur-sm active:bg-black/20 md:hover:bg-gray-50 cursor-pointer text-right"
          >
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  return (
    <div className="text-center text-gray-500 py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
      <p className="mt-2 text-sm">Memuat...</p>
    </div>
  );
}

/**
 * Error message component
 */
function ErrorMessage({ message }) {
  return (
    <div className="text-center text-red-600 py-4">
      <p className="text-sm">{message}</p>
    </div>
  );
}

/**
 * Menu item with submenu capability
 */
function MenuItem({ id, label, activeSub, subOpen, openSub, isMobile, categoryCache, loading, handleClose }) {
  const slug = CATEGORY_MAPPING[id];
  const isActive = activeSub === id;
  
  return (
    <li className="w-full">
      <div className="flex items-center gap-2 justify-end w-full text-xl font-semibold text-right">
        <button
          aria-haspopup="true"
          aria-expanded={subOpen && isActive}
          aria-controls={`submenu-${id}`}
          onClick={(e) => { e.stopPropagation(); openSub(id); }}
          className="p-1 flex items-center cursor-pointer"
        >
          <ArrowIcon active={subOpen && isActive} rotate={subOpen && isActive} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); openSub(id); }}
          aria-controls={`submenu-${id}`}
          className={`flex items-center gap-2 text-base md:text-xl font-semibold text-right hover:text-[#43334C] ${isActive ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
        >
          {label}
        </button>
      </div>

      {isMobile && subOpen && isActive && (
        <div className="pr-4 mt-2">
          <div className="border-t border-b border-gray-200 p-0">
            {categoryCache[slug] ? (
              <RenderParentOnly
                items={categoryCache[slug].items}
                onClose={handleClose}
              />
            ) : loading ? (
              <div className="text-center text-gray-500 py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700 mx-auto"></div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * Desktop submenu panel component
 */
function DesktopSubmenuPanel({ activeSub, categoryCache, loading, error, handleClose }) {
  const getTitle = () => {
    const titles = {
      'about': 'Tentang Hysteria',
      'program': 'Program Hysteria',
      'platform': 'Platform',
      'artikel': 'Artikel'
    };
    return titles[activeSub] || '';
  };

  return (
    <div 
      className="absolute top-0 bottom-0 left-0 right-0 md:right-[calc(36vw-12px)] lg:right-[calc(300px-20px)] z-10 bg-white overflow-auto transition-transform duration-200" 
      role="dialog" 
      aria-modal="true" 
      style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)' }}
    >
      <div className="w-full h-full flex flex-col py-3 px-4 pr-6 md:pr-10 lg:pr-12">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2 border-b-2 border-gray-200 p-2">
          <div className="text-sm font-semibold text-gray-700">{getTitle()}</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeSub === 'about' && (
            <ul id="submenu-about" className="space-y-3 text-right pr-4">
              {ABOUT_MENU_ITEMS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} onClick={handleClose} className="text-gray-700 cursor-pointer hover:text-[#E83C91]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {['program', 'platform', 'artikel'].map(key => {
            const slug = CATEGORY_MAPPING[key];
            return activeSub === key && categoryCache[slug] && (
              <div key={key} id={`submenu-${key}`}>
                <RenderCategoryColumns
                  items={categoryCache[slug].items}
                  onClose={handleClose}
                />
              </div>
            );
          })}

          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MobileMenu({ open, onClose }) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [subOpen, setSubOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);
  const [categoryCache, setCategoryCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  /**
   * Load category data from API
   */
  async function loadCategory(key) {
    const slug = CATEGORY_MAPPING[key];
    if (!slug) return;

    // Return cached data if available
    if (categoryCache[slug]) {
      setActiveSub(key);
      setSubOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/categories/${slug}`);
      if (!res.ok) {
        throw new Error('Failed to fetch category');
      }

      const data = await res.json();
      
      setCategoryCache(prev => ({ 
        ...prev, 
        [slug]: {
          title: data.data.title,
          items: data.data.items
        }
      }));

      setActiveSub(key);
      setSubOpen(true);
    } catch (err) {
      console.error('Error loading category:', err);
      setError('Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Open submenu or toggle if already open
   */
  function openSub(key) {
    if (activeSub === key && subOpen) {
      closeSub();
      return;
    }

    if (['program', 'platform', 'artikel'].includes(key)) {
      loadCategory(key);
    } else {
      setActiveSub(key);
      setSubOpen(true);
    }
  }

  /**
   * Close submenu
   */
  function closeSub() {
    setSubOpen(false);
    setActiveSub(null);
  }

  /**
   * Handle menu close with submenu cleanup
   */
  function handleClose() {
    closeSub();
    onClose();
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)') : null;
    if (!mediaQuery) return;

    const handler = (e) => setIsMobile(e.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <Sheet
      open={open}
      onClose={handleClose}
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
      <div className="relative h-full min-h-[100vh] flex w-full min-w-0 overflow-hidden justify-end">
        {/* Background illustration (desktop only) */}
        <div
          className="hidden md:block absolute left-0 top-0 w-full min-w-[600px] bg-center bg-cover min-h-[100vh] z-0 pointer-events-none"
          style={{ backgroundImage: "url('/image/ilustrasi-menu.png')", backgroundPosition: 'left center' }}
        />

        {/* Main menu panel */}
        <div className="h-full w-[70vw] md:w-[36vw] lg:w-[300px] flex-shrink-0 pointer-events-auto">
          <div className="w-full h-full bg-[#E83C91] rounded-l-[25px] px-6 py-8 md:px-10 md:py-12 flex flex-col relative z-30">
            
            {/* Close button */}
            <div className="flex items-center justify-end">
              <button onClick={handleClose} aria-label="Close menu" className="p-0 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white/90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main navigation */}
            <nav aria-label="Main navigation" className="flex-1">
              <ul className="flex flex-col gap-0.5 md:gap-2 items-end justify-start pt-6 md:pt-4">
                {/* Beranda */}
                <li className="w-full">
                  <Link 
                    href="/" 
                    onClick={handleClose} 
                    className="flex items-center gap-3 justify-end w-full text-white text-base md:text-xl font-semibold text-right hover:text-[#43334C] cursor-pointer"
                  >
                    Beranda
                  </Link>
                </li>

                {/* Tentang Kami */}
                <li className="w-full">
                  <div className="flex items-center gap-2 justify-end w-full text-xl font-semibold text-right">
                    <button
                      aria-haspopup="true"
                      aria-expanded={subOpen && activeSub === 'about'}
                      aria-controls="submenu-about"
                      onClick={(e) => { e.stopPropagation(); openSub('about'); }}
                      className="p-1 flex items-center cursor-pointer"
                    >
                      <ArrowIcon active={subOpen && activeSub === 'about'} rotate={subOpen && activeSub === 'about'} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openSub('about'); }}
                      aria-controls="submenu-about"
                      className={`flex items-center gap-2 text-base md:text-xl font-semibold text-right hover:text-[#43334C] ${activeSub === 'about' ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
                    >
                      Tentang Kami
                    </button>
                  </div>

                  {isMobile && subOpen && activeSub === 'about' && (
                    <div className="pr-4 mt-2">
                      <div className="border-t border-b border-gray-200 p-0">
                        <ul id="submenu-about-mobile" className="space-y-1 text-right">
                          {ABOUT_MENU_ITEMS.map(({ href, label }) => (
                            <li key={href}>
                              <Link 
                                href={href} 
                                onClick={handleClose} 
                                className="block text-white text-sm px-3 py-2 rounded hover:bg-black/10 hover:backdrop-blur-sm active:bg-black/20"
                              >
                                {label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>

                {/* Program Hysteria */}
                <MenuItem
                  id="program"
                  label="Program Hysteria"
                  activeSub={activeSub}
                  subOpen={subOpen}
                  openSub={openSub}
                  isMobile={isMobile}
                  categoryCache={categoryCache}
                  loading={loading}
                  handleClose={handleClose}
                />

                {/* Event */}
                <li className="w-full">
                  <Link 
                    href="/event" 
                    onClick={handleClose} 
                    className="flex items-center gap-3 justify-end w-full text-white text-base md:text-xl font-semibold text-right hover:text-[#43334C] cursor-pointer"
                  >
                    Event
                  </Link>
                </li>

                {/* Platform */}
                <MenuItem
                  id="platform"
                  label="Platform"
                  activeSub={activeSub}
                  subOpen={subOpen}
                  openSub={openSub}
                  isMobile={isMobile}
                  categoryCache={categoryCache}
                  loading={loading}
                  handleClose={handleClose}
                />

                {/* Artikel */}
                <MenuItem
                  id="artikel"
                  label="Artikel"
                  activeSub={activeSub}
                  subOpen={subOpen}
                  openSub={openSub}
                  isMobile={isMobile}
                  categoryCache={categoryCache}
                  loading={loading}
                  handleClose={handleClose}
                />

                {/* Kontak Kami */}
                <li className="w-full">
                  <Link 
                    href="/contact" 
                    onClick={handleClose} 
                    className="flex items-center gap-3 justify-end w-full text-white text-base md:text-xl font-semibold text-right hover:text-[#43334C] cursor-pointer"
                  >
                    Kontak Kami
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Nested submenu panel (desktop only) */}
        {subOpen && !isMobile && (
          <DesktopSubmenuPanel
            activeSub={activeSub}
            categoryCache={categoryCache}
            loading={loading}
            error={error}
            handleClose={handleClose}
          />
        )}
      </div>
    </Sheet>
  );
}
