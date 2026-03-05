import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi kecil untuk membuat slug URL otomatis dari Judul
// Contoh: "Bincang Seni" -> "bincang-seni-16789..."
const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
};

// ==========================================
// METHOD GET: Mengambil Semua Data Program
// ==========================================
export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
      // Kita ambil relasinya sekalian untuk dimunculkan di tabel nanti
      include: {
        programCategories: { include: { categoryItem: true } },
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
export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Ekstrak semua data yang dikirim dari Form Frontend
    const {
      title,
      type,
      description,
      startAt,
      endAt,
      isFlexibleTime,
      location,
      registerLink,
      mapsEmbedSrc,
      poster,
      isPublished,
      driveLink,
      youtubeLink,
      instagramLink,
      drivebukuLink,
      categoryItemIds,
      organizerItemIds,
      tagNames,
    } = body;

    // 2. Siapkan logika untuk Tag (Cari tag yang sudah ada, atau buat baru)
    const tagConnectOrCreate = (tagNames || []).map((name) => ({
      tag: {
        connectOrCreate: {
          where: { name },
          create: { name, slug: generateSlug(name) },
        },
      },
    }));

    // 3. Simpan seluruh data ke Database menggunakan Prisma
    const newProgram = await prisma.program.create({
      data: {
        title,
        slug: generateSlug(title),
        type,
        description,
        startAt,
        endAt,
        isFlexibleTime,
        location,
        registerLink,
        mapsEmbedSrc,
        poster,
        isPublished,
        driveLink,
        youtubeLink,
        instagramLink,
        drivebukuLink,

        // Relasi ke Sub Kategori (Menyimpan banyak ID kategori sekaligus)
        programCategories: {
          create: (categoryItemIds || []).map((id) => ({
            categoryItemId: id,
          })),
        },

        // Relasi ke Penyelenggara
        programOrganizers: {
          create: (organizerItemIds || []).map((id) => ({
            categoryItemId: id,
          })),
        },

        // Relasi ke Tag
        programTags: {
          create: tagConnectOrCreate,
        },
      },
    });

    // Kembalikan respons sukses ke Frontend
    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error("Penyebab Error Prisma POST:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan postingan ke database." },
      { status: 500 }
    );
  }
}