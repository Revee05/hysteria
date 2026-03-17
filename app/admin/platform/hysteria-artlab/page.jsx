"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import SelectField from '@/components/ui/SelectField';
import SearchField from '@/components/adminUI/SearchField';
// mui component
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Button from "@mui/material/Button";
// custom component
import DataTable from '@/components/ui/DataTable';
import PageFilter from '@/components/ui/PageFilter';
import LinkForm from '../_component/link.form';
import PlatformIndex from '../_component/index.page';

import { useRouter } from "next/navigation";
import {
  statusOptions,
  fetchArtlabEventData,
} from '../_handler/data';
import { buildEventColumns } from '../_handler/TablePlatformColom';

// Hanya kategori yang relevan untuk tabel event artlab
const artlabEventCategoryOptions = [
  { id: 'workshop', name: 'Workshop Artlab' },
  { id: 'screening-film',  name: 'Screening Film' },
  { id: 'untuk-perhatian', name: 'Untuk Perhatian' },
  { id: 'stonen-29-radio-show', name: 'Stonen 29 Radio Show' },
];

export default function HysteriaArtlabPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subKategori, setSubKategori] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [perPage, setPerPage]          = useState(10);
  const [openMerch, setOpenMerch] = useState(false);
  const [merchInitial, setMerchInitial] = useState({ input: '' });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [openAntalk, setOpenAntalk] = useState(false);
  const [openArtistRadar, setOpenArtistRadar] = useState(false);

  const debouncedSearch = useDebounce(searchQuery);
  const router = useRouter();

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

  // ── fetch event data dari API (cursor-based pagination) ────────────────────
  const [nextCursor, setNextCursor] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setRows([]);
    setNextCursor(null);
    setLoading(true);
    fetchArtlabEventData({ query: debouncedSearch, categorySlug: subKategori, status: statusFilter, limit: perPage })
      .then(({ data, nextCursor: nc }) => {
        if (cancelled) return;
        setRows(data);
        setNextCursor(nc);
      })
      .catch((err) => { if (!cancelled) console.error('Gagal memuat event artlab:', err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch, subKategori, statusFilter, perPage]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const { data, nextCursor: nc } = await fetchArtlabEventData({
        query: debouncedSearch,
        categorySlug: subKategori,
        status: statusFilter,
        limit: perPage,
        cursor: nextCursor,
      });
      setRows((prev) => [...prev, ...data]);
      setNextCursor(nc);
    } catch (err) {
      console.error('Gagal memuat lebih banyak event artlab:', err);
    } finally {
      setLoading(false);
    }
  }, [nextCursor, loading, debouncedSearch, subKategori, statusFilter, perPage]);

  const columns = useMemo(
    () => buildEventColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
      preferredCategorySlugs: ['workshop-artlab', 'screening-film', 'untuk-perhatian', 'stonen-29-radio-show'],
    }),
    [handleEdit, handleDelete],
  );

  return (
    <div className="p-2 md:p-6 bg-white border border-gray-200 rounded-lg shadow min-h-screen">
      {/* Bagian atas  */}
      <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl text-zinc-700 font-extrabold mb-1 font-poppins">Hysteria Artlab</h1>
          <p className="text-sm text-gray-700 mb-6 font-poppins">Kelola semua konten dari platform Hysteria Artlab</p>

          <div className="grid md:grid-cols-7 gap-6">
              <div className="flex flex-col gap-6 md:col-span-4">
                  <div className="p-5 border border-gray-400 rounded-lg bg-white shadow-xl">
                    <h2 className="py-1 text-pink-500 font-bold mb-3 font-poppins">Merchandise</h2>
                    <div className="flex flex-col md:flex-row gap-3 md:gap-5">
                      <button
                        type="button"
                        className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold cursor-pointer"
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/admin/platform-content/merchandise');
                            if (!res.ok) throw new Error('Failed to fetch merchandise');
                            const data = await res.json();
                            const url = data?.item?.url || '';
                            setMerchInitial({ input: url });
                            setOpenMerch(true);
                          } catch (err) {
                            // still open modal with empty value
                            setMerchInitial({ input: '' });
                            setOpenMerch(true);
                          }
                        }}
                      >
                        Kelola Merchandise
                      </button>
                    </div>
                  </div>

                  <div className="p-5 border border-gray-400 rounded-lg bg-white shadow-xl">
                      <h2 className="py-1 text-pink-500 font-bold mb-3 font-poppins">Workshop Artlab, Screening Film, dan Untuk Perhatian</h2>
                      <div>
                          <button className="w-full md:w-auto bg-[#43334C] hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold cursor-pointer">Tambah Postingan</button>
                      </div>
                  </div>
              </div>

              <div className="p-5 border border-gray-500 rounded-lg bg-white shadow-xl flex flex-col space-y-3 md:space-y-5 md:col-span-3">
                  <h2 className="text-pink-500 font-bold mb-3 font-poppins">Podcast Artlab</h2>
                  <button onClick={() => router.push('/admin/events/create?category=stonen-29-radio-show')} className="w-full bg-[#43334C] hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold cursor-pointer">Tambah Stonen 29 Radio Show</button>
                  <button
                    onClick={() => setOpenAntalk(true)}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold cursor-pointer"
                  >
                    Kelola Anitalk
                  </button>
                  <button
                    onClick={() => setOpenArtistRadar(true)}
                    className="w-full bg-[#43334C] hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold cursor-pointer"
                  >
                    Tambah Artist Radar
                  </button>
              </div>
          </div>
      </div>

      {/* open modals */}
      {openMerch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* blur */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenMerch(false)} />
          {/* modal content */}
          <div className="relative z-10 w-full max-h-[90vh] overflow-auto px-4">
            <div className="mx-auto w-full sm:max-w-md md:max-w-lg lg:max-w-2xl p-2 bg-white rounded-lg shadow-lg">
              <LinkForm
                close={() => setOpenMerch(false)}
                title="Merchandise"
                subtitle="edit dengan nomor hp/whatsapp yang aktif"
                placeholders={{ input: 'contoh: 085535235339' }}
                prefix={'https://api.whatsapp.com/send/?phone=62'}
                isPhone={true}
                initial={merchInitial}
                onSave={async ({ name }) => {
                  try {
                    const body = { url: name };
                    const res = await fetch('/api/admin/platform-content/merchandise', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body)
                    });
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      throw new Error(err.message || 'Failed to save merchandise');
                    }
                    // Optionally refresh page or state here
                  } catch (err) {
                    console.error('Error saving merchandise:', err);
                    throw err;
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {openAntalk && (
        <div className="fixed w-full inset-0 z-50 flex items-center justify-center min-h-screen min-w-screen">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenAntalk(false)} />
          <div className="relative z-10 w-full max-h-[95vh] overflow-auto px-4">
            <div className="mx-auto w-full sm:max-w-lg md:max-w-6xl p-2 bg-white rounded-lg shadow-lg">
              <PlatformIndex
                platformSlug="hysteria-artlab"
                categoryItemSlug="anitalk"
                title="Anitalk"
                subtitle="Kelola Anitalk Konten"
                showImageUpload={false}
                actionLabel="+Add"

                // pass data field (judul dan tahun default)
                // showTags={true}
                searchPlaceholder="Cari judul podcast..."
                showURL={true}
                showPrevDescription={true}
                // showDescription={true}
                showGuests={true}
                showHost={true}
                showMeta={true}
                close={() => setOpenAntalk(false)}
              />
            </div>
          </div>
        </div>
      )}

      {openArtistRadar && (
        <div className="fixed w-full inset-0 z-50 flex items-center justify-center min-h-screen min-w-screen">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenArtistRadar(false)} />
          <div className="relative z-10 w-full max-h-[95vh] overflow-auto px-4">
            <div className="mx-auto w-full sm:max-w-lg md:max-w-6xl p-2 bg-white rounded-lg shadow-lg">
              <PlatformIndex
                platformSlug="hysteria-artlab"
                categoryItemSlug="artist-radar"
                title="Artist Radar"
                subtitle="Kelola Artist Radar"
                actionLabel="+Add"
                searchPlaceholder="Cari judul artist radar..."
                showURL={false}
                showImageUpload={true}
                showTags={true}
                showInstagram={true}
                showYoutube={true}
                showPrevDescription={true}
                showDescription={true}
                showHost={true}
                showGuests={true}
                showMeta={true}
                close={() => setOpenArtistRadar(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bagian bawah */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:gap-0 justify-between items-center md:items-center mb-6 md:mb-0">
          <div>
            <h2 className="text-2xl md:text-3xl text-zinc-700 font-extrabold mb-1 font-poppins">
              Semua Postingan
            </h2>
            <p className="text-sm text-gray-600 mb-6 font-poppins">
              Kelola Workshop Artlab, Screening Film dan Untuk Perhatian
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

        {/* filter */}
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
            className="w-full md:w-auto rounded-md bg-white border border-gray-300 shadow-sm"
            value={subKategori}
            onChange={setSubKategori}
            options={artlabEventCategoryOptions}
            emptyOptionLabel="Semua Sub Kategori"
          />
          <PageFilter perPage={perPage} onChange={setPerPage} />
          <SelectField
            className="w-[190px] md:w-auto rounded-md bg-white border border-gray-300 shadow-sm"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            emptyOptionLabel="Semua Status"
          />
          
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          getRowId={(r) => r.id}
        />
        {nextCursor && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outlined"
              size="small"
              disabled={loading}
              onClick={handleLoadMore}
              sx={{ textTransform: 'none' }}
            >
              {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
