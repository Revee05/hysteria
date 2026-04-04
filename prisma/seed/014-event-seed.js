const { Client } = require("pg");
const logger = require("../../lib/logger");

/**
 * 014-event-seed.js
 *
 * Seed data Event beserta relasi EventCategory, EventOrganizer, dan Tag.
 * - EventCategory  → CategoryItem dari nav tree program-hysteria (009)
 * - EventOrganizer → CategoryItem platform (hysteria-artlab, pekakota, dst.)
 * - Tag            → dibuat/dipakai ulang via upsert
 *
 * Harus dijalankan SETELAH 009-nav-category.js.
 */

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

const TAGS = [
  { name: "Seni",       slug: "seni" },
  { name: "Budaya",     slug: "budaya" },
  { name: "Musik",      slug: "musik" },
  { name: "Festival",   slug: "festival" },
  { name: "Diskusi",    slug: "diskusi" },
  { name: "Workshop",   slug: "workshop" },
  { name: "Film",       slug: "film" },
  { name: "Komunitas",  slug: "komunitas" },
  { name: "Podcast",    slug: "podcast" },
  { name: "Residensi",  slug: "residensi" },
];

/**
 * categoryItemSlugs  → slug CategoryItem untuk EventCategory
 * organizerSlugs     → slug CategoryItem platform untuk EventOrganizer
 * tagSlugs           → slug Tag
 */
