// Repository untuk operasi database terkait "link laki masak" di platform admin.

import { prisma } from '@/lib/prisma.js';

const SELECT = {
  id: true,
  categoryId: true,
  parentId: true,
  title: true,
  slug: true,
  url: true,
};

const ITEM_PRE_ORDER = { title: 'Pre-Order', slug: 'pre-order' };

// ── Finders ──────────────────────────────────────────────────────────────────

export async function findPreOrder() {
  return await prisma.categoryItem.findFirst({
    where: { title: ITEM_PRE_ORDER.title, slug: ITEM_PRE_ORDER.slug },
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
