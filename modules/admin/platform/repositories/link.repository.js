// Repository untuk operasi database terkait "link merchandise" di platform admin.

import { prisma } from '@/lib/prisma.js';

const MERCH_TITLE = 'Merchandise';
const MERCH_SLUG = 'merchandise';

export async function findMerchItem() {
  return await prisma.categoryItem.findFirst({
    where: { title: MERCH_TITLE, slug: MERCH_SLUG },
    select: {
      id: true,
      categoryId: true,
      parentId: true,
      title: true,
      slug: true,
      url: true,
    }
  });
}

export async function findItemById(id) {
  return await prisma.categoryItem.findUnique({ where: { id } });
}

export async function updateMerchItem(id, data) {
  return await prisma.categoryItem.update({ where: { id }, data });
}
