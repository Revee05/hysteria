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
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState({
    title: "Tentang Hysteria",
    subtitle: "Hysteria , Colaboratorium and Creative Impact Hub",
    imageUrl: "/image/tim-hero.png",
  });
  const [visiContent, setVisiContent] = useState("Terwujudnya ekosistem seni dan kreativitas yang sehat, menyejahterakan, dan berkelanjutan");
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
    return ["Terciptanya Lembaga yang berdikari", "Terwujudnya kreator yang berdedikasi, tangguh, dan berdaya", "Terfasilitasinya perkembangan komunitas dan platform", "Eksisnya sumber daya manusia dan komunitas yang peduli pada nilai budaya, kearifan lokal, karakter bangsa, dan memahami keragaman eskpresi budaya sehingga tercipta jiwa toleran", "Adanya kebijakan budaya dan kreativitas yang ideal", "Komunitas berdaya (ekonomi sosbud) serta Kontekstual", "Terciptanya kreator baik individu maupun kolektif yang terkoneksi, berprestasi dan punya sensibilitas di skala lokal– nasional– internasional"];
  }, [misiText]);

  const resolvedVisualItems = useMemo(() => {
    if (Array.isArray(visualItems) && visualItems.length > 0) return visualItems;
    return [{ title: "Brand Guideline" }, { title: "Logo Hysteria" }, { title: "Video Profil Hysteria" }, { title: "Stationary & Promotion Media" }, { title: "Template PPT" }, { title: "Merchandise Guideline" }];
  }, [visualItems]);

  return (
    <main className={`${poppins.variable} font-sans bg-white pb-32`}>
      {/* Banner */}
      <TimHero
        title={heroData.title}
        subtitle={heroData.subtitle}
        imageUrl={heroData.imageUrl}
      />

      <div className="relative w-full">
        <section className="py-20 text-center px-4 md:px-0 relative z-10 pt-[100px]">
          <div className="max-w-[1520px] mx-auto">
            <p className="text-[20px] leading-[1.5] text-black font-poppins">Sebagai laboratorium bersama dan diharapkan memberikan dampak perubahan dengan penekanan kreativitas, Hysteria memimpikan terwujudnya ekosisem seni dan kreatifitas yang sehat, menyejahterakan, dan berkelanjutan. Dibentuk sejak 11 September 2004 Hysteria selain produksi artistik juga memfasilitasi pertemuan lintas disipliner dalam skala lokal hingga global untuk mencari trobosan-trobosan dalam persoalan kreatifitas, seni, komunitas, anak muda, dan isu kota.</p>
          </div>
        </section>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-0 space-y-24">
        {/* Visi Section */}
        <section className="relative">
          <div className="rounded-[10px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.25)] p-12 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-12">
            <div className="w-full md:w-1/4">
              <h2 className="font-bold text-[40px] leading-[1.5] text-black font-poppins text-center md:text-left">Visi:</h2>
            </div>
            <div className="w-full md:w-3/4 flex items-center">
              <p className="whitespace-pre-line text-[24px] leading-[1.5] text-black font-poppins text-center md:text-left">{visiContent}</p>
            </div>
          </div>
        </section>

        {/* Misi Section */}
        <section className="relative">
          <div className="rounded-[10px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.25)] p-12 md:p-16 flex flex-col md:flex-row items-start gap-12">
            <div className="w-full md:w-1/4">
              <h2 className="font-bold text-[40px] leading-[1.5] text-black font-poppins text-center md:text-left">Misi:</h2>
            </div>
            <div className="w-full md:w-3/4">
              <p className="whitespace-pre-line text-[24px] leading-[1.5] text-black font-poppins text-center md:text-left">{misiText}</p>
            </div>
          </div>
        </section>

        {/* Sejarah Hysteria Section */}
        <section className="pt-12">
          <h2 className="text-center font-bold text-[40px] md:text-[64px] mb-16 text-black font-poppins">Sejarah Hysteria</h2>
          <SejarahHysteria items={sejarahItems} />
        </section>

        {/* Panduan Visual Hysteria Section */}
        <section className="pt-12">
          <h2 className="text-center font-bold text-[40px] md:text-[64px] mb-16 text-black font-poppins">Panduan Visual Hysteria</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[35px] max-w-[1550px] mx-auto">
            {resolvedVisualItems.map((item, index) => (
              <a
                key={item.id || index}
                href={item.link || "#"}
                target={item.link ? "_blank" : undefined}
                rel={item.link ? "noopener noreferrer" : undefined}
                className={`h-[265px] flex items-center justify-center rounded-[10px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.25)] p-12 transition-transform hover:scale-105 ${index % 2 === 0 ? "bg-[#e83c91] text-white" : "bg-[#d9d9d9] text-[#43334c]"}`}>
                <h3 className="font-bold text-[32px] md:text-[40px] leading-[1.25] text-center font-poppins break-words max-w-[436px]">{item.title}</h3>
              </a>
            ))}
          </div>
          <p className="text-center mt-12 text-gray-500 italic font-poppins text-lg">Lihat panduan lengkap visual branding Hysteria.</p>
        </section>
      </div>

      {loading ? <div className="sr-only">Memuat konten tentang...</div> : null}
    </main>
  );
}
