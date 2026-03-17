const { Client } = require("pg");
const logger = require("../../lib/logger");

/**
 * 017-platform-events-seed.js â€” generated seed (20 events per category)
 *
 * Kategori:
 *   having-fun-artlab, peltoe  â†’ workshop (Hysteria Artlab)
 *   making-artist, usil        â†’ screening-film (Hysteria Artlab)
 *   untuk-perhatian            â†’ kategori langsung (Hysteria Artlab)
 *   event-ditampart            â†’ via EventOrganizer "ditampart"
 *   meramu                     â†’ via EventCategory "meramu" (Laki Masak)
 */

// â”€â”€â”€ Extra Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EXTRA_TAGS = [
  { name: "Keramik", slug: "keramik" },
  { name: "Kuliner", slug: "kuliner" },
  { name: "Visual",  slug: "visual"  },
];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const addWeeks = (base, n) => new Date(+base + n * 7 * 24 * 3600 * 1000);

/**
 * Hasilkan N event dari array topics.
 * Setiap entri topics â†’ 1 event dengan slug, date, poster otomatis.
 */
function gen({ label, slugPrefix, topics, categoryItemSlugs, organizerSlugs, tagSlugs,
               baseDate, intervalWeeks = 6, location, instagram, youtube = null,
               isFlexibleTime = false, durationHours = 3 }) {
  return topics.map((topic, i) => {
    const n       = i + 1;
    const startAt = addWeeks(baseDate, i * intervalWeeks);
    const endAt   = durationHours ? new Date(+startAt + durationHours * 3600 * 1000) : null;
    const slug    = `${slugPrefix}-${n}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    return {
      title: `${label} #${n} â€” ${topic}`,
      slug,
      description: `${label} edisi ke-${n}: ${topic}. Terbuka untuk umum, tidak perlu pengalaman sebelumnya.`,
      poster: `https://picsum.photos/seed/${slugPrefix}-${n}/800/600`,
      startAt,
      endAt,
      isFlexibleTime,
      location,
      mapsEmbedSrc: null,
      registerLink: null,
      driveLink: null,
      youtubeLink: youtube,
      instagramLink: instagram,
      drivebukuLink: null,
      isPublished: true,
      categoryItemSlugs,
      organizerSlugs,
      tagSlugs,
    };
  });
}

// â”€â”€â”€ Topic banks (20 per kategori) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const HFA_TOPICS = [
  "Melukis Bersama", "Zine Making", "Block Printing", "Kolase Urban",
  "Cat Air Dasar", "Sketsa Wajah", "Mural Mini", "Linocut",
  "Tipografi Tangan", "Risografi", "Eco Print", "Natural Dye",
  "Stiker Art", "Scrapbook", "Intaglio Dasar", "Cukil Kayu",
  "Monotype Press", "Kaligrafi Modern", "Ilustrasi Karakter", "Seni Kolektif",
];

const PELTOE_TOPICS = [
  "Pot Tanah Liat", "Cawan dan Wadah", "Permukaan dan Tekstur", "Piring Mini",
  "Vas Bunga", "Tempat Pensil", "Gantungan Kunci", "Ubin Dekoratif",
  "Sendok Keramik", "Penutup Stoples", "Cangkir Tanpa Pegangan", "Relief Dinding",
  "Mangkok Pinch", "Lamp Diffuser", "Bead Keramik", "Ornamen Gantung",
  "Wadah Bumbu", "Coil Building", "Slab Rolling", "Draping",
];

const MAKING_ARTIST_TOPICS = [
  "Lahirnya Sebuah Karya", "Ruang Berkarya", "Komunitas sebagai Kanvas",
  "Proses dan Hasil", "Seniman dan Kota", "Kolaborasi Lintas Medium",
  "Residensi dan Refleksi", "Arsip sebagai Seni", "Tubuh dan Ruang",
  "Suara yang Tertangkap", "Gambar Tanpa Judul", "Pameran Kecil",
  "Percakapan Studio", "Antara Sketsa dan Karya Jadi", "Keseharian yang Direkam",
  "Material Daur Ulang", "Identitas dan Ekspresi", "Warna dan Makna",
  "Seniman Muda Semarang", "Merawat Karya",
];

