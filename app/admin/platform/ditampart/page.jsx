"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import SearchField from "@/components/adminUI/SearchField";
import SelectField from "@/components/ui/SelectField";
import DataTable from "@/components/ui/DataTable";
import PageFilter from "@/components/ui/PageFilter";
import LinkForm from "../_component/link.form";
import PlatformIndex from "../_component/index.page";
import PosterPreview from "../_component/preview/poster.preview";
import {
  statusOptions,
  fetchDitampartEventData,
} from "../_handler/data";
import { buildEventColumns } from "../_handler/TablePlatformColom";

const categories = [
  { id: 1, title: "3D" },
  { id: 2, title: "Mock up dan Poster" },
  { id: 3, title: "Foto Kegiatan" },
  { id: 4, title: "Short Film Dokumenter" },
];

export default function DitampartPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [perPage, setPerPage] = useState(10);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalInitial, setModalInitial] = useState({});
  const [modalPlaceholders, setModalPlaceholders] = useState({});
  const [modalApiEndpoint, setModalApiEndpoint] = useState("");

  const [platformModal, setPlatformModal] = useState({
    open: false,
    title: "",
    subtitle: "",
    categoryItemSlug: "",
    showImageUpload: false,
    previewComponent: null,
  });

  const debouncedSearch = useDebounce(searchQuery);
  const router = useRouter();

  // ── fetch event data dari API (cursor-based pagination dengan Stack) ───────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const cursorStackRef = useRef([null]); // [null, cursor_p2, cursor_p3, ...]

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  // Untuk melacak perubahan filter dan menghindari double fetch
  const lastFiltersRef = useRef({ debouncedSearch, statusFilter, perPage });

  useEffect(() => {
    let cancelled = false;

    // Cek apakah filter berubah untuk reset ke halaman 1
    const filtersChanged = (
      lastFiltersRef.current.debouncedSearch !== debouncedSearch ||
      lastFiltersRef.current.statusFilter !== statusFilter ||
      lastFiltersRef.current.perPage !== perPage
    );

    if (filtersChanged) {
      lastFiltersRef.current = { debouncedSearch, statusFilter, perPage };
      cursorStackRef.current = [null]; // Reset stack
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    }

    setLoading(true);
    const currentCursor = cursorStackRef.current[currentPage - 1];

    fetchDitampartEventData({
      query: debouncedSearch,
      status: statusFilter,
      limit: perPage,
      cursor: currentCursor,
    })
      .then(({ data, nextCursor, totalCount: total }) => {
        if (cancelled) return;
        setRows(data);
        setTotalCount(total);

        // Update stack jika ada cursor baru
        if (nextCursor && cursorStackRef.current.length <= currentPage) {
          cursorStackRef.current[currentPage] = nextCursor;
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("Gagal memuat event ditampart:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, perPage, currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages, loading]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1 && !loading) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage, loading]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState(null);

  const handleEdit = useCallback((row) => {
    router.push(`/admin/events/${row.id}/edit`);
  }, [router]);

  const handleDelete = useCallback(async (row) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus event "${row.title}"? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;
    try {
      setDeletingId(row.id);
      const res = await fetch(`/api/admin/events/${row.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus event');
      setRows((prev) => prev.filter((e) => e.id !== row.id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }, []);

  const endpointMap = {
    1: "/api/admin/platform-content/ditampart/3d",
    3: "/api/admin/platform-content/ditampart/foto-kegiatan",
    4: "/api/admin/platform-content/ditampart/short-film-dokumenter",
  };

  const openModalForCategory = async (cat) => {
    // cat id 2 → PlatformIndex modal (Mock up dan Poster)
    if (cat.id === 2) {
      setPlatformModal({
        open: true,
        title: "Mock up dan Poster",
        subtitle: "Kelola konten Mock up dan Poster",
        categoryItemSlug: "mockup-dan-poster",
        showImageUpload: true,
        showPrevDescription: true,
        showDescription: true,
        showViews: true,
        showMeta: true,
        previewComponent: PosterPreview,
      });
      return;
    }

    let placeholdersObj = { input: "text . . . . . " };
    if (cat.id === 1)
      placeholdersObj = {
        input: "https://drive.google.com/drive/folders/. . . ",
      };
    if (cat.id === 3)
      placeholdersObj = {
        input: "https://drive.google.com/drive/folders/. . . ",
      };
    if (cat.id === 4)
      placeholdersObj = { input: "https://www.youtube.com/watch . . ." };

    const endpoint = endpointMap[cat.id];
    let currentUrl = "";
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        currentUrl = data?.item?.url || "";
      }
    } catch (err) {
      // open modal with empty value if fetch fails
    }

    setModalTitle(`Link ${cat.title}`);
    setModalInitial({
      categoryId: cat.id,
      categoryTitle: cat.title,
      input: currentUrl,
    });
    setModalPlaceholders(placeholdersObj);
    setModalApiEndpoint(endpoint);
    setModalOpen(true);
  };

  const handleSaveFromForm = async ({ name }) => {
    try {
      const res = await fetch(modalApiEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save");
      }
    } catch (err) {
      console.error("Error saving link:", err);
      throw err;
    }
  };

  // ── columns (memoised agar referensi stabil) ──────────────────────────────
  const columns = useMemo(
    () => buildEventColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete],
  );

  return (
    <div className="p-4 md:p-10 bg-white rounded-md min-h-screen">
      {/* ── Bagian Atas: kategori cards ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins">
            Ditampart
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-poppins">
            Kelola semua konten dari platform Ditampart
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-zinc-300 rounded-xl shadow-md p-4 flex flex-col gap-4 min-w-0"
            >
              <span
                className="text-pink-600 font-semibold font-poppins block truncate"
                title={cat.title}
              >
                {cat.title}
              </span>
              <button
                onClick={() => {
                  if ([1, 2, 3, 4].includes(cat.id)) {
                    openModalForCategory(cat);
                  } else {
                    console.log("Manage:", cat);
                  }
                }}
                className="bg-pink-500 hover:bg-pink-600 cursor-pointer text-white rounded-xl px-4 py-2 shadow-md text-sm font-semibold"
              >
                Kelola Konten
              </button>
            </div>
          ))}
        </section>
      </div>

      {/* ── Bagian Bawah: tabel postingan (lazy-mount) ─────────────────────── */}
      <LazyMount>
        <div className="max-w-5xl mx-auto mt-12">
          <div className="flex flex-col md:flex-row md:gap-0 justify-between items-center md:items-center mb-6 md:mb-0">
            <div>
              <h2 className="text-2xl md:text-3xl text-zinc-700 font-extrabold mb-1 font-poppins">
                Event Ditampart
              </h2>
              <p className="text-sm text-gray-600 mb-6 font-poppins">
                Kelola Event Ditampart
              </p>
            </div>
            <div>
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "#43334C",
                  "&:hover": { backgroundColor: "#352837" },
                  textTransform: "none",
                }}
                onClick={() => router.push("/admin/events/create")}
              >
                Tambah Event
              </Button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap md:flex-row items-center gap-3 mb-4">
            <div className="w-full md:w-auto">
              <SearchField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul postingan..."
                showAdornment={false}
                endAdornment={
                  <IconButton size="small" aria-label="search">
                    <SearchIcon fontSize="small" />
                  </IconButton>
                }
                className="rounded-md bg-white border border-gray-300 shadow-sm"
              />
            </div>

            <SelectField
              className="w-[206px] md:w-auto rounded-md bg-white border border-gray-300 shadow-sm"
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              emptyOptionLabel="Semua Status"
            />
            <PageFilter perPage={perPage} onChange={setPerPage} />
          </div>

          {/* DataTable */}
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            getRowId={(r) => r.id}
          />
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage <= 1 || loading}
              onClick={handlePrevPage}
              sx={{ textTransform: "none" }}
            >
              Prev
            </Button>
            <span className="text-sm text-gray-600 font-poppins">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage >= totalPages || loading}
              onClick={handleNextPage}
              sx={{ textTransform: "none" }}
            >
              Next
            </Button>
          </div>

          {/* modals */}
          {platformModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setPlatformModal((p) => ({ ...p, open: false }))}
              />
              <div className="relative z-10 w-full max-h-[95vh] overflow-auto px-4">
                <div className="mx-auto w-full sm:max-w-lg md:max-w-6xl p-2 bg-white rounded-lg shadow-lg">
                  <PlatformIndex
                    // meta untuk fetch data
                    platformSlug="ditampart"
                    categoryItemSlug={platformModal.categoryItemSlug}
                    title={platformModal.title}
                    subtitle={platformModal.subtitle}
                    actionLabel="+add"
                    searchPlaceholder="Cari konten..."
                    close={() => setPlatformModal((p) => ({ ...p, open: false }))}
                    // field and columns to show
                    showURL={true}
                    showPrevDescription={platformModal.showPrevDescription}
                    // showDescription={platformModal.showDescription}
                    showImageUpload={platformModal.showImageUpload}
                    showViews={platformModal.showViews}
                    showMeta={platformModal.showMeta}
                    showPreview={!!platformModal.previewComponent}
                    PreviewComponent={platformModal.previewComponent}
                  />
                </div>
              </div>
            </div>
          )}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* blur */}
              <div
                className="absolute inset-0 bg-black opacity-40"
                onClick={() => setModalOpen(false)}
              />
              {/* modal content */}
              <div className="z-60 mx-auto w-full sm:max-w-md md:max-w-lg lg:max-w-2xl p-2 bg-white rounded-lg shadow-lg">
                <LinkForm
                  close={() => setModalOpen(false)}
                  title={modalTitle}
                  subtitle={modalPlaceholders.subtitle || ""}
                  initial={modalInitial}
                  placeholders={modalPlaceholders}
                  onSave={handleSaveFromForm}
                />
              </div>
            </div>
          )}
        </div>
      </LazyMount>
    </div>
  );
}

function LazyMount({ children, rootMargin = "300px", className = "" }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05, rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className} style={{ minHeight: visible ? undefined : 120 }}>
      {visible ? children : null}
    </div>
  );
}
