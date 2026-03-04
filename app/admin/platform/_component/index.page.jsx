"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useDebounce } from '@/hooks/use-debounce';
import SearchField from '@/components/adminUI/SearchField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '@/components/ui/DataTable';
import PageFilter from '@/components/ui/PageFilter';
import SubForm from './form/sub.form';

const FALLBACK_ITEMS = [
  { id: 1, no: 1, title: 'example', year: 2026, url: 'https://example.com' },
];

/**
 * PlatformIndex — reusable list/table panel.
 *
 * Props:
 *   platformSlug     – slug platform (misal: 'hysteria-artlab'); jika diisi, fetch via API
 *   categoryItemSlug – slug kategori opsional untuk filter (misal: 'anitalk')
 *   platformId       – alternatif platformSlug jika hanya tersedia ID
 *   categoryItemId   – alternatif categoryItemSlug jika hanya tersedia ID
 *   close            – tutup modal (opsional)
 *   title            – judul utama (h3)
 *   subtitle         – sub-judul (p)
 *   actionLabel      – label tombol aksi kanan atas
 *   onAdd            – callback tambahan setelah POST sukses (opsional)
 *   items            – array baris data statis (fallback jika platformId tidak diisi)
 *   columns          – array kolom untuk DataTable (opsional, ada default)
 *   searchPlaceholder– placeholder SearchField
 *   onEdit           – callback tambahan setelah PATCH sukses (opsional)
 *   onDelete         – callback tambahan setelah DELETE sukses (opsional)
 */
