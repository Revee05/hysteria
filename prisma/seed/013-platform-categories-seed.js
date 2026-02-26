const { Client } = require("pg");
const logger = require("../../lib/logger");

/**
 * 013-platform-categories-seed.js
 *
 * Seed tabel PlatformCategory dengan relasi ke CategoryItem (dari nav tree 009).
 * title, slug, url diambil langsung dari CategoryItem — PlatformCategory hanya
 * menyimpan metadata visual: layout, filters, order.
 *
 * Harus dijalankan SETELAH 009-nav-category.js dan 012-platform-seed.js.
 */

const PLATFORM_CATEGORIES = [
  {
    platformSlug: "hysteria-artlab",
    // categoryItemSlug: slug CategoryItem anak langsung dari 'hysteria-artlab' di nav tree
    categories: [
      { categoryItemSlug: "merchandise",     layout: "grid",     order: 1 },
      { categoryItemSlug: "podcast-artlab",  layout: "carousel", order: 2 },
      { categoryItemSlug: "workshop",        layout: "grid",     order: 3 },
      { categoryItemSlug: "screening-film",  layout: "grid",     order: 4 },
      { categoryItemSlug: "untuk-perhatian", layout: "grid",     order: 5 },
    ],
  },
  {
    platformSlug: "ditampart",
    categories: [
      { categoryItemSlug: "3d",                   layout: "grid",     order: 1 },
      { categoryItemSlug: "foto-kegiatan",         layout: "grid",     order: 2 },
      { categoryItemSlug: "mockup-dan-poster",     layout: "grid",     order: 3 },
      { categoryItemSlug: "short-film-dokumenter", layout: "carousel", order: 4 },
      { categoryItemSlug: "event-ditampart",       layout: "grid",     order: 5 },
    ],
  },
  {
    platformSlug: "laki-masak",
    categories: [
      { categoryItemSlug: "meramu",       layout: "grid",     order: 1 },
      { categoryItemSlug: "homecooked",   layout: "grid",     order: 2 },
      { categoryItemSlug: "komik-ramuan", layout: "carousel", order: 3 },
      { categoryItemSlug: "pre-order",    layout: "grid",     order: 4 },
    ],
  },
];

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 013-platform-categories-seed");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  console.log("📂 Seeding platform categories...");

  try {
    for (const entry of PLATFORM_CATEGORIES) {
      // Resolve Platform.id
      const platformRow = await client.query(
        `SELECT id FROM "Platform" WHERE slug = $1 LIMIT 1`,
        [entry.platformSlug]
      );
      const platformId = platformRow.rows[0]?.id;
      if (!platformId) {
        console.warn(`  ⚠ Platform '${entry.platformSlug}' not found — skipping`);
        continue;
      }

      // Resolve CategoryItem.id untuk platform itu sendiri (parent node di nav tree)
      const parentRow = await client.query(
        `SELECT id FROM "CategoryItem" WHERE slug = $1 LIMIT 1`,
        [entry.platformSlug]
      );
      const parentCategoryItemId = parentRow.rows[0]?.id;
      if (!parentCategoryItemId) {
        console.warn(`  ⚠ CategoryItem '${entry.platformSlug}' not found — skipping`);
        continue;
      }

      console.log(`  Platform: ${entry.platformSlug} (platformId=${platformId}, parentItemId=${parentCategoryItemId})`);

      for (const cat of entry.categories) {
        // Cari CategoryItem anak dari platform ini berdasarkan slug + parentId
        const itemRow = await client.query(
          `SELECT id FROM "CategoryItem" WHERE slug = $1 AND "parentId" = $2 LIMIT 1`,
          [cat.categoryItemSlug, parentCategoryItemId]
        );
        const categoryItemId = itemRow.rows[0]?.id;
        if (!categoryItemId) {
          console.warn(`    ⚠ CategoryItem slug='${cat.categoryItemSlug}' (parent=${entry.platformSlug}) not found — skipping`);
          continue;
        }

        // Upsert berdasarkan (platformId, categoryItemId)
        const existing = await client.query(
          `SELECT id FROM "PlatformCategory" WHERE "platformId" = $1 AND "categoryItemId" = $2 LIMIT 1`,
          [platformId, categoryItemId]
        );

        if (existing.rows.length > 0) {
          await client.query(
            `UPDATE "PlatformCategory"
             SET layout = $1, "order" = $2, "isActive" = true, "updatedAt" = NOW()
             WHERE "platformId" = $3 AND "categoryItemId" = $4`,
            [cat.layout, cat.order, platformId, categoryItemId]
          );
          console.log(`    ↻ Updated: ${cat.categoryItemSlug}`);
        } else {
          await client.query(
            `INSERT INTO "PlatformCategory"
               ("platformId", "categoryItemId", layout, description, filters, "order", "isActive", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5::jsonb, $6, true, NOW(), NOW())`,
            [platformId, categoryItemId, cat.layout, cat.description ?? "", JSON.stringify(cat.filters ?? []), cat.order]
          );
          console.log(`    ✓ Inserted: ${cat.categoryItemSlug}`);
        }
      }
    }

    console.log("\n✅ Platform categories seeded successfully!");
  } catch (error) {
    logger.error("Error seeding platform categories:", error);
    throw error;
  } finally {
    await client.end();
  }
};
