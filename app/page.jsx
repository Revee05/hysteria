
import Hero from "../_sectionComponents/halaman_utama/Hero";
import SorotanEvent from "../_sectionComponents/halaman_utama/sorotan_event";
import PlatformKami from "../_sectionComponents/halaman_utama/platform_kami";
import ArtikelHysteria from "../_sectionComponents/halaman_utama/artikel_hysteria";
import Colaboration from "../_sectionComponents/halaman_utama/colaboration";

export const metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div className="flex flex-col bg-white text-zinc-900 font-sans dark:bg-white dark:text-zinc-900">
      <Hero />
      <SorotanEvent />
      <PlatformKami />
      <ArtikelHysteria />
      <Colaboration />
    </div>
  );
}
