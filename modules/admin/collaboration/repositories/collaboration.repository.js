import { prisma } from "@/lib/prisma";

const PAGE_KEY = "kolaborasi";

export async function findCollaborationContent() {
  const result = await prisma.collaborationContent.findUnique({
    where: {
      pageKey: PAGE_KEY,
    },
  });

  return result || null;
}

export async function upsertCollaborationContent(payload) {
  const data = {
    googleFormUrl: payload.googleFormUrl,
    whatsappNumber: payload.whatsappNumber,
    whatsappMessage: payload.whatsappMessage,
    heroSubHeadline: payload.heroSubHeadline || "",
    heroNotes: payload.heroNotes || "",
    whyBenefits: payload.whyBenefits || [],
    schemes: payload.schemes || [],
    flowSteps: payload.flowSteps || [],
  };

  const result = await prisma.collaborationContent.upsert({
    where: {
      pageKey: PAGE_KEY,
    },
    create: {
      pageKey: PAGE_KEY,
      ...data,
    },
    update: data,
  });

  return result || null;
}