const EVENTS = [
  {
    title: "Gebyuran Bustaman 2025",
    slug: "gebyuran-bustaman-2025",
    description:
      "Festival kampung tahunan di kawasan Bustaman yang merayakan tradisi dan ekspresi komunitas warga. Menampilkan pertunjukan seni, kuliner khas, dan pameran karya lokal.",
    poster: null,
    startAt: new Date("2025-08-10T09:00:00+07:00"),
    endAt: new Date("2025-08-12T21:00:00+07:00"),
    isFlexibleTime: false,
    location: "Kampung Bustaman, Semarang",
    mapsEmbedSrc: null,
    registerLink: null,
    driveLink: null,
    youtubeLink: "https://www.youtube.com/@hysteriaartlab",
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: true,
    categoryItemSlugs: ["gebyuran-bustaman", "festival-kampung"],
    organizerSlugs: ["hysteria-artlab", "pekakota"],
    tagSlugs: ["festival", "budaya", "komunitas"],
  },
  {
    title: "Zine Fest Semarang 2025",
    slug: "zine-fest-semarang-2025",
    description:
      "Pameran dan penjualan zine dari berbagai kolektif dan individu kreatif di Semarang. Tersedia booth zine, sesi peluncuran publikasi, dan workshop pembuatan zine sederhana.",
    poster: null,
    startAt: new Date("2025-09-20T10:00:00+07:00"),
    endAt: new Date("2025-09-21T18:00:00+07:00"),
    isFlexibleTime: false,
    location: "Hysteria Artlab, Jl. Stonen No.29, Semarang",
    mapsEmbedSrc: null,
    registerLink: "https://forms.gle/zinefest2025",
    driveLink: null,
    youtubeLink: null,
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: true,
    categoryItemSlugs: ["zine-fest"],
    organizerSlugs: ["hysteria-artlab"],
    tagSlugs: ["seni", "komunitas"],
  },
  {
    title: "Temu Jejaring Komunitas Seni Semarang",
    slug: "temu-jejaring-komunitas-seni-semarang-2025",
    description:
      "Forum pertemuan antar komunitas seni dan budaya di Semarang untuk berbagi pengalaman, menjalin jaringan kolaborasi, dan mendiskusikan isu-isu seni kontemporer di kota.",
    poster: null,
    startAt: new Date("2025-10-05T13:00:00+07:00"),
    endAt: new Date("2025-10-05T17:00:00+07:00"),
    isFlexibleTime: false,
    location: "Hysteria Artlab, Jl. Stonen No.29, Semarang",
    mapsEmbedSrc: null,
    registerLink: "https://forms.gle/temujejaring2025",
    driveLink: null,
    youtubeLink: null,
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: true,
    categoryItemSlugs: ["temu-jejaring", "forum"],
    organizerSlugs: ["hysteria-artlab", "pekakota"],
    tagSlugs: ["diskusi", "komunitas", "budaya"],
  },
  {
    title: "SGRT Live Session #12",
    slug: "sgrt-live-session-12",
    description:
      "Seri pertunjukan musik langsung SGRT menghadirkan musisi-musisi lokal Semarang dalam format intimate. Malam penuh improvisasi dan ekspresi suara.",
    poster: null,
    startAt: new Date("2025-11-15T19:00:00+07:00"),
    endAt: new Date("2025-11-15T23:00:00+07:00"),
    isFlexibleTime: false,
    location: "Hysteria Artlab, Jl. Stonen No.29, Semarang",
    mapsEmbedSrc: null,
    registerLink: null,
    driveLink: null,
    youtubeLink: "https://www.youtube.com/@hysteriaartlab",
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: true,
    categoryItemSlugs: ["sgrt", "music"],
    organizerSlugs: ["hysteria-artlab"],
    tagSlugs: ["musik", "seni"],
  },
  {
    title: "Flash Residency: Seni Komunitas",
    slug: "flash-residency-seni-komunitas-2025",
    description:
      "Program residensi singkat berdurasi dua minggu bagi seniman muda untuk mengeksplorasi dan berkarya bersama komunitas lokal di Semarang.",
    poster: null,
    startAt: new Date("2025-11-01T00:00:00+07:00"),
    endAt: new Date("2025-11-14T23:59:00+07:00"),
    isFlexibleTime: true,
    location: "Semarang",
    mapsEmbedSrc: null,
    registerLink: "https://forms.gle/flashresidency2025",
    driveLink: null,
    youtubeLink: null,
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: true,
    categoryItemSlugs: ["flash-residency", "residensi-dan-workshop"],
    organizerSlugs: ["hysteria-artlab", "pekakota"],
    tagSlugs: ["residensi", "seni", "komunitas"],
  },
  {
    title: "Screening AM: Sinema Komunitas",
    slug: "screening-am-sinema-komunitas-2025",
    description:
      "Pemutaran film pendek dan dokumenter karya sineas komunitas Semarang. Diikuti sesi diskusi bersama pembuat film dan penonton.",
    poster: null,
    startAt: new Date("2025-12-06T18:30:00+07:00"),
    endAt: new Date("2025-12-06T22:00:00+07:00"),
    isFlexibleTime: false,
    location: "Hysteria Artlab, Jl. Stonen No.29, Semarang",
    mapsEmbedSrc: null,
    registerLink: null,
    driveLink: null,
    youtubeLink: null,
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: true,
    categoryItemSlugs: ["screening-am-film"],
    organizerSlugs: ["hysteria-artlab", "ditampart"],
    tagSlugs: ["film", "diskusi", "komunitas"],
  },
  {
    title: "Safari Memori: Rekam Rasa Kota",
    slug: "safari-memori-rekam-rasa-kota-2026",
    description:
      "Sesi podcast live mengajak warga berbagi memori dan cerita tentang sudut-sudut kota Semarang yang berkesan. Rekaman akan diterbitkan sebagai episode podcast.",
    poster: null,
    startAt: new Date("2026-02-07T14:00:00+07:00"),
    endAt: new Date("2026-02-07T17:00:00+07:00"),
    isFlexibleTime: false,
    location: "Hysteria Artlab, Jl. Stonen No.29, Semarang",
    mapsEmbedSrc: null,
    registerLink: "https://forms.gle/safarimemori2026",
    driveLink: null,
    youtubeLink: "https://www.youtube.com/@hysteriaartlab",
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: true,
    categoryItemSlugs: ["safari-memori", "podcast"],
    organizerSlugs: ["hysteria-artlab"],
    tagSlugs: ["podcast", "budaya", "komunitas"],
  },
  {
    title: "Semarang Writers Week 2026",
    slug: "semarang-writers-week-2026",
    description:
      "Pekan khusus untuk para penulis: workshop penulisan fiksi dan non-fiksi, peluncuran buku, pembacaan puisi, serta diskusi panel tentang ekosistem literasi kota.",
    poster: null,
    startAt: new Date("2026-03-16T09:00:00+07:00"),
    endAt: new Date("2026-03-22T21:00:00+07:00"),
    isFlexibleTime: false,
    location: "Beberapa lokasi di Semarang",
    mapsEmbedSrc: null,
    registerLink: "https://forms.gle/writersweek2026",
    driveLink: null,
    youtubeLink: "https://www.youtube.com/@hysteriaartlab",
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: false,
    categoryItemSlugs: ["semarang-writers-week", "festival-kota"],
    organizerSlugs: ["hysteria-artlab", "bukit-buku"],
    tagSlugs: ["diskusi", "budaya", "komunitas"],
  },
  {
    title: "Buah Tangan: Oleh-Oleh Pengetahuan",
    slug: "buah-tangan-oleh-oleh-pengetahuan-2026",
    description:
      "Sesi berbagi pasca-perjalanan: para anggota komunitas yang baru pulang dari residensi atau festival luar kota menceritakan ilmu dan pengalaman yang mereka bawa pulang.",
    poster: null,
    startAt: new Date("2026-04-11T13:00:00+07:00"),
    endAt: new Date("2026-04-11T17:00:00+07:00"),
    isFlexibleTime: false,
    location: "Hysteria Artlab, Jl. Stonen No.29, Semarang",
    mapsEmbedSrc: null,
    registerLink: null,
    driveLink: null,
    youtubeLink: null,
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: false,
    categoryItemSlugs: ["buah-tangan", "forum"],
    organizerSlugs: ["hysteria-artlab"],
    tagSlugs: ["diskusi", "komunitas"],
  },
  {
    title: "Folk Me Up Vol.5",
    slug: "folk-me-up-vol-5-2026",
    description:
      "Konser musik folk dan akustik menampilkan musisi Semarang dan tamu dari kota lain. Suasana outdoor yang hangat dengan kopi dan penampilan yang intim.",
    poster: null,
    startAt: new Date("2026-05-23T16:00:00+07:00"),
    endAt: new Date("2026-05-23T22:00:00+07:00"),
    isFlexibleTime: false,
    location: "Halaman Hysteria, Jl. Stonen No.29, Semarang",
    mapsEmbedSrc: null,
    registerLink: null,
    driveLink: null,
    youtubeLink: "https://www.youtube.com/@hysteriaartlab",
    instagramLink: "https://www.instagram.com/hysteria.id",
    drivebukuLink: null,
    isPublished: false,
    categoryItemSlugs: ["folk-me-up", "music"],
    organizerSlugs: ["hysteria-artlab"],
    tagSlugs: ["musik", "seni"],
  },
];

