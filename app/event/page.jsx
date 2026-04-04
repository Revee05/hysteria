"use client";

import { useEffect, useState, useMemo, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getEventStatus } from "../../lib/event-status";
import { useDebounce } from "../../hooks/use-debounce";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 18;

function EventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [qInput, setQInput] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null); 
  const dropdownRef = useRef(null);

  /* =========================
     SYNC STATE DARI URL
  ========================== */
  useEffect(() => {
    const paramQ = searchParams.get("q") || "";
    setQ(paramQ);
    setQInput(paramQ);
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
     DEBOUNCE INPUT
  ========================== */
  const debouncedQ = useDebounce(qInput, 500);

  useEffect(() => {
    setQ(debouncedQ);
  }, [debouncedQ]);

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

  const processedEvents = events;

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="mx-auto px-4 mt-18 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-4 text-[var(--foreground)] bg-[var(--background)]">
      <h1 className="text-[24px] sm:text-[30px] md:text-[36px] font-bold leading-[100%] text-[var(--foreground)]">
        Daftar Event
      </h1>

      <p className="text-[16px] font-normal text-[var(--muted-foreground)]">
        Ruang untuk bertemu, bertukar pengetahuan dan membangun jejaring.
      </p>

      {/* FILTER */}
      <div className="flex justify-center mt-8 mb-10 px-4">
        <div className="flex items-center gap-2 w-full max-w-3xl">
          
          {/* SEARCH */}
          <div className="relative flex-1">
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search"
              className="w-full h-[48px] pl-6 pr-14 rounded-full border border-[var(--Color-1)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--Color-1)]"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2" size={22} strokeWidth={2} color="var(--Color-1)" />
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">          
            <div ref={dropdownRef} className="flex items-center gap-2 sm:gap-3 relative">

              {/* FILTER */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === "filter" ? null : "filter")
                  }
                  className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full border border-[var(--Color-1)] flex items-center justify-center bg-[var(--background)] shadow-sm active:scale-95 transition"
                >
                  <Filter size={16} color="var(--Color-1)" />
                </button>

                {openDropdown === "filter" && (
                  <div className="absolute top-12 w-44 bg-white rounded-xl shadow-lg z-50 overflow-hidden animate-fadeIn">
                    <button
                      onClick={() => {
                        setStatus("all");
                        setOpenDropdown(null);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition
                      ${
                        status === "all"
                          ? "bg-[var(--Color-1)] text-[var(--Color-3)] font-medium"
                          : "text-[var(--Color-5)] hover:bg-gray-100"
                      }`}
                    >
                      Semua Event
                    </button>

                    <button
                      onClick={() => {
                        setStatus("upcoming");
                        setOpenDropdown(null);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition
                      ${
                        status === "upcoming"
                          ? "bg-[var(--Color-1)] text-[var(--Color-3)] font-medium"
                          : "text-[var(--Color-5)] hover:bg-gray-100"
                      }`}
                    >
                      Akan Berlangsung
                    </button>

                    <button
                      onClick={() => {
                        setStatus("ongoing");
                        setOpenDropdown(null);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition
                      ${
                        status === "ongoing"
                          ? "bg-[var(--Color-1)] text-[var(--Color-3)] font-medium"
                          : "text-[var(--Color-5)] hover:bg-gray-100"
                      }`}
                    >
                      Sedang Berlangsung
                    </button>

                    <button
                      onClick={() => {
                        setStatus("finished");
                        setOpenDropdown(null);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition
                      ${
                        status === "finished"
                          ? "bg-[var(--Color-1)] text-[var(--Color-3)] font-medium"
                          : "text-[var(--Color-5)] hover:bg-gray-100"
                      }`}
                    >
                      Telah Berakhir
                    </button>
                  </div>
                )}
              </div>

              {/* SORT */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === "sort" ? null : "sort")
                  }
                  className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full border border-[var(--Color-1)] flex items-center justify-center bg-[var(--background)] shadow-sm active:scale-95 transition"
                >
                  <ArrowUpDown size={16} color="var(--Color-1)" />
                </button>

                {openDropdown === "sort" && (
                  <div className="absolute top-12 w-44 bg-white rounded-xl shadow-lg z-50 overflow-hidden animate-fadeIn">
                    <button
                      onClick={() => {
                        setSort("latest");
                        setOpenDropdown(null);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition
                      ${
                        sort === "latest"
                          ? "bg-[var(--Color-1)] text-[var(--Color-3)] font-medium"
                          : "text-[var(--Color-5)] hover:bg-gray-100"
                      }`}
                    >
                      Terbaru
                    </button>

                    <button
                      onClick={() => {
                        setSort("oldest");
                        setOpenDropdown(null);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition
                      ${
                        sort === "oldest"
                          ? "bg-[var(--Color-1)] text-[var(--Color-3)] font-medium"
                          : "text-[var(--Color-5)] hover:bg-gray-100"
                      }`}
                    >
                      Terlama
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-[var(--muted-foreground)]">Memuat event...</p>
      ) : !filteredEvents.length ? (
        <p className="text-[var(--muted-foreground)]">Event tidak ditemukan.</p>
      ) : (
        <>
          {/* GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {paginatedEvents.map((event) => {
              const isFinished = event.status === "FINISHED";

              return (
                <Link key={event.id} href={`/event/${event.slug}`} className="group relative w-full aspect-[4/5] rounded-xl overflow-hidden">
                  <Image
                    src={event.poster || "/placeholder-event.jpg"}
                    alt={event.title}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-75"
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 active:opacity-100 transition-all duration-300">
                    {/* STATUS */}
                    <div className="inline-flex gap-2 flex-wrap mb-1">
                      {event.status === "UPCOMING" && (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (event.registerLink)
                              window.open(event.registerLink, "_blank");
                          }}
                          className="inline-flex items-center justify-center px-3 rounded-[10px] border border-[var(--Color-1)] bg-[var(--Color-3)] text-[var(--Color-1)] text-[12px] leading-[150%] cursor-pointer"
                        >
                          Akan Berlangsung
                        </span>
                      )}

                      {event.status === "ONGOING" && (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (event.registerLink)
                              window.open(event.registerLink, "_blank");
                          }}
                          className="inline-flex items-center justify-center px-3 rounded-[10px] border border-[var(--Color-1)] bg-[var(--Color-3)] text-[var(--Color-1)] text-[12px] leading-[150%] cursor-pointer"
                        >
                          Sedang Berlangsung
                        </span>
                      )}

                      {isFinished && (
                        <span className="inline-flex items-center justify-center px-3 rounded-[10px] border border-[var(--Color-1)] bg-[var(--Color-3)] text-[var(--Color-1)] text-[12px] leading-[150%]">
                          Event Telah Berakhir
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <h2 className="text-[14px] font-bold leading-[150%] text-[var(--Color-3)] line-clamp-2 drop-shadow">
                      {event.title}
                    </h2>

                    {/* DATE */}
                    <p className="text-[12px] leading-[150%] text-[var(--Color-3)]">
                      {new Date(event.startAt).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    {/* BUTTON */}
                    <button
                      onClick={(e) => {
                        if (isFinished) return;
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      disabled={isFinished}
                      className={`mt-2 flex items-center justify-center w-full sm:w-[140px] h-[35px] rounded-[8px] text-[12px] font-medium shadow transition
                      ${
                        isFinished
                          ? "bg-[var(--Color-4)] text-[var(--Color-3)] cursor-not-allowed"
                          : "bg-[var(--Color-1)] text-[var(--Color-3)] hover:opacity-90"
                      }`}
                    >
                      Lihat Sekarang
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12 px-4">
              <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 h-[44px] sm:h-[50px] rounded-full bg-[var(--btn-normal)]">
                {/* PREV */}
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="w-[25px] h-[25px] flex items-center justify-center rounded-full bg-[var(--background)] shadow disabled:opacity-40"
                >
                  <ChevronLeft size={20} strokeWidth={3} color="var(--Color-6)"/>
                </button>

                {/* PAGE NUMBERS */}
                <div className="flex items-center gap-4 text-[var(--Color-1)] text-xl font-medium">
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
                          className="hover:scale-110 transition text-[var(--Color-3)]"
                        >
                          1
                        </button>
                      );
                      if (start > 2) {
                        pages.push(
                          <span key="start-ellipsis" className="opacity-70 text-[var(--Color-3)]">
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
                          className={`w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] flex items-center justify-center rounded-full text-[16px] sm:text-[20px] transition-all duration-300
                          ${
                            i === page
                              ? "text-[var(--Color-3)] bg-[var(--Color-3)]/40 rounded-[6px]"
                              : "text-[var(--Color-3)]"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    if (end < totalPages) {
                      if (end < totalPages - 1) {
                        pages.push(
                          <span key="end-ellipsis" className="opacity-70 text-[var(--Color-3)]">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setPage(totalPages)}
                          className="hover:scale-110 transition text-[var(--Color-3)]"
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
                  <ChevronRight size={20} strokeWidth={3} color="var(--Color-6)"/>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <EventsPageContent />
    </Suspense>
  );
}