const USIL_TOPICS = [
  "Kamera di Pasar", "Malam di Simpang Lima", "Warung di Ujung Jalan",
  "Anak-Anak Gang Baru", "Suara Pagi Hari", "Langkah Kaki Pedestrian",
  "Lapak Pinggir Rel", "Pak RT dan Warganya", "Bus Kota Terakhir",
  "Kucing di Atap", "Lampu 17 Agustusan", "Tukang Cukur Tua",
  "Halaman Belakang", "Sore di Taman Bungkul", "Pasar Kaget Minggu",
  "Bapak-Bapak Ronda", "Becak Sekitar Lawang Sewu", "Gang Sempit",
  "Toko Kelontong", "Listrik dan Kehidupan",
];

const UNTUK_PERHATIAN_TOPICS = [
  "Tentang Jalan Kaki", "Suara yang Terlupa", "Warna Tembok Kota",
  "Bacaan Akhir Tahun", "Surat untuk Komunitas", "Penanda Jalan",
  "Iklan Tiang Listrik", "Tanaman di Jendela", "Nama-Nama Gang",
  "Peta yang Sudah Usang", "Poster yang Ditimpa Poster", "Ruang Tunggu",
  "Meja Makan Keluarga", "Cerita dari Pasar", "Barang yang Tidak Dibuang",
  "Foto Lama di Dinding", "Buku Tamu Pameran", "Catatan Pinggir",
  "Sepatu yang Ditinggal", "Percakapan di Warung Kopi",
];

const DITAMPART_TOPICS = [
  "Pameran Karya Digital", "Open Submission Zine Visual",
  "Workshop Desain Grafis", "Screening Film Dokumenter",
  "Peluncuran Zine Edisi Baru", "Diskusi Seni Digital",
  "Pameran Poster Kolektif", "Workshop Tipografi",
  "Residensi Desainer Muda", "Pameran Foto Dokumenter",
  "Workshop Ilustrasi Digital", "Peluncuran Merch Kolaborasi",
  "Ngobrol Bareng Desainer", "Workshop Motion Graphic",
  "Pameran 3D Render", "Screening Film Pendek",
  "Zine Tahunan Volume Baru", "Workshop Branding Personal",
  "Pameran Akhir Tahun", "Open Studio",
];

const MERAMU_TOPICS = [
  "Sambal Matah dari Bali", "Bumbu Kuning Serbaguna", "Kari Rempah Nusantara",
  "Minyak Bawang Goreng", "Kaldu Tulang Sapi", "Bawang Putih Confit",
  "Daun Salam dan Manfaatnya", "Serundeng Kelapa", "Kecap Manis Sendiri",
  "Rendang Bumbu Basah", "Soto Ayam Kuning", "Lodeh Sayur Campur",
  "Tempe Bacem Original", "Opor Putih Sederhana", "Pepes Ikan Mas",
  "Sayur Asem Bogor", "Garang Asem Ayam", "Rawon Hitam",
  "Gulai Kambing Kampung", "Nasi Liwet Solo",
];

// â”€â”€â”€ Konstanta lokasi & akun â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ARTLAB_LOC    = "Hysteria Artlab, Jl. Stonen No.29, Semarang";
const ARTLAB_IG     = "https://www.instagram.com/hysteria.artlab";
const ARTLAB_YT     = "https://www.youtube.com/@hysteriaartlab";
const DITAMPART_IG  = "https://www.instagram.com/hysteria.ditampart";
const LAKIMASAK_IG  = "https://www.instagram.com/hysteria.lakimasak";
const LAKIMASAK_YT  = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