// ---------------------------------------------------------------------------
// HELPER
// ---------------------------------------------------------------------------

function toSlug(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 014-event-seed");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  logger.info("014: Seeding events...");

  try {
    await client.query("BEGIN");

    // ------------------------------------------------------------------
    // 1. Upsert Tags
    // ------------------------------------------------------------------
    const tagIdMap = {};
    for (const tag of TAGS) {
      const res = await client.query(
        `INSERT INTO "Tag" ("name", "slug")
         VALUES ($1, $2)
         ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
         RETURNING "id"`,
        [tag.name, tag.slug]
      );
      tagIdMap[tag.slug] = res.rows[0].id;
    }
    logger.info(`  ✔ Tags upserted (${TAGS.length})`);

    // ------------------------------------------------------------------
    // 2. Preload CategoryItem slug → id map untuk semua slug yang dipakai
    // ------------------------------------------------------------------
    const allCatSlugs = [
      ...new Set(
        EVENTS.flatMap((e) => [
          ...e.categoryItemSlugs,
          ...e.organizerSlugs,
        ])
      ),
    ];

    const catRows = await client.query(
      `SELECT "id", "slug" FROM "CategoryItem" WHERE "slug" = ANY($1::text[])`,
      [allCatSlugs]
    );
    const categoryItemIdMap = {};
    for (const row of catRows.rows) {
      categoryItemIdMap[row.slug] = row.id;
    }

    // Warn for missing slugs
    for (const slug of allCatSlugs) {
      if (!categoryItemIdMap[slug]) {
        logger.warn(`  ⚠ CategoryItem slug '${slug}' not found — relations will be skipped`);
      }
    }

    // ------------------------------------------------------------------
    // 3. Upsert Events + relations
    // ------------------------------------------------------------------
    let upsertedCount = 0;

    for (const ev of EVENTS) {
      // Upsert Event row
      const evRes = await client.query(
        `INSERT INTO "Event" (
           "title", "slug", "description", "poster",
           "startAt", "endAt", "isFlexibleTime",
           "location", "mapsEmbedSrc",
           "registerLink", "driveLink", "youtubeLink", "instagramLink", "drivebukuLink",
           "isPublished", "createdAt", "updatedAt"
         ) VALUES (
           $1,$2,$3,$4,
           $5,$6,$7,
           $8,$9,
           $10,$11,$12,$13,$14,
           $15, now(), now()
         )
         ON CONFLICT ("slug") DO UPDATE SET
           "title"          = EXCLUDED."title",
           "description"    = EXCLUDED."description",
           "startAt"        = EXCLUDED."startAt",
           "endAt"          = EXCLUDED."endAt",
           "isFlexibleTime" = EXCLUDED."isFlexibleTime",
           "location"       = EXCLUDED."location",
           "isPublished"    = EXCLUDED."isPublished",
           "updatedAt"      = now()
         RETURNING "id"`,
        [
          ev.title,
          ev.slug,
          ev.description,
          ev.poster,
          ev.startAt,
          ev.endAt,
          ev.isFlexibleTime,
          ev.location,
          ev.mapsEmbedSrc,
          ev.registerLink,
          ev.driveLink,
          ev.youtubeLink,
          ev.instagramLink,
          ev.drivebukuLink,
          ev.isPublished,
        ]
      );
      const eventId = evRes.rows[0].id;
      upsertedCount++;

      // EventCategory
      for (const catSlug of ev.categoryItemSlugs) {
        const catItemId = categoryItemIdMap[catSlug];
        if (!catItemId) continue;
        await client.query(
          `INSERT INTO "EventCategory" ("eventId", "categoryItemId", "isPrimary", "order")
           VALUES ($1, $2, $3, $4)
           ON CONFLICT ("eventId", "categoryItemId") DO NOTHING`,
          [eventId, catItemId, ev.categoryItemSlugs.indexOf(catSlug) === 0, ev.categoryItemSlugs.indexOf(catSlug)]
        );
      }

      // EventOrganizer
      for (const orgSlug of ev.organizerSlugs) {
        const orgId = categoryItemIdMap[orgSlug];
        if (!orgId) continue;
        await client.query(
          `INSERT INTO "EventOrganizer" ("eventId", "categoryItemId")
           VALUES ($1, $2)
           ON CONFLICT ("eventId", "categoryItemId") DO NOTHING`,
          [eventId, orgId]
        );
      }

      // EventTag
      for (const tagSlug of ev.tagSlugs) {
        const tagId = tagIdMap[tagSlug];
        if (!tagId) continue;
        await client.query(
          `INSERT INTO "EventTag" ("eventId", "tagId")
           VALUES ($1, $2)
           ON CONFLICT ("eventId", "tagId") DO NOTHING`,
          [eventId, tagId]
        );
      }

      logger.info(`  ✔ Event '${ev.title}' (id=${eventId})`);
    }

    await client.query("COMMIT");
    logger.info(`014: Event seed complete — ${upsertedCount} events upserted`);
  } catch (e) {
    await client.query("ROLLBACK");
    logger.error("014 seeder error:", { error: e.message, stack: e.stack });
    throw e;
  } finally {
    await client.end();
  }
};
