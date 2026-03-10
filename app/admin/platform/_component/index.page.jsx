"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useDebounce } from '@/hooks/use-debounce';
import SearchField from '@/components/adminUI/SearchField';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '@/components/ui/DataTable';
import PageFilter from '@/components/ui/PageFilter';
import SubForm from './form/sub.form';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
  showTags = false,
  showMeta = false,
  showURL = false,
  showInstagram = false,
  showYoutube = false,
  showPrevDescription = false,
  showDescription = false,
  showHost = false,
  showGuests = false,
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
      params.set('minimal', 'true');
      if (platformSlug) {
        params.set('platformSlug', platformSlug);
        if (categoryItemSlug) params.set('categoryItemSlug', categoryItemSlug);
      } else {
        params.set('platformId', String(platformId));
        if (categoryItemId) params.set('categoryItemId', String(categoryItemId));
      }

      const res = await fetch(`/api/admin/platform-content/content?${params.toString()}`);
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
      if (rest.meta != null) fd.append('meta', typeof rest.meta === 'object' ? JSON.stringify(rest.meta) : rest.meta);
      if (rest.instagram != null) fd.append('instagram', rest.instagram);
      if (rest.youtube != null) fd.append('youtube', rest.youtube);
      if (rest.prevdescription != null) fd.append('prevdescription', rest.prevdescription);
      if (rest.description != null) fd.append('description', rest.description);
      if (rest.tags != null) fd.append('tags', JSON.stringify(rest.tags));
      if (platformSlug) fd.append('platformSlug', platformSlug);
      else fd.append('platformId', String(platformId));
      if (categoryItemSlug) fd.append('categoryItemSlug', categoryItemSlug);
      else if (categoryItemId) fd.append('categoryItemId', String(categoryItemId));
      if (rest.host != null) fd.append('host', rest.host);
      if (rest.guests != null) fd.append('guests', JSON.stringify(rest.guests));
      for (const file of imageFiles) fd.append('images', file);

      const res  = await fetch('/api/admin/platform-content/content', { method: 'POST', body: fd });
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
      if (rest.meta != null) fd.append('meta', typeof rest.meta === 'object' ? JSON.stringify(rest.meta) : rest.meta);
      if (rest.url != null) fd.append('url', rest.url);
      if (rest.instagram != null) fd.append('instagram', rest.instagram);
      if (rest.youtube != null) fd.append('youtube', rest.youtube);
      if (rest.prevdescription != null) fd.append('prevdescription', rest.prevdescription);
      if (rest.description != null) fd.append('description', rest.description);
      if (rest.tags != null) fd.append('tags', JSON.stringify(rest.tags));
      if (rest.host != null) fd.append('host', rest.host);
      if (rest.guests != null) fd.append('guests', JSON.stringify(rest.guests));
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
    { field: 'title', headerName: 'Judul', width: 250, freeze:true },
    ...(showImageUpload ? [{
      field: 'image',
      headerName: 'Gambar',
      width: 120,
      freeze: true,
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
    }] : []),
    ...(showPrevDescription ? [{
      field: 'prevdescription',
      headerName: 'Ringkasan',
      width: 250,
      render: (row) => (
        row?.prevdescription
          ? <span className="text-zinc-700 text-sm line-clamp-2">{row.prevdescription}</span>
          : <span className="text-gray-400">—</span>
      ),
    }] : []),
    ...(showDescription ? [{
      field: 'description',
      headerName: 'Deskripsi',
      width: 250,
      render: (row) => (
        row?.description
          ? <span className="text-zinc-700 text-sm line-clamp-2">{row.description}</span>
          : <span className="text-gray-400">—</span>
      ),
    }] : []),
    ...(showYoutube ? [{
      field: 'youtube',
      headerName: 'YouTube',
      width: 180,
      render: (row) => (
        (row?.platform?.youtube || row?.youtube) ? (
          <a href={(row?.platform?.youtube || row?.youtube)} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{row?.platform?.youtube || row?.youtube}</a>
        ) : (
          <span className="text-gray-500">—</span>
        )
      ),
    }] : []),
    ...(showInstagram ? [{
      field: 'instagram',
      headerName: 'Instagram',
      width: 180,
      render: (row) => (
        (row?.platform?.instagram || row?.instagram) ? (
          <a href={(row?.platform?.instagram || row?.instagram)} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{row?.platform?.instagram || row?.instagram}</a>
        ) : (
          <span className="text-gray-500">—</span>
        )
      ),
    }] : []),
    ...(showURL ? [{
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
    }] : []),
    ...(showHost ? [{
        field: 'host',
        headerName: 'Host',
        width: 150,
        render: (row) => <span className="text-zinc-700 text-sm">{row.host || '—'}</span>,
      },
    ] : []),
    ...(showGuests ? [{
        field: 'guests',
        headerName: 'Guests',
        width: 200,
        render: (row) => {
          const list = Array.isArray(row.guests) ? row.guests.filter(Boolean) : [];
          return list.length > 0
            ? <span className="text-zinc-700 text-sm">{list.join(', ')}</span>
            : <span className="text-gray-400">—</span>;
        },
      },
    ] : []),
    ...(showTags ? [{
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      render: (row) => {
        const list = Array.isArray(row.tags) ? row.tags.filter(Boolean) : [];
        return list.length > 0
          ? <span className="text-zinc-700 text-sm">{list.join(', ')}</span>
          : <span className="text-gray-400">—</span>;
      },
    }] : []),
    ...(showMeta ? [{
      field: 'meta',
      headerName: 'Meta',
      width: 180,
      render: (row) => (
        row?.meta ? <span className="text-zinc-700 text-sm line-clamp-2">{typeof row.meta === 'string' ? row.meta : JSON.stringify(row.meta)}</span> : <span className="text-gray-400">—</span>
      ),
    }] : []),
    { field: 'year', headerName: 'Tahun', width: 100, align: 'center', headerAlign: 'center' },
    {
      field: 'aksi',
      headerName: 'Action',
      width: 100,
      align: 'center',
      headerAlign: 'justify-center',
      render: (row) => (
        <div className="flex gap-1 justify-start items-center">
          <Tooltip title="Edit" arrow>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(row); }} sx={{ color: '#ec4899', '&:hover': { color: '#db2777' } }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus" arrow>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); effectiveDelete?.(row); }} sx={{ color: '#43334C', '&:hover': { color: '#ef4444' } }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
          <h3 className="text-2xl text-zinc-600 font-extrabold">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="ml-auto flex flex-end items-end md:flex-row md:items-start gap-2">
          <Tooltip title="tambah postingan" arrow>
            <span>
              <button
                type="button"
                onClick={() => handleAdd()}
                disabled={saving}
                className="px-3 py-2 bg-[#43334C] hover:bg-[#2e2237] text-white rounded-md shadow-md font-semibold cursor-pointer disabled:opacity-60"
              >
                {actionLabel}
              </button>
            </span>
          </Tooltip>

          <Tooltip title="close" arrow>
            <span>
              <button
                type="button"
                onClick={() => close?.()}
                aria-label="close"
                className="px-3 py-2 text-zinc-100 bg-red-500 rounded-md hover:bg-red-600 cursor-pointer"
              >
                ✕
              </button>
            </span>
          </Tooltip>
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
        categoryItemSlug={categoryItemSlug}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        saving={saving}
        showImageUpload={showImageUpload}
        showTags={showTags}
        showInstagram={showInstagram}
        showYoutube={showYoutube}
        showURL={showURL}
        showPrevDescription={showPrevDescription}
        showDescription={showDescription}
        showHost={showHost}
        showGuests={showGuests}
        showMeta={showMeta}
      />
    </div>
  );
}
