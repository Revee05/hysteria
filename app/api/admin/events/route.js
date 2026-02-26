import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { slugify } from "zod";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      organizer,
      categoryItemIds = [],
      startAt,
      endAt,
      location,
      address,
      registerLink,
      mapsEmbedSrc,
      poster,
      driveLink,
      youtubeLink,
      tags = [],
      isPublished,
    } = body;

    /* ================= VALIDASI ================= */
    const errors = {};

    if (!title) errors.title = "Judul event wajib diisi";

    if (
      !Array.isArray(categoryItemIds) ||
      categoryItemIds.length === 0
    ) {
      errors.categoryItemIds = "Minimal pilih 1 kategori";
    }

    if (!startAt) errors.startAt = "Tanggal mulai wajib diisi";

    if (!location) errors.location = "Lokasi wajib diisi";

    if (!poster) errors.poster = "Poster wajib diupload";

    // kalau ada error → return detail
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          message: "Validasi gagal",
          errors,
        },
        { status: 400 }
      );
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

    const slug =
      slugCount > 0 ? `${baseSlug}-${slugCount + 1}` : baseSlug;

    /* ================= CREATE EVENT ================= */
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        organizer,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        location,
        address,
        registerLink,
        mapsEmbedSrc,
        poster,
        driveLink,
        youtubeLink,
        isPublished: Boolean(isPublished),
        tags: Array.isArray(tags) ? tags : [],

        categories: {
          create: categoryItemIds.map((id, idx) => ({
            categoryItemId: Number(id), 
            isPrimary: idx === 0,
            order: idx,
          })),
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/events ERROR:", err);
    return NextResponse.json(
      { message: "Gagal membuat event" },
      { status: 500 }
    );
  }
}

/* ================= GET ================= */
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categories: {
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