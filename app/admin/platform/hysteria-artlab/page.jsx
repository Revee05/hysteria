"use client";

import React, { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import SelectField from '@/components/ui/SelectField';
import SearchField from '@/components/adminUI/SearchField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '@/components/ui/DataTable';
import PageFilter from '@/components/ui/PageFilter';
import LinkForm from '../_component/link.form';
import PlatformIndex from '../_component/index.page';
import {
  subKategoriArtlabOptions,
  statusOptions,
  buildPlatformColumns,
  artlabDummyData,
  filterArtlabData,
} from '../_handler/data';

export default function HysteriaArtlabPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subKategori, setSubKategori] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [perPage, setPerPage]          = useState(10);
  const [openMerch, setOpenMerch] = useState(false);
  const [merchInitial, setMerchInitial] = useState({ input: '' });
  
  const [openAntalk, setOpenAntalk] = useState(false);
  const [openArtistRadar, setOpenArtistRadar] = useState(false);

  const debouncedSearch = useDebounce(searchQuery);

  const handleEdit   = (row) => console.log('Edit:', row);
  const handleDelete = (row) => console.log('Delete:', row);

  const columns = useMemo(
    () => buildPlatformColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  const rows = useMemo(
    () => filterArtlabData(artlabDummyData, { query: debouncedSearch, subKategori, status: statusFilter }),
    [debouncedSearch, subKategori, statusFilter],
  );

  return (
    <div className="p-2 md:p-6 bg-white border border-gray-200 rounded-lg shadow min-h-screen">
      {/* Bagian atas  */}
      <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 font-poppins">Hysteria Artlab</h1>
          <p className="text-sm text-gray-700 mb-6 font-poppins">Kelola semua konten dari platform Hysteria Artlab</p>

          <div className="grid md:grid-cols-7 gap-6">
              <div className="flex flex-col gap-6 md:col-span-4">
                  <div className="p-5 border border-gray-400 rounded-lg bg-white shadow-xl">
                    <h2 className="py-1 text-pink-500 font-bold mb-3 font-poppins">Merchandise</h2>
                    <div>
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
                  <button className="w-full bg-[#43334C] hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold cursor-pointer">Tambah Stonen 29 Radio Show</button>
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
                title="Podcast Artlab"
                subtitle="Kelola Podcast Artlab"
                actionLabel="+Add"
                searchPlaceholder="Cari judul podcast..."
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
                close={() => setOpenArtistRadar(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bagian bawah */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-1 font-poppins">Semua Postingan</h2>
        <p className="text-sm text-gray-700 mb-6 font-poppins">
          Kumpulan postingan dari Podcast Artlab, Workshop Artlab, Screening Film, dan Untuk Perhatian
        </p>

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
            options={subKategoriArtlabOptions}
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
          loading={false}
          getRowId={(r) => r.id}
        />
      </div>
    </div>
  );
}
