import ProgramHero from "@/components/program-detail/ProgramHero";
import PostDetailSection from "@/components/program-post-detail/PostDetailSection";
import OtherReviewsSection from "@/components/program-post-detail/OtherReviewsSection";
import { getProgramPostDetailData } from "@/lib/programDetailApi";

export default async function ProgramPostDetailPage({ params }) {
  const { slug, id } = await params;
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