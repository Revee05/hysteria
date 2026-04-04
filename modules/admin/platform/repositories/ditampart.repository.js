// Repository untuk operasi database terkait "link ditampart" di platform admin.

import { prisma } from '@/lib/prisma.js';

const SELECT = {
  id: true,
  categoryId: true,
  parentId: true,
  title: true,
  slug: true,
  url: true,
};

const ITEM_3D                 = { title: '3D',                    slug: '3d' };
const ITEM_FOTO_KEGIATAN      = { title: 'Foto Kegiatan',         slug: 'foto-kegiatan' };
const ITEM_SHORT_FILM         = { title: 'Short Film Dokumenter', slug: 'short-film-dokumenter' };

// ── Finders ──────────────────────────────────────────────────────────────────

export async function find3D() {
  return await prisma.categoryItem.findFirst({
    where: { title: ITEM_3D.title, slug: ITEM_3D.slug },
    select: SELECT,
  });
}

export async function findFotoKegiatan() {
  return await prisma.categoryItem.findFirst({
    where: { title: ITEM_FOTO_KEGIATAN.title, slug: ITEM_FOTO_KEGIATAN.slug },
    select: SELECT,
  });
}

export async function findShortFilmDokumenter() {
  return await prisma.categoryItem.findFirst({
    where: { title: ITEM_SHORT_FILM.title, slug: ITEM_SHORT_FILM.slug },
    select: SELECT,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export async function findItemById(id) {
  return await prisma.categoryItem.findUnique({ where: { id } });
}

export async function updateItem(id, data) {
  return await prisma.categoryItem.update({ where: { id }, data });
}
