const { Client } = require("pg");
const logger = require("../../lib/logger");

/**
 * 016-platform-content-seed.js
 *
 * Seed tabel PlatformContent (dan PlatformContentImage) dengan
 * data contoh untuk setiap platform dan kategorinya.
 *
 * Harus dijalankan SETELAH:
 *   - 009-nav-category.js  (CategoryItem)
 *   - 012-platform-seed.js (Platform)
 *   - 013-platform-categories-seed.js (PlatformCategory â€” opsional)
 *
 * Strategi upsert: skip jika sudah ada konten (categoryItemId + title + platformId).
 */

// â”€â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Cari CategoryItem.id berdasarkan slug.
 * @param {import('pg').Client} client
 * @param {string} slug
 * @param {string|null} parentSlug - Jika diisi, cari parent dulu lalu cari anak berdasarkan parentId
 */
async function findCategoryItem(client, slug, parentSlug = null) {
  if (parentSlug) {
    const parentRow = await client.query(
      `SELECT id FROM "CategoryItem" WHERE slug = $1 LIMIT 1`,
      [parentSlug]
    );
    const parentId = parentRow.rows[0]?.id;
    if (!parentId) {
      logger.warn(`  âš  CategoryItem parent '${parentSlug}' not found`);
      return null;
    }
    const row = await client.query(
      `SELECT id FROM "CategoryItem" WHERE slug = $1 AND "parentId" = $2 LIMIT 1`,
      [slug, parentId]
    );
    return row.rows[0]?.id ?? null;
  }

  const row = await client.query(
    `SELECT id FROM "CategoryItem" WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return row.rows[0]?.id ?? null;
}

async function findPlatform(client, slug) {
  const row = await client.query(
    `SELECT id FROM "Platform" WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return row.rows[0]?.id ?? null;
}

/**
 * Upsert satu PlatformContent record.
 * Conflict check: (platformId, categoryItemId, title).
 * Kembalikan id record (baru atau existing).
 */
async function upsertContent(client, platformId, categoryItemId, data) {
  const {
    title,
    url = null,
    instagram = null,
    youtube = null,
    prevdescription = null,
    description = null,
    host = null,
    guests = [],
    year = null,
    meta = null,
    tags = [],
    order = 0,
    isActive = true,
  } = data;

  const metaJson = meta !== null ? JSON.stringify(meta) : null;
  const guestsArr = Array.isArray(guests) ? guests : [];
  const tagsArr   = Array.isArray(tags)   ? tags   : [];

  // Check existing
  const existing = await client.query(
    `SELECT id FROM "PlatformContent"
     WHERE "platformId" = $1 AND "categoryItemId" = $2 AND title = $3
     LIMIT 1`,
    [platformId, categoryItemId, title]
  );

  if (existing.rows[0]?.id) {
    // Update
    await client.query(
      `UPDATE "PlatformContent"
       SET url = $1, instagram = $2, youtube = $3, "prevdescription" = $4,
           description = $5, host = $6, guests = $7, year = $8, meta = $9,
           tags = $10, "order" = $11, "isActive" = $12, "updatedAt" = NOW()
       WHERE id = $13`,
      [url, instagram, youtube, prevdescription, description, host,
       guestsArr, year, metaJson, tagsArr, order, isActive, existing.rows[0].id]
    );
    return existing.rows[0].id;
  }

  // Insert
  const inserted = await client.query(
    `INSERT INTO "PlatformContent"
       ("platformId", "categoryItemId", title, url, instagram, youtube,
        "prevdescription", description, host, guests, year, meta, tags,
        "order", "isActive", "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),NOW())
     RETURNING id`,
    [platformId, categoryItemId, title, url, instagram, youtube,
     prevdescription, description, host, guestsArr, year, metaJson,
     tagsArr, order, isActive]
  );
  return inserted.rows[0].id;
}

/**
 * Tambahkan gambar ke konten (hanya jika belum ada imageUrl yang sama).
 */
async function addImage(client, contentId, imageUrl, type = "thumbnail", alt = null, order = 0) {
  const existing = await client.query(
    `SELECT id FROM "PlatformContentImage"
     WHERE "contentId" = $1 AND "imageUrl" = $2 LIMIT 1`,
    [contentId, imageUrl]
  );
  if (existing.rows[0]) return;

  await client.query(
    `INSERT INTO "PlatformContentImage"
       ("contentId", "imageUrl", type, alt, "order", "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
    [contentId, imageUrl, type, alt, order]
  );
}

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// shared guest name pools
const GUESTS_M = ["Budi Santoso", "Fajar Nugroho", "Rizky Pratama", "Surya Hadi", "Rendra Saputra",
                  "Arief Budiman", "Taufik Rahman", "Wahyu Santoso", "Galih Prasetyo", "Doni Hartanto"];
const GUESTS_F = ["Rina Wijaya", "Dian Kusuma", "Maya Sari", "Tika Rahmawati", "Nia Kartika",
                  "Fitria Alam", "Sari Wijayanti", "Mega Putri", "Dini Ramadhani", "Rika Astuti"];

// ── Anitalk ───────────────────────────────────────────────────────────────────
const ANITALK_TOPICS = [
  "Seni Rupa di Ruang Publik",           "Musik Eksperimental dan Komunitas",
  "Kolaborasi Lintas Disiplin",          "Arsip dan Ingatan Kota",
  "Perempuan dalam Seni Pertunjukan",    "Zine dan Budaya Baca-Tulis Bawah Tanah",
  "Graffiti sebagai Bahasa Kota",        "Sound Art di Indonesia",
  "Desain dalam Komunitas Seni",         "Residensi Seniman: Manfaat dan Dilema",
  "Fotografi sebagai Catatan Kolektif",  "Lokakarya Kreatif untuk Semua",
  "Kurasi Mandiri di Ruang Alternatif",  "Seni Rupa dan Pasar Global",
  "Komunitas Tari Kontemporer",          "Seni Teknologi dan Koneksi Manusia",
  "Menulis sebagai Praktek Seni",        "Seniman dan Ruang Hidup",
  "Kolektif Seni di Era Digital",        "Masa Depan Seni Komunitas",
];

function genAnitalk(topics) {
  return topics.map((topic, i) => ({
    title: `Anitalk Ep.${i + 1} \u2014 ${topic}`,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    prevdescription: `Episode ${i + 1}: menyelami perspektif seniman dan praktisi soal ${topic.toLowerCase()}.`,
    host: "Anitalk",
    guests: [GUESTS_M[i % GUESTS_M.length], GUESTS_F[i % GUESTS_F.length]],
    meta: { cardType: "video" },
    order: i + 1,
  }));
}

// ── Artist Radar ──────────────────────────────────────────────────────────────
const ARTISTS = [
  { name: "Zaki Widi",        role: "Pelukis Abstrak",         tags: ["abstrak", "semarang", "pelukis"] },
  { name: "Indri Kuswarini",  role: "Seniman Performatif",     tags: ["performance art", "instalasi", "tubuh"] },
  { name: "Bagas Priambodo",  role: "Fotografer Dokumenter",   tags: ["fotografi", "dokumenter", "komunitas"] },
  { name: "Siti Nuraini",     role: "Musisi Lagu Rakyat",      tags: ["musik", "lagu rakyat", "tradisional"] },
  { name: "Hendro Purnomo",   role: "Sutradara Teater",        tags: ["teater", "tradisi", "sutradara"] },
  { name: "Laras Dewi",       role: "Ilustrator Botanika",     tags: ["ilustrasi", "botanika", "cetak"] },
  { name: "Rendra Saputra",   role: "Seniman Instalasi",       tags: ["instalasi", "ruang", "konseptual"] },
  { name: "Nia Kartika",      role: "Penulis Puisi",           tags: ["puisi", "sastra", "performatif"] },
  { name: "Doni Hartanto",    role: "Perupa Grafis",           tags: ["grafis", "desain", "urban"] },
  { name: "Fitria Alam",      role: "Koreografer Kontemporer", tags: ["tari", "koreografi", "contemporary"] },
  { name: "Arief Budiman",    role: "Musisi Elektronik",       tags: ["musik elektronik", "eksperimental", "sound"] },
  { name: "Sari Wijayanti",   role: "Seniman Keramik",         tags: ["keramik", "tanah liat", "craft"] },
  { name: "Taufik Rahman",    role: "Videografer Seni",        tags: ["video art", "film", "dokumenter"] },
  { name: "Mega Putri",       role: "Perupa Tekstil",          tags: ["tekstil", "tenun", "fiber art"] },
  { name: "Wahyu Santoso",    role: "Seniman Mural",           tags: ["mural", "street art", "kota"] },
  { name: "Dini Ramadhani",   role: "Pematung",                tags: ["patung", "sculptural", "material"] },
  { name: "Galih Prasetyo",   role: "Seniman Sound",           tags: ["sound art", "audio", "eksperimental"] },
  { name: "Rika Astuti",      role: "Pelukis Urban",           tags: ["lukisan", "urban", "figuratif"] },
  { name: "Bintang Kusuma",   role: "Penyair Visual",          tags: ["puisi visual", "tipografi", "teks"] },
  { name: "Alda Mahendra",    role: "Seniman Kolase",          tags: ["kolase", "mixed media", "arsip"] },
];

function genArtistRadar(artists) {
  return artists.map((a, i) => ({
    title: `${a.name} \u2014 ${a.role}`,
    instagram: `https://www.instagram.com/${a.name.toLowerCase().replace(/\s+/g, "")}`,
    youtube: i % 3 !== 0 ? `https://www.youtube.com/@${a.name.toLowerCase().replace(/\s+/g, "")}` : null,
    prevdescription: `${a.name} adalah ${a.role.toLowerCase()} yang aktif berkarya di lingkungan komunitas seni Indonesia.`,
    description: `Karya-karya ${a.name} mencerminkan komitmen mendalam terhadap praktik kreatif yang merespons konteks sosial dan budaya lokal.`,
    host: "Artlab",
    guests: [a.name],
    tags: a.tags,
    meta: { cardType: "artist" },
    order: i + 1,
    images: [{ url: `https://picsum.photos/seed/artist-radar-${i + 1}/800/600`, type: "thumbnail", alt: a.name }],
  }));
}

