const pg = require("pg");
const logger = require("../../lib/logger");

const DEFAULT_WEBSITE_INFO = {
  judul: "Hysteria",
  deskripsi: "Hysteria adalah ruang kolektif seni, riset, dan budaya yang berbasis di Semarang.",
  deskripsiFooter: "Hysteria adalah ruang kolektif seni, riset,\ndan budaya yang berbasis di Semarang.",
  logoWebsite: "/svg/Logo-hysteria.svg",
  faviconWebsite: "/svg/Logo-hysteria.svg",
};

module.exports = async function seedWebsiteInfo() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 016-website-info-seed");
    return;
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  try {
    logger.info("016: Seeding WebsiteInfo defaults...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "WebsiteInfo" (
        "id" SERIAL PRIMARY KEY,
        "pageKey" VARCHAR(50) NOT NULL UNIQUE,
        "judul" VARCHAR(255),
        "deskripsi" TEXT,
        "deskripsiFooter" TEXT,
        "logoWebsite" TEXT,
        "faviconWebsite" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(
      `INSERT INTO "WebsiteInfo"
        ("pageKey", "judul", "deskripsi", "deskripsiFooter", "logoWebsite", "faviconWebsite", "createdAt", "updatedAt")
       VALUES
        ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT ("pageKey") DO UPDATE
       SET "judul" = EXCLUDED."judul",
           "deskripsi" = EXCLUDED."deskripsi",
           "deskripsiFooter" = EXCLUDED."deskripsiFooter",
           "logoWebsite" = EXCLUDED."logoWebsite",
           "faviconWebsite" = EXCLUDED."faviconWebsite",
           "updatedAt" = NOW()`,
      ["default", DEFAULT_WEBSITE_INFO.judul, DEFAULT_WEBSITE_INFO.deskripsi, DEFAULT_WEBSITE_INFO.deskripsiFooter, DEFAULT_WEBSITE_INFO.logoWebsite, DEFAULT_WEBSITE_INFO.faviconWebsite],
    );

    logger.info("016:  ✓ Seeded WebsiteInfo defaults");
  } catch (error) {
    logger.error("016: Seeding failed:", { error: error.message });
    throw error;
  } finally {
    await client.end();
  }
};
