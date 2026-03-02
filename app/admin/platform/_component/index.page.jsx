"use client";

import React, { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import SearchField from '@/components/adminUI/SearchField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '@/components/ui/DataTable';
import PageFilter from '@/components/ui/PageFilter';

const FALLBACK_ITEMS = [
  { id: 1, no: 1, title: 'example', year: 2026 },
];

/**
 * PlatformIndex — reusable list/table panel.
 *
 * Props:
 *   close            – tutup modal (opsional)
 *   title            – judul utama (h3)
 *   subtitle         – sub-judul (p)
 *   actionLabel      – label tombol aksi kanan atas
 *   onAdd            – callback tombol aksi
 *   items            – array baris data  { id, no, title, year, ... }
 *   columns          – array kolom untuk DataTable (opsional, ada default)
 *   searchPlaceholder– placeholder SearchField
 *   onEdit           – callback (row) => void  (dipakai di default columns)
 *   onDelete         – callback (row) => void  (dipakai di default columns)
 */
export default function PlatformIndex({
  close,
  title = '',
  subtitle = '',
  actionLabel = '',
  onAdd,
  items = null,
  columns = null,
  searchPlaceholder = 'Search...',
  onEdit,
  onDelete,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [perPage, setPerPage] = useState(10);
  const debouncedSearch = useDebounce(searchQuery);

  const baseRows = Array.isArray(items) ? items : FALLBACK_ITEMS;

  // build default columns inside component so onEdit/onDelete are in scope
  const defaultColumns = useMemo(() => [
    { field: 'no', headerName: 'No.', width: 60 },
    { field: 'title', headerName: 'Tittle' },
    { field: 'year', headerName: 'Tahun', width: 100, align: 'center', headerAlign: 'center' },
    {
      field: 'aksi',
      headerName: 'Aksi',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => onEdit?.(row)}
            className="text-white bg-pink-500 px-3 py-1 rounded-md text-xs cursor-pointer hover:bg-pink-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete?.(row)}
            className="text-white bg-[#43334C] px-3 py-1 rounded-md text-xs cursor-pointer hover:bg-[#2e2237]"
          >
            ✕
          </button>
        </div>
      ),
    },
  ], [onEdit, onDelete]);

  const activeCols = Array.isArray(columns) ? columns : defaultColumns;

  // client-side search filter
  const rows = useMemo(() => {
    if (!debouncedSearch) return baseRows;
    const q = debouncedSearch.toLowerCase();
    return baseRows.filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [baseRows, debouncedSearch]);

  return (
    <div className="p-3 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex w-full items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-2xl font-extrabold">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="ml-auto flex flex-col items-end md:flex-row md:items-start gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="px-3 py-2 bg-[#43334C] hover:bg-[#2e2237] text-white rounded-md shadow-md font-semibold cursor-pointer"
          >
            {actionLabel}
          </button>
          <button
            type="button"
            onClick={() => close?.()}
            aria-label="close"
            className="px-3 py-2 text-zinc-100 bg-red-500 rounded-md hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
        <PageFilter perPage={perPage} onChange={setPerPage} />
        <div className="w-full">
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
      </div>

      {/* Table */}
      <DataTable
        columns={activeCols}
        rows={rows}
        loading={false}
        getRowId={(r) => r.id}
      />
    </div>
  );
}