// â”€â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EVENTS = [
  ...gen({
    label: "Having Fun Artlab", slugPrefix: "hfa", topics: HFA_TOPICS,
    categoryItemSlugs: ["having-fun-artlab", "workshop"],
    organizerSlugs: ["hysteria-artlab"], tagSlugs: ["seni", "workshop"],
    baseDate: new Date("2022-01-15T09:00:00+07:00"), intervalWeeks: 6,
    location: ARTLAB_LOC, instagram: ARTLAB_IG, durationHours: 3,
  }),
  ...gen({
    label: "Peltoe", slugPrefix: "peltoe", topics: PELTOE_TOPICS,
    categoryItemSlugs: ["peltoe", "workshop"],
    organizerSlugs: ["hysteria-artlab"], tagSlugs: ["seni", "workshop", "keramik"],
    baseDate: new Date("2022-02-12T10:00:00+07:00"), intervalWeeks: 6,
    location: ARTLAB_LOC, instagram: ARTLAB_IG, durationHours: 3,
  }),
  ...gen({
    label: "Making Artist", slugPrefix: "making-artist", topics: MAKING_ARTIST_TOPICS,
    categoryItemSlugs: ["making-artist", "screening-film"],
    organizerSlugs: ["hysteria-artlab"], tagSlugs: ["film", "seni", "komunitas"],
    baseDate: new Date("2022-02-05T18:30:00+07:00"), intervalWeeks: 6,
    location: ARTLAB_LOC, instagram: ARTLAB_IG, youtube: ARTLAB_YT, durationHours: 2.5,
  }),
  ...gen({
    label: "Usil", slugPrefix: "usil", topics: USIL_TOPICS,
    categoryItemSlugs: ["usil", "screening-film"],
    organizerSlugs: ["hysteria-artlab"], tagSlugs: ["film", "seni", "budaya"],
    baseDate: new Date("2022-01-22T18:30:00+07:00"), intervalWeeks: 6,
    location: ARTLAB_LOC, instagram: ARTLAB_IG, youtube: ARTLAB_YT, durationHours: 2,
  }),
  ...gen({
    label: "Untuk Perhatian", slugPrefix: "untuk-perhatian", topics: UNTUK_PERHATIAN_TOPICS,
    categoryItemSlugs: ["untuk-perhatian"],
    organizerSlugs: ["hysteria-artlab"], tagSlugs: ["seni", "budaya", "komunitas"],
    baseDate: new Date("2022-01-15T00:00:00+07:00"), intervalWeeks: 5,
    location: "Semarang", instagram: ARTLAB_IG, isFlexibleTime: true, durationHours: null,
  }),
  ...gen({
    label: "Event Ditampart", slugPrefix: "event-ditampart", topics: DITAMPART_TOPICS,
    categoryItemSlugs: ["event-ditampart"],
    organizerSlugs: ["ditampart"], tagSlugs: ["seni", "visual", "komunitas"],
    baseDate: new Date("2022-02-01T10:00:00+07:00"), intervalWeeks: 6,
    location: ARTLAB_LOC, instagram: DITAMPART_IG, durationHours: 4,
  }),
  ...gen({
    label: "Meramu", slugPrefix: "meramu", topics: MERAMU_TOPICS,
    categoryItemSlugs: ["meramu"],
    organizerSlugs: ["laki-masak"], tagSlugs: ["kuliner", "budaya"],
    baseDate: new Date("2022-02-10T00:00:00+07:00"), intervalWeeks: 5,
    location: "Dapur Laki Masak, Semarang", instagram: LAKIMASAK_IG, youtube: LAKIMASAK_YT,
    isFlexibleTime: true, durationHours: null,
  }),
];

