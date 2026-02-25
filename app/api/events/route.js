import { prisma } from "../../../lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "latest";

  const now = new Date();

  let where = {
    isPublished: true,
    title: { contains: q, mode: "insensitive" },
  };

  if (statusFilter === "upcoming") {
    where.startAt = { gt: now };
  } else if (statusFilter === "ongoing") {
    where.AND = [
      { startAt: { lte: now } },
      {
        OR: [
          { endAt: { gte: now } },
          { endAt: null, startAt: { lte: now } },
        ],
      },
    ];
  } else if (statusFilter === "finished") {
    // event selesai sebelum hari ini
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    where.OR = [
      { endAt: { lt: now } },
      { endAt: null, startAt: { lt: todayStart } },
    ];
  }

  // Sorting
  let orderBy = { startAt: "desc" };
  if (sort === "oldest" || sort === "nearest") orderBy = { startAt: "asc" };
  if (sort === "farthest") orderBy = { startAt: "desc" };

  const events = await prisma.event.findMany({
    where,
    orderBy,
    include: {
      categoryItem: { include: { category: true } },
    },
  });

  // Hitung status otomatis per event
  const eventsWithStatus = events.map((event) => {
    const startAt = new Date(event.startAt);
    const endAt = event.endAt
      ? new Date(event.endAt)
      : new Date(startAt.getTime() + 24 * 60 * 60 * 1000); // +1 hari jika endAt null

    let computedStatus = "DRAFT";
    if (now < startAt) computedStatus = "UPCOMING";
    else if (now >= startAt && now < endAt) computedStatus = "ONGOING";
    else computedStatus = "FINISHED";

    return { ...event, status: computedStatus };
  });

  return new Response(JSON.stringify(eventsWithStatus), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
