"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconInstagram, IconFacebook, IconYoutube, IconX, IconEnvelope, IconTelephone, IconMap } from "../ui/icon";

export default function Footer() {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/admin")) return null;

  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
      <div className="mx-auto w-full max-w-[1920px] lg:h-[393px] h-auto px-6 py-12 text-sm text-zinc-600 dark:text-zinc-400 opacity-100 transform rotate-0">
        
        {/* row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 gap-8 items-start">  
          {/* kolom 1 */}
          <div className="space-y-3 self-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-800 flex items-center justify-center text-white font-bold">H</div>
              <div>
                <div className="font-semibold">Hysteria</div>
              </div>
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              Hysteria adalah ruang kolektif seni, riset, <br /> dan budaya yang berbasis di Semarang.
            </div>

            <div className="mt-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Ikuti kami</div>

            <div className="flex items-center gap-3 text-zinc-500">
              <Link href="#" className="hover:text-zinc-700" aria-label="Instagram">
                <IconInstagram className="w-5 h-5" size={20} />
              </Link>
              <Link href="#" className="hover:text-zinc-700" aria-label="Facebook">
                <IconFacebook className="w-5 h-5" size={20} />
              </Link>
              <Link href="#" className="hover:text-zinc-700" aria-label="YouTube">
                <IconYoutube className="w-5 h-5" size={20} />
              </Link>
              <Link href="#" className="hover:text-zinc-700" aria-label="X">
                <IconX className="w-5 h-5" size={20} />
              </Link>
            </div>
          </div>

          {/* kolom 2,3,4 grouped so gaps between them are equal */}
          <div className="grid grid-cols-1 md:grid-cols-3 ">
            {/* kolom 2 */}
            <div>
              <div className="font-semibold mb-3">Platform</div>
              <ul className="space-y-2 text-zinc-500">
                <li><Link href="#" className="hover:underline">Kolektif Hysteria</Link></li>
                <li><Link href="#" className="hover:underline">Art Lab</Link></li>
                <li><Link href="#" className="hover:underline">Peta Kota</Link></li>
                <li><Link href="#" className="hover:underline">Buku Buku</Link></li>
              </ul>
            </div>

            {/* kolom 3 */}
            <div>
              <div className="font-semibold mb-3">Quick Link</div>
              <ul className="space-y-2 text-zinc-500">
                <li><Link href="/events" className="hover:underline">Event Terbaru</Link></li>
                <li><Link href="/articles" className="hover:underline">Artikel Pilihan</Link></li>
                <li><Link href="/about" className="hover:underline">Tentang</Link></li>
              </ul>
            </div>

            {/* kolom 4 */}
            <div>
              <div className="font-semibold mb-3">Hubungi Kami</div>
              <div className="text-zinc-500 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <IconEnvelope className="w-4 h-4 text-zinc-500" size={16} />
                    <span>hysteriaicta58@gmail.com</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconTelephone className="w-4 h-4 text-zinc-500" size={16} />
                    <span>+62 812 1427 2483</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <IconMap className="w-4 h-4 text-zinc-500 mt-0.5" size={16} />
                    <span>Jl Stonen No.29 Gajahmungkur, Kota Semarang, Jawa Tengah 50233</span>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* row 2 */}
        <div className="mt-10 border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col md:flex-row md:justify-between gap-4 text-xs text-zinc-500">
          <div>© {year} Hysteria. All Rights Reserved.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
