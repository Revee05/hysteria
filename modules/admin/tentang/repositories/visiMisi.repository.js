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
      visi: data.visi,
      misi: data.misi,
    },
    update: {
      ...(data.visi !== undefined && { visi: data.visi }),
      ...(data.misi !== undefined && { misi: data.misi }),
    },
  });
}
