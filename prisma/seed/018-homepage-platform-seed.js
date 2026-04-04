const { Client } = require("pg");
const logger = require("../../lib/logger");

const DEFAULT_IMAGES = "/image/tim-hero.png";
const HOMEPAGE_PLATFORM_CARDS = [
  { title: "Hysteria Artlab", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80", slotType: "tall", order: 0, linkUrl: "/platform/hysteria-artlab" },
  { title: "Peka Kota", imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764b0d?auto=format&fit=crop&w=1200&q=80", slotType: "tall", order: 1, linkUrl: "/platform/peka-kota" },
  { title: "Laki Masak", imageUrl: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80", slotType: "tall", order: 2, linkUrl: "/platform/laki-masak" },
  { title: "Bukit Buku", imageUrl: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80", slotType: "short", order: 3, linkUrl: "/platform/bukit-buku" },
  { title: "Ditam Part", imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80", slotType: "short", order: 4, linkUrl: "/platform/ditampart" },
];

module.exports = async function seedHomepagePlatformCards() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 018-homepage-platform-seed");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query("BEGIN");

    try {
      await client.query('DELETE FROM "HomepagePlatformCard"');

      for (const card of HOMEPAGE_PLATFORM_CARDS) {
        await client.query(
          `INSERT INTO "HomepagePlatformCard"
            ("title", "imageUrl", "linkUrl", "slotType", "order", "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())`,
          [card.title, DEFAULT_IMAGES, card.linkUrl, card.slotType, card.order],
        );
      }

      await client.query("COMMIT");
      logger.info("Synced HomepagePlatformCard with", { count: HOMEPAGE_PLATFORM_CARDS.length });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    }
  } catch (err) {
    logger.error("Error seeding homepage platform cards", { error: err && (err.stack || err.message) });
    throw err;
  } finally {
    await client.end();
  }
};
