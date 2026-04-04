// app/program/page.jsx

// 1. TAMBAHKAN INI BIAR NEXT.JS GAK NGE-CACHE (SELALU NAMPILIN DATA BARU)
export const dynamic = "force-dynamic";

import HeadSection from "../../_sectionComponents/halaman_program/head.Section";
import FestivalSection from "../../_sectionComponents/halaman_program/festival.section";
import ForumSection from "../../_sectionComponents/halaman_program/forum.section";
import MusicSection from "../../_sectionComponents/halaman_program/music.section";
import ResidencySection from "../../_sectionComponents/halaman_program/residency.section";
import PodcastSection from "../../_sectionComponents/halaman_program/podcast.section";
import FilmSection from "../../_sectionComponents/halaman_program/film.section";
import VideoSeriesSection from "../../_sectionComponents/halaman_program/video_series.Section"; 

import { prisma } from "@/lib/prisma";

export default async function ProgramPage() {
  
  const settings = await prisma.pageProgram.findUnique({
    where: { pageSlug: "program" },
  });

  const mainHeroData = settings?.mainHero || {};
  const coversData = settings?.covers || {};
  
  // 👇 INI DIA KUNCI JAWABANNYA! Kita ambil data podcast dari dalam covers
  const podcastsData = coversData.podcasts || {};

  return (
    <main className="min-h-screen bg-white text-black font-sans pb-20">
      <div className="max-w-8xl mx-auto px-5 md:px-8 py-12">
        
        <HeadSection mainHero={mainHeroData} />
        
        <FestivalSection covers={coversData} />
        
        <ForumSection />
        <MusicSection />
        
        <ResidencySection covers={coversData} />
        
        {/* Sekarang data podcast yang tersembunyi sudah berhasil dilempar! */}
        <PodcastSection podcasts={podcastsData} />
        
        <FilmSection />
        
        <VideoSeriesSection covers={coversData} />
        
      </div>
    </main>
  );
}