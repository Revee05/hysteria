"use client";

import { useEffect, useMemo, useState } from "react";
import TimHero from "../tim/_components/TimHero";
import { Poppins } from "next/font/google";
import SejarahHysteria from "./_components/SejarahHysteria";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});

export default function TentangPage() {
  const defaultDescription = "Tentang Hysteria";
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState({
    title: "Tentang Hysteria",
    subtitle: "Hysteria , Colaboratorium and Creative Impact Hub",
    imageUrl: "/image/tim-hero.png",
  });
  const [visiContent, setVisiContent] = useState("Misi Hysteria");
  const [descriptionContent, setDescriptionContent] = useState(defaultDescription);
  const [misiText, setMisiText] = useState("");
  const [sejarahItems, setSejarahItems] = useState([]);
  const [visualItems, setVisualItems] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [heroRes, visiMisiRes, sejarahRes, panduanRes] = await Promise.all([fetch("/api/page-hero/tentang", { method: "GET" }), fetch("/api/tentang/visi-misi", { method: "GET" }), fetch("/api/tentang/sejarah", { method: "GET" }), fetch("/api/tentang/panduan-visual", { method: "GET" })]);

        const [heroJson, visiMisiJson, sejarahJson, panduanJson] = await Promise.all([heroRes.json().catch(() => null), visiMisiRes.json().catch(() => null), sejarahRes.json().catch(() => null), panduanRes.json().catch(() => null)]);

        if (!isMounted) return;

        if (heroJson?.success && heroJson?.data) {
          const pageHero = heroJson.data;
          setHeroData((prev) => ({
            imageUrl: pageHero.imageUrl ?? prev.imageUrl,
            title: pageHero.title || prev.title,
            subtitle: pageHero.subtitle || prev.subtitle,
          }));
        }

        if (visiMisiJson?.success && visiMisiJson?.data) {
          const aboutData = visiMisiJson.data;
          setDescriptionContent(aboutData.description || defaultDescription);
          setVisiContent(aboutData.visi || "");
          // const normalizedMisi = typeof aboutData.misi === "string" ? aboutData.misi : Array.isArray(aboutData.misi) ? aboutData.misi.join("\n") : "";
          setMisiText(aboutData.misi || "");
        }

        if (sejarahJson?.success) {
          const items = Array.isArray(sejarahJson?.data?.items) ? sejarahJson.data.items : [];
          setSejarahItems(items);
        }

        if (panduanJson?.success) {
          const items = Array.isArray(panduanJson?.data?.items) ? panduanJson.data.items : [];
          setVisualItems(items);
        }
      } catch (error) {
        console.error("Error fetching tentang page data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedMisiList = useMemo(() => {
    const parsedMisi = String(misiText || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (parsedMisi.length > 0) return parsedMisi;
    return ["Visi Hysteria"];
  }, [misiText]);

  const resolvedVisualItems = useMemo(() => {
    if (Array.isArray(visualItems) && visualItems.length > 0) return visualItems;
    return [{ title: "Brand Guideline" }, { title: "Logo Hysteria" }, { title: "Video Profil Hysteria" }, { title: "Stationary & Promotion Media" }, { title: "Template PPT" }, { title: "Merchandise Guideline" }];
  }, [visualItems]);

  return (
    <main className={`${poppins.variable} font-sans bg-white pb-20 md:pb-32`}>
      {/* Banner */}
      <TimHero
        title={heroData.title}
        subtitle={heroData.subtitle}
        imageUrl={heroData.imageUrl}
      />

      <div className="relative max-w-[1400px] mx-auto px-6">
        <section className="py-12 md:py-20 text-justify md:text-center px-6 md:px-0 relative z-10 pt-16 md:pt-[100px]">
          <div className="max-w-[1520px] mx-auto">
            <p className="text-[16px] md:text-[20px] leading-relaxed md:leading-[1.5] text-black font-poppins whitespace-pre-line px-2 md:px-0">{descriptionContent}</p>
          </div>
        </section>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 space-y-16 md:space-y-24">
        {/* Visi Section */}
        <section
          id="visi-misi"
          className="relative px-2">
          <div className="rounded-[10px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] md:shadow-[0px_0px_15px_0px_rgba(0,0,0,0.25)] p-8 md:p-10 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-12">
            <div className="w-full md:w-1/4">
              <h2 className="font-bold text-[24px] sm:text-[32px] md:text-[40px] xl:text-[52px] leading-tight text-black font-poppins text-center md:text-left">Visi:</h2>
            </div>
            <div className="w-full md:w-3/4 flex items-center">
              <p className="whitespace-pre-line text-[18px] md:text-[24px] leading-relaxed text-black font-poppins text-center md:text-left w-full">{visiContent}</p>
            </div>
          </div>
        </section>

        {/* Misi Section */}
        <section className="relative px-2 md:px-0">
          <div className="rounded-[10px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] md:shadow-[0px_0px_15px_0px_rgba(0,0,0,0.25)] p-8 md:p-10 flex flex-col md:flex-row items-start gap-6 md:gap-12">
            <div className="w-full md:w-1/4">
              <h2 className="font-bold text-[24px] sm:text-[32px] md:text-[40px] xl:text-[52px] leading-tight text-black font-poppins text-center md:text-left">Misi:</h2>
            </div>
            <div className="w-full md:w-3/4">
              <p className="whitespace-pre-line text-[18px] md:text-[24px] leading-relaxed text-black font-poppins text-left">{misiText}</p>
            </div>
          </div>
        </section>

        {/* Sejarah Hysteria Section */}
        <section
          id="sejarah"
          className="pt-8 md:pt-12 px-2 md:px-0">
          <h2 className="text-center font-bold text-[24px] sm:text-[32px] md:text-[40px] xl:text-[52px] mb-8 md:mb-16 text-black font-poppins uppercase tracking-wider">Sejarah Hysteria</h2>
          <SejarahHysteria items={sejarahItems} />
        </section>

        {/* Panduan Visual Hysteria Section */}
        <section
          id="panduan-visual"
          className="pt-8 md:pt-12 px-2 md:px-0">
          <h2 className="text-center font-bold text-[24px] sm:text-[32px] md:text-[40px] xl:text-[52px] mb-8 md:mb-16 text-black font-poppins uppercase tracking-wider">Panduan Visual Hysteria</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-[35px] max-w-[1550px] mx-auto">
            {resolvedVisualItems.map((item, index) => (
              <a
                key={item.id || index}
                href={item.link || "#"}
                target={item.link ? "_blank" : undefined}
                rel={item.link ? "noopener noreferrer" : undefined}
                className={`h-[120px] sm:h-[180px] md:h-[265px] flex items-center justify-center rounded-[10px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] md:shadow-[0px_0px_15px_0px_rgba(0,0,0,0.25)] p-2 md:p-12 transition-transform hover:scale-105 ${index % 2 === 0 ? "bg-[#e83c91] text-white" : "bg-[#d9d9d9] text-[#43334c]"}`}>
                <h3 className="font-bold text-[14px] sm:text-[24px] md:text-[28px] leading-tight text-center font-poppins break-words max-w-full md:max-w-[436px] uppercase">{item.title}</h3>
              </a>
            ))}
          </div>
        </section>
      </div>

      {loading ? <div className="sr-only">Memuat konten tentang...</div> : null}
    </main>
  );
}
