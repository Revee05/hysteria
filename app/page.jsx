import Image from "next/image";
import Hero from "../_sectionComponents/halaman_utama/Hero";
import PlatformKami from "../_sectionComponents/halaman_utama/platform_kami";
import ArtikelHysteria from "../_sectionComponents/halaman_utama/artikel_hysteria";

export default function Home() {
  return (
    <div className="flex flex-col bg-white text-zinc-900 font-sans dark:bg-white dark:text-zinc-900">
      <Hero />
      {/* <PlatformKami />
      <ArtikelHysteria /> */}
    </div>
  );
}
