"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getEventStatus } from "../../lib/event-status";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 9;

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  /* =========================
     SYNC STATE DARI URL
  ========================== */
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setStatus(searchParams.get("status") || "all");
    setSort(searchParams.get("sort") || "latest");
  }, [searchParams]);

  /* =========================
     UPDATE URL
  ========================== */
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    if (sort !== "latest") params.set("sort", sort);

    const qs = params.toString();
    router.replace(qs ? `/event?${qs}` : "/event");

    setPage(1);
  }, [q, status, sort, router]);

  /* =========================
     FETCH DATA
  ========================== */
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/events?q=${q}&status=${status}&sort=${sort}`
        );
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [q, status, sort]);

  /* =========================
     PROSES STATUS EVENT
     - statusLogic : UPPERCASE
     - statusFilter: lowercase
  ========================== */
  const processedEvents = useMemo(() => {
    return events.map((event) => {
      const statusLogic = getEventStatus(event.startAt, event.endAt);

      return {
        ...event,
        status: statusLogic, // untuk UI logic
        statusFilter: statusLogic.toLowerCase(), // untuk filter
      };
    });
  }, [events]);

  /* =========================
     FILTER BERDASARKAN STATUS
  ========================== */
  const filteredEvents =
    status === "all"
      ? processedEvents
      : processedEvents.filter(
          (event) => event.statusFilter === status
        );

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);

  const paginatedEvents = filteredEvents.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="font-poppins text-[36px] font-bold leading-[100%] text-[var(--Color-3)]">
        Daftar Event
      </h1>

      <p className="font-poppins text-[16px] font-normal text-[var(--Color-3)]">
        Ruang untuk bertemu, bertukar pengetahuan dan membangun jejaring.
      </p>

      {/* FILTER */}
      <div className="flex justify-center mt-8 mb-10">
        <div className="flex items-center gap-4">
          
          {/* SEARCH */}
          <div className="relative w-[640px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="
                w-full h-[48px]
                pl-6 pr-14
                rounded-full
                border border-[var(--Color-1)]
                bg-[var(--Color-3)]
                font-helvetica text-[16px]
                text-[var(--Color-1)]
                placeholder:text-[var(--Color-1)]
                focus:outline-none
              "
            />
            <Search
              className="absolute right-5 top-1/2 -translate-y-1/2"
              size={24}
              strokeWidth={2}
              color="var(--Color-1)"
            />
          </div>

          {/* FILTER */}
          <div className="relative w-[48px] h-[48px]">
            <Filter
              className="absolute inset-0 m-auto pointer-events-none"
              size={18}
              strokeWidth={2}
              color="var(--Color-1)"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="
                w-full h-full
                rounded-full
                border border-[var(--Color-1)]
                bg-transparent
                text-transparent
                appearance-none
                cursor-pointer
                focus:outline-none
              "
            >
              <option value="all">Semua Event</option>
              <option value="upcoming">Akan Berlangsung</option>
              <option value="ongoing">Sedang Berlangsung</option>
              <option value="finished">Telah Berakhir</option>
            </select>
          </div>

          {/* SORT */}
          <div className="relative w-[48px] h-[48px]">
            <ArrowUpDown
              className="absolute inset-0 m-auto pointer-events-none"
              size={18}
              strokeWidth={2}
              color="var(--Color-1)"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="
                w-full h-full
                rounded-full
                border border-[var(--Color-1)]
                bg-transparent
                text-transparent
                appearance-none
                cursor-pointer
                focus:outline-none
              "
            >
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>

        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-500">Memuat event...</p>
      ) : !filteredEvents.length ? (
        <p className="text-gray-500">Event tidak ditemukan.</p>
      ) : (
        <>
          {/* GRID */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paginatedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.slug}`}
                className="group relative w-full max-w-[440px] aspect-[3/4] rounded-xl overflow-hidden"
              >
                <Image
                  src={event.poster || "/placeholder-event.jpg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />

                <div
                  className="
                    absolute inset-0 p-5 flex flex-col justify-end
                    bg-gradient-to-t from-black/80 via-black/40 to-transparent
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300 ease-out
                  "
                >
                  <div className="inline-flex gap-2 mb-3">
                    {event.categoryItem?.title && (
                      <span
                        className="
                          inline-flex
                          items-center
                          justify-center
                          px-3
                          h-[26px]
                          rounded-full
                          text-[12px]
                          text-[var(--Color-1)]
                          bg-[var(--Color-3)]
                        "
                      >
                        {event.categoryItem.title}
                      </span>
                    )}
                    {event.organizer && (
                      <span
                        className="
                          inline-flex
                          items-center
                          justify-center
                          px-3
                          h-[26px]
                          rounded-full
                          text-[12px]
                          text-[var(--Color-1)]
                          bg-[var(--Color-3)]
                        "
                      >
                        {event.organizer}
                      </span>
                    )}
                  </div>

                  <h2 className="font-poppins text-[20px] font-semibold text-white leading-snug">
                    {event.title}
                  </h2>

                  <p className="mt-1 text-[14px] text-white/90">
                    {new Date(event.startAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  {event.status === "UPCOMING" && event.registerLink && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(event.registerLink, "_blank");
                      }}
                      className="
                        mt-4
                        inline-flex items-center justify-center
                        h-[36px]
                        rounded-lg
                        bg-[var(--Color-6)]
                        text-[var(--Color-3)]
                        font-poppins text-[14px] font-normal
                        transition
                        hover:bg-[#D40568]
                        active:bg-[#BC045C]
                      "
                    >
                      Ikuti Sekarang
                    </button>
                  )}

                  {event.status === "ONGOING" && event.registerLink && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(event.registerLink, "_blank");
                      }}
                      className="
                        mt-4
                        inline-flex items-center justify-center
                        h-[36px]
                        rounded-lg
                        bg-[#FDE6F1]
                        text-[var(--Color-1)]
                        font-poppins text-[14px] font-normal
                        transition
                        hover:bg-[#FCDAEA]
                        active:bg-[#F9B2D4]
                      "
                    >
                      Sedang Berlangsung
                    </button>
                  )}

                  {event.status === "FINISHED" && (
                    <button
                      disabled
                      className="
                        mt-4
                        inline-flex items-center justify-center
                        h-[36px]
                        rounded-lg
                        bg-[#E5E5E5]
                        text-[#9CA3AF]
                        font-poppins text-[14px] font-normal
                        cursor-not-allowed
                      "
                    >
                      Event Telah Berakhir
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-10">
              <div className="flex items-center justify-center gap-4 w-[220px] h-[50px] bg-[var(--Color-1)] rounded-full">

                {/* PREV */}
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="
                    w-[25px] h-[25px]
                    flex items-center justify-center
                    rounded-full
                    bg-[var(--Color-3)]
                    shadow
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft size={14} strokeWidth={2} color="var(--Color-1)" />
                </button>

                {/* PAGE NUMBER */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const isActive = page === i + 1;

                  return (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`
                        w-[30px] h-[28.152px]
                        flex items-center justify-center
                        rounded
                        font-helvetica text-[20px] font-normal
                        ${
                          isActive
                            ? "bg-white/50 text-[var(--Color-5)] shadow"
                            : "text-[var(--Color-3)]"
                        }
                      `}
                      style={
                        isActive
                          ? {
                              filter:
                                "drop-shadow(0 0 5.8px rgba(0,0,0,0.25))",
                            }
                          : {}
                      }
                    >
                      {i + 1}
                    </button>
                  );
                })}

                {/* NEXT */}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="
                    w-[25px] h-[25px]
                    flex items-center justify-center
                    rounded-full
                    bg-[var(--Color-3)]
                    shadow
                    disabled:opacity-40
                  "
                >
                  <ChevronRight size={14} strokeWidth={2} color="var(--Color-1)" />
                </button>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
