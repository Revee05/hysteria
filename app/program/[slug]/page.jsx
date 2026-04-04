// app/program/[slug]/page.jsx
import { notFound } from "next/navigation";

// 1. Import Prisma untuk ambil data dari database
import { prisma } from "@/lib/prisma";

// 2. Import komponen untuk tampilan Khusus (Punya Temanmu)
import ProgramHero from "@/components/program-detail/ProgramHero";
import ProgramPostsSection from "@/components/program-detail/ProgramPostsSection.client";
import { getProgramDetailData } from "@/lib/programDetailApi";

// 3. Import komponen untuk tampilan Default kita (Sidebar Pink / 6 Card Grid)
import DefaultProgramView from "@/components/program-detail/DefaultProgramView.client";

// Daftar SEMUA slug utama yang valid agar server aman dari halaman 404
const VALID_SLUGS = [
  'festival-kampung', 'festival-kota', 'festival-biennale', 
  'forum', 'music', 'pemutaran-film', 
  'flash-residency', 'kandang-tandang', 'safari-memori',
  'aston', 'sore-di-stonen', 'sapa-warga', 'hysteria-berkelana'
];

// KAMUS PENERJEMAH (Mapping): 
// Mengubah nama di URL (kebab-case) menjadi nama key di Database (camelCase) yang tadi kita buat di Admin
const slugToDbKey = {
  'festival-kampung': 'festivalKampung',
  'festival-kota': 'festivalKota',
  'festival-biennale': 'biennale',
  'forum': 'forum',
  'music': 'musik',
  'pemutaran-film': 'pemutaranFilm',
  'flash-residency': 'flashResidency',
  'kandang-tandang': 'kandangTandang',
  'safari-memori': 'safariMemori',
  'aston': 'aston', 
  'sore-di-stonen': 'soreDiStonen', 
  'sapa-warga': 'sapaWarga',
  'hysteria-berkelana': 'hysteriaBerkelana'
};

export default async function ProgramDetailPage({ params, searchParams }) {
  // Await untuk aturan Next.js 15+
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Ambil nama slug utama dari URL
  const rawSlug = resolvedParams.slug;
  const actualSlug = Array.isArray(rawSlug) ? rawSlug[rawSlug.length - 1] : rawSlug;

  if (!VALID_SLUGS.includes(actualSlug)) {
    return notFound();
  }

  // ==========================================================
  // AMBIL DATA HERO DARI DATABASE PRISMA
  // ==========================================================
  const settings = await prisma.pageProgram.findUnique({
    where: { pageSlug: "program" },
  });

  const slugHerosData = settings?.slugHeros || {};
  
  // Terjemahkan URL slug jadi key Database
  const dbKey = slugToDbKey[actualSlug]; 
  
  // Ambil data spesifik untuk halaman ini saja (Title, Subtitle, Image)
  const heroData = slugHerosData[dbKey] || null;

  // ==========================================================
  // LOGIKA SWITCHER (PENGATUR KOMPONEN)
  // ==========================================================

  // KONDISI 1: JIKA USER MEMBUKA HALAMAN HYSTERIA BERKELANA
  if (actualSlug === 'hysteria-berkelana') {
    const q = resolvedSearchParams?.q ?? "";
    const page = Number(resolvedSearchParams?.page ?? 1);
    
    // Fetch API dari backend temanmu
    const data = await getProgramDetailData({ slug: actualSlug, q, page });

    return (
      <main className="min-h-screen bg-white">
        {/* Kita oper heroData ke ProgramHero supaya dia bisa pakai Gambar/Title dari Admin */}
        <ProgramHero 
          title={heroData?.title || data.title} 
          subtitle={heroData?.subtitle || data.subtitle} 
          heroImage={heroData?.image} // Lempar gambar dari DB
        />
        <ProgramPostsSection
          programSlug={actualSlug} 
          posts={data.posts}
          totalPages={data.totalPages}
        />
      </main>
    );
  }

  // KONDISI 2: JIKA BUKAN HYSTERIA BERKELANA 
  // (Sapa Warga, Flash Residency, Festival Kampung, dll)
  // Tampilkan komponen default milikmu, dan JANGAN LUPA lempar `heroData`-nya!
  return <DefaultProgramView actualSlug={actualSlug} heroData={heroData} />;
}