import Image from "next/image";
import Hero from "../_sectionComponents/halaman_utama/Hero";
import PlatformKami from "../_sectionComponents/halaman_utama/platform_kami";
import ArtikelHysteria from "../_sectionComponents/halaman_utama/artikel_hysteria";

export default function Home() {
  return (
    <div className="flex items-center justify-center bg-zinc-900 text-white font-sans dark:bg-black">

      <div className="relative w-full max-w-[1920px] lg:w-[1920px] min-h-screen mx-auto flex flex-col items-center justify-start py-32 px-16 bg-[#0b1220] sm:items-start opacity-100">
        <Hero />
        <PlatformKami />
        <ArtikelHysteria />
      </div>
    </div>
  );
}