// ── Mockup dan Poster ─────────────────────────────────────────────────────────
const MOCKUP_TOPICS = [
  { title: "Poster Gebyuran Bustaman 2024",     prev: "Poster resmi untuk Festival Gebyuran Bustaman 2024.",              desc: "Desain terinspirasi motif batik Semarang dengan palet warna ceria." },
  { title: "Mockup Kaos Hysteria Artlab 2024",  prev: "Mockup kaos koleksi Artlab semester pertama 2024.",                desc: "Kaos dengan illustration karakter khas Artlab." },
  { title: "Poster Semarang Writers Week",      prev: "Visual utama festival literasi Semarang Writers Week.",            desc: "Tipografi bold dengan ilustrasi buku terbuka sebagai elemen utama." },
  { title: "Mockup Totebag Ditampart",          prev: "Totebag edisi terbatas cetak karya digital Ditampart.",            desc: "Kanvas dengan print artwork koleksi digital terbaru." },
  { title: "Infografis Laporan Tahunan 2023",   prev: "Visual ringkasan kegiatan Hysteria sepanjang 2023.",               desc: "Data visualisasi program, peserta, dan jangkauan komunitas." },
  { title: "Poster Residensi Seniman Artlab",   prev: "Poster undangan residensi seniman Artlab tahun ini.",              desc: "Desain minimalis dengan palet tanah dan elemen tipografi dinamis." },
  { title: "Mockup Buku Zine Komunitas",        prev: "Mockup zine kolektif edisi komunitas Semarang.",                   desc: "Tampilan spread dan cover zine A5 dengan visual editorial." },
  { title: "Poster Workshop Batik Urban",       prev: "Poster untuk seri workshop batik kontemporer.",                    desc: "Ilustrasi cap batik bergaya modern dengan warna-warna segar." },
  { title: "Mockup Stiker Pack Ditampart",      prev: "Stiker pack berisi 10 karakter ilustrasi Ditampart.",              desc: "Set stiker vinyl waterproof bergaris seni komik indie." },
  { title: "Poster Festival Film Pendek 2024",  prev: "Visual utama kompetisi dan pemutaran film pendek.",                desc: "Frame kamera sebagai elemen desain dengan latar gradasi sinematik." },
  { title: "Mockup Packaging Laki Masak",       prev: "Desain kemasan produk bumbu siap masak Laki Masak.",               desc: "Kemasan kraft paper dengan ilustrasi rempah gaya woodcut." },
  { title: "Poster Pameran Kolektif 2024",      prev: "Poster gelar pameran seni kolektif Artlab akhir tahun.",           desc: "Layout asimetris dengan foto karya terpilih dan tipografi ekspresif." },
  { title: "Mockup Kemeja Flannel Artlab",      prev: "Flannel edisi terbatas kolaborasi seniman lokal.",                 desc: "Mockup kemeja flannel dengan bordir logo dan patch tambahan." },
  { title: "Poster Diskusi Publik Seni #12",    prev: "Visual seri diskusi bulanan mengenai ekosistem seni.",             desc: "Desain dinamis dengan palet monokrom dan aksen merah." },
  { title: "Mockup Pin Set Communal Art",       prev: "Set pin metal bergambar karakter komunitas seni.",                 desc: "Koleksi 6 pin dengan ilustrasi simbol-simbol komunal Artlab." },
  { title: "Poster Konser Musik Eksperimental", prev: "Poster acara konser tahunan musik eksperimental Semarang.",        desc: "Visual sound wave dan tekstur analog sebagai elemen utama desain." },
  { title: "Mockup Kalender Seni 2025",         prev: "Kalender meja bergambar karya seniman Artlab 2025.",               desc: "12 halaman karya terpilih dengan grid kalender minimalis." },
  { title: "Poster Open Call Residensi 2025",   prev: "Undangan terbuka untuk program residensi seniman 2025.",           desc: "Layout bersih dengan hierarki informasi jelas dan visual ajakan." },
  { title: "Mockup Notebook Bergrafis",         prev: "Notebook bercover grafis hasil kolaborasi dengan ilustrator.",     desc: "Cover hard-board dengan blind emboss logo dan halaman bergaris seni." },
  { title: "Poster Penutupan Tahun Ditampart",  prev: "Visual perayaan penutupan tahun komunitas Ditampart.",             desc: "Ilustrasi pesta kolektif dengan palet jenuh dan komposisi ramai." },
];

