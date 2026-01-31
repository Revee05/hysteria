"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Sheet from "../ui/Sheet";

function svgDataUrl(color = '#ffffff') {
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M25.0833 13.4167H1.74998M1.74998 13.4167L13.4166 1.75M1.74998 13.4167L13.4166 25.0833" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function ArrowIcon({ active = false, rotate = false }) {
  const [hover, setHover] = React.useState(false);
  const color = active || hover ? '#43334C' : '#ffffff';
  const src = svgDataUrl(color);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ display: 'inline-flex' }}>
      <Image src={src} alt="" width={18} height={18} unoptimized className="h-4 w-4" style={{ transform: rotate ? 'rotate(180deg)' : 'none', transformOrigin: 'center', transition: 'transform 200ms ease' }} />
    </div>
  );
}

// New: Render categories into 4 columns for nested desktop panel
function RenderCategoryColumns({ items, onClose }) {
  if (!items || items.length === 0) return null;

  // Menggunakan CSS columns untuk auto-flow berdasarkan tinggi
  return (
    <div 
      className="text-right" 
      style={{ 
        columnCount: 4, 
        columnGap: '32px',
        maxHeight: 'calc(100vh - 140px)',
        direction: 'rtl' // Membuat kolom 1 muncul di kanan
      }}
    >
      <div style={{ direction: 'ltr' }}> {/* Reset direction untuk content */}
        <ul className="space-y-1">
          {items.map(item => (
            <li key={item.id} style={{ breakInside: 'avoid', marginBottom: '1.25rem' }}>
              <div>
                <Link 
                  href={item.url || '#'} 
                  onClick={onClose} 
                  className="block text-[#E83C91] font-bold text-lg px-2 py-1 rounded hover:bg-gray-50 text-right leading-tight"
                >
                  {item.title}
                </Link>
                {item.children && item.children.length > 0 && (
                    <ul className="mt-0.5 space-y-0 text-right">
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
                            <ul className="mt-0.5 space-y-0 mr-1.5">
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

// Render only top-level parents (used for mobile nested view)
function RenderParentOnly({ items, onClose }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="space-y-1 md:space-y-3 text-right">
      {items.map(item => (
        <li key={item.id}>
          <Link href={item.url || '#'} onClick={onClose} className="block text-white font-bold text-base md:text-[#E83C91] md:text-xl px-3 py-2 rounded hover:bg-black/10 hover:backdrop-blur-sm active:bg-black/20 md:hover:bg-gray-50 cursor-pointer text-right">
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MobileMenu({ open, onClose }) {
  const [subOpen, setSubOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false));
  
  // Category cache and loading state
  const [categoryCache, setCategoryCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mapping category keys to slugs
  const categoryMapping = {
    'program': 'program-hysteria',
    'platform': 'platform',
    'artikel': 'artikel'
  };

  async function loadCategory(key) {
    const slug = categoryMapping[key];
    if (!slug) return;

    // Check cache
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
      
      // Cache the data
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

  function openSub(key) {
    // Toggle: if same key is already open, close it
    if (activeSub === key && subOpen) {
      closeSub();
      return;
    }

    // For categories with dynamic data
    if (['program', 'platform', 'artikel'].includes(key)) {
      loadCategory(key);
    } else {
      // For static submenu (about)
      setActiveSub(key);
      setSubOpen(true);
    }
  }

  function closeSub() {
    setSubOpen(false);
    setActiveSub(null);
  }

  useEffect(() => {
    const m = typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)') : null;
    if (!m) return;
    const handler = (e) => setIsMobile(e.matches);
    // register listener (fallback for older browsers that use addListener)
    if (typeof m.addEventListener === 'function') {
      m.addEventListener('change', handler);
      return () => m.removeEventListener('change', handler);
    } else if (typeof m.addListener === 'function') {
      m.addListener(handler);
      return () => m.removeListener(handler);
    }
    return;
  }, []);

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
      <div className="relative h-full min-h-[100vh] flex w-full min-w-0 overflow-hidden justify-end">
        {/* Left: illustration / hero area (hidden on small screens) */}
        <div
          className="hidden md:block absolute left-0 top-0 w-full min-w-[600px] bg-center bg-cover min-h-[100vh] z-0 pointer-events-none"
          style={{ backgroundImage: "url('/image/ilustrasi-menu.png')", backgroundPosition: 'left center' }}
        />

        {/* Right: pink menu panel (overlay) wrapper */}
        <div className="h-full w-[70vw] md:w-[36vw] lg:w-[300px] flex-shrink-0 pointer-events-auto">
          
          {/* menu panel container */}
          <div className="w-full h-full bg-[#E83C91] rounded-l-[25px] md:rounded-l-[25px] px-6 py-8 md:px-10 md:py-12 flex flex-col relative z-30 ">
            
            {/* close btn */}
            <div className="flex items-center justify-end">
              <button onClick={onClose} aria-label="Close menu" className="p-0 cursor-pointer">
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

            {/* navigation links - semantic list for SEO */}
            <nav aria-label="Main navigation" className="flex-1">
              <ul className="flex flex-col gap-0.5 md:gap-2 items-end justify-start pt-6 md:pt-4">
                <li className="w-full">
                  <Link href="/" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-base md:text-xl font-semibold text-right hover:text-[#43334C] cursor-pointer">
                    Beranda
                  </Link>
                </li>

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
                      className={`flex items-center gap-2 text-base md:text-xl font-semibold text-right md:text-right hover:text-[#43334C] ${activeSub === 'about' ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
                    >
                      Tentang Kami
                    </button>
                  </div>

                  {isMobile && subOpen && activeSub === 'about' && (
                    <div className="pr-4 mt-2">
                      <div className="border-t border-b border-gray-200 p-0">
                                <ul id="submenu-about-mobile" className="space-y-1 text-right">
                                  <li>
                                    <Link href="/about#visi" onClick={() => { closeSub(); onClose(); }} className="block text-white text-sm md:text-gray-700 md:text-base px-3 py-2 rounded hover:bg-black/10 hover:backdrop-blur-sm active:bg-black/20 md:hover:bg-gray-50">Visi dan Misi</Link>
                                  </li>
                                  <li>
                                    <Link href="/about#sejarah" onClick={() => { closeSub(); onClose(); }} className="block text-white text-sm md:text-gray-700 md:text-base px-3 py-2 rounded hover:bg-black/10 hover:backdrop-blur-sm active:bg-black/20 md:hover:bg-gray-50">Sejarah Hysteria</Link>
                                  </li>
                                  <li>
                                    <Link href="/about#panduan-visual" onClick={() => { closeSub(); onClose(); }} className="block text-white text-sm md:text-gray-700 md:text-base px-3 py-2 rounded hover:bg-black/10 hover:backdrop-blur-sm active:bg-black/20 md:hover:bg-gray-50">Panduan Visual</Link>
                                  </li>
                                </ul>
                      </div>
                    </div>
                  )}
                </li>

                <li className="w-full">
                  <div className="flex items-center gap-2 justify-end w-full text-xl font-semibold text-right">
                    <button
                      aria-haspopup="true"
                      aria-expanded={subOpen && activeSub === 'program'}
                      aria-controls="submenu-program"
                      onClick={(e) => { e.stopPropagation(); openSub('program'); }}
                      className="p-1 flex items-center cursor-pointer"
                    >
                      <ArrowIcon active={subOpen && activeSub === 'program'} rotate={subOpen && activeSub === 'program'} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openSub('program'); }}
                      aria-controls="submenu-program"
                      className={`flex items-center gap-2 text-base md:text-xl font-semibold text-right md:text-right hover:text-[#43334C] ${activeSub === 'program' ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
                    >
                      Program Hysteria
                    </button>
                  </div>

                  {isMobile && subOpen && activeSub === 'program' && (
                    <div className="pr-4 mt-2">
                      <div className="border-t border-b border-gray-200 p-0">
                          {categoryCache['program-hysteria'] ? (
                            <RenderParentOnly
                              items={categoryCache['program-hysteria'].items}
                              onClose={() => { closeSub(); onClose(); }}
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

                <li className="w-full">
                  <Link href="/event" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-base md:text-xl font-semibold text-right hover:text-[#43334C] cursor-pointer">
                    Event
                  </Link>
                </li>

                <li className="w-full">
                  <div className="flex items-center gap-2 justify-end w-full text-xl font-semibold text-right">
                    <button
                      aria-haspopup="true"
                      aria-expanded={subOpen && activeSub === 'platform'}
                      aria-controls="submenu-platform"
                      onClick={(e) => { e.stopPropagation(); openSub('platform'); }}
                      className="p-1 flex items-center cursor-pointer"
                    >
                      <ArrowIcon active={subOpen && activeSub === 'platform'} rotate={subOpen && activeSub === 'platform'} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openSub('platform'); }}
                      aria-controls="submenu-platform"
                      className={`flex items-center gap-2 text-base md:text-xl font-semibold text-right md:text-right hover:text-[#43334C] ${activeSub === 'platform' ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
                    >
                      Platform
                    </button>
                  </div>

                  {isMobile && subOpen && activeSub === 'platform' && (
                    <div className="pr-4 mt-2">
                      <div className="border-t border-b border-gray-200 p-0">
                          {categoryCache['platform'] ? (
                            <RenderParentOnly
                              items={categoryCache['platform'].items}
                              onClose={() => { closeSub(); onClose(); }}
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

                <li className="w-full">
                  <div className="flex items-center gap-2 justify-end w-full text-xl font-semibold text-right">
                    <button
                      aria-haspopup="true"
                      aria-expanded={subOpen && activeSub === 'artikel'}
                      aria-controls="submenu-artikel"
                      onClick={(e) => { e.stopPropagation(); openSub('artikel'); }}
                      className="p-1 flex items-center cursor-pointer"
                    >
                      <ArrowIcon active={subOpen && activeSub === 'artikel'} rotate={subOpen && activeSub === 'artikel'} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openSub('artikel'); }}
                      aria-controls="submenu-artikel"
                      className={`flex items-center gap-2 text-base md:text-xl font-semibold text-right md:text-right hover:text-[#43334C] ${activeSub === 'artikel' ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
                    >
                      Artikel
                    </button>
                  </div>

                  {isMobile && subOpen && activeSub === 'artikel' && (
                    <div className="pr-4 mt-2">
                      <div className="border-t border-b border-gray-200 p-0">
                          {categoryCache['artikel'] ? (
                            <RenderParentOnly
                              items={categoryCache['artikel'].items}
                              onClose={() => { closeSub(); onClose(); }}
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

                <li className="w-full">
                  <Link href="/contact" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-base md:text-xl font-semibold text-right hover:text-[#43334C] cursor-pointer">
                    Kontak Kami
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* nested submenu panel pinned left of the menu (desktop only) */}
        {subOpen && !isMobile && (
          <div className="absolute top-0 bottom-0 left-0 right-0 md:right-[calc(36vw-12px)] lg:right-[calc(300px-20px)] z-10 bg-white overflow-auto transition-transform duration-200" role="dialog" aria-modal="true" style={{boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)'}}>
            <div className="w-full h-full flex flex-col py-3 px-4 pr-6 md:pr-10 lg:pr-12">
              
              {/* header nested sheet */}
              <div className="flex items-center justify-between mb-2 border-b-2 border-gray-200 p-2">
                <div className="text-sm font-semibold text-gray-700">{activeSub === 'about' ? 'Tentang Hysteria' : activeSub === 'program' ? 'Program Hysteria' : activeSub === 'platform' ? 'Platform' : activeSub === 'artikel' ? 'Artikel' : ''}</div>
              </div>

              <div className="flex-1 overflow-auto">
                {activeSub === 'about' && (
                  <ul id="submenu-about" className="space-y-3 text-right pr-4">
                    <li><Link href="/about#visi" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Visi dan Misi</Link></li>
                    <li><Link href="/about#sejarah" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Sejarah Hysteria</Link></li>
                    <li><Link href="/about#panduan-visual" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Panduan Visual</Link></li>
                  </ul>
                )}

                {activeSub === 'program' && categoryCache['program-hysteria'] && (
                  <div id="submenu-program">
                    <RenderCategoryColumns
                      items={categoryCache['program-hysteria'].items}
                      onClose={() => { closeSub(); onClose(); }}
                    />
                  </div>
                )}

                {activeSub === 'platform' && categoryCache['platform'] && (
                  <div id="submenu-platform">
                    <RenderCategoryColumns
                      items={categoryCache['platform'].items}
                      onClose={() => { closeSub(); onClose(); }}
                    />
                  </div>
                )}

                {activeSub === 'artikel' && categoryCache['artikel'] && (
                  <div id="submenu-artikel">
                    <RenderCategoryColumns
                      items={categoryCache['artikel'].items}
                      onClose={() => { closeSub(); onClose(); }}
                    />
                  </div>
                )}

                {loading && (
                  <div className="text-center text-gray-500 py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
                    <p className="mt-2 text-sm">Memuat...</p>
                  </div>
                )}

                {error && (
                  <div className="text-center text-red-600 py-4">
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
