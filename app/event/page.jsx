"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getEventStatus } from "../../lib/event-status";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 12;

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
    return events.map((event) => ({
      ...event,
      status: getEventStatus(event.startAt, event.endAt),
    }));
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (status === "all") return processedEvents;
    return processedEvents.filter(
      (event) => event.status.toLowerCase() === status
    );
  }, [processedEvents, status]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);

  const paginatedEvents = filteredEvents.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages || 1);
    }
  }, [totalPages, page]);
  
  return (
    <div className="mx-auto px-4 mt-12 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-4">
      <h1 className="font-poppins text-[24px] sm:text-[30px] md:text-[36px] font-bold leading-[100%] text-[var(--Color-5)]">
        Daftar Event
      </h1>

      <p className="font-poppins text-[16px] font-normal text-[var(--Color-5)]">
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
              className="w-full h-[48px] pl-6 pr-14 rounded-full border border-[var(--Color-1)] bg-[var(--Color-3)] text-[16px] text-[var(--Color-1)] placeholder:text-[var(--Color-1)] focus:outline-none"
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
              className="w-full h-full rounded-full border border-[var(--Color-1)] bg-transparent text-transparent appearance-none cursor-pointer focus:outline-none"
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
              className="w-full h-full rounded-full border border-[var(--Color-1)] bg-transparent text-transparent appearance-none cursor-pointer focus:outline-none"
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
          <div className="grid sm:grid-cols-2 md:grid-cols-6 gap-2">
            {paginatedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.slug}`}
                className="group relative w-full max-w-[440px] aspect-[4/5] rounded-xl overflow-hidden"
              >
                <Image
                  src={event.poster || "/placeholder-event.jpg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />

                <div
                  className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"
                >
                  <div className="inline-flex gap-2 mb-3">
                    {event.eventCategories?.[0]?.categoryItem?.title && (
                      <span className="inline-flex items-center justify-center px-3 h-[26px] rounded-[10px] border border-[var(--Color-1)] bg-[var(--Color-3)] text-[var(--Color-1)] font-poppins text-[12px] font-normal leading-[150%]">
                        {event.eventCategories[0].categoryItem.title}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 text-[12px] font-poppins font-bold leading-[150%] text-[var(--Color-3)]">
                    {event.title}
                  </h2>

                  <p className="mt-1 text-[10px] font-poppins font-normal leading-[150%] text-[var(--Color-3)]">
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
                      className="mt-3 flex items-center justify-center w-[140px] h-[35px] rounded-[8px] bg-[var(--Color-1)] text-white font-poppins text-[12px] font-medium shadow transition hover:opacity-90"
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
                      className="mt-3 flex items-center justify-center w-[140px] h-[35px] rounded-[8px] bg-[var(--Color-1)] text-white font-poppins text-[12px] font-medium shadow transition hover:opacity-90"
                    >
                      Sedang Berlangsung
                    </button>
                  )}

                  {event.status === "FINISHED" && (
                    <button
                      disabled
                      className="mt-3 flex items-center justify-center w-[140px] h-[35px] rounded-[8px] bg-[var(--Color-1)] text-white font-poppins text-[12px] font-medium shadow transition hover:opacity-90"
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
            <div className="flex items-center justify-center mt-16">
              <div
                className="flex items-center justify-center gap-4 w-[220px] h-[50px] rounded-full bg-[var(--Color-1)]"
              >
                {/* PREV */}
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="w-[25px] h-[25px] flex items-center justify-center rounded-full bg-[var(--Color-3)] shadow disabled:opacity-40"
                >
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>

                {/* PAGE NUMBERS */}
                <div className="flex items-center gap-4 text-white text-xl font-medium">
                  {(() => {
                    const pages = [];
                    const maxVisible = 3;
                    let start = Math.max(1, page - Math.floor(maxVisible / 2));
                    let end = start + maxVisible - 1;

                    if (end > totalPages) {
                      end = totalPages;
                      start = Math.max(1, end - maxVisible + 1);
                    }

                    if (start > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setPage(1)}
                          className="hover:scale-110 transition"
                        >
                          1
                        </button>
                      );
                      if (start > 2) {
                        pages.push(
                          <span key="start-ellipsis" className="opacity-70">
                            ...
                          </span>
                        );
                      }
                    }

                    for (let i = start; i <= end; i++) {
                      const isActive = i === page;

                      pages.push(
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`w-[30px] h-[30px] flex items-center justify-center rounded-full text-[20px] font-normal transition-all duration-300 flex items-center justify-center
                            ${
                            i === page
                            ? "text-[var(--Color-3)] bg-white/40 rounded-[6px]"
                            : "text-[var(--Color-3)]"
                            }
                          `}
                        >
                          {i}
                        </button>
                      );
                    }

                    if (end < totalPages) {
                      if (end < totalPages - 1) {
                        pages.push(
                          <span key="end-ellipsis" className="opacity-70">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setPage(totalPages)}
                          className="hover:scale-110 transition"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                {/* NEXT */}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="w-[25px] h-[25px] flex items-center justify-center rounded-full bg-[var(--Color-3)] shadow disabled:opacity-40"
                >
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
