import { respondSuccess, respondError } from "@/lib/response";
import logger from "@/lib/logger";
import {
  getArticleDetail,
  updateArticleService,
  deleteArticleService,
} from "@/modules/admin/articles";

function extractIdFromUrl(req) {
  const segments = req.nextUrl.pathname.split("/");
  const id = segments[segments.length - 1];

  if (!id) {
    throw new Error("Article ID is missing");
  }

  const numericId = parseInt(id, 10);

  if (Number.isNaN(numericId)) {
    throw new Error(`Invalid article ID: ${id}`);
  }

  return numericId;
}

export async function GET(req) {
  try {
    const id = extractIdFromUrl(req);

    const article = await getArticleDetail(id);

    return respondSuccess(article, 200);
  } catch (error) {
    logger.error("Error fetching article detail", {
      error: error.message,
    });

    return respondError({
      message: error.message,
      status: 400,
    });
  }
}

export async function PUT(req) {
  try {
    const id = extractIdFromUrl(req);

    const formData = await req.formData();

    const data = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      content: JSON.parse(formData.get("content") || "{}"),
      excerpt: formData.get("excerpt"),
      categoryIds: JSON.parse(formData.get("categoryIds") || "[]"),
      authorName: formData.get("authorName"),
      editorName: formData.get("editorName"),
      status: formData.get("status"),
      publishedAt: formData.get("publishedAt")
        ? new Date(formData.get("publishedAt"))
        : null,
      tagNames: JSON.parse(formData.get("tagNames") || "[]"),
      references: JSON.parse(formData.get("references") || "[]"),
      featuredImageSource: formData.get("featuredImageSource"),
    };

    const updated = await updateArticleService(id, data);

    return respondSuccess(updated, 200);
  } catch (error) {
    logger.error("Error updating article", {
      error: error.message,
    });

    return respondError({
      message: error.message,
      status: error.statusCode || 500,
    });
  }
}

export async function DELETE(req) {
  try {
    const id = extractIdFromUrl(req);

    await deleteArticleService(id);

    return respondSuccess({ message: "Article deleted successfully" }, 200);
  } catch (error) {
    logger.error("Error deleting article", {
      error: error.message,
    });

    return respondError({
      message: error.message,
      status: error.statusCode || 500,
    });
  }
}
