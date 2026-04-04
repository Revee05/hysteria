const { Client } = require("pg");
const logger = require("../../lib/logger");

/**
 * 019-article-seed.js
 * 
 * Seed data Article beserta relasi ArticleCategory.
 * Harus dijalankan SETELAH 009-nav-category.js.
 */

const ARTICLES = [
  {
    title: "Kohesi Sosial dan Perlunya Perubahan Paradigma Global",
    slug: "kohesi-sosial-dan-perlunya-perubahan-paradigma-global",
    content: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Isi artikel lengkap tentang kohesi sosial. Membahas bagaimana tantangan global saat ini menuntut kita untuk mendefinisikan ulang cara kita berinteraksi dan berkolaborasi sebagai satu kesatuan sosial yang kohesif." }]
        }
      ]
    }),
    excerpt: "Setelah setahun yang lalu, Melawat ke Timur menjadi Catatan Perjalanan yang mendalam tentang pencarian makna kolektif.",
    featuredImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    authorName: "Hananingsih Widhiasri",
    publishedAt: new Date("2023-07-01T00:00:00+07:00"),
    status: "PUBLISHED",
    categorySlugs: ["bedah-buku"]
  },
  {
    title: "Kecemasan Manusia Modern dan Hal-Hal yang Tak Selesai",
    slug: "kecemasan-manusia-modern-dan-hal-hal-yang-tak-selesai",
    content: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Analisis mendalam mengenai tantangan psikologis manusia di era digital. Artikel ini mengeksplorasi rasa cemas yang timbul dari tuntutan produktivitas yang tiada henti dan fragmentasi perhatian." }]
        }
      ]
    }),
    excerpt: "Analisis mendalam mengenai tantangan psikologis manusia di era digital dan bagaimana mengatasinya.",
    featuredImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    authorName: "Admin Hysteria",
    publishedAt: new Date("2019-11-15T00:00:00+07:00"),
    status: "PUBLISHED",
    categorySlugs: ["esai"]
  },
  {
    title: "Proyek Seni, Aktivasi Kampung dan Narasi Kota",
    slug: "proyek-seni-aktivasi-kampung-dan-narasi-kota",
    content: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Bagaimana seni dapat menjadi alat untuk mengaktifkan ruang publik di kampung. Proyek ini mendokumentasikan berbagai inisiatif seni berbasis komunitas yang berhasil mengubah wajah kampung menjadi ruang yang lebih inklusif." }]
        }
      ]
    }),
    excerpt: "Bagaimana seni dapat menjadi alat untuk mengaktifkan ruang publik di kampung dan menghidupkan kembali narasi lokal.",
    featuredImage: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&q=80",
    authorName: "Kolektif Hysteria",
    publishedAt: new Date("2017-11-07T00:00:00+07:00"),
    status: "PUBLISHED",
    categorySlugs: ["esai"]
  }
];

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 019-article-seed");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  logger.info("019: Seeding articles...");

  try {
    await client.query("BEGIN");

    // Fetch category items for articles
    const articleCatSlugs = [...new Set(ARTICLES.flatMap(a => a.categorySlugs))];
    const catRows = await client.query(
      `SELECT "id", "slug" FROM "CategoryItem" WHERE "slug" = ANY($1::text[])`,
      [articleCatSlugs]
    );
    const categoryIdMap = {};
    for (const row of catRows.rows) {
      categoryIdMap[row.slug] = row.id;
    }

    for (const art of ARTICLES) {
      const artRes = await client.query(
        `INSERT INTO "Article" (
          "title", "slug", "content", "excerpt", "featuredImage",
          "authorName", "status", "publishedAt", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, now(), now()
        )
        ON CONFLICT ("slug") DO UPDATE SET
          "title" = EXCLUDED."title",
          "content" = EXCLUDED."content",
          "excerpt" = EXCLUDED."excerpt",
          "authorName" = EXCLUDED."authorName",
          "status" = EXCLUDED."status",
          "publishedAt" = EXCLUDED."publishedAt",
          "updatedAt" = now()
        RETURNING "id"`,
        [
          art.title, art.slug, art.content, art.excerpt, art.featuredImage,
          art.authorName, art.status, art.publishedAt
        ]
      );
      const articleId = artRes.rows[0].id;

      // ArticleCategory relay
      for (const catSlug of art.categorySlugs) {
        const catId = categoryIdMap[catSlug];
        if (!catId) {
          logger.warn(`  ⚠ CategoryItem '${catSlug}' not found for article '${art.title}'`);
          continue;
        }
        await client.query(
          `INSERT INTO "ArticleCategory" ("articleId", "categoryId")
           VALUES ($1, $2)
           ON CONFLICT ("articleId", "categoryId") DO NOTHING`,
          [articleId, catId]
        );
      }
      logger.info(`  ✔ Article '${art.title}' (id=${articleId})`);
    }

    await client.query("COMMIT");
    logger.info("019: Article seed complete");
  } catch (e) {
    await client.query("ROLLBACK");
    logger.error("019 seeder error:", { error: e.message });
    throw e;
  } finally {
    await client.end();
  }
};
