import { prisma } from "../../../../lib/prisma";

export async function findEvents({ q, statusFilter, sort }) {
  const now = new Date();

  let where = {
    isPublished: true,
  };

  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }

  if (statusFilter === "upcoming") {
    where.startAt = { gt: now };
  }

  if (statusFilter === "ongoing") {
    where.AND = [
      { startAt: { lte: now } },
      {
        OR: [{ endAt: { gte: now } }, { endAt: null, startAt: { lte: now } }],
      },
    ];
  }

  if (statusFilter === "finished") {
    where.AND = [{ endAt: { not: null } }, { endAt: { lt: now } }];
  }

  let orderBy = { startAt: "desc" };

  if (sort === "oldest") {
    orderBy = { startAt: "asc" };
  }

  return prisma.event.findMany({
    where,
    orderBy,
    include: {
      eventCategories: {
        include: {
          categoryItem: true,
        },
      },
    },
  });
}

export async function findEventBySlug(slug) {
  return prisma.event.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      eventCategories: {
        include: {
          categoryItem: {
            include: { category: true },
          },
        },
      },
      organizers: {
        include: {
          categoryItem: {
            include: {
              parent: {
                include: {
                  parent: {
                    include: {
                      parent: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function findOtherEvents(slug) {
  return prisma.event.findMany({
    where: {
      isPublished: true,
      slug: { not: slug },
    },
  });
}

// repo untuk tampilan data carousle sorotan event di halaman home
export async function findLatestEvents(take = 10) {
  return prisma.event.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      eventCategories: {
        include: {
          categoryItem: true,
        },
      },
      organizers: {
        include: {
          categoryItem: true,
        },
      },
    },
    take,
  });
}

export async function incrementEventViews(slug) {
  return prisma.event.update({
    where: { slug },
    data: {
      views: {
        increment: 1,
      },
    },
  });
}

export async function findAllPublishedEvents() {
  return prisma.event.findMany({
    where: {
      isPublished: true,
    },
    include: {
      eventCategories: {
        include: {
          categoryItem: true,
        },
      },
      organizers: {
        include: {
          categoryItem: true,
        },
      },
    },
  });
}