// â”€â”€â”€ Runner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 017-platform-events-seed");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  console.log("ðŸŽ­ Seeding platform events (workshop, screening, meramu, etc)...");

  try {
    await client.query("BEGIN");

    // â”€â”€ 1. Upsert extra tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const tagIdMap = {};
    for (const tag of EXTRA_TAGS) {
      const res = await client.query(
        `INSERT INTO "Tag" ("name", "slug")
         VALUES ($1, $2)
         ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
         RETURNING "id"`,
        [tag.name, tag.slug]
      );
      tagIdMap[tag.slug] = res.rows[0].id;
    }
    // Load existing tags referenced by events
    const allTagSlugs = [...new Set(EVENTS.flatMap((e) => e.tagSlugs))];
    const existingTagRows = await client.query(
      `SELECT id, slug FROM "Tag" WHERE slug = ANY($1::text[])`,
      [allTagSlugs]
    );
    for (const row of existingTagRows.rows) {
      tagIdMap[row.slug] = row.id;
    }

    // â”€â”€ 2. Preload CategoryItem slug â†’ id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const allCatSlugs = [
      ...new Set(
        EVENTS.flatMap((e) => [...e.categoryItemSlugs, ...e.organizerSlugs])
      ),
    ];
    const catRows = await client.query(
      `SELECT id, slug FROM "CategoryItem" WHERE slug = ANY($1::text[])`,
      [allCatSlugs]
    );
    const catIdMap = {};
    for (const row of catRows.rows) {
      catIdMap[row.slug] = row.id;
    }
    for (const slug of allCatSlugs) {
      if (!catIdMap[slug]) {
        console.warn(`  âš  CategoryItem slug '${slug}' not found â€” relations will be skipped`);
      }
    }

    // â”€â”€ 3. Upsert events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let count = 0;
    for (const ev of EVENTS) {
      const evRes = await client.query(
        `INSERT INTO "Event" (
           title, slug, description, poster,
           "startAt", "endAt", "isFlexibleTime",
           location, "mapsEmbedSrc",
           "registerLink", "driveLink", "youtubeLink", "instagramLink", "drivebukuLink",
           "isPublished", "createdAt", "updatedAt"
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,now(),now()
         )
         ON CONFLICT (slug) DO UPDATE SET
           title          = EXCLUDED.title,
           description    = EXCLUDED.description,
           poster         = EXCLUDED.poster,
           "startAt"      = EXCLUDED."startAt",
           "endAt"        = EXCLUDED."endAt",
           "isFlexibleTime" = EXCLUDED."isFlexibleTime",
           location       = EXCLUDED.location,
           "isPublished"  = EXCLUDED."isPublished",
           "updatedAt"    = now()
         RETURNING id`,
        [
          ev.title, ev.slug, ev.description, ev.poster,
          ev.startAt, ev.endAt ?? null, ev.isFlexibleTime,
          ev.location, ev.mapsEmbedSrc,
          ev.registerLink, ev.driveLink, ev.youtubeLink, ev.instagramLink, ev.drivebukuLink,
          ev.isPublished,
        ]
      );
      const eventId = evRes.rows[0].id;
      count++;

      // EventCategory
      for (let i = 0; i < ev.categoryItemSlugs.length; i++) {
        const catId = catIdMap[ev.categoryItemSlugs[i]];
        if (!catId) continue;
        await client.query(
          `INSERT INTO "EventCategory" ("eventId", "categoryItemId", "isPrimary", "order")
           VALUES ($1,$2,$3,$4)
           ON CONFLICT ("eventId","categoryItemId") DO NOTHING`,
          [eventId, catId, i === 0, i]
        );
      }

      // EventOrganizer
      for (const orgSlug of ev.organizerSlugs) {
        const orgId = catIdMap[orgSlug];
        if (!orgId) continue;
        await client.query(
          `INSERT INTO "EventOrganizer" ("eventId","categoryItemId")
           VALUES ($1,$2)
           ON CONFLICT ("eventId","categoryItemId") DO NOTHING`,
          [eventId, orgId]
        );
      }

      // EventTag
      for (const tagSlug of ev.tagSlugs) {
        const tagId = tagIdMap[tagSlug];
        if (!tagId) continue;
        await client.query(
          `INSERT INTO "EventTag" ("eventId","tagId")
           VALUES ($1,$2)
           ON CONFLICT ("eventId","tagId") DO NOTHING`,
          [eventId, tagId]
        );
      }

      console.log(`  âœ“ ${ev.title}`);
    }

    await client.query("COMMIT");
    console.log(`\nâœ… Platform events seeded â€” ${count} events upserted!`);
  } catch (e) {
    await client.query("ROLLBACK");
    logger.error("017 seeder error:", { error: e.message, stack: e.stack });
    throw e;
  } finally {
    await client.end();
  }
};
