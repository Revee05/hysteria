import Link from "next/link";
import InstagramPreviewCard from "./InstagramPreviewCard";

export default function OtherReviewsSection({
  title = "Review Lainnya",
  items = [],
  programSlug,
  moreHref,
}) {
  return (
    <section className="bg-[#ff2d9a]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h3 className="text-center text-3xl font-semibold text-white">{title}</h3>

        <div className="mt-12">
          <div className="hidden gap-10 lg:grid lg:grid-cols-5">
            {items.slice(0, 5).map((it) => (
              <Link
                key={it.id}
                href={`/program/${programSlug}/post/${it.id}`}
                className="block"
              >
                <InstagramPreviewCard thumbnailUrl={it.thumbnailUrl} alt={it.alt} />
              </Link>
            ))}
          </div>

          <div className="lg:hidden">
            <div className="-mx-6 flex gap-6 overflow-x-auto px-6 pb-2">
              {items.map((it) => (
                <Link
                  key={it.id}
                  href={`/program/${programSlug}/post/${it.id}`}
                  className="block shrink-0"
                >
                  <div className="w-52.5">
                    <InstagramPreviewCard thumbnailUrl={it.thumbnailUrl} alt={it.alt} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href={moreHref || `/program/${programSlug}`}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#ff2d9a] hover:bg-white/90"
          >
            Lihat Lebih Banyak
          </Link>
        </div>
      </div>
    </section>
  );
}
