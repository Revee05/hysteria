/**
 * platform.event.content.repository.js
 *
 * Repository untuk query Event yang terkait dengan platform:
 *  - Ditampart  : filter via EventOrganizer → CategoryItem.slug
 *  - Artlab     : filter via EventCategory → CategoryItem.slug (workshop, screening-film, untuk-perhatian)
 *  - Laki Masak : filter via EventCategory → CategoryItem.slug (meramu)
 */
import { prisma } from "../../../../lib/prisma.js";
import { getEventStatus } from "../../../../lib/event-status.js";

// ─── Include standar untuk setiap event query ────────────────────────────────
const EVENT_INCLUDE = {
  eventCategories: {
    include: {
      categoryItem: { select: { id: true, title: true, slug: true } },
    },
    orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
  },
  organizers: {
    include: {
      categoryItem: { select: { id: true, title: true, slug: true } },
    },
  },
  tags: {
    include: { tag: { select: { id: true, name: true, slug: true } } },
  },
};

// ─── Helper: transform Prisma record → plain response object ─────────────────
function formatEvent(event) {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    poster: event.poster,
    description: event.description,
    startAt: event.startAt,
    endAt: event.endAt,
    location: event.location,
    isPublished: event.isPublished,
    status: getEventStatus(event.startAt, event.endAt),
    categories: (event.eventCategories ?? []).map((ec) => ({
      id: ec.categoryItem.id,
      title: ec.categoryItem.title,
      slug: ec.categoryItem.slug,
      isPrimary: ec.isPrimary,
    })),
    organizers: (event.organizers ?? []).map((o) => ({
      id: o.categoryItem.id,
      title: o.categoryItem.title,
      slug: o.categoryItem.slug,
    })),
    tags: (event.tags ?? []).map((t) => t.tag),
    // createdAt: event.createdAt,
    createdAt: event.createdAt,
    // updatedAt: event.updatedAt,
  };
}

// ─── Status → Prisma date conditions ─────────────────────────────────────────
function applyStatusFilter(where, status) {
  const now = new Date();
  if (status === "UPCOMING") {
    where.startAt = { gt: now };
  } else if (status === "ONGOING") {
    where.startAt = { lte: now };
    where.OR = [{ endAt: { gte: now } }, { endAt: null }];
  } else if (status === "FINISHED") {
    where.endAt = { lt: now };
  }
  return where;
}

/**
 * Ambil events berdasarkan organizer CategoryItem slug.
 * Digunakan untuk platform Ditampart.
 *
 * @param {string}  organizerSlug
 * @param {{ q?: string, status?: string, categorySlug?: string }} [filters]
 */
export async function findEventsByOrganizer(organizerSlug, filters = {}) {
  const { q, status, categorySlug, limit = 10, cursor } = filters;

  const where = {
    organizers: {
      some: { categoryItem: { slug: organizerSlug } },
    },
  };

  if (q) where.title = { contains: q, mode: "insensitive" };

  if (categorySlug) {
    where.eventCategories = {
      some: { categoryItem: { slug: categorySlug } },
    };
  }

  applyStatusFilter(where, status);

  const take = limit + 1;
  const events = await prisma.event.findMany({
    where,
    include: EVENT_INCLUDE,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const totalCount = await prisma.event.count({ where });
  const hasMore = events.length > limit;
  const items = hasMore ? events.slice(0, limit) : events;
  return {
    data: items.map(formatEvent),
    nextCursor: hasMore ? items[items.length - 1].id : null,
    totalCount,
  };
}

/**
 * Ambil events berdasarkan satu atau beberapa event category CategoryItem slug.
 * Digunakan untuk Artlab (workshop, screening-film, untuk-perhatian) dan Laki Masak (meramu).
 *
 * @param {string | string[]} categorySlug
 * @param {{ q?: string, status?: string }} [filters]
 */
export async function findEventsByCategory(categorySlug, filters = {}) {
  const { q, status, limit = 10, cursor } = filters;
  const slugs = Array.isArray(categorySlug) ? categorySlug : [categorySlug];

  const where = {
    eventCategories: {
      some: { categoryItem: { slug: { in: slugs } } },
    },
  };

  if (q) where.title = { contains: q, mode: "insensitive" };

  applyStatusFilter(where, status);

  const take = limit + 1;
  const events = await prisma.event.findMany({
    where,
    include: EVENT_INCLUDE,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const totalCount = await prisma.event.count({ where });
  const hasMore = events.length > limit;
  const items = hasMore ? events.slice(0, limit) : events;
  return {
    data: items.map(formatEvent),
    nextCursor: hasMore ? items[items.length - 1].id : null,
    totalCount,
  };
}
