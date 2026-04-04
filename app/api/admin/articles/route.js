import { respondSuccess, respondError, AppError } from "@/lib/response";
import logger from "@/lib/logger";

import { getAllArticles, createArticleService } from "@/modules/admin/articles";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");
    const status = searchParams.get("status");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const articles = await getAllArticles({
      search,
      category,
      status,
      sort,
      page,
      limit,
    });

    return respondSuccess(articles, 200);
  } catch (error) {
    logger.error("Error fetching admin articles", {
      error: error.message,
    });

    return respondError(error);
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("featuredImage");

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
      // NEW
      references: JSON.parse(formData.get("references") || "[]"),
      featuredImageSource: formData.get("featuredImageSource"),
    };

    const article = await createArticleService(data, file);

    return respondSuccess(article, 201);
  } catch (error) {
    console.error("🔥 CREATE ERROR:", error);

    if (error instanceof AppError) {
      return respondError(error);
    }

    return respondError(
      new AppError(
        error.message || "Internal server error",
        500,
        "INTERNAL_ERROR",
      ),
    );
  }
}
