// app/api/admin/programs/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Pakai jalur '@' biar rapi
import slugify from "slugify";

// ==========================================
// METHOD GET: Mengambil Semua Data Program
// ==========================================
export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        programCategories: {
          include: { categoryItem: true },
        },
      },
    });
    return NextResponse.json(programs, { status: 200 });
  } catch (error) {
    console.error("Penyebab Error Prisma GET:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data program" },
      { status: 500 }
    );
  }
}

// ==========================================
// METHOD POST: Menyimpan Data Postingan Baru
// ==========================================
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      title, type = "UMUM", description, startAt, endAt, isFlexibleTime, location,
      registerLink, mapsEmbedSrc, poster, isPublished, driveLink,
      youtubeLink, instagramLink, drivebukuLink, categoryItemIds = [],
      organizerItemIds = [], tagNames = [],
    } = body;

    // 1. VALIDASI ID AGAR PASTI ANGKA (Mencegah error dari string)
    const validCategoryIds = categoryItemIds.map(Number).filter(n => !isNaN(n));
    const validOrganizerIds = organizerItemIds.map(Number).filter(n => !isNaN(n));

    // 2. BIKIN SLUG AMAN PAKAI SLUGIFY
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slugCount = await prisma.program.count({
      where: { slug: { startsWith: baseSlug } },
    });
    const slug = slugCount > 0 ? `${baseSlug}-${slugCount + 1}` : baseSlug;

    // 3. PROSES SIMPAN BERANTAI (TRANSACTION) BIAR ANTI GAGAL
    const newProgram = await prisma.$transaction(async (tx) => {
      // Bikin Program Utama & Sambungin Kategori
      const createdProgram = await tx.program.create({
        data: {
          title, slug, description: description || "", type, poster,
          isPublished: Boolean(isPublished),
          startAt: startAt ? new Date(startAt) : null,
          endAt: endAt ? new Date(endAt) : null,
          isFlexibleTime: Boolean(isFlexibleTime),
          location, registerLink, mapsEmbedSrc, driveLink, youtubeLink, instagramLink, drivebukuLink,
          
          programCategories: {
            create: validCategoryIds.map((id, idx) => ({ categoryItemId: id, isPrimary: idx === 0, order: idx })),
          },
          programOrganizers: {
            create: validOrganizerIds.map((id) => ({ categoryItemId: id })),
          },
        },
      });

      // Proses Tagging
      for (const name of tagNames) {
        if (!name) continue;
        const tagSlug = slugify(name, { lower: true, strict: true });
        
        const tag = await tx.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name, slug: tagSlug },
        });

        await tx.programTag.create({
          data: { programId: createdProgram.id, tagId: tag.id },
        });
      }

      return createdProgram;
    });

    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error("Penyebab Error Prisma POST:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data Program.", details: error.message },
      { status: 500 }
    );
  }
}