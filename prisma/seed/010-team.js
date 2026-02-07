const { Client } = require("pg");
const logger = require("../../lib/logger");

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 010-team");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  const categories = [
    { name: "Pengelola Hysteria", slug: "pengelola-hysteria", order: 0 },
    { name: "Pengurus Hysteria Artlab", slug: "hysteria-artlab", order: 1 },
    { name: "Pengurus Pekakota", slug: "pekakota", order: 2 },
  ];

  const members = [
    // Pengelola Hysteria
    { categorySlug: "pengelola-hysteria", name: "A Khairudin", role: "Solidarity Maker", order: 0 },
    { categorySlug: "pengelola-hysteria", name: "Ragil Maulana A.", role: "General Manager", order: 1 },
    { categorySlug: "pengelola-hysteria", name: "Izza Nadia Hikma", role: "Sekretaris", order: 2 },
    { categorySlug: "pengelola-hysteria", name: "Titis Wijayanti", role: "Bendahara", order: 3 },
    { categorySlug: "pengelola-hysteria", name: "Tommy Ari Wibowo", role: "Manajer Ruang", order: 4 },
    { categorySlug: "pengelola-hysteria", name: "Arif Fitra Kurniawan", role: "Divisi Riset", order: 5 },
    { categorySlug: "pengelola-hysteria", name: "Purna Cipta N.", role: "Deputi Sapu Jagad", order: 6 },
    { categorySlug: "pengelola-hysteria", name: "Istiqbalul F. Asteja", role: "Direktur Bukit Buku", order: 7 },

    // Hysteria Artlab
    { categorySlug: "hysteria-artlab", name: "Tyok Hari", role: "Staff Hysteria Artlab", order: 0 },
    { categorySlug: "hysteria-artlab", name: "Hananingsih W.", role: "Staff Hysteria Artlab", order: 1 },
    { categorySlug: "hysteria-artlab", name: "Humam Zidni Ahmad", role: "Staff Hysteria Artlab", order: 2 },
    { categorySlug: "hysteria-artlab", name: "Wan Fajar", role: "Staff Hysteria Artlab", order: 3 },
    { categorySlug: "hysteria-artlab", name: "Mukhammad J. F.", role: "Staff Hysteria Artlab", order: 4 },
    { categorySlug: "hysteria-artlab", name: "Anita Dewi", role: "Staff Hysteria Artlab", order: 5 },
    { categorySlug: "hysteria-artlab", name: "Dheni Fattah", role: "Staff Hysteria Artlab", order: 6 },

    // Pekakota
    { categorySlug: "pekakota", name: "Pujo Nugroho", role: "Staff Pekakota", order: 0 },
    { categorySlug: "pekakota", name: "Nella Ardiantanti S.", role: "Staff Pekakota", order: 1 },
    { categorySlug: "pekakota", name: "Radit Bayu Anggoro", role: "Staff Pekakota", order: 2 },
    { categorySlug: "pekakota", name: "Yasin Fajar", role: "Staff Pekakota", order: 3 },
    { categorySlug: "pekakota", name: "Salma Ibrahim", role: "Staff Pekakota", order: 4 },
  ];

  const toSlug = (value) => {
    const base = String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return base || "item";
  };

  try {
    logger.info("010: Seeding team categories and members...");
    await client.query("BEGIN");

    const categoryMap = {};
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO "TeamCategory" ("name", "slug", "description", "order", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, NULL, $3, true, now(), now())
         ON CONFLICT ("slug", "name") DO UPDATE
         SET "order" = EXCLUDED."order", "isActive" = true, "updatedAt" = now()
         RETURNING "id"`,
        [cat.name, cat.slug, cat.order],
      );
      categoryMap[cat.slug] = res.rows[0].id;
    }

    for (const member of members) {
      const categoryId = categoryMap[member.categorySlug];
      if (!categoryId) throw new Error(`Category not found: ${member.categorySlug}`);

      const slug = toSlug(member.name);
      const found = await client.query(`SELECT id FROM "TeamMember" WHERE "slug" = $1 AND "name" = $2 LIMIT 1`, [slug, member.name]);

      if (found.rows[0]?.id) {
        await client.query(
          `UPDATE "TeamMember"
           SET "role" = $1, "order" = $2, "categoryId" = $3, "isActive" = true, "updatedAt" = now()
           WHERE id = $4`,
          [member.role, member.order, categoryId, found.rows[0].id],
        );
      } else {
        await client.query(
          `INSERT INTO "TeamMember" ("categoryId", "name", "slug", "role", "imageUrl", "email", "instagram", "order", "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, NULL, NULL, NULL, $5, true, now(), now())`,
          [categoryId, member.name, slug, member.role, member.order],
        );
      }
    }

    await client.query("COMMIT");
    logger.info("010: Team seed complete");
  } catch (e) {
    await client.query("ROLLBACK");
    logger.error("010 seeder error:", { error: e.message });
    throw e;
  } finally {
    await client.end();
  }
};
