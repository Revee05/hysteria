import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventStatus, EVENT_STATUS_LABEL } from "../../../lib/event-status";
import ShareButtons from "../../../components/adminUI/Event/ShareButtons";
import { ArrowLeft } from "lucide-react";
import { getEventDetail, getOtherEvents } from "../../../modules/public/events/services/event.service";
import { getOrganizerDisplay } from "../../../lib/organizer-helper";
import LiveArchiveLinks from "../../../components/adminUI/Event/LiveArchiveLinks";
import { getProgramPageConfig } from "../../../modules/public/events/services/event.service";
import ViewsTracker from "../../../components/tracker/views.tracker";
import { Eye } from "lucide-react";

export const revalidate = 0;

export default async function EventDetailPage({ params }) {
  const { slug } = await params;

  const [event, otherEvents, pageConfig] = await Promise.all([
    getEventDetail(slug),
    getOtherEvents(slug),
    getProgramPageConfig(),
  ]);

  if (!event) return notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/event/${event.slug}`;
  const status = getEventStatus(event.startAt, event.endAt);
  const startDate = new Date(event.startAt);
  const endDate = event.endAt ? new Date(event.endAt) : null;

  const sameMonth =
    endDate &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const sameYear =
    endDate &&
    startDate.getFullYear() === endDate.getFullYear();

  const sameDay =
    endDate &&
    startDate.getDate() === endDate.getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const formattedDate = endDate
    ? sameDay      
      ? startDate.toLocaleDateString("id-ID", {
          day: "numeric",
          weekday: "long",
          month: "long",
          year: "numeric",
        })
      : sameMonth
        ? `${startDate.getDate()} – ${endDate.getDate()} ${startDate.toLocaleDateString(
            "id-ID",
            { month: "long", year: "numeric" }
          )}`
        : sameYear
        ? `${startDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
          })} – ${endDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}`
        : `${startDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })} – ${endDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}`
    : startDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const formattedTime = event.isFlexibleTime
    ? "Menyesuaikan"
    : `${startDate.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })}${
        endDate
          ? ` – ${endDate.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : ""
      } WIB`;

  const organizerSlug = event.organizers?.[0]?.categoryItem?.slug;
  const isEmbedMap = event.mapsEmbedSrc?.includes("/maps/embed");
  const detailHero = pageConfig?.detailHero ?? {
    image: null,
    isBlur: false,
  };
  const bgImage = event?.heroImage || detailHero.image;
  const isBlur = detailHero.isBlur;

  function getHeroStyle({ bgImage, event }) {
    if (bgImage) {
      return {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    if (event?.heroColor) {
      return { background: event.heroColor };
    }

    return {
      background:
        "linear-gradient(to right, #db2777, #c026d3, #ec4899)",
    };
  }

  return (
    <div className="w-full">
      <ViewsTracker slug={event.slug} />
      {/* HERO GRADIENT */}
      <section
        className="relative w-full h-[300px]"
        style={getHeroStyle({ bgImage, event })}
      >
        {isBlur && (
          <div className="absolute inset-0 backdrop-blur-md bg-black/30" />
        )}
        {/* BACK BUTTON */}
        <Link
          href="/event"
          className="absolute top-6 left-6 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full text-white transition hover:bg-white/10 mt-16" aria-label="Kembali">
          <ArrowLeft className="w-7 h-7 stroke-[3]" />
        </Link>
      </section>

      {/* CONTENT */}
      <div className="mx-auto px-6 -mt-32 space-y-16 bg-[var(--background)]">

        {/* HEADER (POSTER + INFO) */}
        <section className="grid md:grid-cols-3 gap-10 items-start">
          {/* POSTER */}
          <div className="md:col-span-1">
            <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={event.poster || "/placeholder-event.jpg"}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
              />
            </div>
          </div>

          {/* INFO */}
          <div className="md:col-span-2 space-y-4 pt-10 mt-28">            
            <div className="flex flex-wrap gap-2">
              {event.eventCategories.map((cat) => (
              <Link
                key={cat.categoryItem.id}
                href={cat.categoryItem.url ?? "#"}
                className= "inline-block px-4 py-1 rounded-full bg-[var(--Color-3)] text-[var(--Color-1)] border border-[var(--Color-1)] text-xs hover:bg-[var(--Color-1)] hover:text-[var(--Color-3)] transition"
              >
                {cat.categoryItem.title}
              </Link>
            ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-[var(--Color-5)]">
              {event.title}
            </h1>

            <p className="text-sm text-[var(--Color-5)]">
              Diselenggarakan oleh:
              <span className="ml-2 inline-flex flex-wrap gap-2">
                {getOrganizerDisplay(event.organizers).map((org, index) => (
                  <Link
                    key={`${org.key}-${index}`} 
                    href={org.href}
                    className="inline-block px-4 py-1 rounded-full bg-[var(--Color-1)] text-[var(--Color-3)] border border-[var(--Color-1)] text-xs hover:bg-[var(--Color-3)] hover:text-[var(--Color-1)] transition"
                  >
                    {org.label}
                  </Link>
                ))}
              </span>
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <p className="text-sm text-[var(--Color-5)]">
                Status Event:{" "}
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--Color-3)] text-[var(--Color-1)] border border-[var(--Color-1)] text-xs">
                  {EVENT_STATUS_LABEL[status]}
                </span>
              </p>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--Color-3) text-(--Color-1) border border-(--Color-1) text-xs">
                <Eye className="w-3.5 h-3.5" /> {(event.views || 0).toLocaleString("id-ID")} kali dilihat
              </span>
            </div>
          </div>
        </section>

        {/* DETAIL */}
        <section className="grid md:grid-cols-3 gap-10">
          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-[var(--Color-5)] text-[18px]">Ikuti Keseruan Kami</h3>

              {/* BUTTON DAFTAR EVENT */}
              {event.registerLink && (
                <a
                  href={status === "FINISHED" ? undefined : event.registerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-2 flex items-center justify-center w-full sm:w-[140px] h-[40px] rounded-[8px] text-[12px] font-medium shadow transition
                    ${
                      status === "FINISHED"
                        ? "bg-[var(--Color-4)] text-[var(--Color-3)] cursor-not-allowed pointer-events-none"
                        : "bg-[var(--Color-1)] text-[var(--Color-3)] hover:opacity-90"
                    }`}
                >
                  Daftar Sekarang
                </a>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-[var(--Color-5)] text-[18px]">Jadwal Pelaksanaan</h3>
              <div className="text-sm text-gray-600 space-y-2">
                {/* TANGGAL */}
                <div className="grid grid-cols-[max-content_10px_1fr] gap-x-2">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="grid grid-cols-[140px_10px_1fr]">
                      <span className="font-medium">Tanggal Acara</span>
                      <span>:</span>
                      <span>{formattedDate}</span>
                    </div>

                    <div className="grid grid-cols-[140px_10px_1fr]">
                      <span className="font-medium">Waktu Acara</span>
                      <span>:</span>
                      <span className={event.isFlexibleTime ? "font-medium" : ""}>
                        {formattedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-[var(--Color-5)] text-[18px]">Lokasi</h3>
              <p className="text-sm text-gray-600 mb-1">
                {event.location}
              </p>

              {event.mapsEmbedSrc && (
                isEmbedMap ? (
                  <div className="w-full h-[280px] rounded-xl overflow-hidden border">
                    <iframe
                      src={event.mapsEmbedSrc}
                      className="w-full h-full"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : (
                  <a
                    href={event.mapsEmbedSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full h-[40px] rounded-[8px] bg-[var(--Color-1)] text-[var(--Color-3)] text-[13px] font-medium shadow hover:opacity-90 transition"
                  >
                    Buka di Google Maps
                  </a>
                )
              )}
            </div>
            
            <div>
              <LiveArchiveLinks event={event} status={status} />
            </div>
          </aside>

          {/* DESKRIPSI */}
          <div className="md:col-span-2">
            <h2 className="font-semibold mb-4 text-[var(--Color-5)] text-[18px]">Deskripsi</h2>

            <div
              className="
                prose prose-p:leading-relaxed
                prose-img:rounded-xl prose-img:mx-auto
                prose-a:text-pink-600 hover:prose-a:underline
                max-w-none text-gray-800
              "
              dangerouslySetInnerHTML={{ __html: event.description }}
            />

            <div className="mt-8 flex flex-wrap items-start gap-2">
              <h2 className="font-semibold text-[var(--Color-5)] text-[18px] whitespace-nowrap">
                Tags:
              </h2>

              {event.tags && event.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((et) => (
                    <span
                      key={et.tag.id}
                      className="text-[16px] text-[var(--Color-1)]"
                    >
                      #{et.tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-[var(--Color-1)]">Tidak ada tag</p>
              )}
            </div>
            
            <div className="mt-8">
              <ShareButtons
                url={shareUrl}
                title={event.title}
              />
            </div>
          </div>
        </section>

        {/* EVENT LAINNYA */}
        <section>
          <div className="flex items-center justify-between mb-4"> 
            <h2 className="font-semibold text-[var(--Color-5)] text-[18px]"> Event Lainnya </h2> 
            <Link href="/event" className="text-pink-600 hover:underline"> Lihat semua </Link> 
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {otherEvents.map((other) => {
              const isFinished = other.status === "FINISHED";

              return (
                <Link
                  key={other.id}
                  href={`/event/${other.slug}`}
                  className="group relative min-w-[260px] aspect-[4/5] rounded-xl overflow-hidden block"
                >
                  <Image
                    src={other.poster || "/placeholder-event.jpg"}
                    alt={other.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 backdrop-blur-sm bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">

                    {/* STATUS */}
                    <div className="inline-flex gap-2 flex-wrap mb-1">
                      {other.status === "UPCOMING" && <span className="inline-flex items-center justify-center px-3 h-[26px] rounded-[10px] border border-[var(--Color-1)] bg-[var(--Color-3)] text-[var(--Color-1)] text-[12px]">Akan Berlangsung</span>}
                      {other.status === "ONGOING" && <span className="inline-flex items-center justify-center px-3 h-[26px] rounded-[10px] border border-[var(--Color-1)] bg-[var(--Color-3)] text-[var(--Color-1)] text-[12px]">Sedang Berlangsung</span>}
                      {isFinished && <span className="inline-flex items-center justify-center px-3 h-[26px] rounded-[10px] border border-[var(--Color-1)] bg-[var(--Color-3)] text-[var(--Color-1)] text-[12px]">Event Telah Berakhir</span>}
                    </div>

                    <h3 className="text-[14px] font-bold text-[var(--Color-3)] line-clamp-2">
                      {other.title}
                    </h3>

                    <p className="text-[12px] text-[var(--Color-3)]">
                      {new Date(other.startAt).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    {/* BUTTON VISUAL ONLY */}
                    <div
                      className={`mt-2 flex items-center justify-center w-full sm:w-[140px] h-[35px] rounded-[8px] text-[12px] font-medium shadow transition
                      ${
                        isFinished
                          ? "bg-[var(--Color-4)] text-[var(--Color-3)]"
                          : "bg-[var(--Color-1)] text-[var(--Color-3)]"
                      }`}
                    >
                      Lihat Sekarang
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* CARD LIHAT SEMUA */}
            <Link
              href="/event"
              className="min-w-[260px] flex items-center justify-center rounded-xl border-2 border-dashed border-pink-500 text-pink-600 font-semibold hover:bg-pink-50"
            >
              Lihat Semua Event →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// export async function generateMetadata({ params }) {
//   const { slug } = await params;

//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_SITE_URL}/api/events/${slug}`,
//     { next: { revalidate: 60 } }
//   );

//   if (!res.ok) return {};

//   const { event } = await res.json();

//   if (!event) return {};

//   const url = `${process.env.NEXT_PUBLIC_SITE_URL}/event/${event.slug}`;

//   return {
//     title: event.title,
//     description: event.excerpt || "Informasi event terbaru dari Hysteria",
//     openGraph: {
//       title: event.title,
//       description: event.excerpt || event.title,
//       url,
//       siteName: "Hysteria",
//       images: [
//         {
//           url: event.poster || "/placeholder-event.jpg",
//           width: 1200,
//           height: 630,
//           alt: event.title,
//         },
//       ],
//       type: "article",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: event.title,
//       description: event.excerpt || event.title,
//       images: [event.poster || "/placeholder-event.jpg"],
//     },
//   };
// }