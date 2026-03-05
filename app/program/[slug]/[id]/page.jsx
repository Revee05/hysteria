import { notFound } from "next/navigation";

// 1. Komponen buatan temanmu (Hysteria Berkelana)
import ProgramHero from "@/components/program-detail/ProgramHero";
import PostDetailSection from "@/components/program-post-detail/PostDetailSection";
import OtherReviewsSection from "@/components/program-post-detail/OtherReviewsSection";
import { getProgramPostDetailData } from "@/lib/programDetailApi";

// 2. Komponen Default Dummy buatan kita!
import DefaultProgramPostDetailView from "@/components/program-post-detail/DefaultProgramPostDetailView";

export default async function ProgramPostDetailPage({ params }) {
  // Await params untuk Next.js 15+
  const resolvedParams = await params;
  const { slug, id } = resolvedParams;

  // KONDISI 1: HYSTERIA BERKELANA (Kode temanmu)
  if (slug === 'hysteria-berkelana') {
    const data = await getProgramPostDetailData({ slug, id });
    return (
      <>
        <ProgramHero title={data.title} subtitle={data.subtitle} />
        <PostDetailSection post={data.post} />
        <OtherReviewsSection
          title="Review Lainnya"
          items={data.otherReviews}
          programSlug={slug}
          moreHref={`/program/${slug}`}
        />
      </>
    );
  }

  // KONDISI 2: DEFAULT / SLUG LAINNYA (Forum, Aston, dll)
  // Kita tampilkan halaman dummy super keren sesuai desain UI!
  return <DefaultProgramPostDetailView slug={slug} id={id} />;
}