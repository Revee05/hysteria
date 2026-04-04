const DUMMY_THUMB = "/gambar%20card%20detail.png";

function makeFallbackData({ slug, q, page }) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const queryTag = q?.trim() ? ` · hasil untuk "${q.trim()}"` : "";

  return {
    title: "Hysteria Berkelana",
    subtitle:
      "Perayaan seni, budaya, dan kehidupan kampung melalui kerja kolektif warga dan seniman.",
    posts: Array.from({ length: 10 }, (_, i) => ({
      id: `${safePage}-${i + 1}`,
      thumbnailUrl: DUMMY_THUMB,
      alt: `${slug} Post ${i + 1}${queryTag}`,
    })),
    totalPages: 5,
  };
}

function normalizeProgramDetailResponse(payload, fallback) {
  if (!payload || typeof payload !== "object") return fallback;

  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title
      : fallback.title;

  const subtitle =
    typeof payload.subtitle === "string" && payload.subtitle.trim()
      ? payload.subtitle
      : fallback.subtitle;

  const totalPages =
    typeof payload.totalPages === "number" && payload.totalPages > 0
      ? payload.totalPages
      : fallback.totalPages;

  const rawPosts = Array.isArray(payload.posts)
    ? payload.posts
    : Array.isArray(payload.items)
      ? payload.items
      : [];

  const posts = rawPosts.length
    ? rawPosts.map((item, index) => ({
        id: String(item?.id ?? `${index + 1}`),
        thumbnailUrl:
          item?.thumbnailUrl || item?.thumbnail || item?.image || DUMMY_THUMB,
        alt: item?.alt || item?.caption || `Post ${index + 1}`,
      }))
    : fallback.posts;

  return {
    title,
    subtitle,
    posts,
    totalPages,
  };
}

function makeFallbackPostDetailData({ id }) {
  return {
    title: "Hysteria Berkelana",
    subtitle:
      "Perayaan seni, budaya, dan kehidupan kampung melalui kerja kolektif warga dan seniman.",
    post: {
      id: String(id),
      heading: "HYSTERIA BERKELANA: Edisi MAKANAN MANIS",
      title: "Hysteria Berkelana - Edisi Makanan Manis😊",
      thumbnailUrl: DUMMY_THUMB,
      shortText: "Makan-makan biar kenyang",
      paragraphs: [
        "Hola halo, Sobat Hysteria! Kali ini, Hysteria Berkelana jalan-jalan ke tengah kota sambil makan yang manis-manis. Ada pisang goreng viral nih, di Jl. Melati Selatan, Brumbungan, kec. Semarang Tengah.",
        "⭐ 9/10 — gas cobain! Yumm yumm😁",
        "Hysteria Berkelana adalah salah satu segmen di @grobakhysteria yang menghadirkan review singkat seputar tempat dan kuliner di Kota Semarang. Mulai dari warung kaki lima, UMKM lokal, sampai spot unik yang punya ciri khasnya sendiri.",
      ],
      tags: [
        "#kulinersemarang",
        "#pisanggoreng",
        "#gorenganbesek",
        "#viral",
        "#makanansemarang",
      ],
      instagramUrl: "https://www.instagram.com/",
    },
    otherReviews: Array.from({ length: 5 }, (_, i) => ({
      id: `other-${i + 1}`,
      thumbnailUrl: DUMMY_THUMB,
      alt: `Review ${i + 1}`,
    })),
  };
}

function normalizeParagraphs(value, fallbackParagraphs = []) {
  if (!Array.isArray(value)) return fallbackParagraphs;

  const paragraphs = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return paragraphs.length ? paragraphs : fallbackParagraphs;
}

function normalizeTags(value, fallbackTags = []) {
  if (!Array.isArray(value)) return fallbackTags;

  const tags = value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        return String(item.name || item.label || item.tag || "").trim();
      }
      return "";
    })
    .filter(Boolean);

  return tags.length ? tags : fallbackTags;
}

function normalizeOtherReviews(value, fallbackItems = []) {
  if (!Array.isArray(value) || !value.length) return fallbackItems;

  return value.map((item, index) => ({
    id: String(item?.id ?? `other-${index + 1}`),
    thumbnailUrl:
      item?.thumbnailUrl || item?.thumbnail || item?.image || DUMMY_THUMB,
    alt: item?.alt || item?.caption || `Review ${index + 1}`,
  }));
}

function normalizeProgramPostDetailResponse(payload, fallback) {
  if (!payload || typeof payload !== "object") return fallback;

  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title
      : typeof payload.programTitle === "string" && payload.programTitle.trim()
        ? payload.programTitle
        : fallback.title;

  const subtitle =
    typeof payload.subtitle === "string" && payload.subtitle.trim()
      ? payload.subtitle
      : typeof payload.programSubtitle === "string" && payload.programSubtitle.trim()
        ? payload.programSubtitle
        : fallback.subtitle;

  const rawPost =
    payload.post && typeof payload.post === "object"
      ? payload.post
      : payload.data && typeof payload.data === "object"
        ? payload.data
        : payload;

  const post = {
    id: String(rawPost?.id ?? fallback.post.id),
    heading: rawPost?.heading || rawPost?.category || fallback.post.heading,
    title: rawPost?.title || fallback.post.title,
    thumbnailUrl:
      rawPost?.thumbnailUrl || rawPost?.thumbnail || rawPost?.image || fallback.post.thumbnailUrl,
    shortText: rawPost?.shortText || rawPost?.excerpt || fallback.post.shortText,
    paragraphs: normalizeParagraphs(rawPost?.paragraphs, fallback.post.paragraphs),
    tags: normalizeTags(rawPost?.tags, fallback.post.tags),
    instagramUrl:
      rawPost?.instagramUrl || rawPost?.url || rawPost?.link || fallback.post.instagramUrl,
  };

  const otherReviews = normalizeOtherReviews(
    payload.otherReviews || payload.relatedPosts || payload.items,
    fallback.otherReviews,
  );

  return {
    title,
    subtitle,
    post,
    otherReviews,
  };
}

export async function getProgramDetailData({ slug, q = "", page = 1 }) {
  const fallback = makeFallbackData({ slug, q, page });

  const apiBaseUrl =
    process.env.PROGRAM_API_BASE_URL || process.env.NEXT_PUBLIC_PROGRAM_API_BASE_URL;

  if (!apiBaseUrl) return fallback;

  const url = new URL("/program-detail", apiBaseUrl);
  url.searchParams.set("slug", slug);
  if (q?.trim()) url.searchParams.set("q", q.trim());
  url.searchParams.set("page", String(page));

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) return fallback;

    const payload = await res.json();
    return normalizeProgramDetailResponse(payload, fallback);
  } catch {
    return fallback;
  }
}

export async function getProgramPostDetailData({ slug, id }) {
  const fallback = makeFallbackPostDetailData({ id });

  const apiBaseUrl =
    process.env.PROGRAM_API_BASE_URL || process.env.NEXT_PUBLIC_PROGRAM_API_BASE_URL;

  if (!apiBaseUrl) return fallback;

  const url = new URL("/program-detail/post", apiBaseUrl);
  url.searchParams.set("slug", slug);
  url.searchParams.set("id", String(id));

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) return fallback;

    const payload = await res.json();
    return normalizeProgramPostDetailResponse(payload, fallback);
  } catch {
    return fallback;
  }
}