function genMockup(items) {
  return items.map((item, i) => ({
    title: item.title,
    prevdescription: item.prev,
    description: item.desc,
    meta: { cardType: "mockup" },
    order: i + 1,
    images: [{ url: `https://picsum.photos/seed/mockup-${i + 1}/600/900`, type: "thumbnail", alt: item.title }],
  }));
}

// ── Homecooked ────────────────────────────────────────────────────────────────
const HOMECOOKED_TOPICS = [
  ["Nasi Goreng Versi Laki Masak",  "Agus Priyono"],   ["Soto Semarang Asli",          "Pak Darto"],
  ["Rendang Praktis Akhir Pekan",   "Roni Kusuma"],    ["Tumis Kangkung Istimewa",     "Eko Wahyudi"],
  ["Bakmi Jawa Kompor Kayu",        "Mbah Slamet"],    ["Gulai Kambing Bumbu Rempah",  "Yusuf Halim"],
  ["Ayam Panggang Bumbu Kecap",     "Dimas Prasetyo"], ["Tempe Bacem Ala Rumahan",     "Heri Santosa"],
  ["Rawon Hitam Surabaya",          "Pak Bambang"],    ["Gado-Gado Segar Tanpa Ribet", "Fikri Anwar"],
  ["Sate Ayam Bumbu Kacang",        "Agus Priyono"],   ["Ikan Bakar Sambal Matah",     "Roni Kusuma"],
  ["Opor Ayam Lebaran",             "Pak Darto"],      ["Tongseng Kambing Pedas",      "Yusuf Halim"],
  ["Lodeh Sayur Santan",            "Heri Santosa"],   ["Capcay Kuah Ala Laki Masak",  "Dimas Prasetyo"],
  ["Pecel Lele Bumbu Rempah",       "Eko Wahyudi"],    ["Sup Buntut Slow Cooker",      "Mbah Slamet"],
  ["Bibimbap Gaya Lokal",           "Fikri Anwar"],    ["Sambel Bawang Pedas Nendang", "Pak Bambang"],
];

