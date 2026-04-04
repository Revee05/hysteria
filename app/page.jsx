import Hero from "../_sectionComponents/halaman_utama/Hero";
import NextDynamic from "next/dynamic";
import { getPublicWebsiteInfo } from "../modules/admin/websiteInfo/index.js";
import { withWebsiteInfoDefaults } from "../lib/defaults/website-info.js";
import { getLatestEvents } from "../modules/public/events/services/event.service";
import { getLatestArticles } from "../modules/public/articles/services/article.public.service";

// Lazy loading components for better initial performance
const SorotanEvent = NextDynamic(() => import("../_sectionComponents/halaman_utama/sorotan_event"), {
  loading: () => <LoadingSkeleton />,
});
const PlatformKami = NextDynamic(() => import("../_sectionComponents/halaman_utama/platform_kami"));
const ArtikelHysteria = NextDynamic(() => import("../_sectionComponents/halaman_utama/artikel_hysteria"));
const Colaboration = NextDynamic(() => import("../_sectionComponents/halaman_utama/colaboration"));

function LoadingSkeleton() {
  return (
    <div className="w-full py-20 bg-white">
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="h-10 w-64 bg-zinc-100 rounded-lg mx-auto mb-4 animate-pulse" />
        <div className="h-6 w-96 bg-zinc-50 rounded-lg mx-auto mb-12 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[450px] bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const info = withWebsiteInfoDefaults(await getPublicWebsiteInfo());
  return {
    title: { absolute: info.judul },
    description: info.deskripsi,
  };
}

// export const metadata = {
//   title: { absolute: "test" },
//   description: "Hysteria adalah ruang kolektif seni, riset, dan budaya yang berbasis di Semarang.",
// };

export default async function Home() {
  const latestEvents = await getLatestEvents(10);
  const latestArticles = await getLatestArticles(3);

  return (
    <div className="flex flex-col bg-white text-zinc-900 font-sans dark:bg-white dark:text-zinc-900">
      <Hero />
      <SorotanEvent initialEvents={latestEvents} />
      <PlatformKami />
      <ArtikelHysteria initialArticles={latestArticles} />
      <Colaboration />
    </div>
  );
}
