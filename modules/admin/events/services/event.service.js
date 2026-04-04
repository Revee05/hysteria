import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import * as repo from "../repositories/event.repository";
import Uploads from "@/lib/upload/uploads";

export async function getEvents() {
  return repo.findAllEvents();
}

export async function getEventById(id) {
  return repo.findEventById(id);
}

export async function deleteEvent(id) {
  const eventId = Number(id);
  const uploader = new Uploads();

  // ambil data dulu
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { poster: true },
  });

  // delete file
  try {
    if (event?.poster) {
      await uploader.deleteFile(event.poster);
    }
  } catch (err) {
    console.warn("Gagal hapus poster:", err.message);
  }

  return repo.deleteEvent(eventId);
}

/* CREATE */

export async function createEvent(body) {
  const baseSlug = slugify(body.title, { lower: true, strict: true });

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.event.findUnique({ where: { slug } })) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        startAt: new Date(body.startAt),
        endAt: body.endAt ? new Date(body.endAt) : null,
        location: body.location,
        registerLink: body.registerLink,
        mapsEmbedSrc: body.mapsEmbedSrc,
        poster: body.poster,
        driveLink: body.driveLink,
        youtubeLink: body.youtubeLink,
        instagramLink: body.instagramLink,
        drivebukuLink: body.drivebukuLink,
        youtubeLiveLink: body.youtubeLiveLink,
        instagramLiveLink: body.instagramLiveLink,
        tiktokLiveLink: body.tiktokLiveLink,
        isPublished: Boolean(body.isPublished),
        isFlexibleTime: Boolean(body.isFlexibleTime),

        eventCategories: {
          create: body.categoryItemIds.map((id, idx) => ({
            categoryItemId: Number(id),
            isPrimary: idx === 0,
            order: idx,
          })),
        },

        organizers: {
          create: body.organizerItemIds.map((id) => ({
            categoryItemId: Number(id),
          })),
        },
      },
    });

    if (Array.isArray(body.tagNames)) {
      const tagRecords = await Promise.all(
        body.tagNames.map(async (name) => {
          const slug = slugify(name, { lower: true, strict: true });

          return tx.tag.upsert({
            where: { slug },
            update: {},
            create: { name, slug },
          });
        })
      );

      await tx.eventTag.createMany({
        data: tagRecords.map((tag) => ({
          eventId: event.id,
          tagId: tag.id,
        })),
      });
    }
    return event;
  });
}

/* UPDATE */
export async function updateEvent(id, body) {
  const eventId = Number(id);
  const uploader = new Uploads();

  // ambil data lama
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
    select: { poster: true },
  });

  const data = {
    title: body.title,
    description: body.description,
    location: body.location,
    registerLink: body.registerLink,
    mapsEmbedSrc: body.mapsEmbedSrc,
    poster: body.poster || null,
    driveLink: body.driveLink ?? null,
    youtubeLink: body.youtubeLink ?? null,
    instagramLink: body.instagramLink ?? null,
    drivebukuLink: body.drivebukuLink ?? null,
    youtubeLiveLink: body.youtubeLiveLink ?? null,
    instagramLiveLink: body.instagramLiveLink ?? null,
    tiktokLiveLink: body.tiktokLiveLink ?? null,
    isPublished:
      typeof body.isPublished === "boolean"
        ? body.isPublished
        : undefined,
    isFlexibleTime:
      typeof body.isFlexibleTime === "boolean"
        ? body.isFlexibleTime
        : undefined,
  };

  if (body.startAt) data.startAt = new Date(body.startAt);
  data.endAt = body.endAt ? new Date(body.endAt) : null;

  // DELETE FILE LAMA (kalau diganti / dihapus)
  try {
    if (
      existingEvent?.poster &&
      existingEvent.poster !== body.poster
    ) {
      await uploader.deleteFile(existingEvent.poster);
    }
  } catch (err) {
    console.warn("Gagal hapus file lama:", err.message);
  }

  await repo.updateEvent(eventId, data);

  /* ORGANIZER */
  if (Array.isArray(body.organizerItemIds)) {
    await repo.deleteEventOrganizers(eventId);

    await repo.createEventOrganizers(
      body.organizerItemIds.map((id) => ({
        eventId,
        categoryItemId: Number(id),
      }))
    );
  }

  /* TAG */
  if (Array.isArray(body.tagNames)) {
    await repo.deleteEventTags(eventId);

    for (const name of body.tagNames) {
      const slug = slugify(name, { lower: true, strict: true });

      const tag = await prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });

      await prisma.eventTag.create({
        data: {
          eventId,
          tagId: tag.id,
        },
      });
    }
  }

  /* CATEGORY */
  if (Array.isArray(body.categoryItemIds)) {
    await repo.deleteEventCategories(eventId);

    await repo.createEventCategories(
      body.categoryItemIds.map((id, idx) => ({
        eventId,
        categoryItemId: Number(id),
        isPrimary: idx === 0,
        order: idx,
      }))
    );
  }
  return repo.findEventById(eventId);
}