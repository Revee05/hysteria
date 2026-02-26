import { prisma } from "../../../../lib/prisma.js";

export async function findSejarahItems({ isActive = null } = {}) {
  const where = isActive === null ? {} : { isActive };
  return prisma.tentangSejarahItem.findMany({
    where,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

export async function findSejarahItemById(id) {
  return prisma.tentangSejarahItem.findUnique({
    where: { id },
  });
}

export async function findMaxSejarahOrder() {
  const result = await prisma.tentangSejarahItem.aggregate({
    _max: { order: true },
  });
  return Number.isFinite(result?._max?.order) ? result._max.order : -1;
}

export async function createSejarahItem(data) {
  return prisma.tentangSejarahItem.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl || null,
      order: data.order ?? 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

export async function updateSejarahItem(id, data) {
  return prisma.tentangSejarahItem.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function deleteSejarahItem(id) {
  return prisma.tentangSejarahItem.delete({
    where: { id },
  });
}

export async function updateSejarahOrders(items) {
  const updates = items.map((item) =>
    prisma.tentangSejarahItem.update({
      where: { id: item.id },
      data: { order: item.order },
    }),
  );
  return prisma.$transaction(updates);
}
