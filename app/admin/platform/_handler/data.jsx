"use client";

/**
 * _handler/data.js
 * Handler untuk menyiapkan data, opsi filter, dan fetch helper platform admin.
 * Digunakan bersama oleh semua halaman admin platform (ditampart, artlab, laki-masak).
 */

import React from 'react';

// ═══════════════════════════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════════════════════════

export const statusOptions = [
  { id: 'akan-datang',        name: 'Akan Datang' },
  { id: 'sedang-berlangsung', name: 'Sedang Berlangsung' },
  { id: 'berakhir',           name: 'Berakhir' },
];

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

// ═══════════════════════════════════════════════════════════════
// DITAMPART
// ═══════════════════════════════════════════════════════════════

export async function fetchDitampartEventData({ query = '', status = null, limit = 10, cursor = null } = {}) {
  const p = new URLSearchParams();
  if (query)  p.set('q', query);
  if (status) p.set('status', status);
  p.set('limit', String(limit));
  if (cursor) p.set('cursor', String(cursor));
  const res = await fetch(`/api/admin/platform-content/ditampart/events?${p.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data event ditampart');
  const json = await res.json();
  return {
    data: json.data?.data ?? [],
    nextCursor: json.data?.nextCursor ?? null,
    totalCount: json.data?.totalCount ?? 0,
  };
}

// ═══════════════════════════════════════════════════════════════
// HYSTERIA ARTLAB
// ═══════════════════════════════════════════════════════════════

export async function fetchArtlabEventData({ query = '', categorySlug = null, status = null, limit = 10, cursor = null } = {}) {
  const p = new URLSearchParams();
  if (query)        p.set('q', query);
  if (categorySlug) p.set('categorySlug', categorySlug);
  if (status)       p.set('status', status);
  p.set('limit', String(limit));
  if (cursor)       p.set('cursor', String(cursor));
  const res = await fetch(`/api/admin/platform-content/hysteria-artlab/events?${p.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data event artlab');
  const json = await res.json();
  return {
    data: json.data?.data ?? [],
    nextCursor: json.data?.nextCursor ?? null,
    totalCount: json.data?.totalCount ?? 0,
  };
}

// ═══════════════════════════════════════════════════════════════
// LAKI MASAK
// ═══════════════════════════════════════════════════════════════

export async function fetchLakiMasakEventData({ query = '', status = null, limit = 10, cursor = null } = {}) {
  const p = new URLSearchParams();
  if (query)  p.set('q', query);
  if (status) p.set('status', status);
  p.set('limit', String(limit));
  if (cursor) p.set('cursor', String(cursor));
  const res = await fetch(`/api/admin/platform-content/laki-masak/events?${p.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data event meramu');
  const json = await res.json();
  return {
    data: json.data?.data ?? [],
    nextCursor: json.data?.nextCursor ?? null,
    totalCount: json.data?.totalCount ?? 0,
  };
}

