import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  // data total konten
  const [
    totalArticles,
    totalEvents,
    totalMedia,
    totalPrograms,
    totalPlatformContents,
    recentArticles,
    recentEvents,
  ] = await Promise.all([
    prisma.article.count({ where: { isDeleted: false } }),
    prisma.event.count(),
    prisma.articleMedia.count(),

    prisma.program.count({
      where: { isPublished: true },
    }),

    prisma.platformContent.count({
      where: { isActive: true },
    }),

    // data recent articles, show 5 datas
    prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        authorName: true,
      },
    }),

    // data recent events, show 5 datas
    prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        startAt: true,
        isPublished: true,
      },
    }),
  ]);

  return {
    totalContent:
      totalArticles + totalEvents + totalMedia + totalPlatformContents,

    totalArticles,
    totalEvents,
    totalMedia,

    totalPrograms,
    totalPlatformContents,

    recentArticles,
    recentEvents,
  };
}

export async function getDashboardAnalytics(range = "weekly") {
  const now = new Date();
  let startDate = new Date();

  const statsMap = {};
  let formatKey; // date or hour

  if (range === "weekly") {
    startDate.setDate(now.getDate() - 7);
    formatKey = (d) => d.toISOString().split("T")[0];
    // Initialize 7 days
    for (let i = 0; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = d.toISOString().split("T")[0];
      statsMap[label] = {
        label,
        article: 0,
        event: 0,
        platform: 0,
        rawDate: d,
      };
    }
  } else if (range === "monthly") {
    startDate.setMonth(now.getMonth() - 1);
    formatKey = (d) => d.toISOString().split("T")[0];
    // Initialize 30 days
    for (let i = 0; i <= 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = d.toISOString().split("T")[0];
      statsMap[label] = {
        label,
        article: 0,
        event: 0,
        platform: 0,
        rawDate: d,
      };
    }
  } else {
    startDate.setFullYear(now.getFullYear() - 1);
    formatKey = (d) => d.toISOString().slice(0, 7); // YYYY-MM
    // Initialize 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const label = d.toISOString().slice(0, 7);
      statsMap[label] = {
        label,
        article: 0,
        event: 0,
        platform: 0,
        rawDate: d,
      };
    }
  }

  // Fetch all together
  const [articles, events, platforms] = await Promise.all([
    prisma.article.findMany({
      where: { createdAt: { gte: startDate }, isDeleted: false },
      select: { createdAt: true, views: true },
    }),
    prisma.event.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, views: true },
    }),
    prisma.platformContent.findMany({
      where: { createdAt: { gte: startDate }, isActive: true },
      select: { createdAt: true, views: true },
    }),
  ]);

  const processData = (items, key) => {
    items.forEach((item) => {
      const label = formatKey(item.createdAt);
      if (statsMap[label]) {
        statsMap[label][key] += item.views || 0;
      }
    });
  };

  processData(articles, "article");
  processData(events, "event");
  processData(platforms, "platform");

  // Convert map to sorted array
  return Object.values(statsMap).sort((a, b) => a.rawDate - b.rawDate);
}
