import pg from "pg";

function createClient() {
  return new pg.Client({ connectionString: process.env.DATABASE_URL });
}

export async function findActiveContactSection() {
  const client = createClient();
  await client.connect();

  try {
    const result = await client.query(
      `SELECT *
       FROM "ContactSection"
       WHERE "isActive" = true
       ORDER BY "updatedAt" DESC
       LIMIT 1`
    );
    return result.rows[0] || null;
  } finally {
    await client.end();
  }
}

export async function findLatestContactSection() {
  const client = createClient();
  await client.connect();

  try {
    const result = await client.query(
      `SELECT *
       FROM "ContactSection"
       ORDER BY "updatedAt" DESC
       LIMIT 1`
    );
    return result.rows[0] || null;
  } finally {
    await client.end();
  }
}

export async function createContactSection(payload) {
  const client = createClient();
  await client.connect();

  try {
    const result = await client.query(
      `INSERT INTO "ContactSection"
        ("mapsEmbedUrl", "locationTitle", "locationAddress", "operationalHours", "whatsappNumber", "instagramUrl", "twitterUrl", "facebookUrl", "youtubeUrl", "tiktokUrl", "email", "isActive", "createdAt", "updatedAt")
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), NOW())
       RETURNING *`,
      [
        payload.mapsEmbedUrl,
        payload.locationTitle,
        payload.locationAddress,
        payload.operationalHours,
        payload.whatsappNumber,
        payload.instagramUrl,
        payload.twitterUrl,
        payload.facebookUrl,
        payload.youtubeUrl,
        payload.tiktokUrl,
        payload.email,
      ]
    );

    return result.rows[0] || null;
  } finally {
    await client.end();
  }
}

export async function updateContactSectionById(id, payload) {
  const client = createClient();
  await client.connect();

  try {
    const result = await client.query(
      `UPDATE "ContactSection"
       SET "mapsEmbedUrl" = $2,
           "locationTitle" = $3,
           "locationAddress" = $4,
           "operationalHours" = $5,
           "whatsappNumber" = $6,
           "instagramUrl" = $7,
           "twitterUrl" = $8,
           "facebookUrl" = $9,
           "youtubeUrl" = $10,
           "tiktokUrl" = $11,
           "email" = $12,
           "updatedAt" = NOW()
       WHERE "id" = $1
       RETURNING *`,
      [
        id,
        payload.mapsEmbedUrl,
        payload.locationTitle,
        payload.locationAddress,
        payload.operationalHours,
        payload.whatsappNumber,
        payload.instagramUrl,
        payload.twitterUrl,
        payload.facebookUrl,
        payload.youtubeUrl,
        payload.tiktokUrl,
        payload.email,
      ]
    );

    return result.rows[0] || null;
  } finally {
    await client.end();
  }
}
