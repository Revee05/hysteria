export function publishedArticleCondition() {
  const now = new Date();

  return {
    OR: [
      { status: "PUBLISHED" },
      {
        status: "SCHEDULED",
        publishedAt: {
          not: null,
          lte: now,
        },
      },
    ],
  };
}