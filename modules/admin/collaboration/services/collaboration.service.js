import logger from "../../../../lib/logger.js";
import { AppError } from "../../../../lib/response.js";
import { findCollaborationContent, upsertCollaborationContent } from "../repositories/collaboration.repository.js";
import { validateCollaborationContentData } from "../validators/collaboration.validator.js";

const FALLBACK_CONTENT = {
  googleFormUrl: process.env.NEXT_PUBLIC_COLLABORATION_FORM_URL || "https://forms.gle/",
  whatsappNumber: "6281214272483",
  whatsappMessage: "Halo, saya tertarik untuk berkolaborasi dengan Hysteria",
  heroSubHeadline:
    "Kami membuka ruang kolaborasi bagi individu, komunitas, dan institusi yang ingin menciptakan program, event, dan inisiatif berdampak bersama.",
  heroNotes:
    "Kolaborasi bagi kami bukan sekadar kerja sama, melainkan proses saling belajar, berbagi peran, dan membangun dampak jangka panjang.",
  whyBenefits: [
    {
      title: "Pendekatan Kolaboratif yang Setara",
      subTitle: "Kolaborator diposisikan sebagai mitra, bukan sekadar pengisi program.",
      imageUrl: "",
    },
    {
      title: "Pengalaman Produksi dan Program",
      subTitle: "Berpengalaman mengelola ide hingga eksekusi program seni-budaya.",
      imageUrl: "",
    },
  ],
  schemes: [
    {
      title: "Kolaborasi Program dan Event",
      subTitle: "",
      imageUrl: "",
    },
    {
      title: "Kolaborasi Konten dan Publikasi",
      subTitle: "",
      imageUrl: "",
    },
  ],
  flowSteps: [
    {
      title: "1. Pengajuan ide/proposal",
      subTitle: "Mitra mengajukan ide atau program melalui form/kontak.",
      imageUrl: "",
    },
    {
      title: "2. Diskusi dan kurasi",
      subTitle: "Tim meninjau dan menyamakan visi kolaborasi.",
      imageUrl: "",
    },
  ],
};

function normalizeItems(items, fallbackItems) {
  if (!Array.isArray(items) || items.length === 0) return fallbackItems;
  return items.map((item) => ({
    title: item?.title || "",
    subTitle: item?.subTitle || "",
    imageUrl: item?.imageUrl || "",
  }));
}

function mapPublicData(content) {
  return {
    heroTitle: "Mari Berkolaborasi",
    heroDescription: content.heroSubHeadline,
    heroNotes: content.heroNotes,
    googleFormUrl: content.googleFormUrl,
    ctaDescription: "Isi formulir untuk mengajukan proposal kolaborasi dengan tim kami",
    whatsappNumber: content.whatsappNumber,
    whatsappMessage: content.whatsappMessage,
    whyBenefits: content.whyBenefits.map((item) => ({
      title: item.title,
      description: item.subTitle,
      imageUrl: item.imageUrl,
    })),
    schemes: content.schemes.map((item) => ({
      title: item.title,
      description: item.subTitle,
      imageUrl: item.imageUrl,
    })),
    flowSteps: content.flowSteps.map((item) => ({
      num: item.title,
      desc: item.subTitle,
      imageUrl: item.imageUrl,
    })),
  };
}

function buildContent(row) {
  const merged = {
    ...FALLBACK_CONTENT,
    ...(row || {}),
  };

  return {
    googleFormUrl: merged.googleFormUrl,
    whatsappNumber: merged.whatsappNumber,
    whatsappMessage: merged.whatsappMessage,
    heroSubHeadline: merged.heroSubHeadline || FALLBACK_CONTENT.heroSubHeadline,
    heroNotes: merged.heroNotes || FALLBACK_CONTENT.heroNotes,
    whyBenefits: normalizeItems(merged.whyBenefits, FALLBACK_CONTENT.whyBenefits),
    schemes: normalizeItems(merged.schemes, FALLBACK_CONTENT.schemes),
    flowSteps: normalizeItems(merged.flowSteps, FALLBACK_CONTENT.flowSteps),
  };
}

export async function getPublicCollaborationContent() {
  try {
    const row = await findCollaborationContent();
    const content = buildContent(row);
    return mapPublicData(content);
  } catch (error) {
    logger.error("Failed to fetch public collaboration content", { error: error?.message || error });
    return mapPublicData(buildContent(null));
  }
}

export async function getAdminCollaborationContent() {
  const row = await findCollaborationContent();
  return buildContent(row);
}

export async function upsertAdminCollaborationContent(data) {
  let validated;
  try {
    validated = validateCollaborationContentData(data || {});
  } catch (error) {
    logger.warn("Collaboration content validation failed", { error: error?.issues || error?.errors || error });
    throw new AppError(error?.issues?.[0]?.message || "Invalid collaboration content data", 400, "VALIDATION_ERROR");
  }

  try {
    return await upsertCollaborationContent(validated);
  } catch (error) {
    logger.error("Failed to save collaboration content", { error: error?.message || error });
    throw new AppError("Failed to save collaboration content", 500, "COLLABORATION_CONTENT_SAVE_FAILED");
  }
}
