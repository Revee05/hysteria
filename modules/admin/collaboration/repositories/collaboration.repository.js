import pg from "pg";

const PAGE_KEY = "kolaborasi";

function createClient() {
  return new pg.Client({ connectionString: process.env.DATABASE_URL });
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "CollaborationContent" (
      "id" SERIAL PRIMARY KEY,
      "pageKey" VARCHAR(100) NOT NULL UNIQUE,
      "googleFormUrl" TEXT NOT NULL,
      "whatsappNumber" VARCHAR(30) NOT NULL,
      "whatsappMessage" TEXT NOT NULL,
      "heroSubHeadline" TEXT,
      "heroNotes" TEXT,
      "whyBenefits" JSONB,
      "schemes" JSONB,
      "flowSteps" JSONB,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`ALTER TABLE "CollaborationContent" ADD COLUMN IF NOT EXISTS "heroSubHeadline" TEXT`);
  await client.query(`ALTER TABLE "CollaborationContent" ADD COLUMN IF NOT EXISTS "heroNotes" TEXT`);
  await client.query(`ALTER TABLE "CollaborationContent" ADD COLUMN IF NOT EXISTS "whyBenefits" JSONB`);
  await client.query(`ALTER TABLE "CollaborationContent" ADD COLUMN IF NOT EXISTS "schemes" JSONB`);
  await client.query(`ALTER TABLE "CollaborationContent" ADD COLUMN IF NOT EXISTS "flowSteps" JSONB`);
}

export async function findCollaborationContent() {
  const client = createClient();
  await client.connect();

  try {
    await ensureTable(client);
    const result = await client.query(
      `SELECT *
       FROM "CollaborationContent"
       WHERE "pageKey" = $1
       LIMIT 1`,
      [PAGE_KEY]
    );

    return result.rows[0] || null;
  } finally {
    await client.end();
  }
}

export async function upsertCollaborationContent(payload) {
  const client = createClient();
  await client.connect();

  try {
    await ensureTable(client);
    const result = await client.query(
      `INSERT INTO "CollaborationContent"
        (
          "pageKey",
          "googleFormUrl",
          "whatsappNumber",
          "whatsappMessage",
          "heroSubHeadline",
          "heroNotes",
          "whyBenefits",
          "schemes",
          "flowSteps",
          "createdAt",
          "updatedAt"
        )
       VALUES
        ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, NOW(), NOW())
       ON CONFLICT ("pageKey") DO UPDATE
       SET "googleFormUrl" = EXCLUDED."googleFormUrl",
           "whatsappNumber" = EXCLUDED."whatsappNumber",
           "whatsappMessage" = EXCLUDED."whatsappMessage",
           "heroSubHeadline" = EXCLUDED."heroSubHeadline",
           "heroNotes" = EXCLUDED."heroNotes",
           "whyBenefits" = EXCLUDED."whyBenefits",
           "schemes" = EXCLUDED."schemes",
           "flowSteps" = EXCLUDED."flowSteps",
           "updatedAt" = NOW()
       RETURNING *`,
      [
        PAGE_KEY,
        payload.googleFormUrl,
        payload.whatsappNumber,
        payload.whatsappMessage,
        payload.heroSubHeadline || "",
        payload.heroNotes || "",
        JSON.stringify(payload.whyBenefits || []),
        JSON.stringify(payload.schemes || []),
        JSON.stringify(payload.flowSteps || []),
      ]
    );

    return result.rows[0] || null;
  } finally {
    await client.end();
  }
}
