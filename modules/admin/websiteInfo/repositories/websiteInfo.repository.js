import pg from "pg";

const PAGE_KEY = "default";

function createClient() {
  return new pg.Client({ connectionString: process.env.DATABASE_URL });
}

async function ensureTable(client) {
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
}

export async function findWebsiteInfo() {
  const client = createClient();
  await client.connect();

  try {
    await ensureTable(client);
    const result = await client.query(
      `SELECT *
       FROM "WebsiteInfo"
       WHERE "pageKey" = $1
       LIMIT 1`,
      [PAGE_KEY],
    );

    return result.rows[0] || null;
  } finally {
    await client.end();
  }
}

export async function upsertWebsiteInfo(payload) {
  const client = createClient();
  await client.connect();

  try {
    await ensureTable(client);
    const result = await client.query(
      `INSERT INTO "WebsiteInfo"
        (
          "pageKey",
          "judul",
          "deskripsi",
          "deskripsiFooter",
          "logoWebsite",
          "faviconWebsite",
          "createdAt",
          "updatedAt"
        )
       VALUES
        ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT ("pageKey") DO UPDATE
       SET "judul" = EXCLUDED."judul",
           "deskripsi" = EXCLUDED."deskripsi",
           "deskripsiFooter" = EXCLUDED."deskripsiFooter",
           "logoWebsite" = EXCLUDED."logoWebsite",
           "faviconWebsite" = EXCLUDED."faviconWebsite",
           "updatedAt" = NOW()
       RETURNING *`,
      [PAGE_KEY, payload.judul, payload.deskripsi, payload.deskripsiFooter, payload.logoWebsite, payload.faviconWebsite],
    );

    return result.rows[0] || null;
  } finally {
    await client.end();
  }
}
