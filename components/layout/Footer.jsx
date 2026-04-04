"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IconInstagram, IconFacebook, IconYoutube, IconX, IconEnvelope, IconTelephone, IconMap } from "../ui/icon";
import { withWebsiteInfoDefaults } from "../../lib/defaults/website-info";

export default function Footer({ websiteInfo }) {
  const fallbackWebsiteInfo = withWebsiteInfoDefaults(websiteInfo || {});
  const [resolvedWebsiteInfo, setResolvedWebsiteInfo] = useState(fallbackWebsiteInfo);
  const [contactInfo, setContactInfo] = useState({
    instagramUrl: "https://instagram.com/grobakhysteria",
    facebookUrl: "https://facebook.com/kolektifhysteria",
    youtubeUrl: "https://youtube.com/@kolektifhysteria",
    twitterUrl: "https://twitter.com/grobakhysteria",
    email: "hysteriakita59@gmail.com",
    whatsappNumber: "628121272483",
    locationAddress: "Jl Stonen No.29 Gajahmungkur, Kota Semarang, Jawa Tengah 50233",
  });

  const pathname = usePathname() || "";
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;

    let isMounted = true;

    async function loadFooterData() {
      try {
        const [contactRes, websiteInfoRes] = await Promise.all([fetch("/api/contact"), fetch("/api/website-info")]);

        const contactJson = await contactRes.json().catch(() => null);
        const websiteInfoJson = await websiteInfoRes.json().catch(() => null);

        if (!isMounted) return;

        const contact = contactJson?.data?.contact;
        if (contact) {
          setContactInfo((prev) => ({
            instagramUrl: contact.instagramUrl || prev.instagramUrl,
            facebookUrl: contact.facebookUrl || prev.facebookUrl,
            youtubeUrl: contact.youtubeUrl || prev.youtubeUrl,
            twitterUrl: contact.twitterUrl || prev.twitterUrl,
            email: contact.email || prev.email,
            whatsappNumber: contact.whatsappNumber || prev.whatsappNumber,
            locationAddress: contact.locationAddress || prev.locationAddress,
          }));
        }

        const websiteInfoData = websiteInfoJson?.data?.websiteInfo;
        if (websiteInfoData) {
          setResolvedWebsiteInfo(withWebsiteInfoDefaults(websiteInfoData));
        }
      } catch {
        // Keep fallback links and website info when API is unavailable.
      }
    }

    loadFooterData();

    return () => {
      isMounted = false;
    };
  }, [isAdminRoute]);

  if (isAdminRoute) return null;

  const year = new Date().getFullYear();
  return (
    <footer
      className="w-full flex flex-col flex-grow"
      style={{ backgroundColor: "#43334c", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mx-auto w-full max-w-[1920px] flex-1 px-8 py-10 flex flex-col justify-start text-sm text-white opacity-100 transform rotate-0">
        {/* row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 gap-8 items-start">
          {/* kolom 1 */}
          <div className="space-y-3 self-start">
            <div className="w-12 h-12 flex items-center justify-center ml-1">
              <Image
                src={resolvedWebsiteInfo.logoWebsite}
                alt={`${resolvedWebsiteInfo.judul} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>

            <div className="text-xs text-white/70 whitespace-pre-line">{resolvedWebsiteInfo.deskripsiFooter}</div>

            <div className="mt-2 text-sm font-bold text-white">Ikuti kami</div>

            <div className="flex items-center gap-3 text-white">
              <a
                href={contactInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-90"
                aria-label="Instagram">
                <IconInstagram
                  className="w-5 h-5 text-white"
                  size={20}
                />
              </a>
              <a
                href={contactInfo.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-90"
                aria-label="Facebook">
                <IconFacebook
                  className="w-5 h-5 text-white"
                  size={20}
                />
              </a>
              <a
                href={contactInfo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-90"
                aria-label="YouTube">
                <IconYoutube
                  className="w-5 h-5 text-white"
                  size={20}
                />
              </a>
              <a
                href={contactInfo.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-90"
                aria-label="X">
                <IconX
                  className="w-5 h-5 text-white"
                  size={20}
                />
              </a>
            </div>
          </div>

          {/* kolom 2,3,4 grouped so gaps between them are equal */}
          <div className="grid grid-cols-1 md:grid-cols-3 ">
            {/* kolom 2 */}
            <div>
              <div className="font-bold mb-3">Platform</div>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link
                    href="#"
                    className="hover:underline">
                    Kolektif Hysteria
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:underline">
                    Art Lab
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:underline">
                    Peta Kota
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:underline">
                    Bukit Buku
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:underline">
                    laki Masak
                  </Link>
                </li>
              </ul>
            </div>

            {/* kolom 3 */}
            <div>
              <div className="font-bold mb-3">Quick Link</div>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link
                    href="/events"
                    className="hover:underline">
                    Event Terbaru
                  </Link>
                </li>
                <li>
                  <Link
                    href="/articles"
                    className="hover:underline">
                    Artikel Pilihan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:underline">
                    Tentang
                  </Link>
                </li>
              </ul>
            </div>

            {/* kolom 4 */}
            {/* <div className="border border-zink-400"> */}
            <div>
              <div className="font-bold mb-3">Hubungi Kami</div>
              <div className="text-white/70 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div>
                    <IconEnvelope
                      className="w-4 h-4 text-white"
                      size={16}
                    />
                  </div>
                  <span>{contactInfo.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div>
                    <IconTelephone
                      className="w-4 h-4 text-white"
                      size={16}
                    />
                  </div>
                  <span>{contactInfo.whatsappNumber}</span>
                </div>

                <div className="flex items-start gap-2">
                  <div>
                    <IconMap
                      className="w-4 h-4 text-white mt-0.5"
                      size={16}
                    />
                  </div>
                  <span className="whitespace-pre-line">{contactInfo.locationAddress}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* row 2 */}
        <div
          className="mt-10 pt-3 flex flex-col md:flex-row md:justify-between gap-4 text-xs text-white"
          style={{ borderTop: "2px solid rgba(255, 255, 255, 0.12)" }}>
          <div>
            © {year} {resolvedWebsiteInfo.judul}. All Rights Reserved.
          </div>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="hover:underline">
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:underline">
              Terms
            </Link>
            <Link
              href="/contact"
              className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
