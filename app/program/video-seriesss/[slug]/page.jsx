import ProgramHero from "@/components/program-detail/ProgramHero";
import ProgramPostsSection from "@/components/program-detail/ProgramPostsSection.client";
import { getProgramDetailData } from "@/lib/programDetailApi";

export default async function ProgramDetailPage({ params, searchParams }) {
  const { slug } = await params;

  const q = (await searchParams)?.q ?? "";
  const page = Number((await searchParams)?.page ?? 1);
  const data = await getProgramDetailData({ slug, q, page });

  return (
    <>
      <ProgramHero title={data.title} subtitle={data.subtitle} />

      <ProgramPostsSection
        programSlug={slug}
        posts={data.posts}
        totalPages={data.totalPages}
      />
    </>
  );
}