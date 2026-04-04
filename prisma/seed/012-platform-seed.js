const { Client } = require("pg");
const logger = require("../../lib/logger");

const PLATFORMS = [
  {
    slug: "hysteria-artlab",
    name: "Hysteria Artlab",
    headline: "Ruang Ekspresi Seni & Budaya",
    subHeadline: "Artlab adalah platform Hysteria yang mendedikasikan dirinya untuk eksplorasi seni, musik, film, dan workshop kreatif.",
    instagram: "https://www.instagram.com/hysteria.artlab",
    youtube: "https://www.youtube.com/@HysteriaArtlab",
    youtubeProfile: null,
    mainImageUrl: "https://picsum.photos/seed/artlab-main/1600/600",
    coverItems: [
      { key: "cover-1", label: "Cover Merchandise", title: "Merchandise Artlab", subtitle: "Temukan koleksi merchandise eksklusif Artlab.", imageUrl: "https://picsum.photos/seed/artlab-cover-1/1200/800", order: 1 },
      { key: "cover-2", label: "Cover Podcast Artlab", title: "Podcast Artlab", subtitle: "Obrolan mendalam seputar seni dan kreativitas.", imageUrl: "https://picsum.photos/seed/artlab-cover-2/1200/800", order: 2 },
      { key: "cover-3", label: "Cover Workshop Artlab", title: "Workshop Artlab", subtitle: "Belajar dan berkarya bersama di workshop kami.", imageUrl: "https://picsum.photos/seed/artlab-cover-3/1200/800", order: 3 },
      { key: "cover-4", label: "Cover Screening Film", title: "Screening Film", subtitle: "Nonton bareng film-film pilihan kuratorial Artlab.", imageUrl: "https://picsum.photos/seed/artlab-cover-4/1200/800", order: 4 },
      { key: "cover-5", label: "Cover Untuk Perhatian", title: "Untuk Perhatian", subtitle: "Pesan dan karya yang ingin kami sampaikan.", imageUrl: "https://picsum.photos/seed/artlab-cover-5/1200/800", order: 5 },
    ],
    heroItems: [
      { key: "hero-podcast-artlab", label: "Hero Page Podcast Artlab", title: "Podcast Artlab", subtitle: "Dengarkan percakapan seru seputar dunia seni.", imageUrl: "https://picsum.photos/seed/artlab-hero-1/1600/900", order: 1 },
      { key: "hero-stonen-radio", label: "Hero Page Stonen 29 Radio Show", title: "Stonen 29 Radio Show", subtitle: "Program radio yang menghadirkan musik dan cerita.", imageUrl: "https://picsum.photos/seed/artlab-hero-2/1600/900", order: 2 },
      { key: "hero-anitalk", label: "Hero Page Anitalk", title: "Anitalk", subtitle: "Diskusi dan wawancara bersama para seniman.", imageUrl: "https://picsum.photos/seed/artlab-hero-3/1600/900", order: 3 },
      { key: "hero-artist-radar", label: "Hero Page Artist Radar", title: "Artist Radar", subtitle: "Spotlight untuk seniman-seniman baru yang menarik perhatian.", imageUrl: "https://picsum.photos/seed/artlab-hero-4/1600/900", order: 4 },
      { key: "hero-workshop-artlab", label: "Hero Page Workshop Artlab", title: "Workshop Artlab", subtitle: "Ikuti workshop seni yang inspiratif bersama kami.", imageUrl: "https://picsum.photos/seed/artlab-hero-5/1600/900", order: 5 },
      { key: "hero-screening-film", label: "Hero Page Screening Film", title: "Screening Film", subtitle: "Pengalaman sinematik kuratif bersama komunitas.", imageUrl: "https://picsum.photos/seed/artlab-hero-6/1600/900", order: 6 },
      { key: "hero-untuk-perhatian", label: "Hero Page Untuk Perhatian", title: "Untuk Perhatian", subtitle: "Konten dan karya yang layak mendapat perhatianmu.", imageUrl: "https://picsum.photos/seed/artlab-hero-7/1600/900", order: 7 },
    ],
  },
  {
    slug: "ditampart",
    name: "Hysteria Ditampart",
    headline: "Visual Art & Digital Creativity",
    subHeadline: "Ditampart mengeksplorasi seni visual, desain grafis, 3D, dokumenter, dan berbagai karya digital dari komunitas Hysteria.",
    instagram: "https://www.instagram.com/hysteria.ditampart",
    youtube: null,
    youtubeProfile: null,
    mainImageUrl: null,
    mainImageItems: [
      { key: "main-1", label: "Gambar Utama 1", imageUrl: "https://picsum.photos/seed/ditampart1/800/900", order: 1 },
      { key: "main-2", label: "Gambar Utama 2", imageUrl: "https://picsum.photos/seed/ditampart2/800/900", order: 2 },
    ],
    coverItems: [
      { key: "cover-1", label: "Cover 3D", title: "Karya 3D", subtitle: "Eksplorasi dunia tiga dimensi bersama Ditampart.", imageUrl: "https://picsum.photos/seed/ditampart-cover-1/1200/800", order: 1 },
      { key: "cover-2", label: "Cover Foto Kegiatan", title: "Foto Kegiatan", subtitle: "Dokumentasi visual setiap kegiatan Ditampart.", imageUrl: "https://picsum.photos/seed/ditampart-cover-2/1200/800", order: 2 },
      { key: "cover-3", label: "Cover Mockup dan Poster", title: "Mockup & Poster", subtitle: "Karya desain grafis unggulan dari tim Ditampart.", imageUrl: "https://picsum.photos/seed/ditampart-cover-3/1200/800", order: 3 },
      { key: "cover-4", label: "Cover Short Film Dokumenter", title: "Short Film Dokumenter", subtitle: "Film dokumenter pendek dari berbagai sudut pandang.", imageUrl: "https://picsum.photos/seed/ditampart-cover-4/1200/800", order: 4 },
      { key: "cover-5", label: "Cover Event Ditampart", title: "Event Ditampart", subtitle: "Rangkaian event seni visual yang tak boleh dilewatkan.", imageUrl: "https://picsum.photos/seed/ditampart-cover-5/1200/800", order: 5 },
    ],
    heroItems: [
      { key: "hero-mockup-poster", label: "Hero Page Mock Up dan Poster", title: "Mockup & Poster", subtitle: "Karya desain terbaik dari komunitas Ditampart.", imageUrl: "https://picsum.photos/seed/ditampart-hero-1/1600/900", order: 1 },
      { key: "hero-event-ditampart", label: "Hero Page Event Ditampart", title: "Event Ditampart", subtitle: "Event seni visual yang menginspirasi.", imageUrl: "https://picsum.photos/seed/ditampart-hero-2/1600/900", order: 2 },
    ],
  },
  {
    slug: "laki-masak",
    name: "Hysteria Laki Masak",
    headline: "Masak adalah Seni, Seni adalah Hidup",
    subHeadline: "Laki Masak adalah platform kuliner Hysteria yang membahas resep, komik, dan cerita di balik dapur para laki-laki.",
    instagram: "https://www.instagram.com/hysteria.lakimasak",
    youtube: null,
    youtubeProfile: null,
    mainImageUrl: "https://picsum.photos/seed/laki-masak-main/1600/600",
    coverItems: [
      { key: "cover-1", label: "Cover Meramu", title: "Meramu", subtitle: "Panduan meramu bahan menjadi sajian istimewa.", imageUrl: "https://picsum.photos/seed/laki-cover-1/1200/800", order: 1 },
      { key: "cover-2", label: "Cover Homecooked", title: "Homecooked", subtitle: "Masakan rumahan yang hangat dan penuh cerita.", imageUrl: "https://picsum.photos/seed/laki-cover-2/1200/800", order: 2 },
      { key: "cover-3", label: "Cover Komik Ramuan", title: "Komik Ramuan", subtitle: "Komik seru tentang petualangan memasak.", imageUrl: "https://picsum.photos/seed/laki-cover-3/1200/800", order: 3 },
      { key: "cover-4", label: "Pre-Order", title: "Pre-Order", subtitle: "Dapatkan produk eksklusif Laki Masak lebih awal.", imageUrl: "https://picsum.photos/seed/laki-cover-4/1200/800", order: 4 },
    ],
    heroItems: [
      { key: "hero-meramu", label: "Hero Page Meramu", title: "Meramu", subtitle: "Resep dan teknik memasak untuk dikuasai.", imageUrl: "https://picsum.photos/seed/laki-hero-1/1600/900", order: 1 },
      { key: "hero-homecooked", label: "Hero Page Homecooked", title: "Homecooked", subtitle: "Cerita dan inspirasi masakan rumahan.", imageUrl: "https://picsum.photos/seed/laki-hero-2/1600/900", order: 2 },
      { key: "hero-komik-ramuan", label: "Hero Page Komik Ramuan", title: "Komik Ramuan", subtitle: "Komik yang menghadirkan dapur dengan cara unik.", imageUrl: "https://picsum.photos/seed/laki-hero-3/1600/900", order: 3 },
    ],
  },
];

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 012-platform-seed");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  console.log("🌐 Seeding platform data...");

  try {
    for (const platform of PLATFORMS) {
      const result = await client.query(
        `INSERT INTO "Platform" (slug, name, headline, "subHeadline", instagram, youtube, "youtubeProfile", "mainImageUrl", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           headline = EXCLUDED.headline,
           "subHeadline" = EXCLUDED."subHeadline",
           instagram = EXCLUDED.instagram,
           youtube = EXCLUDED.youtube,
           "youtubeProfile" = EXCLUDED."youtubeProfile",
           "mainImageUrl" = EXCLUDED."mainImageUrl"
         RETURNING id`,
        [platform.slug, platform.name, platform.headline ?? null, platform.subHeadline ?? null, platform.instagram ?? null, platform.youtube ?? null, platform.youtubeProfile ?? null, platform.mainImageUrl ?? null],
      );

      let platformId = result.rows[0]?.id;
      if (!platformId) {
        const existing = await client.query(`SELECT id FROM "Platform" WHERE slug = $1`, [platform.slug]);
        platformId = existing.rows[0].id;
      }

      console.log(`  ✓ Platform: ${platform.slug} (id=${platformId})`);

      for (const item of platform.coverItems) {
        await client.query(
          `INSERT INTO "PlatformImage" ("platformId", key, type, label, title, subtitle, "imageUrl", "order", "createdAt", "updatedAt")
           VALUES ($1, $2, 'cover', $3, $4, $5, $6, $7, NOW(), NOW())
           ON CONFLICT ("platformId", key) DO UPDATE SET
             label = EXCLUDED.label,
             title = EXCLUDED.title,
             subtitle = EXCLUDED.subtitle,
             "imageUrl" = EXCLUDED."imageUrl",
             "order" = EXCLUDED."order"`,
          [platformId, item.key, item.label, item.title ?? null, item.subtitle ?? null, item.imageUrl ?? null, item.order],
        );
        console.log(`    ✓ Cover: ${item.key}`);
      }

      for (const item of platform.heroItems) {
        await client.query(
          `INSERT INTO "PlatformImage" ("platformId", key, type, label, title, subtitle, "imageUrl", "order", "createdAt", "updatedAt")
           VALUES ($1, $2, 'hero', $3, $4, $5, $6, $7, NOW(), NOW())
           ON CONFLICT ("platformId", key) DO UPDATE SET
             label = EXCLUDED.label,
             title = EXCLUDED.title,
             subtitle = EXCLUDED.subtitle,
             "imageUrl" = EXCLUDED."imageUrl",
             "order" = EXCLUDED."order"`,
          [platformId, item.key, item.label, item.title ?? null, item.subtitle ?? null, item.imageUrl ?? null, item.order],
        );
        console.log(`    ✓ Hero: ${item.key}`);
      }

      for (const item of (platform.mainImageItems || [])) {
        await client.query(
          `INSERT INTO "PlatformImage" ("platformId", key, type, label, title, subtitle, "imageUrl", "order", "createdAt", "updatedAt")
           VALUES ($1, $2, 'main', $3, $4, $5, $6, $7, NOW(), NOW())
           ON CONFLICT ("platformId", key) DO UPDATE SET
             label = EXCLUDED.label,
             "imageUrl" = EXCLUDED."imageUrl",
             "order" = EXCLUDED."order"`,
          [platformId, item.key, item.label, null, null, item.imageUrl ?? null, item.order],
        );
        console.log(`    ✓ Main image: ${item.key}`);
      }
    }

    console.log("\n✅ Platform data seeded successfully!");
  } catch (error) {
    logger.error("Error seeding platform data:", error);
    throw error;
  } finally {
    await client.end();
  }
};
