import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import slugify from "slugify";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      organizer,
      categoryItemId,
      startAt,
      endAt,
      location,
      registerLink,
      mapsEmbedSrc,
      poster,
      driveLink,
      youtubeLink,
      isPublished,
    } = body;

    // VALIDASI WAJIB
    if (!title || !categoryItemId || !startAt || !location || !poster) {
      return NextResponse.json(
        { message: "Field wajib belum lengkap" }, 
        { status: 400 }
      );
    }

    // CEK KATEGORI
    const category = await prisma.categoryItem.findUnique({
      where: { id: Number(categoryItemId) },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Kategori tidak valid" },
        { status: 400 }
      );
    }

    // SLUG
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slugCount = await prisma.event.count(
      { where: { slug: { startsWith: baseSlug } },
    });

    const slug = slugCount > 0 ? `${baseSlug}-${slugCount + 1}` : baseSlug;

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        organizer,
        categoryItemId: Number(categoryItemId),
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null, 
        location,
        registerLink,
        mapsEmbedSrc,
        poster,
        driveLink,
        youtubeLink,
        isPublished: Boolean(isPublished),
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

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        categoryItem: {
          select: {
            title: true,
          },
        },
      },
    });

    // WALAU KOSONG → TETAP BALIK []
    return NextResponse.json(events, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/events ERROR:", err);

    return NextResponse.json(
      { message: "Gagal mengambil data event" },
      { status: 500 }
    );
  }
}