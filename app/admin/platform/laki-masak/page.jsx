"use client";

import React, { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import SelectField from '@/components/ui/SelectField';
import SearchField from '@/components/adminUI/SearchField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '@/components/ui/DataTable';
import PageFilter from '@/components/ui/PageFilter';
import LinkForm from '../_component/link.form';
import PlatformIndex from '../_component/index.page';
import {
  subKategoriLakiMasakOptions,
  statusOptions,
  buildPlatformColumns,
  lakiMasakDummyData,
  filterLakiMasakData,
  homecookedDummyData,
  komikRamuanDummyData,
} from '../_handler/data';

const categories = [
  { id: 1, title: 'Homecooked' },
  { id: 2, title: 'Komik Ramuan' },
  { id: 3, title: 'Pre-Order' },
];

export default function LakiMasakPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subKategori, setSubKategori] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [perPage, setPerPage]          = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalInitial, setModalInitial] = useState({});
  const [modalPlaceholders, setModalPlaceholders] = useState({});

  const [platformModal, setPlatformModal] = useState({ open: false, title: '', subtitle: '', items: [] });

  const debouncedSearch = useDebounce(searchQuery);

  const handleEdit   = (row) => console.log('Edit:', row);
  const handleDelete = (row) => console.log('Delete:', row);

  const openModalForCategory = (cat) => {
    // cat id 1 & 2 → PlatformIndex modal
    if (cat.id === 1) {
      setPlatformModal({ open: true, title: 'Homecooked', subtitle: 'Kelola konten Homecooked', items: homecookedDummyData });
      return;
    }
    if (cat.id === 2) {
      setPlatformModal({ open: true, title: 'Komik Ramuan', subtitle: 'Kelola konten Komik Ramuan', items: komikRamuanDummyData });
      return;
    }
    // cat id 3 → LinkForm modal (Pre-Order)
    setModalTitle(`Kelola ${cat.title}`);
    setModalInitial({ categoryId: cat.id, categoryTitle: cat.title });
    const placeholdersObj = cat.id === 3 ? { input: 'https://api.whatsapp.com/send/?phone=62' } : { input: 'text . . . . . ' };
    setModalPlaceholders(placeholdersObj);
    setModalOpen(true);
  };

  const handleSaveFromForm = async (data) => {
    console.log('Saved from LinkForm (LakiMasak):', data, modalInitial);
    // TODO: integrate saving logic (API call / state update)
    setModalOpen(false);
  };

  const columns = useMemo(
    () => buildPlatformColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  const rows = useMemo(
    () => filterLakiMasakData(lakiMasakDummyData, { query: debouncedSearch, subKategori, status: statusFilter }),
    [debouncedSearch, subKategori, statusFilter],
  );

    return (
        <div className="p-4 md:p-10 bg-white rounded-md min-h-screen">
        
            {/* bagian atas */}
            <div className="max-w-6xl mx-auto">
                <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Laki Masak</h1>
                <p className="text-sm text-gray-600 mt-1">Kelola semua konten dari platform Laki Masak</p>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((cat) => (
                    <div
                    key={cat.id}
                    className="h-30 bg-white border border-zinc-800 rounded-xl shadow-xl p-3 flex flex-col items-center text-center"
                    >
                    <div className="w-full h-auto flex items-start justify-start">
                        <span className="text-pink-600 font-semibold font-poppins block truncate" title={cat.title}>{cat.title}</span>
                    </div>

                    <div className="mt-auto items-center">
                        <button
                          onClick={() => {
                            if ([1, 2, 3].includes(cat.id)) {
                              openModalForCategory(cat);
                            } else {
                              console.log('Manage:', cat);
                            }
                          }}
                          className="bg-pink-500 cursor-pointer hover:bg-pink-600 text-white rounded-xl px-5 py-2 shadow-md"
                        >
                          Kelola Konten
                        </button>
                    </div>
                    </div>
                ))}
                </section>
            </div>

            {/* bagian bawah */}
            <div className="max-w-6xl mx-auto mt-12">
              <div className='flex flex-col md:flex-row md:gap-0 justify-between items-start md:items-center mb-6 md:mb-0'>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-1 font-poppins">Meramu</h2>
                  <p className="text-sm text-gray-600 mb-6 font-poppins">
                    Kumpulan postingan dari Meramu, salah satu kegiatan di Laki Masak
                  </p>
                </div>
                <div>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#43334C',
                      '&:hover': { backgroundColor: '#352837' },
                      textTransform: 'none',
                    }}
                  >
                    Tambah Event
                  </Button>
                </div>
              </div>

              {/* filter */}
              <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                <div className="w-full">
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
                  className="rounded-md bg-white border border-gray-300 shadow-sm"
                  value={subKategori}
                  onChange={setSubKategori}
                  options={subKategoriLakiMasakOptions}
                  emptyOptionLabel="Semua Sub Kategori"
                  sx={{ minWidth: 200 }}
                />
                <SelectField
                  className="rounded-md bg-white border border-gray-300 shadow-sm"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusOptions}
                  emptyOptionLabel="Semua Status"
                  sx={{ minWidth: 180 }}
                />
                <PageFilter perPage={perPage} onChange={setPerPage} />
              </div>

              <DataTable
                columns={columns}
                rows={rows}
                loading={false}
                getRowId={(r) => r.id}
              />
              {platformModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setPlatformModal(p => ({ ...p, open: false }))} />
                  <div className="relative z-10 w-full max-h-[95vh] overflow-auto px-4">
                    <div className="mx-auto w-full sm:max-w-lg md:max-w-4xl p-2 bg-white rounded-lg shadow-lg">
                      <PlatformIndex
                        title={platformModal.title}
                        subtitle={platformModal.subtitle}
                        actionLabel="Tambah"
                        onAdd={() => console.log('Tambah', platformModal.title)}
                        items={platformModal.items}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        searchPlaceholder="Cari konten..."
                        close={() => setPlatformModal(p => ({ ...p, open: false }))}
                      />
                    </div>
                  </div>
                </div>
              )}
              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  {/* blur */}
                  <div className="absolute inset-0 bg-black opacity-40" onClick={() => setModalOpen(false)} />
                  {/* modal content */}
                  <div className="z-60 mx-auto w-full sm:max-w-md md:max-w-lg lg:max-w-2xl p-2 bg-white rounded-lg shadow-lg">
                    <LinkForm
                      close={() => setModalOpen(false)}
                      title={modalTitle}
                      initial={modalInitial}
                      placeholders={modalPlaceholders}
                      onSave={handleSaveFromForm}
                    />
                  </div>
                </div>
              )}
            </div>
        </div>
  );
}

