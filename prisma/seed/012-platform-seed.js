const { Client } = require("pg");
const logger = require("../../lib/logger");

const PLATFORMS = [
  {
    slug: "artlab",
    name: "Hysteria Artlab",
    coverItems: [
      { key: "cover-1", label: "Cover Merchandise", order: 1 },
      { key: "cover-2", label: "Cover Podcast Artlab", order: 2 },
      { key: "cover-3", label: "Cover Workshop Artlab", order: 3 },
      { key: "cover-4", label: "Cover Screening Film", order: 4 },
      { key: "cover-5", label: "Cover Untuk Perhatian", order: 5 },
    ],
    heroItems: [
      { key: "hero-podcast-artlab", label: "Hero Page Podcast Artlab", order: 1 },
      { key: "hero-stonen-radio", label: "Hero Page Stonen 29 Radio Show", order: 2 },
      { key: "hero-anitalk", label: "Hero Page Anitalk", order: 3 },
      { key: "hero-artist-radar", label: "Hero Page Artist Radar", order: 4 },
      { key: "hero-workshop-artlab", label: "Hero Page Workshop Artlab", order: 5 },
      { key: "hero-screening-film", label: "Hero Page Screening Film", order: 6 },
      { key: "hero-untuk-perhatian", label: "Hero Page Untuk Perhatian", order: 7 },
    ],
  },
  {
    slug: "ditampart",
    name: "Hysteria Ditampart",
    coverItems: [
      { key: "cover-1", label: "Cover 3D", order: 1 },
      { key: "cover-2", label: "Cover Foto Kegiatan", order: 2 },
      { key: "cover-3", label: "Cover Mockup dan Poster", order: 3 },
      { key: "cover-4", label: "Cover Short Film Dokumenter", order: 4 },
      { key: "cover-5", label: "Cover Event Ditampart", order: 5 },
    ],
    heroItems: [
      { key: "hero-mockup-poster", label: "Hero Page Mock Up dan Poster", order: 1 },
      { key: "hero-event-ditampart", label: "Hero Page Event Ditampart", order: 2 },
    ],
  },
  {
    slug: "laki-masak",
    name: "Hysteria Laki Masak",
    coverItems: [
      { key: "cover-1", label: "Cover Meramu", order: 1 },
      { key: "cover-2", label: "Cover Homecooked", order: 2 },
      { key: "cover-3", label: "Cover Komik Ramuan", order: 3 },
      { key: "cover-4", label: "Pre-Order", order: 4 },
    ],
    heroItems: [
      { key: "hero-meramu", label: "Hero Page Meramu", order: 1 },
      { key: "hero-homecooked", label: "Hero Page Homecooked", order: 2 },
      { key: "hero-komik-ramuan", label: "Hero Page Komik Ramuan", order: 3 },
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
        `INSERT INTO "Platform" (slug, name, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, true, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [platform.slug, platform.name],
      );

      let platformId = result.rows[0]?.id;
      if (!platformId) {
        const existing = await client.query(`SELECT id FROM "Platform" WHERE slug = $1`, [platform.slug]);
        platformId = existing.rows[0].id;
      }

      console.log(`  ✓ Platform: ${platform.slug} (id=${platformId})`);

      for (const item of platform.coverItems) {
        await client.query(
          `INSERT INTO "PlatformImage" ("platformId", key, type, label, "order", "createdAt", "updatedAt")
           VALUES ($1, $2, 'cover', $3, $4, NOW(), NOW())
           ON CONFLICT ("platformId", key) DO UPDATE SET label = EXCLUDED.label, "order" = EXCLUDED."order"`,
          [platformId, item.key, item.label, item.order],
        );
        console.log(`    ✓ Cover: ${item.key}`);
      }

      for (const item of platform.heroItems) {
        await client.query(
          `INSERT INTO "PlatformImage" ("platformId", key, type, label, "order", "createdAt", "updatedAt")
           VALUES ($1, $2, 'hero', $3, $4, NOW(), NOW())
           ON CONFLICT ("platformId", key) DO UPDATE SET label = EXCLUDED.label, "order" = EXCLUDED."order"`,
          [platformId, item.key, item.label, item.order],
        );
        console.log(`    ✓ Hero: ${item.key}`);
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
