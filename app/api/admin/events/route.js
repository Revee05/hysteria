import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import slugify from "slugify";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      categoryItemIds = [],
      organizerItemIds = [],
      startAt,
      endAt,
      location,
      registerLink,
      mapsEmbedSrc,
      poster,
      driveLink,
      youtubeLink,
      instagramLink,
      drivebukuLink,
      tagNames = [],
      isPublished,
    } = body;

    /* ================= VALIDASI ================= */
    const errors = {};

    if (!title) errors.title = "Judul event wajib diisi";
    if (!startAt) errors.startAt = "Tanggal mulai wajib diisi";
    if (!location) errors.location = "Lokasi wajib diisi";
    if (!poster) errors.poster = "Poster wajib diupload";
    if (!description) errors.description = "Deskripsi wajib diisi";
    if (
      !Array.isArray(categoryItemIds) ||
      categoryItemIds.length === 0
    ) {
      errors.categoryItemIds = "Minimal pilih 1 kategori";
    }
    if (!Array.isArray(organizerItemIds) || organizerItemIds.length === 0) {
      errors.organizerItemIds = "Minimal pilih 1 penyelenggara";
    }

    // kalau ada error → return detail
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ message: "Validasi gagal", errors }, { status: 400 });
    }

    /* ================= CEK KATEGORI ================= */
    const categoriesExist = await prisma.categoryItem.findMany({
      where: {
        id: { in: categoryItemIds.map(Number) },
      },
      select: { id: true },
    });

    if (categoriesExist.length !== categoryItemIds.length) {
      return NextResponse.json(
        { message: "Salah satu kategori tidak valid" },
        { status: 400 }
      );
    }

    /* ================= SLUG ================= */
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slugCount = await prisma.event.count({
      where: { slug: { startsWith: baseSlug } },
    });

    const slug = slugCount > 0 ? `${baseSlug}-${slugCount + 1}` : baseSlug;

    /* ================= CREATE EVENT ================= */
    const event = await prisma.$transaction(async (tx) => {
      const createdEvent  = await tx.event.create({
        data: {
          title,
          slug,
          description,
          startAt: new Date(startAt),
          endAt: endAt ? new Date(endAt) : null,
          location,
          registerLink,
          mapsEmbedSrc,
          poster,
          driveLink,
          youtubeLink,
          instagramLink,
          drivebukuLink,
          isPublished: Boolean(isPublished),
          
          eventCategories: {
            create: categoryItemIds.map((id, idx) => ({
              categoryItemId: Number(id), 
              isPrimary: idx === 0,
              order: idx,
            })),
          },

          organizers: {
            create: organizerItemIds.map((id) => ({
              categoryItemId: Number(id),
            })),
          },
        },
      });

      // ===== TAGS =====
      for (const name of tagNames) {
        const slug = slugify(name, { lower: true, strict: true });

        const tag = await tx.tag.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });

        await tx.eventTag.create({
          data: {
            eventId: createdEvent.id,
            tagId: tag.id,
          },
        });
      }
      return createdEvent;
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/events ERROR:", err);
    return NextResponse.json({ message: "Gagal membuat event" }, { status: 500 });
  }
}

/* ================= GET ================= */
export async function GET() {
  try {
    const events = await prisma.event.findMany({
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

    return NextResponse.json(events, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/events ERROR:", err);
    return NextResponse.json(
      { message: "Gagal mengambil data event" },
      { status: 500 }
    );
  }
}