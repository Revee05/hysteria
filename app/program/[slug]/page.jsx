// app/program/[slug]/page.jsx
import { notFound } from "next/navigation";

// 1. Import komponen untuk tampilan Khusus (Punya Temanmu)
import ProgramHero from "@/components/program-detail/ProgramHero";
import ProgramPostsSection from "@/components/program-detail/ProgramPostsSection.client";
import { getProgramDetailData } from "@/lib/programDetailApi";

// 2. Import komponen untuk tampilan Default kita (Sidebar Pink / 6 Card Grid)
import DefaultProgramView from "@/components/program-detail/DefaultProgramView.client";

// Daftar SEMUA slug utama yang valid agar server aman dari halaman 404
const VALID_SLUGS = [
  'festival-kampung', 'festival-kota', 'festival-biennale', 
  'forum', 'music', 'pemutaran-film', 
  'flash-residency', 'kandang-tandang', 'safari-memori', 'safari-memori',
  'aston', 'sore-di-stonen', 'sapa-warga', 'hysteria-berkelana'
];

export default async function ProgramDetailPage({ params, searchParams }) {
  // Await untuk aturan Next.js 15+
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Ambil nama slug utama dari URL (misal: 'hysteria-berkelana' atau 'sapa-warga')
  const rawSlug = resolvedParams.slug;
  const actualSlug = Array.isArray(rawSlug) ? rawSlug[rawSlug.length - 1] : rawSlug;

  if (!VALID_SLUGS.includes(actualSlug)) {
    return notFound();
  }

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
        <ProgramHero title={data.title} subtitle={data.subtitle} />
        <ProgramPostsSection
          programSlug={actualSlug} 
          posts={data.posts}
          totalPages={data.totalPages}
        />
      </main>
    );
  }

  // KONDISI 2: JIKA BUKAN HYSTERIA BERKELANA 
  // (Sapa Warga, Flash Residency, Festival Kampung, Forum, dll)
  // Tampilkan komponen default milikmu!
  return <DefaultProgramView actualSlug={actualSlug} />;
}