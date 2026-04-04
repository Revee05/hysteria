function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

/**
 * Attach tags to article (transaction)
 */
export async function attachTags(tx, articleId, tagNames = []) {
  if (!tagNames?.length) return;

  for (const name of tagNames) {
    const slug = generateSlug(name);

    let tag = await tx.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      tag = await tx.tag.create({
        data: { name, slug },
      });
    }

    await tx.articleTag.create({
      data: {
        articleId,
        tagId: tag.id,
      },
    });
  }
}

/**
 * Reset tags (for update)
 */
export async function resetTags(tx, articleId, tagNames = []) {
  await tx.articleTag.deleteMany({
    where: { articleId },
  });

  await attachTags(tx, articleId, tagNames);
}