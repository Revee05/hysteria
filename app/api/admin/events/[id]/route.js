import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import slugify from "slugify";

/* =========================
   GET EVENT BY ID
========================= */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event ID" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventCategories: {
          include: {
            categoryItem: true,
          },
        },
        organizers: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("GET EVENT ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE EVENT
========================= */
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const eventId = Number(id);
    const body = await req.json();

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event ID" },
        { status: 400 }
      );
    }

    const data = {
      title           : body.title,
      description     : body.description,
      location        : body.location,
      registerLink    : body.registerLink,
      mapsEmbedSrc    : body.mapsEmbedSrc,
      poster          : body.poster || null,
      driveLink       : body.driveLink ?? null,
      youtubeLink     : body.youtubeLink ?? null,
      instagramLink   : body.instagramLink ?? null,
      drivebukuLink   : body.drivebukuLink ?? null,
      isPublished     :
        typeof body.isPublished === "boolean"
          ? body.isPublished
          : undefined,
      isFlexibleTime  :
        typeof body.isFlexibleTime === "boolean"
          ? body.isFlexibleTime
          : undefined,
    };

    if (body.startAt) data.startAt = new Date(body.startAt);
    if (body.endAt) data.endAt = new Date(body.endAt);

    if (Array.isArray(body.organizerItemIds)) {
      await prisma.eventOrganizer.deleteMany({
        where: { eventId },
      });

      await prisma.eventOrganizer.createMany({
        data: body.organizerItemIds.map((id) => ({
          eventId,
          categoryItemId: Number(id),
        })),
      });
    }

    if (Array.isArray(body.tagNames)) {
      await prisma.eventTag.deleteMany({
        where: { eventId },
      });

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

    const event = await prisma.event.update({
      where: { id: eventId },
      data,
    });

    /* ================= UPDATE KATEGORI ================= */
    if (Array.isArray(body.categoryItemIds)) {
      await prisma.eventCategory.deleteMany({
        where: { eventId },
      });

      await prisma.eventCategory.createMany({
        data: body.categoryItemIds.map((id, idx) => ({
          eventId,
          categoryItemId: Number(id),
          isPrimary: idx === 0,
          order: idx,
        })),
      });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    return NextResponse.json(
      { message: "Gagal mengupdate event" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE EVENT
========================= */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event ID" },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    return NextResponse.json(
      { message: "Gagal menghapus event" },
      { status: 500 }
    );
  }
}
