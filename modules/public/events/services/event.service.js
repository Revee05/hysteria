import * as repository from "../repositories/event.repository";
import { mapEventStatus } from "../mappers/event.mapper";
import { prisma } from "@/lib/prisma";

export async function getAllEvents() {
  return repo.findAllEvents();
}

export async function getEvents({ q, status, sort }) {
  const events = await repository.findEvents({
    q,
    statusFilter: status,
    sort,
  });

  return events.map(mapEventStatus);
}

export async function getEventDetail(slug) {
  const event = await repository.findEventBySlug(slug);

  if (!event) {
    throw new Error("Event not found");
  }

  return mapEventStatus(event);
}

export async function getOtherEvents(slug) {
  const events = await repository.findOtherEvents(slug);

  const mapped = events.map(mapEventStatus);

  const ongoing = mapped.filter((e) => e.status === "ONGOING");
  const upcoming = mapped.filter((e) => e.status === "UPCOMING");
  const finished = mapped.filter((e) => e.status === "FINISHED");

  const sorted = [
    ...ongoing.sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
    ...upcoming.sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
    ...finished.sort((a, b) => new Date(b.startAt) - new Date(a.startAt)),
  ];

  return sorted.slice(0, 6); // limit sesuai kebutuhan
}

export async function getLatestEvents(take = 10) {
  const events = await repository.findLatestEvents(take);

  return events.map(mapEventStatus).map((e) => {
    // Determine primary category for badge
    const primaryCat =
      e.eventCategories.find((ec) => ec.isPrimary) || e.eventCategories[0];

    // Status mapping in Indonesian
    const statusLabels = {
      UPCOMING: "Akan Datang",
      ONGOING: "Sedang Berlangsung",
      FINISHED: "Telah Berakhir",
    };

    return {
      ...e,
      categoryTitle: primaryCat?.categoryItem?.title || "Event",
      statusLabel: statusLabels[e.status] || "Event",
    };
  });
}

// helper parsing
function parsePageProgram(config) {
  const slugHeros = config?.slugHeros ?? {};

  return {
    detailHero: {
      image:
        typeof slugHeros?.detail?.image === "string"
          ? slugHeros.detail.image
          : null,
      isBlur:
        typeof slugHeros?.detail?.isBlur === "boolean"
          ? slugHeros.detail.isBlur
          : false,
    },
  };
}

export async function getProgramPageConfig() {
  const config = await prisma.pageProgram.findUnique({
    where: { pageSlug: "program" },
  });

  if (!config) {
    return {
      detailHero: {
        image: null,
        isBlur: false,
      },
    };
  }
  return parsePageProgram(config);
}

export async function trackEventView(slug) {
  try {
    const result = await repository.incrementEventViews(slug);
    console.log(`[EVENT VIEW] Updated DB for ${slug}: new views = ${result.views}`);
    return result;
  } catch (error) {
    console.error(`[EVENT VIEW] Error incrementing views for event: ${slug}`, error);
    throw error;
  }
}

export async function getFeaturedEvents(take = 10) {
  const events = await repository.findAllPublishedEvents();

  const mapped = events.map(mapEventStatus);

  const sortNearest = (a, b) =>
    new Date(a.startAt) - new Date(b.startAt);

  const sortPopular = (a, b) =>
    (b.views || 0) - (a.views || 0);

  const TOP_N = 10; 

  // helper split
  const splitByTopN = (list, sortFn) => {
    const sorted = [...list].sort(sortPopular);

    const popular = sorted.slice(0, TOP_N);
    const rest = sorted.slice(TOP_N).sort(sortFn);

    return { popular, rest };
  };

  // group by status
  const ongoing = mapped.filter((e) => e.status === "ONGOING");
  const upcoming = mapped.filter((e) => e.status === "UPCOMING");
  const finished = mapped.filter((e) => e.status === "FINISHED");

  // split tiap group
  const ongoingSplit = splitByTopN(ongoing, sortNearest);
  const upcomingSplit = splitByTopN(upcoming, sortNearest);
  const finishedSplit = splitByTopN(finished, sortPopular);

  const combined = [
    ...ongoingSplit.popular,
    ...ongoingSplit.rest,

    ...upcomingSplit.popular,
    ...upcomingSplit.rest,

    ...finishedSplit.popular,
    ...finishedSplit.rest,
  ];

  return combined.slice(0, take).map((e) => {
    const primaryCat =
      e.eventCategories.find((ec) => ec.isPrimary) || e.eventCategories[0];

    const statusLabels = {
      UPCOMING: "Akan Datang",
      ONGOING: "Sedang Berlangsung",
      FINISHED: "Telah Berakhir",
    };

    return {
      ...e,
      categoryTitle: primaryCat?.categoryItem?.title || "Event",
      statusLabel: statusLabels[e.status] || "Event",
    };
  });
}