function genHomecooked(topics) {
  return topics.map(([topic, guest], i) => ({
    title: `Homecooked Ep.${i + 1} \u2014 ${topic}`,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    prevdescription: `Episode ${i + 1}: ${topic} \u2014 masak jujur dari dapur rumahan.`,
    host: "Laki Masak",
    guests: [guest],
    meta: { cardType: "video" },
    order: i + 1,
    images: [{ url: `https://picsum.photos/seed/homecooked-${i + 1}/800/600`, type: "thumbnail", alt: `Homecooked Ep.${i + 1}` }],
  }));
}

// ── Komik Ramuan ──────────────────────────────────────────────────────────────
const KOMIK_TOPICS = [
  ["Bumbu Dasar",        2023], ["Minyak Kelapa",      2023], ["Api dan Kesabaran",  2024], ["Bumbu Impor",        2024],
  ["Dapur Terakhir",     2025], ["Bawang Merah Putih", 2023], ["Garam Laut",         2023], ["Cabai Merah Merona", 2024],
  ["Ketumbar Terbang",   2024], ["Daun Salam",         2025], ["Santan Pagi",        2023], ["Asam Jawa",          2023],
  ["Lengkuas Runcing",   2024], ["Kunyit Purba",       2024], ["Serai Wangi",        2025], ["Kencur Ajaib",       2023],
  ["Terasi Nelayan",     2024], ["Pandan Hijau",       2024], ["Laos Dalam Mimpi",   2025], ["Petai Kehormatan",   2025],
];

