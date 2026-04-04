import {
  getDashboardStats,
  getDashboardAnalytics,
} from "../repositories/dashboard.repository";

export async function getDashboardData(range = "weekly") {
  const [stats, analytics] = await Promise.all([
    getDashboardStats(),
    getDashboardAnalytics(range),
  ]);

  return {
    stats,
    analytics,
    recent: {
      articles: stats.recentArticles,
      events: stats.recentEvents,
    },
  };
}