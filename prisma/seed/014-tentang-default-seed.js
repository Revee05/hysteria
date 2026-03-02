const { Client } = require("pg");
const logger = require("../../lib/logger");

const PAGE_SLUG = "tentang";

const DEFAULT_DESCRIPTION = "Sebagai laboratorium bersama dan diharapkan memberikan dampak perubahan dengan penekanan kreativitas, Hysteria memimpikan terwujudnya ekosisem seni dan kreatifitas yang sehat, menyejahterakan, dan berkelanjutan. Dibentuk sejak 11 September 2004 Hysteria selain produksi artistik juga memfasilitasi pertemuan lintas disipliner dalam skala lokal hingga global untuk mencari trobosan-trobosan dalam persoalan kreatifitas, seni, komunitas, anak muda, dan isu kota.";

const DEFAULT_VISI = "Terwujudnya ekosistem seni dan kreativitas yang sehat, menyejahterakan, dan berkelanjutan";

const DEFAULT_MISI_LIST = ["1. Terciptanya Lembaga yang berdikari", "2. Terwujudnya kreator yang berdedikasi, tangguh, dan berdaya", "3. Terfasilitasinya perkembangan komunitas dan platform", "4. Eksisnya sumber daya manusia dan komunitas yang peduli pada nilai budaya, kearifan lokal, karakter bangsa, dan memahami keragaman eskpresi budaya sehingga tercipta jiwa toleran", "5. Adanya kebijakan budaya dan kreativitas yang ideal", "6. Komunitas berdaya (ekonomi sosbud) serta Kontekstual", "7. Terciptanya kreator baik individu maupun kolektif yang terkoneksi, berprestasi dan punya sensibilitas di skala lokal– nasional– internasional"];

const DEFAULT_PANDUAN_VISUAL = ["Brand Guideline", "Logo Hysteria", "Video Profil Hysteria", "Stationary & Promotion Media", "Template PPT", "Merchandise Guideline"];

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 014-tentang-default-seed");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    logger.info("014: Seeding default Tentang content...");
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO "TentangVisiMisi" ("pageSlug", "description", "visi", "misi", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT ("pageSlug") DO UPDATE
       SET "description" = EXCLUDED."description",
           "visi" = EXCLUDED."visi",
           "misi" = EXCLUDED."misi",
           "updatedAt" = NOW()`,
      [PAGE_SLUG, DEFAULT_DESCRIPTION, DEFAULT_VISI, DEFAULT_MISI_LIST.join("\n")],
    );

    await client.query(`DELETE FROM "TentangSejarahItem"`);
    const years = Array.from({ length: 2020 - 2004 + 1 }, (_, index) => String(2004 + index));
    for (const [index, year] of years.entries()) {
      await client.query(
        `INSERT INTO "TentangSejarahItem" ("title", "imageUrl", "order", "isActive", "createdAt", "updatedAt")
         VALUES ($1, NULL, $2, true, NOW(), NOW())`,
        [year, index],
      );
    }

    await client.query(`DELETE FROM "TentangPanduanVisual"`);
    for (const [index, title] of DEFAULT_PANDUAN_VISUAL.entries()) {
      await client.query(
        `INSERT INTO "TentangPanduanVisual" ("title", "link", "order", "isActive", "createdAt", "updatedAt")
         VALUES ($1, NULL, $2, true, NOW(), NOW())`,
        [title, index],
      );
    }

    await client.query("COMMIT");
    logger.info("014: Tentang default seed complete");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("014 seeder error:", { error: error.message });
    throw error;
  } finally {
    await client.end();
  }
};
