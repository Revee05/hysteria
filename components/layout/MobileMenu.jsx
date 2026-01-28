"use client";

import React, { useState } from "react";
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

export default function MobileMenu({ open, onClose }) {
  const [subOpen, setSubOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);

  function openSub(key) {
    setActiveSub(key);
    setSubOpen(true);
  }

  function closeSub() {
    setSubOpen(false);
    setActiveSub(null);
  }

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
              <ul className="flex flex-col gap-1 items-end justify-start pt-6 md:pt-4">
                <li className="w-full">
                  <Link href="/" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right hover:text-[#43334C] cursor-pointer">
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
                      className={`flex items-center gap-2 text-xl font-semibold text-right md:text-right hover:text-[#43334C] ${activeSub === 'about' ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
                    >
                      Tentang Kami
                    </button>
                  </div>
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
                      className={`flex items-center gap-2 text-xl font-semibold text-right md:text-right hover:text-[#43334C] ${activeSub === 'program' ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
                    >
                      Program Hysteria
                    </button>
                  </div>
                </li>

                <li className="w-full">
                  <Link href="/event" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right hover:text-[#43334C] cursor-pointer">
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
                      className={`flex items-center gap-2 text-xl font-semibold text-right md:text-right hover:text-[#43334C] ${activeSub === 'platform' ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
                    >
                      Platform
                    </button>
                  </div>
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
                      className={`flex items-center gap-2 text-xl font-semibold text-right md:text-right hover:text-[#43334C] ${activeSub === 'artikel' ? 'text-[#43334C]' : 'text-white'} cursor-pointer`}
                    >
                      Artikel
                    </button>
                  </div>
                </li>

                <li className="w-full">
                  <Link href="/contact" onClick={onClose} className="flex items-center gap-3 justify-end w-full text-white text-xl font-semibold text-right hover:text-[#43334C] cursor-pointer">
                    Kontak Kami
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* nested submenu panel pinned left of the menu */}
        {subOpen && (
          <div className="absolute top-0 bottom-0 left-0 right-0 md:right-[calc(36vw-12px)] lg:right-[calc(300px-20px)] z-10 bg-[#f7f7f7] overflow-auto transition-transform duration-200" role="dialog" aria-modal="true" style={{boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)'}}>
            <div className="w-full h-full flex flex-col p-6 pr-8 md:pr-12 lg:pr-16 border border-red-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-md font-semibold text-gray-700">{activeSub === 'about' ? 'Tentang Hysteria' : activeSub === 'program' ? 'Program Hysteria' : activeSub === 'platform' ? 'Platform' : activeSub === 'artikel' ? 'Artikel' : ''}</div>                  
                  {/* close btn untuk nested sheet */}
                  <button onClick={closeSub} aria-label="Close submenu" className="p-2 text-gray-600 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
              </div>

              <div className="flex-1 overflow-auto">
                {activeSub === 'about' && (
                  <ul id="submenu-about" className="space-y-3 text-right pr-4">
                    <li><Link href="/about#visi" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Visi dan Misi</Link></li>
                    <li><Link href="/about#sejarah" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Sejarah Hysteria</Link></li>
                    <li><Link href="/about#panduan-visual" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Panduan Visual</Link></li>
                  </ul>
                )}

                {activeSub === 'program' && (
                  <ul id="submenu-program" className="space-y-3 text-right pr-4">
                    <li><Link href="/program/1" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Program A</Link></li>
                    <li><Link href="/program/2" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Program B</Link></li>
                  </ul>
                )}

                {activeSub === 'platform' && (
                  <ul id="submenu-platform" className="space-y-3 text-right pr-4">
                    <li><Link href="/platform/web" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Platform Web</Link></li>
                    <li><Link href="/platform/mobile" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Platform Mobile</Link></li>
                  </ul>
                )}

                {activeSub === 'artikel' && (
                  <ul id="submenu-artikel" className="space-y-3 text-right pr-4">
                    <li><Link href="/artikel" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Terbaru</Link></li>
                    <li><Link href="/artikel/categories" onClick={() => { closeSub(); onClose(); }} className="text-gray-700 cursor-pointer">Kategori</Link></li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
