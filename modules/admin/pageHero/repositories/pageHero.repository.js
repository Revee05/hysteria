import { prisma } from "../../../../lib/prisma.js";

function getPageHeroDelegate() {
  return prisma?.pageHero || null;
}

export async function findPageHeroBySlug(pageSlug) {
  const delegate = getPageHeroDelegate();

  if (delegate?.findUnique) {
    return delegate.findUnique({
      where: { pageSlug },
    });
  }

  const rows = await prisma.$queryRaw`
    SELECT "id", "pageSlug", "imageUrl", "title", "subtitle", "createdAt", "updatedAt"
    FROM "PageHero"
    WHERE "pageSlug" = ${pageSlug}
    LIMIT 1
  `;

  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function upsertPageHeroBySlug(pageSlug, data) {
  const hasImageUrl = Object.prototype.hasOwnProperty.call(data || {}, "imageUrl");
  const imageUrl = data?.imageUrl ?? null;
  const title = data?.title ?? null;
  const subtitle = data?.subtitle ?? null;

  const updatedRows = await prisma.$queryRaw`
    UPDATE "PageHero"
    SET
      "imageUrl" = CASE WHEN ${hasImageUrl} THEN ${imageUrl} ELSE "imageUrl" END,
      "title" = COALESCE(${title}, "title"),
      "subtitle" = COALESCE(${subtitle}, "subtitle"),
      "updatedAt" = NOW()
    WHERE "pageSlug" = ${pageSlug}
    RETURNING "id", "pageSlug", "imageUrl", "title", "subtitle", "createdAt", "updatedAt"
  `;

  if (Array.isArray(updatedRows) && updatedRows.length > 0) {
    return updatedRows[0];
  }

  const createdRows = await prisma.$queryRaw`
    INSERT INTO "PageHero" ("pageSlug", "imageUrl", "title", "subtitle")
    VALUES (${pageSlug}, ${imageUrl}, ${title}, ${subtitle})
    RETURNING "id", "pageSlug", "imageUrl", "title", "subtitle", "createdAt", "updatedAt"
  `;

  return Array.isArray(createdRows) ? createdRows[0] || null : null;
}
