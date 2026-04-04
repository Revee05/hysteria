import { NextResponse } from "next/server";
import { getPublicArticles } from "@/modules/public/articles/services/article.public.service";

export async function GET(req) {
  try {

    const { searchParams } = new URL(req.url);

    const params = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "all",
      sort: searchParams.get("sort") || "newest",
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
    };

    const result = await getPublicArticles(params);

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {

    console.error("ARTICLE API ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}