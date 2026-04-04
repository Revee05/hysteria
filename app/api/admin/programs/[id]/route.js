// app/api/admin/programs/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 👉 PERBAIKAN 1: Pakai jalur tol '@' biar nggak nyasar!
import slugify from "slugify";

// ==========================================
// METHOD GET: Ambil data 1 Program untuk di-Edit
// ==========================================
export async function GET(req, { params }) {
  try {
    const resolvedParams = await params; // 👉 PERBAIKAN 2: Await params ala Next.js 15
    const id = Number(resolvedParams.id);
    
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        programCategories: true,
        programOrganizers: true,
        programTags: { include: { tag: true } },
      },
    });

    if (!program) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(program, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data", details: error.message }, { status: 500 });
  }
}

// ==========================================
// METHOD PUT: Simpan Hasil Edit (Update)
// ==========================================
export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params; // 👉 PERBAIKAN 2: Await params ala Next.js 15
    const id = Number(resolvedParams.id);
    const body = await req.json();

    const {
      title, type, description, categoryItemIds = [], organizerItemIds = [],
      startAt, endAt, isFlexibleTime, location, registerLink, mapsEmbedSrc,
      poster, driveLink, youtubeLink, instagramLink, drivebukuLink, tagNames = [], isPublished,
    } = body;

    const validCategoryIds = categoryItemIds.map(Number).filter(n => !isNaN(n));
    const validOrganizerIds = organizerItemIds.map(Number).filter(n => !isNaN(n));

    // Cek slug biar nggak bentrok dengan judul lain
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slugCount = await prisma.program.count({
      where: { slug: { startsWith: baseSlug }, id: { not: id } },
    });
    const slug = slugCount > 0 ? `${baseSlug}-${slugCount + 1}` : baseSlug;

    // Pakai Transaction untuk hapus relasi lama & timpa dengan relasi baru
    const updatedProgram = await prisma.$transaction(async (tx) => {
      // 1. Bersihkan relasi lama
      await tx.programCategory.deleteMany({ where: { programId: id } });
      await tx.programOrganizer.deleteMany({ where: { programId: id } });
      await tx.programTag.deleteMany({ where: { programId: id } });

      // 2. Update Data Program Utama
      const prog = await tx.program.update({
        where: { id },
        data: {
          title, slug, description: description || "", type, poster,
          isPublished: Boolean(isPublished),
          startAt: startAt ? new Date(startAt) : null,
          endAt: endAt ? new Date(endAt) : null,
          isFlexibleTime: Boolean(isFlexibleTime),
          location, registerLink, mapsEmbedSrc, driveLink, youtubeLink, instagramLink, drivebukuLink,
          // Bikin relasi baru
          programCategories: {
            create: validCategoryIds.map((cid, idx) => ({ categoryItemId: cid, isPrimary: idx === 0, order: idx })),
          },
          programOrganizers: {
            create: validOrganizerIds.map(oid => ({ categoryItemId: oid })),
          },
        },
      });

      // 3. Update Tags
      for (const name of tagNames) {
        if (!name) continue;
        const tagSlug = slugify(name, { lower: true, strict: true });
        const tag = await tx.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name, slug: tagSlug },
        });
        await tx.programTag.create({
          data: { programId: id, tagId: tag.id },
        });
      }
      return prog;
    });

    return NextResponse.json(updatedProgram, { status: 200 });
  } catch (err) {
    console.error("PUT Error:", err);
    return NextResponse.json({ message: "Gagal update data", details: err.message }, { status: 500 });
  }
}

// ==========================================
// METHOD DELETE: Hapus Data Program
// ==========================================
export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params; // 👉 PERBAIKAN 2: Await params ala Next.js 15
    const id = Number(resolvedParams.id);
    await prisma.program.delete({ where: { id } });
    return NextResponse.json({ message: "Data berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus data", details: error.message }, { status: 500 });
  }
}