export default function PlatformIndex({
  platformSlug = null,
  categoryItemSlug = null,
  platformId = null,
  categoryItemId = null,
  close,
  title = '',
  subtitle = '',
  actionLabel = 'add',
  onAdd,
  items = null,
  columns = null,
  searchPlaceholder = 'Search...',
  onEdit,
  onDelete,
  showImageUpload = false,
}) {
  const [searchQuery, setSearchQuery]   = useState('');
  const [perPage, setPerPage]           = useState(10);
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [formMode, setFormMode]         = useState('add');   // 'add' | 'edit'
  const [selectedRow, setSelectedRow]   = useState(null);

  // ─── API state (aktif hanya jika platformId tersedia) ───────────────────────
  const [apiRows, setApiRows]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const debouncedSearch = useDebounce(searchQuery);

  // aktif jika salah satu slug/id platform tersedia
  const hasApi = !!(platformSlug || platformId);

  // ─── Fetch list dari API ─────────────────────────────────────────────────────
  const fetchContents = useCallback(async () => {
    if (!hasApi) return;
    try {
      setLoading(true);
      setApiError(null);
      const params = new URLSearchParams();
      if (platformSlug) {
        params.set('platformSlug', platformSlug);
        if (categoryItemSlug) params.set('categoryItemSlug', categoryItemSlug);
      } else {
        params.set('platformId', String(platformId));
        if (categoryItemId) params.set('categoryItemId', String(categoryItemId));
      }

      const res = await fetch(`/api/admin/platform-content?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json?.message ?? 'Gagal mengambil data');

      // normalize: tambahkan field `no` untuk nomor urut
      const data = (json.data ?? []).map((row, idx) => ({ ...row, no: idx + 1 }));
      setApiRows(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hasApi, platformSlug, categoryItemSlug, platformId, categoryItemId]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // ─── Sumber data baris ───────────────────────────────────────────────────────
  // Jika ada platform info → gunakan apiRows, jika tidak → gunakan prop items / fallback
  const baseRows = hasApi ? apiRows : (Array.isArray(items) ? items : FALLBACK_ITEMS);

  // ─── Handlers CRUD ──────────────────────────────────────────────────────────
  async function handleApiAdd(data) {
    const { files: imageFiles = [], ...rest } = data;
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('title', rest.title ?? '');
      if (rest.year != null && rest.year !== '') fd.append('year', String(rest.year));
      if (rest.url) fd.append('url', rest.url);
      if (platformSlug) fd.append('platformSlug', platformSlug);
      else fd.append('platformId', String(platformId));
      if (categoryItemSlug) fd.append('categoryItemSlug', categoryItemSlug);
      else if (categoryItemId) fd.append('categoryItemId', String(categoryItemId));
      for (const file of imageFiles) fd.append('images', file);

      const res  = await fetch('/api/admin/platform-content', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Gagal menyimpan data');

      onAdd?.(json.data);
      await fetchContents();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleApiEdit(data) {
    if (!data?.id) return;
    const { id, no, files: imageFiles = [], ...rest } = data;
    try {
      setSaving(true);
      const fd = new FormData();
      if (rest.title != null) fd.append('title', rest.title);
      if (rest.year != null && rest.year !== '') fd.append('year', String(rest.year));
      if (rest.url != null) fd.append('url', rest.url);
      for (const file of imageFiles) fd.append('images', file);

      const res  = await fetch(`/api/admin/platform-content/${id}`, { method: 'PATCH', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Gagal mengupdate data');

      onEdit?.(json.data);
      await fetchContents();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleApiDelete(row) {
    if (!row?.id) return;
    if (!confirm(`Hapus "${row.title}"?`)) return;
    try {
      const res  = await fetch(`/api/admin/platform-content/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Gagal menghapus data');

      onDelete?.(row);
      await fetchContents();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  // Tentukan handler yang dipakai (API vs prop)
  const effectiveDelete = hasApi ? handleApiDelete : onDelete;

  // build default columns inside component so handlers are in scope
  const defaultColumns = [
    { field: 'no', headerName: 'No.', width: 60, freeze:true},
    { field: 'title', headerName: 'Judul', width: 250 },
    {
      field: 'url',
      width: 250,
      headerName: 'URL',
      render: (row) => (
        row?.url ? (
          <a href={row.url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{row.url}</a>
        ) : (
          <span className="text-gray-500">—</span>
        )
      ),
    },
    {
      field: 'image',
      headerName: 'Gambar',
      width: 120,
      render: (row) => (
        row?.images && row.images.length > 0 ? (
          <Image
            src={row.images[0].imageUrl}
            alt={row.images[0].alt || row.title || 'gambar'}
            width={160}
            height={120}
            className="w-20 h-15 object-cover rounded"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
    },
    { field: 'year', headerName: 'Tahun', width: 100, align: 'center', headerAlign: 'center' },
    {
      field: 'aksi',
      headerName: 'Action',
      width: 100,
      align: 'center',
      headerAlign: 'justify-center',
      render: (row) => (
        <div className="flex flex-wrap gap-2 justify-start items-center ">
          <button
            onClick={() => handleEdit(row)}
            className="text-white bg-pink-500 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-pink-600"
          >
            Edit
          </button>
          <button
            onClick={() => effectiveDelete?.(row)}
            className="text-white bg-[#43334C] px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-red-500"
          >
            ✕
          </button>
        </div>
      ),
    },
  ];

  const activeCols = Array.isArray(columns) ? columns : defaultColumns;

  // client-side search filter
  const rows = useMemo(() => {
    if (!debouncedSearch) return baseRows;
    const q = debouncedSearch.toLowerCase();
    return baseRows.filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [baseRows, debouncedSearch]);

  function handleAdd() {
    setFormMode('add');
    setSelectedRow(null);
    setIsFormOpen(true);
  }

  function handleEdit(row) {
    setFormMode('edit');
    setSelectedRow(row);
    setIsFormOpen(true);
  }

  // Pilih handler submit form sesuai mode dan ketersediaan platform info
  function handleFormSubmit(data) {
    setIsFormOpen(false);
    if (hasApi) {
      if (formMode === 'add') handleApiAdd(data);
      else handleApiEdit(data);
    } else {
      if (formMode === 'add') onAdd?.(data);
      else onEdit?.(data);
    }
  }

  return (
    <div className="p-3 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex w-full items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-2xl font-extrabold">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-end md:flex-row md:items-start gap-2">
          <button
            type="button"
            onClick={() => handleAdd()}
            disabled={saving}
            className="px-3 py-2 bg-[#43334C] hover:bg-[#2e2237] text-white rounded-md shadow-md font-semibold cursor-pointer disabled:opacity-60"
          >
            {actionLabel}
          </button>
          <button
            type="button"
            onClick={() => close?.()}
            aria-label="close"
            className="px-3 py-2 text-zinc-100 bg-red-500 rounded-md hover:bg-red-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* API error banner */}
      {apiError && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-300 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{apiError}</span>
          <button
            type="button"
            onClick={fetchContents}
            className="ml-4 text-red-600 underline text-xs cursor-pointer hover:text-red-800"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap md:flex-row items-center gap-3 mb-4">
        <div className="w-full md:w-auto">
          <SearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            showAdornment={false}
            endAdornment={
              <IconButton size="small" aria-label="search">
                <SearchIcon fontSize="small" />
              </IconButton>
            }
            className="rounded-md bg-white border border-gray-300 shadow-sm"
          />
        </div>
        <PageFilter perPage={perPage} onChange={setPerPage} />
      </div>

      {/* Table */}
      <DataTable
        columns={activeCols}
        rows={rows}
        loading={loading}
        getRowId={(r) => r.id}
      />

      <SubForm
        key={selectedRow?.id ?? '__new__'}
        open={isFormOpen}
        mode={formMode}
        initialData={selectedRow}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        saving={saving}
        showImageUpload={showImageUpload}
      />
    </div>
  );
}
