import Link from "next/link";
import InstagramPreviewCard from "./InstagramPreviewCard";

export default function OtherReviewsSection({
  title = "Review Lainnya",
  items = [],
  programSlug,
  moreHref,
}) {
  return (
    // Menggunakan warna pink standar Hysteria yang sering dipakai
    <section className="bg-[#E83C91]">
      <div className="mx-auto max-w-6xl px-6 py-16 font-poppins">
        <h3 className="text-center text-3xl font-bold text-white">{title}</h3>

        <div className="mt-12">
          {/* Tampilan Desktop */}
          <div className="hidden gap-10 lg:grid lg:grid-cols-5">
            {items.slice(0, 5).map((it) => (
              <Link
                key={it.id}
                href={`/program/${programSlug}/${it.id}`}
                className="block hover:opacity-80 hover:-translate-y-1 transition-all duration-300"
              >
                <InstagramPreviewCard thumbnailUrl={it.thumbnailUrl} alt={it.alt} />
              </Link>
            ))}
          </div>

          {/* Tampilan Mobile (Scroll Samping) */}
          <div className="lg:hidden">
            <div className="-mx-6 flex gap-6 overflow-x-auto px-6 pb-4 snap-x">
              {items.map((it) => (
                <Link
                  key={it.id}
                  href={`/program/${programSlug}/${it.id}`}
                  className="block shrink-0 snap-center hover:opacity-90 transition-opacity"
                >
                  {/* Tailwind fix: pakai [210px] agar valid */}
                  <div className="w-[210px]">
                    <InstagramPreviewCard thumbnailUrl={it.thumbnailUrl} alt={it.alt} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Tombol Lihat Lebih Banyak */}
        <div className="mt-12 flex justify-center">
          <Link
            href={moreHref || `/program/${programSlug}`}
            className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-bold text-[#E83C91] hover:bg-pink-50 transition-colors shadow-md hover:shadow-lg"
          >
            Lihat Lebih Banyak
          </Link>
        </div>
      </div>
    </section>
  );
}