function genKomikRamuan(topics) {
  return topics.map(([topic, year], i) => ({
    title: `Komik Ramuan Vol.${i + 1} \u2014 ${topic}`,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    prevdescription: `Volume ${i + 1}: petualangan Aji berkelana menemukan makna dari ${topic.toLowerCase()}.`,
    year,
    meta: { cardType: "komik-ramuan" },
    order: i + 1,
    images: [{ url: `https://picsum.photos/seed/komik-${i + 1}/600/900`, type: "thumbnail", alt: `Komik Ramuan Vol.${i + 1}` }],
  }));
}

const SEED_DATA = [
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 HYSTERIA ARTLAB \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    platformSlug: "hysteria-artlab",
    categoryItemSlug: "merchandise",
    categoryParentSlug: "hysteria-artlab",
    items: [
      { title: "Merchandise Hysteria Artlab", url: "https://api.whatsapp.com/send/?phone=6285535235339", order: 1 },
    ],
  },
  {
    platformSlug: "hysteria-artlab",
    categoryItemSlug: "anitalk",
    categoryParentSlug: "podcast-artlab",
    items: genAnitalk(ANITALK_TOPICS),
  },
  {
    platformSlug: "hysteria-artlab",
    categoryItemSlug: "artist-radar",
    categoryParentSlug: "podcast-artlab",
    items: genArtistRadar(ARTISTS),
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 DITAMPART \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    platformSlug: "ditampart",
    categoryItemSlug: "3d",
    categoryParentSlug: "ditampart",
    items: [
      { title: "Karya 3D Ditampart", url: "https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz", order: 1 },
    ],
  },
  {
    platformSlug: "ditampart",
    categoryItemSlug: "foto-kegiatan",
    categoryParentSlug: "ditampart",
    items: [
      { title: "Foto Kegiatan Ditampart", url: "https://drive.google.com/drive/folders/1ZyXwVuTsRqPoNmLkJiHgFeDcBa", order: 1 },
    ],
  },
  {
    platformSlug: "ditampart",
    categoryItemSlug: "short-film-dokumenter",
    categoryParentSlug: "ditampart",
    items: [
      { title: "Short Film Dokumenter Ditampart", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", order: 1 },
    ],
  },
  {
    platformSlug: "ditampart",
    categoryItemSlug: "mockup-dan-poster",
    categoryParentSlug: "ditampart",
    items: genMockup(MOCKUP_TOPICS),
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 LAKI MASAK \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    platformSlug: "laki-masak",
    categoryItemSlug: "pre-order",
    categoryParentSlug: "laki-masak",
    items: [
      { title: "Pre-Order Produk Laki Masak", url: "https://api.whatsapp.com/send/?phone=6285535235339", order: 1 },
    ],
  },
  {
    platformSlug: "laki-masak",
    categoryItemSlug: "homecooked",
    categoryParentSlug: "laki-masak",
    items: genHomecooked(HOMECOOKED_TOPICS),
  },
  {
    platformSlug: "laki-masak",
    categoryItemSlug: "komik-ramuan",
    categoryParentSlug: "laki-masak",
    items: genKomikRamuan(KOMIK_TOPICS),
  },
];

// â”€â”€â”€ Runner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 016-platform-content-seed");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  console.log("ðŸ“ Seeding platform content...");

  try {
    for (const entry of SEED_DATA) {
      const platformId = await findPlatform(client, entry.platformSlug);
      if (!platformId) {
        console.warn(`  âš  Platform '${entry.platformSlug}' not found â€” skipping`);
        continue;
      }

      const categoryItemId = await findCategoryItem(
        client,
        entry.categoryItemSlug,
        entry.categoryParentSlug
      );
      if (!categoryItemId) {
        console.warn(`  âš  CategoryItem '${entry.categoryItemSlug}' (parent='${entry.categoryParentSlug}') not found â€” skipping`);
        continue;
      }

      console.log(`  Platform: ${entry.platformSlug} â†’ category: ${entry.categoryItemSlug}`);

      for (const item of entry.items) {
        const { images = [], ...contentData } = item;

        const contentId = await upsertContent(
          client,
          platformId,
          categoryItemId,
          contentData
        );

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          await addImage(client, contentId, img.url, img.type ?? "thumbnail", img.alt ?? null, i);
        }

        console.log(`    âœ“ ${item.title}`);
      }
    }

    console.log("\nâœ… Platform content seeded successfully!");
  } catch (error) {
    logger.error("Error seeding platform content:", error);
    throw error;
  } finally {
    await client.end();
  }
};
