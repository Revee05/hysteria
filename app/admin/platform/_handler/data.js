"use client";

/**
 * _handler/data.js
 * Handler untuk menyiapkan data, kolom, dan opsi filter platform admin.
 * Digunakan bersama oleh semua halaman admin platform (ditampart, artlab, laki-masak).
 */

import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';

const DEFAULT_THUMBNAIL = '/images/default-thumbnail.png';

// ═══════════════════════════════════════════════════════════════
// SHARED — dipakai oleh semua platform
// ═══════════════════════════════════════════════════════════════

// ── Status options ────────────────────────────────────────────
export const statusOptions = [
  { id: 'akan-datang',        name: 'Akan Datang' },
  { id: 'sedang-berlangsung', name: 'Sedang Berlangsung' },
  { id: 'berakhir',           name: 'Berakhir' },
];

// ── Status badge ──────────────────────────────────────────────
const STATUS_STYLE = {
  'Akan Datang':        'bg-blue-100 text-blue-700',
  'Sedang Berlangsung': 'bg-green-100 text-green-700',
  'Berakhir':           'bg-gray-100 text-gray-600',
};

export function StatusBadge({ status }) {
  const cls = STATUS_STYLE[status] ?? 'bg-zinc-100 text-zinc-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ── Column factory ────────────────────────────────────────────
/**
 * @param {{ onEdit: (row) => void, onDelete: (row) => void }} callbacks
 * @returns kolom DataTable (digunakan oleh semua platform: ditampart, artlab, laki-masak)
 */
export function buildPlatformColumns({ onEdit, onDelete }) {
  return [
    {
      field: 'id',
      headerName: 'ID',
      width: 60,
      freeze: true,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'thumbnail',
      headerName: 'Thumbnail',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      render: (row) =>
        row.thumbnail ? (
          <div className="flex items-center justify-center">
            <Image
              src={row.thumbnail}
              alt={row.title ?? 'thumbnail'}
              width={56}
              height={40}
              className="rounded object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-14 h-10 bg-zinc-200 rounded flex items-center justify-center text-xs text-zinc-500">
            No img
          </div>
        ),
    },
    {
      field: 'title',
      headerName: 'Judul',
      width: 240,
      render: (row) => (
        <span className="font-medium text-zinc-800 line-clamp-2">{row.title ?? '-'}</span>
      ),
    },
    {
      field: 'subKategori',
      headerName: 'Sub Kategori',
      width: 180,
      render: (row) => (
        <span className="text-zinc-700 text-sm">{row.subKategori ?? '-'}</span>
      ),
    },
    {
      field: 'date',
      headerName: 'Tanggal',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      render: (row) => {
        if (!row.date) return '-';
        const d = new Date(row.date);
        return (
          <span className="text-zinc-700 text-sm">
            {d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      field: 'action',
      headerName: 'Aksi',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit?.(row); }}
              className="text-blue-600 hover:bg-blue-50"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete?.(row); }}
              className="text-red-500 hover:bg-red-50"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// DITAMPART
// ═══════════════════════════════════════════════════════════════

// ── Options ───────────────────────────────────────────────────
export const subKategoriDitampartOptions = [
  { id: '3d',           name: '3D' },
  { id: 'mockup-poster', name: 'Mock up dan Poster' },
  { id: 'foto-kegiatan', name: 'Foto Kegiatan' },
  { id: 'short-film',   name: 'Short Film Dokumenter' },
];

// ── Dummy data ────────────────────────────────────────────────
export const ditampartDummyData = [
  { id: 1, thumbnail: '/image/ditampart1.png', title: 'Pameran Karya 3D Angkatan 2024',       subKategori: '3D',                   date: '2024-11-20', status: 'Berakhir' },
  { id: 2, thumbnail: DEFAULT_THUMBNAIL, title: 'Poster Promosi Hysteria Vol.12',        subKategori: 'Mock up dan Poster',   date: '2025-02-10', status: 'Berakhir' },
  { id: 3, thumbnail: DEFAULT_THUMBNAIL, title: 'Dokumentasi Foto Kegiatan Bulan Maret', subKategori: 'Foto Kegiatan',        date: '2025-03-08', status: 'Akan Datang' },
  { id: 4, thumbnail: DEFAULT_THUMBNAIL, title: 'Short Film — Suara di Balik Tirai',     subKategori: 'Short Film Dokumenter', date: '2025-04-15', status: 'Akan Datang' },
  { id: 5, thumbnail: DEFAULT_THUMBNAIL, title: 'Workshop Visual 3D Semester Genap',     subKategori: '3D',                   date: '2025-03-01', status: 'Sedang Berlangsung' },
  { id: 6, thumbnail: DEFAULT_THUMBNAIL, title: 'Mock-up Merchandise Koleksi Musim Gugur', subKategori: 'Mock up dan Poster', date: '2025-03-20', status: 'Sedang Berlangsung' },
];

// ── Mock up dan Poster
export const mockupPosterDummyData = [
  { id: 201, no: 1, title: 'Poster Promosi Hysteria Vol.12', year: 2025 },
  { id: 202, no: 2, title: 'Mock-up Merchandise Koleksi Musim Gugur', year: 2025 },
  { id: 203, no: 3, title: 'Poster Event Workshop Visual', year: 2025 },
];

// ── Filter ────────────────────────────────────────────────────
export function filterDitampartData(data, { query, subKategori, status }) {
  return data.filter((row) => {
    const matchQuery  = !query      || row.title.toLowerCase().includes(query.toLowerCase());
    const matchSub    = !subKategori || row.subKategori === subKategoriDitampartOptions.find((o) => o.id === subKategori)?.name;
    const matchStatus = !status     || row.status === statusOptions.find((o) => o.id === status)?.name;
    return matchQuery && matchSub && matchStatus;
  });
}

// ── Fetch ─────────────────────────────────────────────────────
export async function fetchDitampartData({ query = '', subKategori = null, status = null } = {}) {
  const p = new URLSearchParams();
  if (query)       p.set('q', query);
  if (subKategori) p.set('subKategori', subKategori);
  if (status)      p.set('status', status);
  const res = await fetch(`/api/admin/platforms/ditampart/posts?${p.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data');
  const json = await res.json();
  return json.data ?? [];
}

// ═══════════════════════════════════════════════════════════════
// HYSTERIA ARTLAB
// ═══════════════════════════════════════════════════════════════

// ── Options ───────────────────────────────────────────────────
export const subKategoriArtlabOptions = [
  { id: 'podcast-artlab',  name: 'Podcast Artlab' },
  { id: 'stonen-29',       name: 'Stonen 29 Radio Show' },
  { id: 'workshop-artlab', name: 'Workshop Artlab' },
  { id: 'screening-film',  name: 'Screening Film' },
  { id: 'untuk-perhatian', name: 'Untuk Perhatian' },
];

// ── Dummy data ────────────────────────────────────────────────
export const artlabDummyData = [
  { id: 1, thumbnail: DEFAULT_THUMBNAIL, title: 'Podcast Artlab Eps.01 — Seni & Ruang',       subKategori: 'Podcast Artlab',      date: '2025-01-10', status: 'Berakhir' },
  { id: 2, thumbnail: DEFAULT_THUMBNAIL, title: 'Stonen 29 Radio Show Vol.3',                 subKategori: 'Stonen 29 Radio Show', date: '2025-02-14', status: 'Berakhir' },
  { id: 3, thumbnail: DEFAULT_THUMBNAIL, title: 'Workshop Kolase & Ilustrasi',                subKategori: 'Workshop Artlab',     date: '2025-03-05', status: 'Sedang Berlangsung' },
  { id: 4, thumbnail: DEFAULT_THUMBNAIL, title: 'Screening Film Pendek — Gerak Budaya',       subKategori: 'Screening Film',      date: '2025-03-22', status: 'Akan Datang' },
  { id: 5, thumbnail: DEFAULT_THUMBNAIL, title: 'Untuk Perhatian: Panggilan Karya Vol.2',     subKategori: 'Untuk Perhatian',     date: '2025-04-01', status: 'Akan Datang' },
  { id: 6, thumbnail: DEFAULT_THUMBNAIL, title: 'Podcast Artlab Eps.02 — Musik & Identitas',  subKategori: 'Podcast Artlab',      date: '2025-04-20', status: 'Akan Datang' },
];

// anitalk
export const anitalkDummyData = [
  { id: 101, no: 1, title: 'Anitalk Eps.01 — Perjalanan Stonen 29', year:2026 },
  { id: 102, no: 2, title: 'Anitalk Eps.02 — Di Balik Layar Stonen 29', year:2026 },
  { id: 103, no: 3, title: 'Anitalk Eps.03 — Kolaborasi dengan Musisi Lokal', year:2026 },
  { id: 104, no: 4, title: 'Anitalk Eps.04 — Eksplorasi Tema Sosial dalam Podcast', year:2026 },
  { id: 105, no: 5, title: 'Anitalk Eps.05 — Merayakan Keberagaman Melalui Podcast', year:2026 },
];

// ── Filter ────────────────────────────────────────────────────
export function filterArtlabData(data, { query, subKategori, status }) {
  return data.filter((row) => {
    const matchQuery  = !query       || row.title.toLowerCase().includes(query.toLowerCase());
    const matchSub    = !subKategori || row.subKategori === subKategoriArtlabOptions.find((o) => o.id === subKategori)?.name;
    const matchStatus = !status      || row.status === statusOptions.find((o) => o.id === status)?.name;
    return matchQuery && matchSub && matchStatus;
  });
}

// ── Fetch ─────────────────────────────────────────────────────
export async function fetchArtlabData({ query = '', subKategori = null, status = null } = {}) {
  const p = new URLSearchParams();
  if (query)       p.set('q', query);
  if (subKategori) p.set('subKategori', subKategori);
  if (status)      p.set('status', status);
  const res = await fetch(`/api/admin/platforms/artlab/posts?${p.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data');
  const json = await res.json();
  return json.data ?? [];
}

// ═══════════════════════════════════════════════════════════════
// LAKI MASAK
// ═══════════════════════════════════════════════════════════════

// ── Options ───────────────────────────────────────────────────
export const subKategoriLakiMasakOptions = [
  { id: 'homecooked',   name: 'Homecooked' },
  { id: 'komik-ramuan', name: 'Komik Ramuan' },
  { id: 'pre-order',    name: 'Pre-Order' },
  { id: 'meramu',       name: 'Meramu' },
];

// ── Dummy data ────────────────────────────────────────────────
export const lakiMasakDummyData = [
  { id: 1, thumbnail: DEFAULT_THUMBNAIL, title: 'Homecooked Eps.01 — Masak Bareng Komunitas', subKategori: 'Homecooked',   date: '2025-01-15', status: 'Berakhir' },
  { id: 2, thumbnail: DEFAULT_THUMBNAIL, title: 'Komik Ramuan — Seri Dapur Vol.1',            subKategori: 'Komik Ramuan', date: '2025-02-20', status: 'Berakhir' },
  { id: 3, thumbnail: DEFAULT_THUMBNAIL, title: 'Pre-Order Buku Resep Laki Masak 2025',       subKategori: 'Pre-Order',    date: '2025-03-01', status: 'Sedang Berlangsung' },
  { id: 4, thumbnail: DEFAULT_THUMBNAIL, title: 'Meramu — Festival Kuliner Kampus',           subKategori: 'Meramu',       date: '2025-03-28', status: 'Akan Datang' },
  { id: 5, thumbnail: DEFAULT_THUMBNAIL, title: 'Homecooked Eps.02 — Menu Sarapan Lokal',     subKategori: 'Homecooked',   date: '2025-04-10', status: 'Akan Datang' },
  { id: 6, thumbnail: DEFAULT_THUMBNAIL, title: 'Komik Ramuan — Seri Dapur Vol.2',            subKategori: 'Komik Ramuan', date: '2025-04-25', status: 'Akan Datang' },
];

// ── Homecooked
export const homecookedDummyData = [
  { id: 301, no: 1, title: 'Homecooked Eps.01 — Masak Bareng Komunitas', year: 2025 },
  { id: 302, no: 2, title: 'Homecooked Eps.02 — Menu Sarapan Lokal', year: 2025 },
  { id: 303, no: 3, title: 'Homecooked Eps.03 — Dapur Tradisional', year: 2025 },
];

// ── Komik Ramuan
export const komikRamuanDummyData = [
  { id: 401, no: 1, title: 'Komik Ramuan — Seri Dapur Vol.1', year: 2025 },
  { id: 402, no: 2, title: 'Komik Ramuan — Seri Dapur Vol.2', year: 2025 },
  { id: 403, no: 3, title: 'Komik Ramuan — Racikan Rahasia', year: 2025 },
];

// ── Filter ────────────────────────────────────────────────────
export function filterLakiMasakData(data, { query, subKategori, status }) {
  return data.filter((row) => {
    const matchQuery  = !query       || row.title.toLowerCase().includes(query.toLowerCase());
    const matchSub    = !subKategori || row.subKategori === subKategoriLakiMasakOptions.find((o) => o.id === subKategori)?.name;
    const matchStatus = !status      || row.status === statusOptions.find((o) => o.id === status)?.name;
    return matchQuery && matchSub && matchStatus;
  });
}

// ── Fetch ─────────────────────────────────────────────────────
export async function fetchLakiMasakData({ query = '', subKategori = null, status = null } = {}) {
  const p = new URLSearchParams();
  if (query)       p.set('q', query);
  if (subKategori) p.set('subKategori', subKategori);
  if (status)      p.set('status', status);
  const res = await fetch(`/api/admin/platforms/laki-masak/posts?${p.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data');
  const json = await res.json();
  return json.data ?? [];
}
