import { prisma } from "@/lib/prisma";

export function findAllEvents() {
  return prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      eventCategories: {
        include: {
          categoryItem: {
            select: { title: true },
          },
        },
      },
    },
  });
}

export function findEventById(id) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      eventCategories: {
        include: { categoryItem: true },
      },
      organizers: true,
      tags: {
        include: { tag: true },
      },
    },
  });
}

export function createEvent(data) {
  return prisma.event.create({
    data,
  });
}

export function updateEvent(id, data) {
  return prisma.event.update({
    where: { id },
    data,
  });
}

export function deleteEvent(id) {
  return prisma.event.delete({
    where: { id },
  });
}

export function deleteEventCategories(eventId) {
  return prisma.eventCategory.deleteMany({
    where: { eventId },
  });
}

export function createEventCategories(data) {
  return prisma.eventCategory.createMany({
    data,
  });
}

export function deleteEventOrganizers(eventId) {
  return prisma.eventOrganizer.deleteMany({
    where: { eventId },
  });
}

export function createEventOrganizers(data) {
  return prisma.eventOrganizer.createMany({
    data,
  });
}

export function deleteEventTags(eventId) {
  return prisma.eventTag.deleteMany({
    where: { eventId },
  });
}