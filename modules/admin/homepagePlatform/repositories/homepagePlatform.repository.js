import { prisma } from "../../../../lib/prisma.js";

export function findHomepagePlatformCards() {
  return prisma.$queryRaw`
    SELECT
      "id",
      "title",
      "imageUrl",
      "linkUrl",
      "slotType",
      "order",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "HomepagePlatformCard"
    ORDER BY "order" ASC, "id" ASC
  `;
}

export function replaceHomepagePlatformCards(cards) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`DELETE FROM "HomepagePlatformCard"`;
    if (cards.length > 0) {
      for (const card of cards) {
        await tx.$executeRaw`
          INSERT INTO "HomepagePlatformCard"
            ("title", "imageUrl", "linkUrl", "slotType", "order", "isActive", "createdAt", "updatedAt")
          VALUES
            (${card.title}, ${card.imageUrl}, ${card.linkUrl}, ${card.slotType}, ${card.order}, ${card.isActive}, NOW(), NOW())
        `;
      }
    }

    return tx.$queryRaw`
      SELECT
        "id",
        "title",
        "imageUrl",
        "linkUrl",
        "slotType",
        "order",
        "isActive",
        "createdAt",
        "updatedAt"
      FROM "HomepagePlatformCard"
      ORDER BY "order" ASC, "id" ASC
    `;
  });
}
