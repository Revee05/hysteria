import { prisma } from "../../../../lib/prisma.js";

export async function findTentangVisiMisiBySlug(pageSlug = "tentang") {
  return prisma.tentangVisiMisi.findUnique({
    where: { pageSlug },
  });
}

export async function upsertTentangVisiMisiBySlug(pageSlug, data) {
  return prisma.tentangVisiMisi.upsert({
    where: { pageSlug },
    create: {
      pageSlug,
      description: data.description,
      visi: data.visi,
      misi: data.misi,
    },
    update: {
      ...(data.description !== undefined && { description: data.description }),
      ...(data.visi !== undefined && { visi: data.visi }),
      ...(data.misi !== undefined && { misi: data.misi }),
    },
  });
}
