import { prisma } from "../../../../lib/prisma.js";

export async function findPanduanVisualItems({ isActive = null } = {}) {
  const where = isActive === null ? {} : { isActive };
  return prisma.tentangPanduanVisual.findMany({
    where,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

export async function findPanduanVisualById(id) {
  return prisma.tentangPanduanVisual.findUnique({
    where: { id },
  });
}

export async function findMaxPanduanVisualOrder() {
  const result = await prisma.tentangPanduanVisual.aggregate({
    _max: { order: true },
  });
  return Number.isFinite(result?._max?.order) ? result._max.order : -1;
}

export async function createPanduanVisual(data) {
  return prisma.tentangPanduanVisual.create({
    data: {
      title: data.title,
      link: data.link || null,
      order: data.order ?? 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

export async function updatePanduanVisual(id, data) {
  return prisma.tentangPanduanVisual.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.link !== undefined && { link: data.link }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function deletePanduanVisual(id) {
  return prisma.tentangPanduanVisual.delete({
    where: { id },
  });
}

export async function updatePanduanVisualOrders(items) {
  const updates = items.map((item) =>
    prisma.tentangPanduanVisual.update({
      where: { id: item.id },
      data: { order: item.order },
    }),
  );
  return prisma.$transaction(updates);
}
