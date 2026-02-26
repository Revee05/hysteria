import { NextResponse } from "next/server";
import { getPublicArticleDetail } from "@/modules/public/articles/services/services/article.public.service";

export async function GET(_, { params }) {
  const article = await getPublicArticleDetail(params.slug);

  if (!article) {
    return NextResponse.json(
      { success: false, error: "Artikel tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: article,
  });
}
